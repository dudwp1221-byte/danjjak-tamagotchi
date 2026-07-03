export type AmbientType = 'rain' | 'cafe' | 'forest'

export const AMBIENT_META: Record<AmbientType, { label: string; emoji: string }> = {
  rain: { label: '빗소리', emoji: '🌧️' },
  cafe: { label: '카페', emoji: '☕' },
  forest: { label: '숲', emoji: '🌿' },
}

const CYCLE: (AmbientType | null)[] = [null, 'rain', 'cafe', 'forest']

export function nextAmbient(current: AmbientType | null): AmbientType | null {
  const idx = CYCLE.indexOf(current)
  return CYCLE[(idx + 1) % CYCLE.length]
}

function fillNoise(data: Float32Array, type: AmbientType) {
  if (type === 'rain') {
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    return
  }
  if (type === 'cafe') {
    // brown noise: integrate white
    let last = 0
    for (let i = 0; i < data.length; i++) {
      const w = Math.random() * 2 - 1
      last = (last + 0.02 * w) / 1.02
      data[i] = last * 3.5
    }
    return
  }
  // forest: pink noise approximation
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0
  for (let i = 0; i < data.length; i++) {
    const w = Math.random() * 2 - 1
    b0 = 0.99886 * b0 + w * 0.0555179
    b1 = 0.99332 * b1 + w * 0.0750759
    b2 = 0.96900 * b2 + w * 0.1538520
    b3 = 0.86650 * b3 + w * 0.3104856
    b4 = 0.55000 * b4 + w * 0.5329522
    b5 = -0.7616 * b5 - w * 0.0168980
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + w * 0.5362) * 0.11
  }
}

export class AmbientPlayer {
  private ctx: AudioContext | null = null
  private source: AudioBufferSourceNode | null = null
  private gain: GainNode | null = null
  current: AmbientType | null = null
  volume = 0.35

  play(type: AmbientType) {
    this.stop()
    this.current = type

    const ctx = new AudioContext()
    this.ctx = ctx

    const sampleRate = ctx.sampleRate
    const seconds = 10
    const bufSize = sampleRate * seconds
    const buffer = ctx.createBuffer(1, bufSize, sampleRate)
    fillNoise(buffer.getChannelData(0), type)

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = type === 'rain' ? 'bandpass' : 'lowpass'
    filter.frequency.value = type === 'rain' ? 800 : 600
    filter.Q.value = type === 'rain' ? 0.5 : 1

    const gain = ctx.createGain()
    gain.gain.value = this.volume
    this.gain = gain

    source.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)
    source.start()
    this.source = source
  }

  stop() {
    try { this.source?.stop() } catch { /* already stopped */ }
    this.ctx?.close().catch(() => {})
    this.source = null
    this.ctx = null
    this.gain = null
    this.current = null
  }

  setVolume(v: number) {
    this.volume = v
    if (this.gain) this.gain.gain.value = v
  }
}
