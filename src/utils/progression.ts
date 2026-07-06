import type { PetAction } from '../types/pet'

/** 케어 1회당 경험치 / 코인 */
export const ACTION_XP = 5
export const ACTION_COINS = 2

/** 미니게임으로 하루에 얻을 수 있는 코인 상한 — 파밍 방지 (기분 보상은 무제한) */
export const MINIGAME_DAILY_COIN_CAP = 60

/**
 * 케어(먹이/쓰다듬기/씻기기)는 직접 돌봐주는 보상이므로 큰 폭의 XP를 준다.
 * 단, 액션별로 시간당 횟수 제한을 둬서 노가다 클릭을 막는다.
 * 제한을 넘기면 스탯은 채워지지만 XP는 거의 없다.
 * (방치 성장은 useBehavior/근무 활동 XP가 따로 담당)
 */
export const CARE_XP = 12
export const CARE_XP_OVER = 1
/** 액션별 시간당 큰 XP 지급 횟수 (매 시각 초기화) */
export const CARE_HOURLY_CAP = 3

/** 액션별 핵심 스탯 (이게 이미 가득 차 있으면 "낭비") */
export const PRIMARY_STAT: Record<PetAction, keyof import('../types/pet').PetStats> = {
  feed: 'hunger',
  pet: 'mood',
  wash: 'cleanliness',
  sleep: 'energy',
  play: 'health',
  gift: 'mood',
}

/** 레벨 L에 도달하는 데 필요한 누적 경험치: 20 * (L-1) * L */
function xpToReach(level: number): number {
  return 20 * (level - 1) * level
}

/** 누적 경험치로부터 현재 레벨 계산 (1~만렙). 만렙 초과 XP가 남아 있어도 표시·보상은 만렙 기준. */
export function levelFromXp(xp: number): number {
  // 20L^2 - 20L - xp <= 0  =>  L <= (20 + sqrt(400 + 80xp)) / 40
  const l = Math.floor((20 + Math.sqrt(400 + 80 * xp)) / 40)
  return Math.min(MAX_LEVEL, Math.max(1, l))
}

/** 현재 레벨 안에서의 진행도 */
export interface LevelProgress {
  level: number
  /** 이번 레벨에서 모은 경험치 */
  current: number
  /** 다음 레벨까지 필요한 총량 */
  needed: number
  /** 0~1 비율 */
  ratio: number
  /** 최고 레벨 도달 여부 */
  maxed: boolean
}

export const MAX_LEVEL = 30
/** 만렙 이후 XP → 코인 전환 비율 (XP 몇 점당 1코인) */
export const OVERFLOW_XP_PER_COIN = 40

export function levelProgress(xp: number): LevelProgress {
  const level = Math.min(levelFromXp(xp), MAX_LEVEL)
  if (level >= MAX_LEVEL) {
    return { level: MAX_LEVEL, current: 1, needed: 1, ratio: 1, maxed: true }
  }
  const base = xpToReach(level)
  const next = xpToReach(level + 1)
  const current = xp - base
  const needed = next - base
  // 표시값은 정수로 (패시브 XP가 소수라 누적 경험치에 소수점이 생김)
  return { level, current: Math.floor(current), needed, ratio: current / needed, maxed: false }
}

/** 진화 단계 (tier 0=유년기 … 4=궁극체) */
export interface Stage {
  key: 'infant' | 'baby' | 'teen' | 'adult' | 'legend'
  label: string
  badge: string
  /** 펫 그림 표시 배율 */
  scale: number
}

// 진화 게이트: 5/10/15/20 (만렙 30 — 궁극체 이후 10레벨의 여생 구간)
const STAGES: { minLevel: number; stage: Stage }[] = [
  { minLevel: 20, stage: { key: 'legend', label: '궁극체', badge: '👑', scale: 1.3 } },
  { minLevel: 15, stage: { key: 'adult', label: '완전체', badge: '✨', scale: 1.18 } },
  { minLevel: 10, stage: { key: 'teen', label: '성숙기', badge: '🌱', scale: 1.05 } },
  { minLevel: 5, stage: { key: 'baby', label: '성장기', badge: '🐣', scale: 0.9 } },
  { minLevel: 1, stage: { key: 'infant', label: '유년기', badge: '🥚', scale: 0.75 } },
]

export function stageFromLevel(level: number): Stage {
  return STAGES.find((s) => level >= s.minLevel)!.stage
}

/** 진화 단계 인덱스 (0:유년기 1:성장기 2:성숙기 3:완전체 4:궁극체) */
export function stageIndexFromLevel(level: number): number {
  if (level >= 20) return 4
  if (level >= 15) return 3
  if (level >= 10) return 2
  if (level >= 5) return 1
  return 0
}
