import { describe, it, expect } from 'vitest'
import { createPet } from './pet'
import { resolveCare, careRemaining, CARE_HOURLY_CAP } from './care'
import type { Pet, PetAction } from '../types/pet'

function freshPet(): Pet {
  return createPet({ ownerName: '테스터', name: '단짝', imageDataUrl: 'data:,' })
}

// 한 시각(hour bucket) 안에서 같은 액션을 n번 케어하며 pet을 갱신
function careN(pet: Pet, action: PetAction, n: number, now: number) {
  let p = pet
  const xps: number[] = []
  for (let i = 0; i < n; i++) {
    const o = resolveCare(p, action, now)
    xps.push(o.xp)
    p = { ...p, stats: o.result.stats, careXp: o.nextCareXp }
  }
  return { pet: p, xps }
}

const HOUR = 3600000
const NOW = 30_000 * HOUR // 임의의 정각 버킷

describe('케어 시간당 제한', () => {
  it('액션별 남은 횟수가 5에서 시작한다', () => {
    const pet = freshPet()
    expect(careRemaining(pet, 'feed', NOW)).toBe(CARE_HOURLY_CAP)
    expect(careRemaining(pet, 'pet', NOW)).toBe(CARE_HOURLY_CAP)
    expect(careRemaining(pet, 'wash', NOW)).toBe(CARE_HOURLY_CAP)
  })

  it('5회 케어하면 남은 횟수가 0이 된다', () => {
    const { pet } = careN(freshPet(), 'feed', CARE_HOURLY_CAP, NOW)
    expect(careRemaining(pet, 'feed', NOW)).toBe(0)
  })

  it('한도를 넘기면 XP가 큰 폭으로 떨어진다 (보너스 소진)', () => {
    const { pet, xps } = careN(freshPet(), 'feed', CARE_HOURLY_CAP, NOW)
    const firstXp = xps[0]
    const over = resolveCare(pet, 'feed', NOW)
    expect(over.xp).toBeLessThan(firstXp)
    expect(over.xp).toBeLessThanOrEqual(2)
    expect(firstXp).toBeGreaterThanOrEqual(12)
  })

  it('액션마다 한도가 독립적이다', () => {
    const { pet } = careN(freshPet(), 'feed', CARE_HOURLY_CAP, NOW)
    expect(careRemaining(pet, 'feed', NOW)).toBe(0)
    expect(careRemaining(pet, 'pet', NOW)).toBe(CARE_HOURLY_CAP)
    expect(careRemaining(pet, 'wash', NOW)).toBe(CARE_HOURLY_CAP)
  })

  it('정각이 바뀌면 한도가 리셋된다', () => {
    const { pet } = careN(freshPet(), 'feed', CARE_HOURLY_CAP, NOW)
    expect(careRemaining(pet, 'feed', NOW)).toBe(0)
    expect(careRemaining(pet, 'feed', NOW + HOUR)).toBe(CARE_HOURLY_CAP)
  })

  it('재우기·놀아주기도 시간당 제한이 있다', () => {
    const pet = freshPet()
    expect(careRemaining(pet, 'sleep', NOW)).toBe(CARE_HOURLY_CAP)
    expect(careRemaining(pet, 'play', NOW)).toBe(CARE_HOURLY_CAP)
  })

  it('선물(gift)은 제한이 없다 (아이템으로 제한)', () => {
    const pet = freshPet()
    expect(careRemaining(pet, 'gift', NOW)).toBe(Infinity)
  })

  it('케어 카운터는 해당 액션만 증가한다', () => {
    const o = resolveCare(freshPet(), 'feed', NOW)
    expect(o.nextCareXp.feed).toBe(1)
    expect(o.nextCareXp.pet).toBe(0)
    expect(o.nextCareXp.wash).toBe(0)
  })
})
