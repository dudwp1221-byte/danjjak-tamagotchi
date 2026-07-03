import type { Personality, PetStats } from '../types/pet'

export interface PersonalityDef {
  id: Personality
  name: string
  emoji: string
  desc: string
  /** 특정 스탯이 더 빨리 줄어드는 배수 (기질의 까다로운 부분) */
  decayMult: Partial<PetStats>
}

export const PERSONALITIES: Record<Personality, PersonalityDef> = {
  foodie: {
    id: 'foodie',
    name: '먹보',
    emoji: '🍖',
    desc: '자주 배고파해요. 먹이를 더 챙겨주세요!',
    decayMult: { hunger: 1.6 },
  },
  sleepyhead: {
    id: 'sleepyhead',
    name: '잠꾸러기',
    emoji: '😴',
    desc: '쉽게 지쳐요. 푹 재워주세요.',
    decayMult: { energy: 1.6 },
  },
  cuddler: {
    id: 'cuddler',
    name: '애교쟁이',
    emoji: '🥰',
    desc: '관심이 많이 필요해요. 자주 쓰다듬어 주세요.',
    decayMult: { mood: 1.6 },
  },
  cleanfreak: {
    id: 'cleanfreak',
    name: '깔끔이',
    emoji: '🫧',
    desc: '금방 꼬질꼬질해져요. 자주 씻겨주세요.',
    decayMult: { cleanliness: 1.6 },
  },
  playful: {
    id: 'playful',
    name: '장난꾸러기',
    emoji: '🤸',
    desc: '에너지가 넘쳐 기분도 기운도 빨리 변해요.',
    decayMult: { mood: 1.3, energy: 1.3 },
  },
  calm: {
    id: 'calm',
    name: '느긋이',
    emoji: '🧘',
    desc: '느긋한 성격이라 모든 스탯이 천천히 줄어요.',
    decayMult: {
      hunger: 0.85,
      mood: 0.85,
      cleanliness: 0.85,
      energy: 0.85,
      health: 0.85,
    },
  },
}

const ALL: Personality[] = [
  'foodie',
  'sleepyhead',
  'cuddler',
  'cleanfreak',
  'playful',
  'calm',
]

/** 무작위 기질 (펫 생성 시) */
export function randomPersonality(): Personality {
  return ALL[Math.floor(Math.random() * ALL.length)]
}

/** id로부터 안정적인 기질 (구버전 펫 마이그레이션용) */
export function personalityFromId(id: string): Personality {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return ALL[h % ALL.length]
}

export function personalityDef(p: Personality): PersonalityDef {
  return PERSONALITIES[p]
}
