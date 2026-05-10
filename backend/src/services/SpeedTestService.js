import speedTest from 'speedtest-net';

const toMbps = (bytesPerSec) => parseFloat(((bytesPerSec * 8) / 1_000_000).toFixed(2));

export class SpeedTestService {
  async run() {
    const raw = await speedTest({ acceptLicense: true, acceptGdpr: true });

    return {
      download:        toMbps(raw.download.bandwidth),
      upload:          toMbps(raw.upload.bandwidth),
      ping:            parseFloat(raw.ping.latency.toFixed(2)),
      jitter:          parseFloat(raw.ping.jitter.toFixed(2)),
      packet_loss:     raw.packetLoss ?? 0,
      server_name:     raw.server?.name     ?? null,
      server_location: raw.server?.location ?? null,
      isp:             raw.isp              ?? null,
    };
  }
}

export default new SpeedTestService();
