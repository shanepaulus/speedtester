import { performance } from 'perf_hooks';
import { randomBytes } from 'crypto';

const CF_DOWN  = 'https://speed.cloudflare.com/__down';
const CF_UP    = 'https://speed.cloudflare.com/__up';
const CF_TRACE = 'https://www.cloudflare.com/cdn-cgi/trace';

export class SpeedTestService {
  async run(onProgress) {
    onProgress?.({ phase: 'ping' });
    const [isp, latency] = await Promise.all([this.#isp(), this.#ping()]);
    onProgress?.({ phase: 'ping_done', ping: latency.ping, jitter: latency.jitter });

    onProgress?.({ phase: 'download', value: 0 });
    const dl = await this.#download(onProgress);

    onProgress?.({ phase: 'upload', value: 0 });
    const ul = await this.#upload(onProgress);

    return {
      download:        dl,
      upload:          ul,
      ping:            latency.ping,
      jitter:          latency.jitter,
      packet_loss:     0,
      server_name:     'Cloudflare',
      server_location: 'Nearest edge',
      isp,
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

  async #download(onProgress) {
    const size   = 25_000_000;
    const start  = performance.now();
    const res    = await fetch(`${CF_DOWN}?bytes=${size}`);
    let received = 0;
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
    const elapsed = (performance.now() - start) / 1000;
    return parseFloat((received * 8 / elapsed / 1_000_000).toFixed(2));
  }

  async #upload(onProgress) {
    const data  = randomBytes(10 * 1024 * 1024);
    const start = performance.now();
    await fetch(CF_UP, { method: 'POST', body: data, headers: { 'Content-Type': 'application/octet-stream' } });
    const elapsed = (performance.now() - start) / 1000;
    const ul = parseFloat((data.length * 8 / elapsed / 1_000_000).toFixed(2));
    onProgress?.({ phase: 'upload', value: ul });
    return ul;
  }

  async #isp() {
    try {
      const res  = await fetch(CF_TRACE);
      const text = await res.text();
      return text.match(/^org=(.+)$/m)?.[1]?.trim() ?? null;
    } catch {
      return null;
    }
  }
}

export default new SpeedTestService();
