import type { WorkMode, WorkToday } from '../types/pet'

export type { WorkMode }

export interface WorkTickPayload {
  mode: WorkMode
  consecutiveTicks: number
}

/** 활동 감지 틱 길이(초) — Electron 메인의 WORK_TICK_MS와 맞춤 */
export const WORK_TICK_SEC = 15

/**
 * 15초 틱당 XP 지급량. 컴퓨터로 일하는 동안 펫이 함께 성장하는 핵심 공급원.
 * working 0.5 = 120/시간, focused 1 = 240/시간 (방치 트리클 ~47/시간보다 확실히 높게).
 * overtime(야근, 저녁 자동 버닝타임) = 가속.
 */
export const WORK_XP_PER_TICK: Record<Exclude<WorkMode, 'idle'>, number> = {
  working: 0.5,
  focused: 1,
  overtime: 1.5,
}

/** 집중 모드 진입에 필요한 연속 틱 수 (20 × 15s = 5분) */
export const FOCUS_TICK_THRESHOLD = 20

/** 야근 모드 하루 최대 누적 시간 (분) */
export const OVERTIME_DAILY_CAP_MIN = 240

/** 야근(버닝타임) 시간대: 저녁 7시 ~ 새벽 6시 */
export const OVERTIME_HOUR_START = 19
export const OVERTIME_HOUR_END = 6

/** 모드별 표시 텍스트 */
export const WORK_MODE_META: Record<WorkMode, { label: string; emoji: string }> = {
  idle: { label: '대기 중', emoji: '😴' },
  working: { label: '업무 중', emoji: '💼' },
  focused: { label: '집중 모드', emoji: '🔥' },
  overtime: { label: '야근 버닝타임', emoji: '🌙' },
}

/** 진화 조건 카운터에 기록할 틱당 증가량 (분) */
export const WORK_PROFILE_TICK_MIN = 0.25

export interface WorkTickResult {
  /** 틱이 반영된 오늘의 업무 통계 */
  workToday: WorkToday
  /** 지급할 XP */
  xp: number
  /** 증가시킬 진화 조건 카운터 키 (없으면 null) */
  profileKey: 'work_overtime' | 'work_focused' | null
}

function emptyWorkToday(today: number): WorkToday {
  return { date: today, workMinutes: 0, focusMinutes: 0, meetingMinutes: 0, overtimeMinutes: 0 }
}

/**
 * work-tick 1개(15초)를 업무 통계에 반영하고 지급할 XP를 계산한다.
 * 게임 창(useWorkActivity)과 바탕화면 펫(useBackgroundXp)이 같은 규칙을 쓰도록 공용화.
 * 야근 일일 상한 초과·idle이면 null (지급 없음).
 */
export function applyWorkTick(
  prev: WorkToday,
  mode: WorkMode,
  today: number,
): WorkTickResult | null {
  if (mode === 'idle') return null

  const base: WorkToday = prev.date === today ? { ...prev } : emptyWorkToday(today)

  if (mode === 'overtime' && base.overtimeMinutes >= OVERTIME_DAILY_CAP_MIN) return null

  const workToday: WorkToday = {
    ...base,
    workMinutes: base.workMinutes + WORK_PROFILE_TICK_MIN,
    focusMinutes: mode === 'focused' ? base.focusMinutes + WORK_PROFILE_TICK_MIN : base.focusMinutes,
    overtimeMinutes: mode === 'overtime' ? base.overtimeMinutes + WORK_PROFILE_TICK_MIN : base.overtimeMinutes,
  }

  const profileKey =
    mode === 'overtime' ? 'work_overtime' : mode === 'focused' ? 'work_focused' : null

  return { workToday, xp: WORK_XP_PER_TICK[mode] ?? 0, profileKey }
}
