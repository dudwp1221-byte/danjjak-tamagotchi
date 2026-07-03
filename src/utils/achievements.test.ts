import { describe, expect, it } from 'vitest'
import { newlyUnlocked } from './achievements'
import { normalizePet } from './pet'
import type { Pet } from '../types/pet'

function makePet(overrides: Partial<Pet>): Pet {
  return normalizePet({ id: 'test', ...overrides })
}

describe('newlyUnlocked', () => {
  it('첫 케어 업적은 totalActions>=1에서 해금', () => {
    const pet = makePet({ totalActions: 1 })
    const ids = newlyUnlocked({ pet, level: 1, days: 1, score: 100 })
    expect(ids).toContain('first_care')
  })

  it('이미 보유한 업적은 다시 나오지 않음', () => {
    const pet = makePet({ totalActions: 1, achievements: ['first_care'] })
    const ids = newlyUnlocked({ pet, level: 1, days: 1, score: 100 })
    expect(ids).not.toContain('first_care')
  })

  it('레벨/완벽컨디션 조건 반영', () => {
    const pet = makePet({
      stats: { hunger: 95, mood: 95, cleanliness: 95, energy: 95 },
    })
    const ids = newlyUnlocked({ pet, level: 6, days: 1, score: 95 })
    expect(ids).toContain('level_3')
    expect(ids).toContain('level_6')
    expect(ids).toContain('perfect')
  })

  it('조건 미달이면 해금 없음', () => {
    const pet = makePet({
      totalActions: 0,
      stats: { hunger: 10, mood: 10, cleanliness: 10, energy: 10 },
    })
    const ids = newlyUnlocked({ pet, level: 1, days: 1, score: 10 })
    expect(ids).toEqual([])
  })
})
