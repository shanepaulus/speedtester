import { performance } from 'perf_hooks';
import { randomBytes } from 'crypto';

const CF_DOWN  = 'https://speed.cloudflare.com/__down';
const CF_UP    = 'https://speed.cloudflare.com/__up';
const CF_TRACE = 'https://www.cloudflare.com/cdn-cgi/trace';

export class SpeedTestService {
  async run(onProgress, durationSeconds = 5) {
    onProgress?.({ phase: 'ping' });
    const [trace, latency] = await Promise.all([this.#trace(), this.#ping()]);
    onProgress?.({ phase: 'ping_done', ping: latency.ping, jitter: latency.jitter });

    onProgress?.({ phase: 'download', value: 0 });
    const dl = await this.#download(onProgress, durationSeconds);

    onProgress?.({ phase: 'upload', value: 0 });
    const ul = await this.#upload(onProgress, durationSeconds);

    const location = [trace.colo, trace.loc].filter(Boolean).join(' · ') || 'Nearest edge';
    return {
      download:        dl,
      upload:          ul,
      ping:            latency.ping,
      jitter:          latency.jitter,
      packet_loss:     0,
      server_name:     'Cloudflare',
      server_location: location,
      isp:             trace.isp,
    };
  }

  async #ping() {
    const samples = [];
    for (let i = 0; i < 10; i++) {
      const t = performance.now();
      await fetch(`${CF_DOWN}?bytes=0`);
      samples.push(performance.now() - t);
    }
    const avg    = samples.reduce((a, b) => a + b) / samples.length;
    const jitter = Math.sqrt(samples.reduce((s, p) => s + (p - avg) ** 2, 0) / samples.length);
    return { ping: parseFloat(avg.toFixed(2)), jitter: parseFloat(jitter.toFixed(2)) };
  }

  async #download(onProgress, durationSeconds) {
    const PARALLEL   = 4;
    const CHUNK      = 25_000_000; // 25 MB — within Cloudflare's supported range
    const controller = new AbortController();
    const timer      = setTimeout(() => controller.abort(), durationSeconds * 1000);
    const start      = performance.now();
    let   received   = 0;

    const worker = async () => {
      try {
        while (!controller.signal.aborted) {
          const res    = await fetch(`${CF_DOWN}?bytes=${CHUNK}`, { signal: controller.signal });
          const reader = res.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            received += value.length;
            const elapsed = (performance.now() - start) / 1000;
            if (elapsed > 0.1) {
              onProgress?.({ phase: 'download', value: parseFloat((received * 8 / elapsed / 1_000_000).toFixed(2)) });
            }
          }
        }
      } catch (err) {
        if (!controller.signal.aborted) throw err;
      }
    };

    try {
      await Promise.all(Array.from({ length: PARALLEL }, worker));
    } finally {
      clearTimeout(timer);
    }

    const elapsed = (performance.now() - start) / 1000;
    return parseFloat((received * 8 / Math.max(elapsed, 0.01) / 1_000_000).toFixed(2));
  }

  async #upload(onProgress, durationSeconds) {
    const PARALLEL   = 4;
    const CHUNK_SIZE = 8 * 1024 * 1024; // 8 MB per request — reduces HTTP overhead on fast connections
    const chunk      = randomBytes(CHUNK_SIZE);
    const start      = performance.now();
    let   totalSent  = 0;
    let   finished   = false;

    const worker = async () => {
      while (!finished) {
        await fetch(CF_UP, {
          method:  'POST',
          body:    chunk,
          headers: { 'Content-Type': 'application/octet-stream' },
        });
        totalSent += CHUNK_SIZE;
        const elapsed = (performance.now() - start) / 1000;
        onProgress?.({ phase: 'upload', value: parseFloat((totalSent * 8 / elapsed / 1_000_000).toFixed(2)) });
        if (elapsed >= durationSeconds) finished = true;
      }
    };

    await Promise.all(Array.from({ length: PARALLEL }, worker));

    const elapsed = (performance.now() - start) / 1000;
    return parseFloat((totalSent * 8 / elapsed / 1_000_000).toFixed(2));
  }

  async #trace() {
    try {
      const res  = await fetch(CF_TRACE);
      const text = await res.text();
      const get  = (key) => text.match(new RegExp(`^${key}=(.+)$`, 'm'))?.[1]?.trim() ?? null;
      return { isp: get('org'), colo: get('colo'), loc: get('loc') };
    } catch {
      return { isp: null, colo: null, loc: null };
    }
  }
}

export default new SpeedTestService();
