import type { Pet, PetAction } from '../types/pet'
import { performCare, type CareResult } from './stats'
import { CARE_XP, CARE_XP_OVER, CARE_HOURLY_CAP } from './progression'

type LimitedAction = 'feed' | 'pet' | 'wash' | 'sleep' | 'play'
const LIMITED: LimitedAction[] = ['feed', 'pet', 'wash', 'sleep', 'play']

/** 이번 시각 케어 카운터 초기값 */
function emptyCareXp(hour: number): Pet['careXp'] {
  return { hour, feed: 0, pet: 0, wash: 0, sleep: 0, play: 0 }
}

export { CARE_HOURLY_CAP }

/** 시간당 케어 제한 버킷 (epoch 시각 인덱스) */
export function careHour(now: number = Date.now()): number {
  return Math.floor(now / 3600000)
}

/** 이번 시각에 해당 액션으로 큰 XP를 받을 수 있는 남은 횟수 (제한 없는 액션은 Infinity) */
export function careRemaining(
  pet: Pet,
  action: PetAction,
  now: number = Date.now(),
): number {
  if (!(LIMITED as PetAction[]).includes(action)) return Infinity
  const used =
    pet.careXp.hour === careHour(now) ? pet.careXp[action as LimitedAction] : 0
  return Math.max(0, CARE_HOURLY_CAP - used)
}

export interface CareOutcome {
  result: CareResult
  /** 최종 지급 XP */
  xp: number
  coins: number
  /** 갱신된 시간당 케어 카운터 */
  nextCareXp: Pet['careXp']
  /** 이번 케어가 시간당 큰 XP 한도 내였는지 */
  withinCap: boolean
}

/**
 * 케어 1회의 결과를 계산한다. 게임 창과 바탕화면 펫이 동일 규칙을 쓰도록 공용화.
 * - feed/pet/wash: 시각마다 CARE_HOURLY_CAP회까지 큰 XP(CARE_XP), 초과 시 CARE_XP_OVER
 * - sleep: 제한 없음(기본 XP)
 */
export function resolveCare(
  pet: Pet,
  action: PetAction,
  now: number = Date.now(),
): CareOutcome {
  const result = performCare(pet.stats, action)

  const hour = careHour(now)
  const cx = pet.careXp.hour === hour ? pet.careXp : emptyCareXp(hour)
  const limited = (LIMITED as PetAction[]).includes(action)
  const used = limited ? cx[action as LimitedAction] : 0
  const withinCap = limited ? used < CARE_HOURLY_CAP : true

  const xp = limited ? (withinCap ? CARE_XP : CARE_XP_OVER) : result.xp
  const coins = result.coins

  const nextCareXp =
    limited && !result.wasted ? { ...cx, [action]: used + 1 } : cx

  return { result, xp, coins, nextCareXp, withinCap }
}
