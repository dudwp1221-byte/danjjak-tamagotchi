import { describe, expect, it } from 'vitest'
import {
  adjustStats,
  applyAction,
  applyDecay,
  performCare,
  petMood,
  wellbeing,
} from './stats'
import type { PetStats } from '../types/pet'

const full: PetStats = { hunger: 100, mood: 100, cleanliness: 100, energy: 100, health: 100 }
const mid: PetStats = { hunger: 50, mood: 50, cleanliness: 50, energy: 50, health: 50 }

describe('applyDecay', () => {
  it('동일 시각이면 변화 없음', () => {
    expect(applyDecay(mid, 1000, 1000)).toEqual(mid)
  })

  it('시간이 지나면 모든 스탯이 감소', () => {
    const r = applyDecay(full, 0, 60_000) // 1분
    expect(r.hunger).toBeLessThan(100)
    expect(r.mood).toBeLessThan(100)
    expect(r.cleanliness).toBeLessThan(100)
    expect(r.energy).toBeLessThan(100)
  })

  it('0 미만으로 내려가지 않음', () => {
    const r = applyDecay(mid, 0, 1000 * 60 * 60 * 24) // 하루
    expect(r.hunger).toBeGreaterThanOrEqual(0)
    expect(r.energy).toBeGreaterThanOrEqual(0)
  })

  it('성격 배수가 해당 스탯 감소를 키운다', () => {
    const normal = applyDecay(full, 0, 60_000)
    const foodie = applyDecay(full, 0, 60_000, { hunger: 2 })
    expect(foodie.hunger).toBeLessThan(normal.hunger)
  })
})

describe('applyAction', () => {
  it('먹이주기는 배고픔을 올린다', () => {
    expect(applyAction(mid, 'feed').hunger).toBeGreaterThan(mid.hunger)
  })

  it('100을 넘지 않는다', () => {
    expect(applyAction(full, 'feed').hunger).toBe(100)
  })
})

describe('adjustStats', () => {
  it('음수 delta는 감소, 0~100 보정', () => {
    expect(adjustStats(mid, { mood: -60 }).mood).toBe(0)
    expect(adjustStats(mid, { mood: 100 }).mood).toBe(100)
  })
})

describe('performCare', () => {
  it('정상 케어는 보상이 있다', () => {
    const r = performCare(mid, 'feed')
    expect(r.wasted).toBe(false)
    expect(r.xp).toBeGreaterThan(0)
    expect(r.coins).toBeGreaterThan(0)
  })

  it('이미 가득 찬 스탯도 작은 보상을 준다', () => {
    const r = performCare(full, 'feed')
    expect(r.wasted).toBe(false)
    expect(r.xp).toBeGreaterThan(0)
    expect(r.coins).toBeGreaterThan(0)
    expect(r.stats.mood).toBe(100)
  })
})

describe('wellbeing / petMood', () => {
  it('wellbeing은 평균', () => {
    expect(wellbeing(full)).toBe(100)
    expect(wellbeing(mid)).toBe(50)
  })

  it('배고프면 배고픔 상태를 우선 표시', () => {
    const hungry: PetStats = { ...full, hunger: 10 }
    expect(petMood(hungry).label).toContain('배고')
  })

  it('모두 높으면 행복', () => {
    expect(petMood(full).label).toContain('행복')
  })
})
