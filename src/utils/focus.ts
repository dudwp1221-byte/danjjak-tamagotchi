import { todayIndex } from './pet'

/**
 * 집중 타이머 규칙 — "일하면서 집중한 만큼 성장이 빨라진다".
 *
 * - 1시간 세션을 완주하면: 즉시 XP + 1시간짜리 집중 버프(업무·케어 XP 배수)
 * - 당일 연속 완주(스트릭)로 버프가 강해진다: ×1.5 → ×1.75 → ×2.0
 * - 보상은 하루 4세션까지. 4세션을 다 채우면 피니셔 보너스(1일 1회)
 * - 세션 중단(포기·자리 비움)은 실패 — 보상 없이 스트릭이 끊긴다
 *
 * 상태는 localStorage에 저장되어 게임 창·바탕화면 펫이 같은 버프를 본다.
 */

const KEY = 'danjjak-focus'

/** 세션 길이 (분) — 업무 1시간 단위와 맞춤 */
export const FOCUS_SESSION_MIN = 60
/** 완주 후 휴식 (분) */
export const FOCUS_BREAK_MIN = 10
/** 하루 보상 세션 상한 */
export const FOCUS_DAILY_CAP = 4
/** 세션 완주 즉시 XP (1시간 근무 XP ~120의 절반 수준 보너스) */
export const FOCUS_SESSION_XP = 60
/** 버프 지속 (분) — 세션 길이와 동일, 완주가 다음 1시간을 가속 */
export const FOCUS_BUFF_MIN = 60
/** 스트릭별 XP 배수 (1연속, 2연속, 3연속+) */
export const FOCUS_MULTS = [1.5, 1.75, 2.0] as const
/** 4세션 피니셔 보너스 */
export const FOCUS_FINISHER = { xp: 60, coins: 20 } as const
/** Electron: 세션 중 이 시간(초) 연속 자리 비움이면 자동 실패 */
export const FOCUS_IDLE_FAIL_SEC = 180

export interface FocusState {
  /** 로컬 자정 기준 날짜 인덱스 — 바뀌면 전부 리셋 */
  day: number
  /** 오늘 완료(보상 지급) 세션 수 */
  completed: number
  /** 오늘 연속 완주 수 (실패 시 0으로) */
  streak: number
  /** 버프 만료 시각 (epoch ms, 0 = 없음) */
  buffUntil: number
  /** 버프 배수 */
  buffMult: number
  /** 피니셔 보너스 수령 여부 */
  finisherClaimed: boolean
}

const DEFAULT: FocusState = {
  day: 0,
  completed: 0,
  streak: 0,
  buffUntil: 0,
  buffMult: 1,
  finisherClaimed: false,
}

export function loadFocus(): FocusState {
  try {
    const raw = localStorage.getItem(KEY)
    const s = raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<FocusState>) } : { ...DEFAULT }
    // 날짜가 바뀌면 일일 카운터 리셋 (버프는 자정 넘겨도 만료 시각까지 유지)
    if (s.day !== todayIndex()) {
      return { ...DEFAULT, day: todayIndex(), buffUntil: s.buffUntil, buffMult: s.buffMult }
    }
    return s
  } catch {
    return { ...DEFAULT, day: todayIndex() }
  }
}

function save(s: FocusState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    // 무시
  }
}

/** 현재 XP 배수 — 버프 중이면 배수, 아니면 1. (업무 틱·케어 XP에 곱한다) */
export function focusMultiplier(now: number = Date.now()): number {
  const s = loadFocus()
  return s.buffUntil > now ? s.buffMult : 1
}

/** 표시용 버프 정보 (없으면 null) */
export function focusBuffInfo(now: number = Date.now()): { mult: number; remainMin: number } | null {
  const s = loadFocus()
  if (s.buffUntil <= now) return null
  return { mult: s.buffMult, remainMin: Math.ceil((s.buffUntil - now) / 60000) }
}

export interface FocusCompleteResult {
  /** 보상 상한 초과 여부 (초과면 나머지 필드 무의미) */
  capped: boolean
  xp: number
  coins: number
  mult: number
  buffMin: number
  /** 오늘 완료 세션 수 (이번 포함) */
  completed: number
  streak: number
  /** 이번에 피니셔 보너스를 받았는지 */
  finisher: boolean
}

/** 세션 완주 처리 — 버프 갱신 + 보상 계산 */
export function completeFocusSession(now: number = Date.now()): FocusCompleteResult {
  const s = loadFocus()
  if (s.completed >= FOCUS_DAILY_CAP) {
    return { capped: true, xp: 0, coins: 0, mult: 1, buffMin: 0, completed: s.completed, streak: s.streak, finisher: false }
  }
  const completed = s.completed + 1
  const streak = s.streak + 1
  const mult = FOCUS_MULTS[Math.min(streak - 1, FOCUS_MULTS.length - 1)]
  const finisher = completed >= FOCUS_DAILY_CAP && !s.finisherClaimed
  save({
    day: s.day,
    completed,
    streak,
    buffUntil: now + FOCUS_BUFF_MIN * 60000,
    buffMult: mult,
    finisherClaimed: s.finisherClaimed || finisher,
  })
  return {
    capped: false,
    xp: FOCUS_SESSION_XP + (finisher ? FOCUS_FINISHER.xp : 0),
    coins: finisher ? FOCUS_FINISHER.coins : 0,
    mult,
    buffMin: FOCUS_BUFF_MIN,
    completed,
    streak,
    finisher,
  }
}

/** 세션 실패 처리 (중단/자리 비움) — 스트릭 리셋, 버프는 건드리지 않음 */
export function failFocusSession(): void {
  const s = loadFocus()
  save({ ...s, streak: 0 })
}
