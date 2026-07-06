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
  {
    id: 'fur_plant',
    name: '초록 화분',
    emoji: '🪴',
    price: 60,
    desc: '초록 곁을 어슬렁거리게 돼요',
    behaviorBonus: { activatesBehavior: 'wandering', weight: 1.8 },
    position: 'left',
  },
  {
    id: 'fur_rug',
    name: '포근한 러그',
    emoji: '🧶',
    price: 70,
    desc: '바닥에서 뒹굴뒹굴 낮잠을 자요',
    behaviorBonus: { activatesBehavior: 'sleeping', weight: 1.3 },
    position: 'back',
  },
  {
    id: 'fur_snack_basket',
    name: '간식 바구니',
    emoji: '🧺',
    price: 80,
    desc: '군것질을 즐기게 돼요',
    behaviorBonus: { activatesBehavior: 'eating', weight: 2.0 },
    position: 'right',
  },
  {
    id: 'fur_radio',
    name: '라디오',
    emoji: '📻',
    price: 90,
    desc: '음악에 맞춰 신나게 놀아요',
    behaviorBonus: { activatesBehavior: 'playing', weight: 1.8 },
    evolutionBonus: { profileKey: 'playful_moments', multiplier: 1.3 },
    position: 'left',
  },
  {
    id: 'fur_fishtank',
    name: '어항',
    emoji: '🐠',
    price: 110,
    desc: '물멍하며 마음이 차분해져요',
    behaviorBonus: { activatesBehavior: 'window_gazing', weight: 1.8 },
    position: 'back',
  },
  {
    id: 'fur_desk',
    name: '작은 책상',
    emoji: '📖',
    price: 100,
    desc: '차분히 공부하는 시간이 늘어요',
    behaviorBonus: { activatesBehavior: 'reading', weight: 1.6 },
    evolutionBonus: { profileKey: 'reading_sessions', multiplier: 1.3 },
    position: 'right',
  },
  {
    id: 'fur_telescope',
    name: '망원경',
    emoji: '🔭',
    price: 150,
    desc: '밤하늘을 오래 바라보게 돼요',
    behaviorBonus: { activatesBehavior: 'window_gazing', weight: 2.2 },
    evolutionBonus: { profileKey: 'night_companion', multiplier: 2 },
    position: 'left',
  },
]

export function getFurniture(id: string): FurnitureItem | undefined {
  return FURNITURE_ITEMS.find((f) => f.id === id)
}
