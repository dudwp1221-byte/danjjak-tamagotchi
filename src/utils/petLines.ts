import { typeLine } from './typeLines'
import type { Personality, PetStats } from '../types/pet'
import type { SeasonKey } from './season'
import type { TimePhase, GameSeason } from './gametime'

const LOW = 35

const HUNGRY = ['배고파...', '간식 어디 없나?', '꼬르륵...', '뭐 먹을 거 없어?']
const DIRTY = ['씻고 싶어...', '꼬질꼬질해', '목욕하고파', '근질근질해']
const SLEEPY = ['졸려...', '코~ 자고 싶다', '하품~', '눈이 감겨...']
const LONELY = ['심심해', '놀아줘!', '나 좀 봐줘', '어디 갔어?']

const HAPPY = ['오늘도 좋은 하루!', '히히 신난다', '같이 있어 좋아', '룰루랄라~', '최고야!']

const BY_PERSONALITY: Record<Personality, string[]> = {
  foodie: ['밥 줘! 밥!', '간식 타임 언제야?', '맛있는 거 먹고 싶다'],
  sleepyhead: ['5분만 더...', '낮잠 최고', '느긋하게 가자~'],
  cuddler: ['쓰다듬어 줘 💕', '같이 놀자!', '사랑해~'],
  cleanfreak: ['반짝반짝하고파', '먼지 싫어!', '깨끗한 게 좋아'],
  playful: ['놀자 놀자!', '심심할 틈이 없어', '오늘 뭐하고 놀까?'],
  calm: ['느긋~하게 가자', '서두를 거 없어', '오늘도 평화롭네', '음~ 여유롭다'],
}

/** 시간대별 대사 (낮은 일반 대사로 충분해 비워 둠) */
const BY_PHASE: Partial<Record<TimePhase['key'], string[]>> = {
  dawn: ['좋은 아침! ☀️', '잘 잤어?', '상쾌한 아침이야', '하루가 시작됐어'],
  evening: ['노을 예쁘다 🌆', '하루가 저무네', '저녁 시간이야', '오늘 하루 어땠어?'],
  night: ['이제 잘 시간인가... 🌙', '별이 예쁘다', '밤은 조용해서 좋아', '슬슬 졸리네'],
  midnight: ['다들 자나봐 🌌', '쉿, 한밤중이야', '나만 깨어있어?', 'zzz...'],
}

/** 계절별 대사 */
const BY_SEASON: Record<SeasonKey, string[]> = {
  spring: ['봄이다! 🌸', '꽃놀이 가고 싶어', '따뜻해서 좋아', '새싹이 돋았어'],
  summer: ['더워~ 🌻', '여름이다!', '시원한 거 먹고 싶다', '물놀이 가자!'],
  autumn: ['선선하니 좋네 🍂', '단풍 예쁘다', '가을 타나봐...', '하늘이 높아'],
  winter: ['춥다 추워 ⛄', '겨울이야!', '따뜻하게 있고 싶어', '눈 오면 좋겠다'],
}

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** 현재 상태/성격(+게임 시간, +갈래 타입)에 맞는 펫 대사 한 줄 */
export function pickPetLine(
  stats: PetStats,
  personality: Personality,
  clock?: { phase: TimePhase; season: GameSeason },
  petType?: string,
): string {
  // 가장 부족한 욕구를 우선 표현
  const lowest = Math.min(
    stats.hunger,
    stats.mood,
    stats.cleanliness,
    stats.energy,
  )
  if (lowest < LOW) {
    if (stats.hunger === lowest) return pick(HUNGRY)
    if (stats.cleanliness === lowest) return pick(DIRTY)
    if (stats.energy === lowest) return pick(SLEEPY)
    return pick(LONELY)
  }
  // 갈래(타입) 전용 대사 — 30% 확률로 우선 (진화 갈래마다 다른 개성)
  if (petType && Math.random() < 0.3) {
    const t = typeLine(petType)
    if (t) return t
  }
  // 컨디션이 괜찮으면 성격/행복/시간/계절 대사를 섞어서
  const pools: string[][] = [HAPPY, BY_PERSONALITY[personality]]
  if (clock) {
    const t = BY_PHASE[clock.phase.key]
    if (t) pools.push(t)
    pools.push(BY_SEASON[clock.season.key])
  }
  return pick(pools[Math.floor(Math.random() * pools.length)])
}
