import type { BehaviorState } from '../types/pet'

export interface FurnitureItem {
  id: string
  name: string
  emoji: string
  price: number
  desc: string
  behaviorBonus?: {
    activatesBehavior: BehaviorState
    weight: number
  }
  evolutionBonus?: {
    profileKey: string
    multiplier: number
  }
  position?: 'left' | 'right' | 'back'
}

export const FURNITURE_ITEMS: FurnitureItem[] = [
  {
    id: 'fur_bed',
    name: '아늑한 침대',
    emoji: '🛏️',
    price: 80,
    desc: '잠을 더 잘 자게 돼요',
    behaviorBonus: { activatesBehavior: 'sleeping', weight: 2.0 },
    position: 'right',
  },
  {
    id: 'fur_bookshelf',
    name: '책장',
    emoji: '📚',
    price: 100,
    desc: '독서를 즐기게 돼요',
    behaviorBonus: { activatesBehavior: 'reading', weight: 2.0 },
    evolutionBonus: { profileKey: 'reading_sessions', multiplier: 1.5 },
    position: 'back',
  },
  {
    id: 'fur_moon_lamp',
    name: '달 조명',
    emoji: '🌙',
    price: 120,
    desc: '밤을 함께 더 많이 보내요',
    behaviorBonus: { activatesBehavior: 'window_gazing', weight: 2.0 },
    evolutionBonus: { profileKey: 'night_companion', multiplier: 2 },
    position: 'left',
  },
  {
    id: 'fur_sofa',
    name: '소파',
    emoji: '🛋️',
    price: 90,
    desc: '낮잠 자는 걸 좋아해요',
    behaviorBonus: { activatesBehavior: 'sleeping', weight: 1.5 },
    position: 'left',
  },
  {
    id: 'fur_toy_box',
    name: '장난감 상자',
    emoji: '🧸',
    price: 70,
    desc: '혼자서도 잘 놀아요',
    behaviorBonus: { activatesBehavior: 'playing', weight: 2.0 },
    evolutionBonus: { profileKey: 'playful_moments', multiplier: 1.5 },
    position: 'right',
  },
]

export function getFurniture(id: string): FurnitureItem | undefined {
  return FURNITURE_ITEMS.find((f) => f.id === id)
}
