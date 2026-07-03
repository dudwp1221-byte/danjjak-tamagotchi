/**
 * 외부 음원 없이 Web Audio API로 간단한 효과음을 낸다.
 * "회사에서 몰래" 컨셉이라 기본은 음소거 상태로 시작한다.
 */

import type { PetAction } from '../types/pet'

let ctx: AudioContext | null = null
let muted = true

export function isMuted(): boolean {
  return muted
}

export function setMuted(value: boolean): void {
  muted = value
}

function getCtx(): AudioContext | null {
  if (muted) return null
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  return ctx
}

/** 짧은 비프음 하나 */
function blip(freq: number, durationMs: number, type: OscillatorType = 'sine') {
  const audio = getCtx()
  if (!audio) return
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.0001, audio.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.15, audio.currentTime + 0.01)
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    audio.currentTime + durationMs / 1000,
  )
  osc.connect(gain).connect(audio.destination)
  osc.start()
  osc.stop(audio.currentTime + durationMs / 1000)
}

/** 액션별 효과음 */
export function playAction(action: PetAction): void {
  switch (action) {
    case 'feed':
      blip(523, 120, 'triangle')
      break
    case 'pet':
      blip(659, 90, 'sine')
      window.setTimeout(() => blip(784, 110, 'sine'), 90)
      break
    case 'wash':
      blip(880, 140, 'sine')
      break
    case 'sleep':
      blip(392, 200, 'triangle')
      break
  }
}

/** 레벨업 — 상승 아르페지오 */
export function playLevelUp(): void {
  ;[523, 659, 784, 1047].forEach((f, i) =>
    window.setTimeout(() => blip(f, 140, 'triangle'), i * 90),
  )
}

/** 업적 달성 — 밝은 2음 */
export function playAchievement(): void {
  blip(784, 120, 'sine')
  window.setTimeout(() => blip(1047, 180, 'sine'), 110)
}

/** 상사 등장 — 낮고 긴박한 버즈 */
export function playBoss(): void {
  blip(220, 180, 'sawtooth')
  window.setTimeout(() => blip(185, 220, 'sawtooth'), 160)
}

/** 코인 획득 */
export function playCoin(): void {
  blip(988, 80, 'square')
  window.setTimeout(() => blip(1319, 90, 'square'), 70)
}

/** 인트로 — 다마고치 전원 켜는 듯한 향수 멜로디 */
export function playIntroChime(): void {
  ;[392, 523, 659, 880].forEach((f, i) =>
    window.setTimeout(() => blip(f, 170, 'triangle'), i * 150),
  )
}

/** 알이 깨어나는 소리 */
export function playEggHatch(): void {
  blip(659, 90, 'square')
  window.setTimeout(() => blip(880, 90, 'square'), 110)
  window.setTimeout(() => blip(1175, 200, 'triangle'), 250)
}

/** 작은 알이 삐약대는 소리 */
export function playEggBeep(): void {
  blip(740, 70, 'square')
  window.setTimeout(() => blip(740, 70, 'square'), 130)
}
