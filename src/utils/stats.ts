import type { PetAction, PetStats } from '../types/pet'
import { ACTION_COINS, ACTION_XP, PRIMARY_STAT } from './progression'

/**
 * 분당 스탯 감소량.
 * 방치형: 하루 종일 안 봐도 스탯이 바닥나지 않도록 매우 느리게.
 * hunger 100→0 ≈ 6.5시간, energy ≈ 7.5시간, cleanliness ≈ 20시간
 */
const DECAY_PER_MIN: PetStats = {
  hunger: 0.13, // ~8/시간 (8시간이면 풀→~36, 하루 ~3번 챙기면 유지)
  cleanliness: 0.08, // ~5/시간
  energy: 0.12, // ~7/시간
  mood: 0.05, // 애정(유대) — 천천히 (~3/시간)
  health: 0.033, // 건강 — 가장 천천히 (~2/시간)
}

/**
 * 액션별 스탯 효과. 버튼은 올려주기만 하고 깎지 않는다.
 * (스탯 감소는 시간 경과(applyDecay)로만 일어남)
 */
const ACTION_EFFECTS: Record<PetAction, Partial<PetStats>> = {
  feed: { hunger: 24 },
  pet: { mood: 20 },
  wash: { cleanliness: 24 },
  sleep: { energy: 26, health: 2 },
  play: { mood: 13, health: 10 },
  gift: { mood: 40, health: 4 },
}

const clamp = (n: number) => Math.max(0, Math.min(100, n))

/** 스탯에 증감(delta)을 더하고 0~100으로 보정한다. (음수면 감소) */
export function adjustStats(stats: PetStats, delta: Partial<PetStats>): PetStats {
  return {
    hunger: clamp(stats.hunger + (delta.hunger ?? 0)),
    mood: clamp(stats.mood + (delta.mood ?? 0)),
    cleanliness: clamp(stats.cleanliness + (delta.cleanliness ?? 0)),
    energy: clamp(stats.energy + (delta.energy ?? 0)),
    health: clamp(stats.health + (delta.health ?? 0)),
  }
}

/**
 * 경과 시간(ms)만큼 스탯을 감소시켜 반환한다. (오프라인 시간도 반영)
 * mult로 특정 스탯의 감소 속도를 조절할 수 있다 (성격 반영).
 */
export function applyDecay(
  stats: PetStats,
  lastUpdated: number,
  now: number,
  mult: Partial<PetStats> = {},
  /**
   * 오프라인 그레이스 하한선. 지정 시 감소가 이 값 아래로는 안 내려간다.
   * (앱을 꺼둔 동안 펫이 알아서 쉬었다는 처리 — 자고 일어나도 안 비참하게)
   * 단 이미 floor보다 낮았다면 그대로 둔다(올려주지 않음).
   */
  floor?: number,
): PetStats {
  const minutes = Math.max(0, (now - lastUpdated) / 60000)
  if (minutes === 0) return stats
  const dec = (cur: number, rate: number, m: number) => {
    const next = clamp(cur - rate * m * minutes)
    if (floor === undefined) return next
    return Math.max(next, Math.min(cur, floor))
  }
  return {
    hunger: dec(stats.hunger, DECAY_PER_MIN.hunger, mult.hunger ?? 1),
    mood: dec(stats.mood, DECAY_PER_MIN.mood, mult.mood ?? 1),
    cleanliness: dec(stats.cleanliness, DECAY_PER_MIN.cleanliness, mult.cleanliness ?? 1),
    energy: dec(stats.energy, DECAY_PER_MIN.energy, mult.energy ?? 1),
    health: dec(stats.health, DECAY_PER_MIN.health, mult.health ?? 1),
  }
}

/** 회복 액션을 적용한 새 스탯을 반환한다. */
export function applyAction(stats: PetStats, action: PetAction): PetStats {
  return adjustStats(stats, ACTION_EFFECTS[action])
}

export interface CareResult {
  stats: PetStats
  xp: number
  coins: number
  /** 이미 가득 찬 스탯에 액션해서 보상이 없는 경우 */
  wasted: boolean
}

/**
 * 케어 액션을 수행하고 스탯/보상을 함께 계산한다.
 * 방치형: 언제 와도 플레이어는 항상 보상을 받는다.
 * 스탯이 이미 가득 차 있어도 XP/코인은 주고, 기분을 살짝 올려준다.
 */
export function performCare(stats: PetStats, action: PetAction): CareResult {
  const primary = PRIMARY_STAT[action]
  // play/gift는 트레이드오프가 있어 "이미 가득" 단축을 건너뛰고 항상 효과 적용
  if (action !== 'play' && action !== 'gift' && stats[primary] >= 98) {
    // 이미 가득 참 → 스탯 변화 없이 기분 +5 보너스 + 절반 보상
    return {
      stats: { ...stats, mood: clamp(stats.mood + 5) },
      xp: Math.ceil(ACTION_XP / 2),
      coins: 1,
      wasted: false,
    }
  }
  return {
    stats: applyAction(stats, action),
    xp: ACTION_XP,
    coins: ACTION_COINS,
    wasted: false,
  }
}

/** 전체 컨디션 점수(0~100) — 다섯 스탯의 평균 */
export function wellbeing(stats: PetStats): number {
  return Math.round(
    (stats.hunger + stats.mood + stats.cleanliness + stats.energy + stats.health) / 5,
  )
}

/** 컨디션에 따른 펫의 기분 상태 */
export interface PetMood {
  emoji: string
  label: string
}

export function petMood(stats: PetStats): PetMood {
  // 가장 부족한 스탯을 우선적으로 표현
  const lowest = Math.min(
    stats.hunger,
    stats.mood,
    stats.cleanliness,
    stats.energy,
    stats.health,
  )
  if (stats.hunger === lowest && stats.hunger < 30)
    return { emoji: '🍽️', label: '배고파요...' }
  if (stats.cleanliness === lowest && stats.cleanliness < 30)
    return { emoji: '💧', label: '꼬질꼬질해요' }
  if (stats.energy === lowest && stats.energy < 30)
    return { emoji: '😴', label: '졸려요...' }
  if (stats.health === lowest && stats.health < 30)
    return { emoji: '🤒', label: '아파요...' }
  if (stats.mood === lowest && stats.mood < 30)
    return { emoji: '😢', label: '외로워요' }

  const score = wellbeing(stats)
  if (score >= 80) return { emoji: '😍', label: '아주 행복해요!' }
  if (score >= 50) return { emoji: '🙂', label: '기분 좋아요' }
  return { emoji: '😐', label: '그저 그래요' }
}
