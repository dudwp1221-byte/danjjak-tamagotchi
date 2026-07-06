import { describe, expect, it } from 'vitest'
import {
  FORMS,
  BABY_FORMS,
  STARTERS,
  GROWTH_ROOTS,
  FAMILIES,
  HIDDEN_FORMS,
  FOUR_SYMBOLS,
  ZODIAC,
  ARCHANGELS,
  SINS,
  FIENDS,
  HUANGLONG,
  formById,
  babyFormById,
  babyFormsForStarter,
  nextForms,
  rollStarter,
  starterFromId,
  fusionResult,
} from './species'
import { stageIndexFromLevel } from './progression'

describe('evolution forms', () => {
  it('형태가 충분히 많다 (500개 이상)', () => {
    expect(FORMS.length).toBeGreaterThanOrEqual(500)
  })

  it('공용 유년기 풀이 37종 존재한다', () => {
    expect(BABY_FORMS).toHaveLength(37)
    expect(new Set(BABY_FORMS.map((b) => b.id)).size).toBe(37)
  })

  it('유년기가 FORMS에 tier 0로 편입되어 있다', () => {
    const formIds = new Set(FORMS.map((f) => f.id))
    for (const baby of BABY_FORMS) {
      expect(formIds.has(baby.id)).toBe(true)
      expect(formById(baby.id).tier).toBe(0)
    }
  })

  it('유년기의 성장기 후보(next)는 실제 성장기 라인을 가리킨다', () => {
    const growthLines = new Set(GROWTH_ROOTS.map((s) => s.line))
    for (const baby of BABY_FORMS) {
      expect(baby.starters.length).toBeGreaterThan(0)
      for (const line of baby.starters) expect(growthLines.has(line)).toBe(true)
    }
  })

  it('유년기 조회 헬퍼가 동작한다', () => {
    expect(babyFormById('baby_sprout_blob').name).toBe('푸루')
    expect(babyFormsForStarter('liz').some((b) => b.id === 'baby_sprout_blob')).toBe(true)
  })

  it('합체 형태는 가챠 시작 형태에 포함되지 않는다', () => {
    expect(STARTERS.some((s) => s.line === 'fuse')).toBe(false)
  })

  it('특수(합체 조건) 진화 형태가 존재한다', () => {
    expect(FORMS.some((f) => f.requires)).toBe(true)
  })

  it('히든 종족이 모두 존재한다 (사신수4·12지신12·대천사4·죄악마7·사흉수4·황룡1)', () => {
    expect(FOUR_SYMBOLS.length).toBe(4)
    expect(ZODIAC.length).toBe(12)
    expect(ARCHANGELS.length).toBe(4)
    expect(SINS.length).toBe(7)
    expect(FIENDS.length).toBe(4)
    expect(HIDDEN_FORMS.length).toBe(32)
  })

  it('황룡은 초월체(tier5)이고 사신수에서 진화 가능', () => {
    expect(HUANGLONG.tier).toBe(5)
    expect(FOUR_SYMBOLS.every((f) => f.next.includes('hid_huanglong'))).toBe(true)
  })

  it('히든 형태는 가챠 시작 형태에 없다', () => {
    expect(STARTERS.some((s) => s.hidden)).toBe(false)
  })

  it('form id는 모두 고유하다', () => {
    const ids = FORMS.map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('모든 next 참조는 실제 존재하는 형태', () => {
    const ids = new Set(FORMS.map((f) => f.id))
    for (const f of FORMS) {
      for (const n of f.next) expect(ids.has(n)).toBe(true)
    }
  })

  it('next 형태는 한 단계 높은 tier', () => {
    for (const f of FORMS) {
      for (const n of f.next) {
        expect(formById(n).tier).toBe(f.tier + 1)
      }
    }
  })

  it('분기 진화가 존재한다 (next가 2개 이상인 형태)', () => {
    expect(FORMS.some((f) => f.next.length >= 2)).toBe(true)
  })

  it('6대 타입이 모두 등장한다', () => {
    const fams = new Set(FORMS.map((f) => f.family))
    for (const fam of FAMILIES) expect(fams.has(fam)).toBe(true)
  })

  it('시작 형태는 모두 tier 0', () => {
    for (const s of STARTERS) expect(s.tier).toBe(0)
  })

  it('rollStarter는 항상 시작 형태 반환', () => {
    for (let i = 0; i < 40; i++) {
      expect(rollStarter().tier).toBe(0)
    }
  })

  it('starterFromId는 안정적', () => {
    expect(starterFromId('x1').id).toBe(starterFromId('x1').id)
  })

  it('nextForms는 Form 배열 반환', () => {
    const root = STARTERS[0]
    expect(nextForms(root.id).length).toBe(root.next.length)
  })
})

describe('fusionResult (합체)', () => {
  it('궁극체끼리 합체하면 가장 신성한 형태(테소자)', () => {
    const ultimate = formById('fl_holy3') // tier 4
    expect(fusionResult(ultimate, ultimate).id).toBe('fuse_light')
  })

  it('성숙기끼리 합체하면 혼돈 형태(조제부)', () => {
    const early = formById('liz_fire1') // tier 2 → 합 4... 니타네
    expect(fusionResult(early, early).line).toBe('fuse')
  })

  it('합체 결과는 항상 fuse 계통', () => {
    const a = formById('liz_fire1')
    const b = formById('liz_aqua1')
    expect(fusionResult(a, b).line).toBe('fuse')
  })
})

describe('stageIndexFromLevel', () => {
  it('레벨대별 진화 인덱스', () => {
    expect(stageIndexFromLevel(1)).toBe(0)
    expect(stageIndexFromLevel(5)).toBe(1)
    expect(stageIndexFromLevel(10)).toBe(2)
    expect(stageIndexFromLevel(15)).toBe(3)
    expect(stageIndexFromLevel(20)).toBe(4)
  })
})
