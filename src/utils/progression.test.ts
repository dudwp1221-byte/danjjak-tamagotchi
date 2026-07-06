import { describe, expect, it } from 'vitest'
import { levelFromXp, levelProgress, stageFromLevel } from './progression'

describe('levelFromXp', () => {
  it('0 경험치는 레벨 1', () => {
    expect(levelFromXp(0)).toBe(1)
  })

  it('경험치가 늘면 레벨이 오른다(단조 증가)', () => {
    let prev = 0
    for (let xp = 0; xp <= 2000; xp += 50) {
      const lv = levelFromXp(xp)
      expect(lv).toBeGreaterThanOrEqual(prev)
      prev = lv
    }
  })

  it('알려진 임계값: 40xp에서 레벨 2', () => {
    expect(levelFromXp(39)).toBe(1)
    expect(levelFromXp(40)).toBe(2)
  })
})

describe('levelProgress', () => {
  it('비율은 0~1 사이', () => {
    for (const xp of [0, 30, 120, 500, 9999]) {
      const p = levelProgress(xp)
      expect(p.ratio).toBeGreaterThanOrEqual(0)
      expect(p.ratio).toBeLessThanOrEqual(1)
    }
  })

  it('아주 큰 경험치는 MAX', () => {
    expect(levelProgress(999999).maxed).toBe(true)
  })
})

describe('stageFromLevel', () => {
  it('레벨대별 진화 단계 (게이트 5/10/15/20, 만렙 30)', () => {
    expect(stageFromLevel(1).key).toBe('infant')
    expect(stageFromLevel(5).key).toBe('baby')
    expect(stageFromLevel(10).key).toBe('teen')
    expect(stageFromLevel(15).key).toBe('adult')
    expect(stageFromLevel(20).key).toBe('legend')
    expect(stageFromLevel(30).key).toBe('legend')
  })
})
