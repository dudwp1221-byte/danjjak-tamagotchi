import type { Pet, Personality } from '../types/pet'
import { levelFromXp } from './progression'
import { canEvolveNow } from './evolve'
import { formById } from './species'
import { typeLine } from './typeLines'
import { bondStage } from './bond'

/* ── 진화 가능 ── */
const EVOLVE_LINES = [
  '나… 진화할 수 있을 것 같아요! ✨',
  '뭔가 변할 것 같은 기분이에요… 🌟',
  '몸이 근질근질, 진화할 때가 됐나봐요! 💫',
  '주인님, 저 진화할 수 있어요! 봐주세요 ✨',
]
function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * 지금 꼭 필요한 게 있으면 그 대사 (없으면 null).
 * 진화 > 배고픔 > 졸림 > 청결 > 건강 > 애정 순.
 */
export function needLine(pet: Pet): string | null {
  const { hunger, energy, cleanliness, mood, health } = pet.stats
  if (canEvolveNow(pet, levelFromXp(pet.growth))) return pick(EVOLVE_LINES)
  if (hunger < 30) return '배고파요... 🍙'
  if (energy < 25) return '졸려요... 💤'
  if (cleanliness < 30) return '씻고 싶어요 🛁'
  if (health < 30) return '몸이 좀 안 좋아요... 🤒'
  if (mood < 35) return '쓰다듬어줘요 💕'
  return null
}

/* ── 시간대별 힐링 대사 ── */
type Bucket = 'morning' | 'preLunch' | 'postLunch' | 'evening' | 'overtime' | 'work'

function bucketFor(hour: number): Bucket {
  if (hour >= 7 && hour < 10) return 'morning'
  if (hour >= 11 && hour < 13) return 'preLunch'
  if (hour >= 13 && hour < 15) return 'postLunch'
  if (hour >= 17 && hour < 20) return 'evening'
  if (hour >= 20 || hour < 6) return 'overtime'
  return 'work'
}

const TIME_LINES: Record<Bucket, string[]> = {
  morning: [
    '좋은 아침이에요! 오늘도 화이팅 ☀️',
    '출근하느라 고생 많았어요 🚶',
    '오늘 하루도 잘 부탁해요!',
    '아침은 챙겨 드셨어요? 🥪',
  ],
  preLunch: [
    '슬슬 배고파질 시간이네요 🍚',
    '오늘 점심 뭐 드실 거예요? 😋',
    '오전 잘 버텼어요! 곧 점심이에요',
  ],
  postLunch: [
    '밥 잘 먹었어요? 😊',
    '식곤증 조심하세요~ 😴',
    '잠깐 스트레칭 어때요? 🙆',
  ],
  evening: [
    '오늘도 정말 수고했어요! 🌆',
    '퇴근 시간 다가와요, 조금만 더 힘내요',
    '집 가면 푹 쉬어요 💛',
  ],
  overtime: [
    '주인님 너무 무리하지 말아요 🌙',
    '늦었어요… 쉬엄쉬엄해요',
    '커피 한 잔 어때요? ☕',
    '몸 꼭 챙기면서 해요 🥹',
  ],
  work: [
    '집중 잘 되고 있어요? ✨',
    '물 한 잔 마셔요 💧',
    '주인님 쉬엄쉬엄하세요~',
    '잠깐 눈 좀 쉬어요 👀',
    '잘하고 있어요, 토닥토닥 🫶',
  ],
}

/* ── 성격별 대사 ── */
const PERSONALITY_LINES: Record<Personality, string[]> = {
  foodie: ['배고프면 저랑 같이 먹어요 🍖', '맛있는 거 생각나요…', '간식 타임 어때요?'],
  sleepyhead: ['졸리면 잠깐 눈 붙여요 😴', '하암~ 같이 쉴까요?', '무리하면 안 돼요, 쉬엄쉬엄'],
  cuddler: ['저 보고 싶었죠? 🥰', '쓰다듬어주면 힘날 것 같아요 💕', '옆에 있어줘서 좋아요'],
  cleanfreak: ['책상도 깔끔하게! ✨', '손 씻는 거 잊지 마요 🫧', '정리하면 기분 좋아져요'],
  playful: ['잠깐 놀다 할까요? 🤸', '심심하면 저랑 놀아요!', '스트레스는 펑펑 날려요 🎈'],
  calm: ['천천히 해도 괜찮아요 🧘', '숨 한번 고르고 가요~', '여유가 제일이에요 ☕'],
}

/* ── 유대 단계별 친밀 대사 — 관계가 깊어질수록 말이 가까워진다 (bond.ts 단계명 기준) ── */
const BOND_LINES: Record<string, string[]> = {
  '처음 만난 사이': [
    '아직은 조금 낯설지만… 잘 부탁해요!',
    '주인님은 어떤 분일까, 궁금해요 👀',
  ],
  '낯익은 사이': [
    '주인님 얼굴 보면 이제 마음이 놓여요 😊',
    '오늘도 같이 있어서 좋아요',
  ],
  '친해진 사이': [
    '주인님이랑 있는 시간이 제일 편해요 ☺️',
    '이제 주인님 기척만 느껴도 알아요!',
  ],
  '마음을 연 사이': [
    '있잖아요… 주인님이 있어서 매일이 좋아요 💛',
    '힘든 날엔 저한테 기대요. 제가 있잖아요',
  ],
  '둘도 없는 단짝': [
    '우린 둘도 없는 단짝이죠? 저는 그렇게 생각해요 💖',
    '주인님 곁이 세상에서 제일 좋아요',
  ],
  '운명의 단짝': [
    '다시 태어나도 주인님한테 갈 거예요 ✨',
    '말 안 해도 알아요. 우리 사이니까 🫶',
  ],
}

/** 평상시(필요 없을 때) 유대·갈래·성격·시간대 섞은 힐링 한마디 */
export function ambientLine(pet: Pet, hour: number = new Date().getHours()): string {
  if (Math.random() < 0.2) {
    const lines = BOND_LINES[bondStage(pet.bond ?? 0).name]
    if (lines) return pick(lines)
  }
  if (Math.random() < 0.25) {
    const t = typeLine(formById(pet.form).type)
    if (t) return t
  }
  if (Math.random() < 0.35) return pick(PERSONALITY_LINES[pet.personality])
  return pick(TIME_LINES[bucketFor(hour)])
}

/** 펫을 직접 콕 눌렀을 때 — 필요한 게 있으면 그것, 없으면 힐링 한마디 */
export function pokeLine(pet: Pet): string {
  return needLine(pet) ?? ambientLine(pet)
}
