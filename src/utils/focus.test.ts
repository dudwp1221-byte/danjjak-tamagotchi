import { beforeEach, describe, expect, it } from 'vitest'
import {
  loadFocus,
  canStartFocus,
  startFocusSession,
  activeFocusSession,
  isFocusDue,
  claimFocusSession,
  abortFocusSession,
  FOCUS_DAILY_CAP,
  FOCUS_COMPLETE_XP,
  FOCUS_STAT_DRAIN,
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

describe('집중 모드 규칙 (재기획)', () => {
  it('처음엔 완료 0, 시작 가능', () => {
    expect(loadFocus().completed).toBe(0)
    expect(canStartFocus()).toBe(true)
  })

  it('세션 영속화: 시작 → 시간 전엔 완료 대기 아님 → 시간 지나면 due', () => {
    const now = Date.now()
    const s = startFocusSession(now)
    expect(activeFocusSession()?.endsAt).toBe(s.endsAt)
    expect(isFocusDue(now + 1000)).toBe(false)
    expect(claimFocusSession(now + 1000)).toBeNull() // 아직 안 끝남
    expect(isFocusDue(s.endsAt + 1)).toBe(true)
  })

  it('업무 완료: 대량 XP + 피로 반환, 세션 제거, 완료 수 +1 (중복 수령 없음)', () => {
    const now = Date.now()
    const s = startFocusSession(now)
    const r = claimFocusSession(s.endsAt + 1)
    expect(r?.xp).toBe(FOCUS_COMPLETE_XP)
    expect(r?.drain.energy).toBe(FOCUS_STAT_DRAIN.energy)
    expect(r?.completed).toBe(1)
    expect(activeFocusSession()).toBeNull()
    expect(loadFocus().completed).toBe(1)
    expect(claimFocusSession(s.endsAt + 2)).toBeNull() // 재수령 없음
  })

  it('하루 3번 상한 — 3번 완료하면 더는 시작 불가', () => {
    const now = Date.now()
    for (let i = 0; i < FOCUS_DAILY_CAP; i++) {
      const s = startFocusSession(now)
      claimFocusSession(s.endsAt + 1)
    }
    expect(loadFocus().completed).toBe(FOCUS_DAILY_CAP)
    expect(canStartFocus()).toBe(false)
  })

  it('중단(abort): 세션만 제거, 완료 수는 그대로', () => {
    const now = Date.now()
    startFocusSession(now)
    abortFocusSession()
    expect(activeFocusSession()).toBeNull()
    expect(loadFocus().completed).toBe(0)
  })
})
