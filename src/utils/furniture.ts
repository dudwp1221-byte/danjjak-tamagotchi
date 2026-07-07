import type { BehaviorState, PetAction } from '../types/pet'

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
  /** 케어 보너스 — 해당 케어 액션의 XP에 곱해진다 (예: 간식 바구니 → 먹이주기 ×1.5) */
  careBonus?: {
    action: PetAction
    xpMult: number
  }
  /** 전역 성장 배율 — 모든 XP(케어·업무)에 곱해진다. 고가 가구용 */
  xpMult?: number
  position?: 'left' | 'right' | 'back'
}

export const FURNITURE_ITEMS: FurnitureItem[] = [
  {
    id: 'fur_bed',
    name: '아늑한 침대',
    emoji: '🛏️',
    price: 80,
    desc: '잠을 더 잘 자게 돼요 · 재우기 XP +50%',
    behaviorBonus: { activatesBehavior: 'sleeping', weight: 2.0 },
    careBonus: { action: 'sleep', xpMult: 1.5 },
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
    desc: '혼자서도 잘 놀아요 · 놀아주기 XP +50%',
    behaviorBonus: { activatesBehavior: 'playing', weight: 2.0 },
    evolutionBonus: { profileKey: 'playful_moments', multiplier: 1.5 },
    careBonus: { action: 'play', xpMult: 1.5 },
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
    desc: '바닥에서 뒹굴뒹굴 · 쓰다듬기 XP +30%',
    behaviorBonus: { activatesBehavior: 'sleeping', weight: 1.3 },
    careBonus: { action: 'pet', xpMult: 1.3 },
    position: 'back',
  },
  {
    id: 'fur_snack_basket',
    name: '간식 바구니',
    emoji: '🧺',
    price: 80,
    desc: '군것질을 즐기게 돼요 · 먹이주기 XP +50%',
    behaviorBonus: { activatesBehavior: 'eating', weight: 2.0 },
    careBonus: { action: 'feed', xpMult: 1.5 },
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
  {
    id: 'fur_soccer',
    name: '축구공',
    emoji: '⚽',
    price: 50,
    desc: '데굴데굴 공놀이 · 놀아주기 XP +30%',
    behaviorBonus: { activatesBehavior: 'playing', weight: 1.5 },
    careBonus: { action: 'play', xpMult: 1.3 },
    position: 'left',
  },
  {
    id: 'fur_bathtub',
    name: '거품 욕조',
    emoji: '🛁',
    price: 90,
    desc: '목욕을 좋아하게 돼요 · 씻기기 XP +50%',
    careBonus: { action: 'wash', xpMult: 1.5 },
    position: 'right',
  },
  {
    id: 'fur_crystal_lamp',
    name: '수정 램프',
    emoji: '🔮',
    price: 800,
    desc: '신비한 기운이 방을 채워요 · 모든 XP +10%',
    xpMult: 1.1,
    position: 'back',
  },
]

export function getFurniture(id: string): FurnitureItem | undefined {
  return FURNITURE_ITEMS.find((f) => f.id === id)
}

/** 보유 가구의 케어 액션 XP 배율 (같은 액션 가구가 여럿이면 가장 큰 것만 — 중첩 방지) */
export function furnitureCareXpMult(furniture: string[], action: PetAction): number {
  let best = 1
  for (const id of furniture) {
    const f = getFurniture(id)
    if (f?.careBonus && f.careBonus.action === action) best = Math.max(best, f.careBonus.xpMult)
  }
  return best
}

/** 보유 가구의 전역 XP 배율 (곱연산 중첩) */
export function furnitureXpMult(furniture: string[]): number {
  let mult = 1
  for (const id of furniture) {
    const f = getFurniture(id)
    if (f?.xpMult) mult *= f.xpMult
  }
  return mult
}
