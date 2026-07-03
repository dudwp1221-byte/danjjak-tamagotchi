import type { Pet } from '../types/pet'
import type { SeasonKey } from './season'
import { formById, ZODIAC, FOUR_SYMBOLS } from './species'

export interface AwakenCtx {
  pet: Pet
  level: number
  /** 발견한 형태 집합 (도감) */
  dex: Set<string>
  /** 현재 게임 계절 (사신수 조건) */
  season: SeasonKey
  /** 펫이 태어난 달 1~12 (12지신 조건) */
  birthMonth: number
}

export interface AwakenCond {
  /** 은근한 암시 (정확한 조건은 숨김) */
  hint: string
  cost: { coins?: number; item?: string }
  check: (c: AwakenCtx) => boolean
}

// 헬퍼
const lo = (p: Pet) =>
  Math.min(p.stats.hunger, p.stats.mood, p.stats.cleanliness, p.stats.energy, p.stats.health)
const fam = (p: Pet) => formById(p.form).family
const bio = (p: Pet) => fam(p) === '생물형' || fam(p) === '혼합·이형형'
const holy = (p: Pet) => fam(p) === '신성·악마형'
/** 형태의 세부 타입이 후보군에 속하는지 (속성 폐지 후 각성 게이트) */
const isKind = (p: Pet, kinds: string[]) => kinds.includes(formById(p.form).type)
/** 어둠 컨셉 타입 (사흉수·죄악마 게이트) */
const DARK_KINDS = ['마왕형', '악마형', '마수형', '언데드형']

const conds: Record<string, AwakenCond> = {
  // ── 사신수: 계절 + 그 신수를 닮은 종족 + 완벽한 양육 ──
  // 청룡=봄·용족/주작=여름·조류/백호=가을·짐승/현무=겨울·수생.
  hid_azure: {
    hint: '“봄바람이 불 때, 용과 초목의 피를 이은 자에게…”',
    cost: { coins: 200 },
    check: ({ pet, level, season }) =>
      level >= 15 &&
      season === 'spring' &&
      bio(pet) &&
      isKind(pet, ['용형', '파충류형', '공룡형', '식물형']) &&
      lo(pet) >= 85,
  },
  hid_vermilion: {
    hint: '“한여름 하늘을 나는 새의 혼이 절정에 달할 때…”',
    cost: { coins: 200 },
    check: ({ pet, level, season }) =>
      level >= 15 && season === 'summer' && bio(pet) && isKind(pet, ['조류형']) && lo(pet) >= 85,
  },
  hid_white: {
    hint: '“가을 들판을 달리는 짐승의 강인함으로…”',
    cost: { coins: 200 },
    check: ({ pet, level, season }) =>
      level >= 15 &&
      season === 'autumn' &&
      bio(pet) &&
      isKind(pet, ['야수형', '포유류형', '성수형', '환수형']) &&
      lo(pet) >= 85,
  },
  hid_black: {
    hint: '“한겨울 깊은 물에 사는 자의 지혜에 다다를 때…”',
    cost: { coins: 200 },
    check: ({ pet, level, season }) =>
      level >= 15 &&
      season === 'winter' &&
      bio(pet) &&
      isKind(pet, ['수생형', '양서류형']) &&
      lo(pet) >= 85,
  },

  // ── 사흉수: 어둠 계열 종족 + 진화의 돌 + 방치된 상태 ──
  hid_taotie: {
    hint: '“채워지지 않는 굶주림이 흉수를 부른다…”',
    cost: { item: 'item_evostone' },
    check: ({ pet, level }) =>
      level >= 15 &&
      isKind(pet, DARK_KINDS) &&
      pet.ownedItems.includes('item_evostone') &&
      pet.stats.hunger < 30,
  },
  hid_qiongqi: {
    hint: '“극도로 사나워진 마음이 날개를 펼칠 때…”',
    cost: { item: 'item_evostone' },
    check: ({ pet, level }) =>
      level >= 15 &&
      isKind(pet, DARK_KINDS) &&
      pet.ownedItems.includes('item_evostone') &&
      pet.stats.mood < 30,
  },
  hid_taowu: {
    hint: '“지칠 대로 지쳐 고집만 남았을 때…”',
    cost: { item: 'item_evostone' },
    check: ({ pet, level }) =>
      level >= 15 &&
      isKind(pet, DARK_KINDS) &&
      pet.ownedItems.includes('item_evostone') &&
      pet.stats.energy < 30,
  },
  hid_hundun: {
    hint: '“씻기지 못한 혼탁함 속에서 혼돈이 깨어난다…”',
    cost: { item: 'item_evostone' },
    check: ({ pet, level }) =>
      level >= 15 &&
      isKind(pet, DARK_KINDS) &&
      pet.ownedItems.includes('item_evostone') &&
      pet.stats.cleanliness < 30,
  },

  // ── 4대천사: 천사형 종족 + 선행(업적) + 성격 ──
  hid_michael: {
    hint: '“용맹한 장난기를 지닌 빛의 권속에게…”',
    cost: { coins: 250 },
    check: ({ pet, level }) =>
      level >= 15 &&
      holy(pet) &&
      isKind(pet, ['천사형']) &&
      pet.achievements.length >= 10 &&
      pet.personality === 'playful',
  },
  hid_gabriel: {
    hint: '“다정한 전령의 마음을 지닌 자에게…”',
    cost: { coins: 250 },
    check: ({ pet, level }) =>
      level >= 15 &&
      holy(pet) &&
      isKind(pet, ['천사형']) &&
      pet.achievements.length >= 10 &&
      pet.personality === 'cuddler',
  },
  hid_raphael: {
    hint: '“정결함으로 모두를 치유하는 손길에게…”',
    cost: { coins: 250 },
    check: ({ pet, level }) =>
      level >= 15 &&
      holy(pet) &&
      isKind(pet, ['천사형']) &&
      pet.achievements.length >= 10 &&
      pet.personality === 'cleanfreak',
  },
  hid_uriel: {
    hint: '“고요한 명상 속 지혜에 다다른 자에게…”',
    cost: { coins: 250 },
    check: ({ pet, level }) =>
      level >= 15 &&
      holy(pet) &&
      isKind(pet, ['천사형']) &&
      pet.achievements.length >= 10 &&
      pet.personality === 'sleepyhead',
  },

  // ── 7대 죄악마: 어둠 계열 종족 + 죄에 맞는 성격/상태 ──
  hid_gluttony: {
    hint: '“멈추지 않는 식탐에 영혼이 잠식될 때…”',
    cost: { coins: 250 },
    check: ({ pet, level }) =>
      level >= 15 && holy(pet) && isKind(pet, DARK_KINDS) && pet.personality === 'foodie',
  },
  hid_sloth: {
    hint: '“끝없는 나태에 몸을 맡길 때…”',
    cost: { coins: 250 },
    check: ({ pet, level }) =>
      level >= 15 && holy(pet) && isKind(pet, DARK_KINDS) && pet.personality === 'sleepyhead',
  },
  hid_lust: {
    hint: '“채울 수 없는 갈망에 사로잡힐 때…”',
    cost: { coins: 250 },
    check: ({ pet, level }) =>
      level >= 15 && holy(pet) && isKind(pet, DARK_KINDS) && pet.personality === 'cuddler',
  },
  hid_wrath: {
    hint: '“터져나오는 분노를 주체할 수 없을 때…”',
    cost: { coins: 250 },
    check: ({ pet, level }) =>
      level >= 15 && holy(pet) && isKind(pet, DARK_KINDS) && pet.personality === 'playful',
  },
  hid_pride: {
    hint: '“완벽함에 도취된 오만한 자에게…”',
    cost: { coins: 250 },
    check: ({ pet, level }) =>
      level >= 15 && holy(pet) && isKind(pet, DARK_KINDS) && pet.personality === 'cleanfreak',
  },
  hid_greed: {
    hint: '“산처럼 쌓인 황금에 눈먼 자에게…”',
    cost: { coins: 250 },
    check: ({ pet, level }) =>
      level >= 15 && holy(pet) && isKind(pet, DARK_KINDS) && pet.coins >= 800,
  },
  hid_envy: {
    hint: '“비참함과 시기심이 마음을 가득 채울 때…”',
    cost: { coins: 250 },
    check: ({ pet, level }) =>
      level >= 15 && holy(pet) && isKind(pet, DARK_KINDS) && lo(pet) < 40,
  },

  // ── 황룡: 사신수를 모두 거느린 자 ──
  hid_huanglong: {
    hint: '“사방신을 모두 거느린 자, 중앙의 황제를 마주하리…”',
    cost: { coins: 300 },
    check: ({ pet, dex }) =>
      FOUR_SYMBOLS.some((f) => f.id === pet.form) &&
      FOUR_SYMBOLS.every((f) => dex.has(f.id)),
  },
}

// ── 12지신: "태어난 달"의 띠로만 각성 (그 띠 부적 소모) ──
// 입양한 실제 달이 곧 별자리 — 1월생=쥐신 … 12월생=돼지신.
ZODIAC.forEach((z, i) => {
  const charm = `charm_${z.id}`
  const month = i + 1
  conds[z.id] = {
    hint: `“${month}월에 태어난 단짝만이, 그 띠의 부적을 쥐고 깨어난다…”`,
    cost: { item: charm },
    check: ({ pet, level, birthMonth }) =>
      level >= 12 && birthMonth === month && pet.ownedItems.includes(charm),
  }
})

export const AWAKEN_CONDS = conds

export function awakenCond(id: string): AwakenCond | undefined {
  return AWAKEN_CONDS[id]
}

export function isAwakenEligible(id: string, ctx: AwakenCtx): boolean {
  const c = AWAKEN_CONDS[id]
  return c ? c.check(ctx) : false
}
