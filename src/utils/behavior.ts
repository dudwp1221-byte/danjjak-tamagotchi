import type { BehaviorState, Personality, PetStats } from '../types/pet'
import type { FurnitureItem } from './furniture'
import { FURNITURE_ITEMS } from './furniture'

interface BehaviorMeta {
  label: string
  emoji: string
  minDuration: number
  maxDuration: number
  statEffect: Partial<PetStats>
  /**
   * 행동 틱(10초)마다 적립되는 수동 XP. 방치 트리클이므로 소수.
   * 평균 ~0.13/틱 → 약 47 XP/시간. (근무 120~240/시간보다 확실히 낮게)
   */
  passiveXp: number
}

/**
 * 행동 메타 정보.
 * statEffect는 BEHAVIOR_TICK_MS(10초)마다 적용되는 회복량.
 * 방치형: 켜두기만 해도 스탯이 유지되고 XP가 쌓이도록.
 * 잠자기(energy 8/틱) + 먹기(hunger 7/틱) = 자율 생존 충분.
 * 청결도는 grooming(idle/wandering)으로 조금씩 회복.
 */
export const BEHAVIOR_META: Record<BehaviorState, BehaviorMeta> = {
  idle: {
    label: '쉬는 중',
    emoji: '😌',
    minDuration: 20000,
    maxDuration: 40000,
    statEffect: { mood: 0.8, cleanliness: 0.3 },
    passiveXp: 0.12,
  },
  sleeping: {
    label: '자는 중',
    emoji: '💤',
    minDuration: 90000,
    maxDuration: 200000,
    statEffect: { energy: 8.0, mood: 1.0 },
    passiveXp: 0.1,
  },
  eating: {
    label: '혼자 챙겨먹는 중',
    emoji: '🍽️',
    minDuration: 20000,
    maxDuration: 40000,
    statEffect: { hunger: 7.0 },
    passiveXp: 0.1,
  },
  reading: {
    label: '독서 중',
    emoji: '📖',
    minDuration: 40000,
    maxDuration: 100000,
    statEffect: { mood: 1.5 },
    passiveXp: 0.2,
  },
  playing: {
    label: '노는 중',
    emoji: '🎮',
    minDuration: 20000,
    maxDuration: 60000,
    statEffect: { mood: 2.0 },
    passiveXp: 0.2,
  },
  window_gazing: {
    label: '창밖 구경',
    emoji: '🌙',
    minDuration: 30000,
    maxDuration: 70000,
    statEffect: { mood: 1.2, energy: 0.8 },
    passiveXp: 0.15,
  },
  wandering: {
    label: '돌아다니는 중',
    emoji: '🚶',
    minDuration: 15000,
    maxDuration: 35000,
    statEffect: { mood: 0.5, cleanliness: 0.2 },
    passiveXp: 0.12,
  },
}

export function randomDuration(state: BehaviorState): number {
  const { minDuration, maxDuration } = BEHAVIOR_META[state]
  return minDuration + Math.random() * (maxDuration - minDuration)
}

export function decideBehavior(
  stats: PetStats,
  personality: Personality,
  furniture: string[],
  hourOfDay: number,
): BehaviorState {
  const isNight = hourOfDay >= 22 || hourOfDay < 6

  // 자율 생존 — 방치형이므로 실제로 필요할 때만 먹고 잠
  if (stats.energy < (personality === 'sleepyhead' ? 35 : 25)) return 'sleeping'
  if (stats.hunger < (personality === 'foodie' ? 35 : 22)) return 'eating'

  // 밤 시간 편향
  if (isNight) {
    return Math.random() < 0.5 ? 'window_gazing' : 'sleeping'
  }

  // 기분 낮으면 놀기
  if (stats.mood < 30) return 'playing'

  // 가구 가중치 기반 확률 선택
  const weights: Record<BehaviorState, number> = {
    idle: 3,
    wandering: 2,
    playing: 1,
    reading: 1,
    window_gazing: 1,
    sleeping: 1,
    eating: 0.5,
  }

  const ownedFurniture = FURNITURE_ITEMS.filter((f: FurnitureItem) =>
    furniture.includes(f.id),
  )
  for (const item of ownedFurniture) {
    if (item.behaviorBonus) {
      const { activatesBehavior, weight } = item.behaviorBonus
      weights[activatesBehavior] = (weights[activatesBehavior] ?? 1) * weight
    }
  }

  const total = Object.values(weights).reduce((s, w) => s + w, 0)
  let r = Math.random() * total
  for (const [state, w] of Object.entries(weights) as [BehaviorState, number][]) {
    r -= w
    if (r <= 0) return state
  }
  return 'idle'
}
