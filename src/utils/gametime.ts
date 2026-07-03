/**
 * 게임 내 가속 시계 — 현실과 별개로 게임 안에서 시간이 빠르게 흐른다.
 * 펫이 태어난 순간(createdAt)이 게임 시간의 시작점이다.
 *
 * 달력: 게임 1년 = 365일(현실 달력), 실제 7일에 맞아떨어진다.
 * → 게임 1일 = 실제 약 27.6분(밤/낮 한 주기), 게임 1분 ≈ 실제 1.15초.
 * 월은 실제 달력 길이(1월 31일 … 2월 28일 …)를 따른다(윤년 무시).
 * 계절은 3달씩(봄→여름→가을→겨울), 게임은 봄(1월)부터 시작한다.
 */
import type { SeasonKey } from './season'

/** 게임 일 년의 달 수 */
export const MONTHS_PER_YEAR = 12
/** 게임 일 년의 일수 (365, 현실 달력) */
export const DAYS_PER_YEAR = 365
/** 게임 1년에 해당하는 실제 시간(ms) = 정확히 7일 */
export const REAL_MS_PER_GAME_YEAR = 7 * 24 * 60 * 60 * 1000
/** 게임 하루에 해당하는 실제 시간(ms) = 실제 7일 / 365 ≈ 27.6분 */
export const REAL_MS_PER_GAME_DAY = REAL_MS_PER_GAME_YEAR / DAYS_PER_YEAR

/** 펫이 깨어난(태어난) 순간의 게임 시각(시). 아침에 시작한다. */
export const BIRTH_HOUR = 8

/** 각 달의 일수 (합 365, 윤년 무시) */
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

const MIN_PER_DAY = 24 * 60

/** 게임 계절 */
export interface GameSeason {
  key: SeasonKey
  name: string
  emoji: string
}

const SEASONS: GameSeason[] = [
  { key: 'spring', name: '봄', emoji: '🌸' },
  { key: 'summer', name: '여름', emoji: '🌻' },
  { key: 'autumn', name: '가을', emoji: '🍂' },
  { key: 'winter', name: '겨울', emoji: '⛄' },
]

/** 게임 월(1~12)에 해당하는 계절 (3달씩) */
export function seasonForMonth(month: number): GameSeason {
  const idx = Math.floor((month - 1) / 3) % 4
  return SEASONS[idx]
}

/** 하루의 시간대 */
export interface TimePhase {
  key: 'dawn' | 'day' | 'evening' | 'night' | 'midnight'
  name: string
  emoji: string
  /** 무대 배경을 어둡게 덮는 강도 0~1 (밤일수록 큼) */
  dark: number
}

const PHASES: Record<TimePhase['key'], TimePhase> = {
  dawn: { key: 'dawn', name: '새벽', emoji: '🌅', dark: 0.2 },
  day: { key: 'day', name: '낮', emoji: '☀️', dark: 0 },
  evening: { key: 'evening', name: '저녁', emoji: '🌆', dark: 0.22 },
  night: { key: 'night', name: '밤', emoji: '🌙', dark: 0.42 },
  midnight: { key: 'midnight', name: '한밤중', emoji: '🌌', dark: 0.55 },
}

/** 게임 시각(시)에 해당하는 시간대 */
export function phaseForHour(hour: number): TimePhase {
  if (hour >= 23 || hour < 5) return PHASES.midnight
  if (hour < 8) return PHASES.dawn
  if (hour < 17) return PHASES.day
  if (hour < 20) return PHASES.evening
  return PHASES.night
}

/** 게임 시계 한 시점 */
export interface GameClock {
  /** 게임 누적 일차 (1부터) */
  day: number
  /** 게임 연도 (1부터) */
  year: number
  /** 게임 월 (1~12) */
  month: number
  /** 이번 달 며칠째 (1~6) */
  monthDay: number
  /** 0~23 */
  hour: number
  /** 0~59 */
  minute: number
  phase: TimePhase
  season: GameSeason
  /** 밤(밤·한밤중) 시간대 여부 */
  isNight: boolean
  /** "HH:MM" */
  hhmm: string
}

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)

/**
 * 펫 생성 시각과 현재 실제 시각으로 게임 시계를 계산한다.
 */
export function gameClock(createdAt: number, now: number = Date.now()): GameClock {
  const elapsed = Math.max(0, now - createdAt)
  const elapsedGameMin = (elapsed / REAL_MS_PER_GAME_DAY) * MIN_PER_DAY
  const totalMin = BIRTH_HOUR * 60 + elapsedGameMin
  const day = Math.floor(totalMin / MIN_PER_DAY) + 1
  const intoDay = totalMin % MIN_PER_DAY
  const hour = Math.floor(intoDay / 60)
  const minute = Math.floor(intoDay % 60)

  const dayIdx = day - 1
  const year = Math.floor(dayIdx / DAYS_PER_YEAR) + 1
  let dayOfYear = dayIdx % DAYS_PER_YEAR // 0-based
  let month = 1
  for (let i = 0; i < 12; i++) {
    if (dayOfYear < MONTH_DAYS[i]) {
      month = i + 1
      break
    }
    dayOfYear -= MONTH_DAYS[i]
  }
  const monthDay = dayOfYear + 1
  const phase = phaseForHour(hour)

  return {
    day,
    year,
    month,
    monthDay,
    hour,
    minute,
    phase,
    season: seasonForMonth(month),
    isNight: phase.key === 'night' || phase.key === 'midnight',
    hhmm: `${pad(hour)}:${pad(minute)}`,
  }
}

/** 현재 게임 계절 키 (진화/각성 조건용) */
export function gameSeasonKey(createdAt: number, now: number = Date.now()): SeasonKey {
  return gameClock(createdAt, now).season.key
}

/** 현재 게임이 밤인지 (진화 조건용) */
export function isGameNight(createdAt: number, now: number = Date.now()): boolean {
  return gameClock(createdAt, now).isNight
}

/**
 * 펫이 태어난 실제 달(1~12). 12지신은 입양한 달로 정해진다 — 일종의 별자리.
 */
export function birthMonth(createdAt: number): number {
  return new Date(createdAt).getMonth() + 1
}
