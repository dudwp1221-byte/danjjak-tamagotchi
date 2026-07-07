import { beforeEach, describe, expect, it } from 'vitest'
import {
  loadFocus,
  focusMultiplier,
  focusBuffInfo,
  completeFocusSession,
  failFocusSession,
  startFocusSession,
  activeFocusSession,
  completeDueFocusSession,
  abortFocusSession,
  FOCUS_DAILY_CAP,
  FOCUS_SESSION_XP,
  FOCUS_FINISHER,
  FOCUS_MULTS,
  FOCUS_BUFF_MIN,
} from './focus'

// node 환경용 localStorage 스텁
const store = new Map<string, string>()
beforeEach(() => {
  store.clear()
  globalThis.localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: () => null,
    length: 0,
  } as unknown as Storage
})

describe('집중 타이머 규칙', () => {
  it('버프가 없으면 배수 1', () => {
    expect(focusMultiplier()).toBe(1)
    expect(focusBuffInfo()).toBeNull()
  })

  it('세션 완주 → 즉시 XP + 30분 버프 ×1.5', () => {
    const now = Date.now()
    const r = completeFocusSession(now)
    expect(r.capped).toBe(false)
    expect(r.xp).toBe(FOCUS_SESSION_XP)
    expect(r.mult).toBe(FOCUS_MULTS[0])
    expect(focusMultiplier(now + 1000)).toBe(FOCUS_MULTS[0])
    // 버프 만료 후엔 1로
    expect(focusMultiplier(now + (FOCUS_BUFF_MIN * 60000) + 1)).toBe(1)
  })

  it('연속 완주 스트릭으로 버프 강화 (1.5 → 1.75 → 2.0 → 2.0 유지)', () => {
    const now = Date.now()
    expect(completeFocusSession(now).mult).toBe(1.5)
    expect(completeFocusSession(now).mult).toBe(1.75)
    expect(completeFocusSession(now).mult).toBe(2.0)
    expect(completeFocusSession(now).mult).toBe(2.0)
  })

  it('실패하면 스트릭 리셋 (버프는 유지)', () => {
    const now = Date.now()
    completeFocusSession(now)
    completeFocusSession(now) // streak 2, mult 1.75
    failFocusSession()
    expect(loadFocus().streak).toBe(0)
    expect(focusMultiplier(now + 1000)).toBe(1.75) // 이미 받은 버프는 유지
    const r = completeFocusSession(now)
    expect(r.mult).toBe(1.5) // 스트릭이 끊겨 처음부터
  })

  it('세션 영속화: 시작 → 시간 전엔 완료 없음 → 시간 지나면 1회만 완료', () => {
    const now = Date.now()
    const s = startFocusSession(now)
    expect(activeFocusSession()?.endsAt).toBe(s.endsAt)
    // 아직 안 끝남
    expect(completeDueFocusSession(now + 1000)).toBeNull()
    expect(activeFocusSession()).not.toBeNull()
    // 끝난 뒤 — 완료 + 세션 소거 (중복 지급 없음)
    const r = completeDueFocusSession(s.endsAt + 1)
    expect(r?.capped).toBe(false)
    expect(activeFocusSession()).toBeNull()
    expect(completeDueFocusSession(s.endsAt + 2)).toBeNull()
  })

  it('세션 중단(abort): 세션 제거 + 스트릭 리셋', () => {
    const now = Date.now()
    completeFocusSession(now) // streak 1
    startFocusSession(now)
    abortFocusSession()
    expect(activeFocusSession()).toBeNull()
    expect(loadFocus().streak).toBe(0)
  })

  it('하루 4세션 상한 + 4번째에 피니셔 보너스', () => {
    const now = Date.now()
    let last = completeFocusSession(now)
    for (let i = 1; i < FOCUS_DAILY_CAP; i++) last = completeFocusSession(now)
    expect(last.finisher).toBe(true)
    expect(last.xp).toBe(FOCUS_SESSION_XP + FOCUS_FINISHER.xp)
    expect(last.coins).toBe(FOCUS_FINISHER.coins)
    // 상한 초과 세션은 보상 없음
    const over = completeFocusSession(now)
    expect(over.capped).toBe(true)
    expect(over.xp).toBe(0)
  })
})
