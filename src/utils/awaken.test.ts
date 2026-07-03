import { describe, expect, it } from 'vitest'
import { AWAKEN_CONDS, awakenCond, type AwakenCtx } from './awaken'
import { HIDDEN_FORMS, FOUR_SYMBOLS, ZODIAC } from './species'
import { normalizePet } from './pet'
import type { Pet } from '../types/pet'
import type { SeasonKey } from './season'

function pet(overrides: Partial<Pet>): Pet {
  return normalizePet({ id: 'test', ...overrides })
}

/** 테스트용 ctx (계절/생월 기본값 포함) */
function ctxFor(
  p: Pet,
  opts: { level?: number; dex?: Set<string>; season?: SeasonKey; birthMonth?: number } = {},
): AwakenCtx {
  return {
    pet: p,
    level: opts.level ?? 20,
    dex: opts.dex ?? new Set([p.form]),
    season: opts.season ?? 'spring',
    birthMonth: opts.birthMonth ?? 1,
  }
}

describe('awaken conditions', () => {
  it('모든 히든 형태에 개별 조건이 있다', () => {
    for (const f of HIDDEN_FORMS) {
      expect(awakenCond(f.id)).toBeTruthy()
    }
  })

  it('각 히든 형태는 자기만의 암시 문구를 가진다', () => {
    const hints = HIDDEN_FORMS.map((f) => awakenCond(f.id)!.hint)
    // 사신수·사흉수·천사·죄악마는 서로 다른 암시
    const fourHints = FOUR_SYMBOLS.map((f) => awakenCond(f.id)!.hint)
    expect(new Set(fourHints).size).toBe(4)
    expect(hints.every((h) => h.length > 0)).toBe(true)
  })

  it('갓 태어난 펫은 어떤 히든도 각성 불가', () => {
    const fresh = pet({})
    const ctx = ctxFor(fresh, { level: 1 })
    for (const f of HIDDEN_FORMS) {
      expect(AWAKEN_CONDS[f.id].check(ctx)).toBe(false)
    }
  })

  it('황룡: 사신수이면서 4종 모두 발견하면 각성 가능', () => {
    const dragon = pet({ form: 'hid_azure', species: 'div_four' })
    const dexAll = new Set(FOUR_SYMBOLS.map((f) => f.id))
    const ctx = ctxFor(dragon, { dex: dexAll })
    expect(AWAKEN_CONDS['hid_huanglong'].check(ctx)).toBe(true)
  })

  it('도철(식탐 흉수): 어둠 계열 종족 + 진화의 돌 + 굶주림에서 각성', () => {
    const fiend = pet({
      form: 'gh_demon3', // 마왕형 (어둠 계열 종족)
      growth: 6000, // 레벨 15+
      ownedItems: ['item_evostone'],
      stats: { hunger: 10, mood: 80, cleanliness: 80, energy: 80 },
    })
    expect(AWAKEN_CONDS['hid_taotie'].check(ctxFor(fiend))).toBe(true)
    // 배가 부르면 불가
    const fed = pet({
      form: 'gh_demon3',
      growth: 6000,
      ownedItems: ['item_evostone'],
      stats: { hunger: 90, mood: 80, cleanliness: 80, energy: 80 },
    })
    expect(AWAKEN_CONDS['hid_taotie'].check(ctxFor(fed))).toBe(false)
  })

  it('주작: 여름 + 조류형 + 완벽 양육에서 각성, 겨울엔 불가', () => {
    // 불새(bd_fire2): 생물형 조류형
    const birdPet = pet({
      form: 'bd_fire2',
      stats: { hunger: 90, mood: 90, cleanliness: 90, energy: 90 },
    })
    const cond = AWAKEN_CONDS['hid_vermilion']
    expect(cond.check(ctxFor(birdPet, { season: 'summer' }))).toBe(true)
    expect(cond.check(ctxFor(birdPet, { season: 'winter' }))).toBe(false)
    // 조류가 아니면 여름에도 불가
    const lizard = pet({
      form: 'liz_fire2',
      stats: { hunger: 90, mood: 90, cleanliness: 90, energy: 90 },
    })
    expect(cond.check(ctxFor(lizard, { season: 'summer' }))).toBe(false)
  })

  it('12지신: 태어난 달이 맞고 부적이 있을 때만 그 띠로 각성', () => {
    const ratId = ZODIAC[0].id // 1월생 = 쥐신
    const charm = `charm_${ratId}`
    const owner = pet({ ownedItems: [charm] })
    const cond = AWAKEN_CONDS[ratId]
    // 1월생 + 부적 → 가능
    expect(cond.check(ctxFor(owner, { birthMonth: 1 }))).toBe(true)
    // 다른 달 생이면 불가
    expect(cond.check(ctxFor(owner, { birthMonth: 5 }))).toBe(false)
    // 부적 없으면 불가
    const noCharm = pet({})
    expect(cond.check(ctxFor(noCharm, { birthMonth: 1 }))).toBe(false)
  })
})
