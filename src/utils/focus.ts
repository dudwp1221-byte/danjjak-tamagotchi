import { todayIndex } from './pet'

/**
 * 집중 모드 — "집중 타이머를 켜고 60분을 채우면, 완료 시 대량의 경험치를 받는다".
 *
 * - 집중 모드는 오직 이 타이머로만 진입한다 (평소 업무 자동 감지는 '업무 중').
 * - 하루 3번까지.
 * - 스트릭·연속 보상·성장 버프 개념 없음 — 완료할 때마다 동일한 큰 보상.
 * - 60분을 채우면 '업무 완료' 버튼으로 직접 보상을 수령한다 →
 *   대량 XP + 피로(건강·기운·포만도 감소. 열심히 일했으니까).
 *
 * 상태는 localStorage에 저장되어 게임 창·바탕화면 펫이 공유한다.
 */

const KEY = 'danjjak-focus'

/** 세션 길이 (분) */
export const FOCUS_SESSION_MIN = 60
/** 하루 집중 세션 상한 */
export const FOCUS_DAILY_CAP = 3
/** 완료 시 지급하는 대량 경험치 */
export const FOCUS_COMPLETE_XP = 300
/** 완료(열일) 후 피로 — 스탯 감소량 */
export const FOCUS_STAT_DRAIN = { hunger: 25, energy: 30, health: 12 } as const
/** Electron: 세션 중 이 시간(초) 연속 자리 비움이면 자동 실패 */
export const FOCUS_IDLE_FAIL_SEC = 180

export interface FocusState {
  /** 로컬 자정 기준 날짜 인덱스 — 바뀌면 리셋 */
  day: number
  /** 오늘 완료(보상 수령) 세션 수 */
  completed: number
}

const DEFAULT: FocusState = { day: 0, completed: 0 }

export function loadFocus(): FocusState {
  try {
    const raw = localStorage.getItem(KEY)
    const s = raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<FocusState>) } : { ...DEFAULT }
    if (s.day !== todayIndex()) return { day: todayIndex(), completed: 0 }
    return s
  } catch {
    return { day: todayIndex(), completed: 0 }
  }
}

function save(s: FocusState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    // 무시
  }
}

/** 오늘 집중 세션을 더 시작할 수 있는지 (하루 3번 상한) */
export function canStartFocus(): boolean {
  return loadFocus().completed < FOCUS_DAILY_CAP
}

// ── 진행 중인 세션 — localStorage에 영속화되어 타이머 창을 닫아도 계속 돈다 ──

const SESSION_KEY = 'danjjak-focus-session'

export interface FocusSessionState {
  startedAt: number
  endsAt: number
}

export function activeFocusSession(): FocusSessionState | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as FocusSessionState
    return typeof s.endsAt === 'number' ? s : null
  } catch {
    return null
  }
}

export function startFocusSession(now: number = Date.now()): FocusSessionState {
  const s: FocusSessionState = { startedAt: now, endsAt: now + FOCUS_SESSION_MIN * 60000 }
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(s))
  } catch {
    // 무시
  }
  return s
}

export function clearFocusSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY)
  } catch {
    // 무시
  }
}

/** 진행 중 세션 중단 — 보상 없이 세션만 제거 */
export function abortFocusSession(): void {
  clearFocusSession()
}

/** 세션이 60분을 다 채웠고 아직 '업무 완료'를 안 눌렀는지 (보상 수령 대기 상태) */
export function isFocusDue(now: number = Date.now()): boolean {
  const s = activeFocusSession()
  return !!s && now >= s.endsAt
}

export interface FocusClaimResult {
  xp: number
  drain: { hunger: number; energy: number; health: number }
  /** 오늘 완료 세션 수 (이번 포함) */
  completed: number
}

/**
 * '업무 완료' — 60분을 채운 세션의 보상을 수령한다.
 * 대량 XP + 피로(스탯 감소)를 반환하고 세션을 제거한다. 조건 미충족이면 null.
 * (세션 제거가 원자적으로 함께 일어나 중복 지급 없음)
 */
export function claimFocusSession(now: number = Date.now()): FocusClaimResult | null {
  const s = activeFocusSession()
  if (!s || now < s.endsAt) return null
  clearFocusSession()
  const f = loadFocus()
  if (f.completed >= FOCUS_DAILY_CAP) {
    return { xp: 0, drain: { hunger: 0, energy: 0, health: 0 }, completed: f.completed }
  }
  const completed = f.completed + 1
  save({ day: todayIndex(), completed })
  return { xp: FOCUS_COMPLETE_XP, drain: { ...FOCUS_STAT_DRAIN }, completed }
}
