import { useEffect } from 'react'
import type { Pet } from '../types/pet'
import type { WorkTickPayload } from '../utils/work-activity'
import { applyWorkTick, WORK_PROFILE_TICK_MIN } from '../utils/work-activity'
import { loadPets, getActiveId, upsertPet } from '../utils/storage'
import { normalizePet, todayIndex } from '../utils/pet'

/** 방치 트리클: 10초마다 소량 (~47 XP/시간, 게임 창의 자율 행동 패시브와 비슷한 수준) */
const PASSIVE_XP = 0.13
const PASSIVE_TICK_MS = 10000

function loadActivePet(): Pet | null {
  const pets = loadPets()
  const aid = getActiveId()
  return (aid && pets.find((p) => p.id === aid)) || pets[0] || null
}

/**
 * 바탕화면 펫 창에서 백그라운드 XP를 적립하는 훅.
 * 게임 창의 PetGame이 떠 있는 동안(xp-active 신호)은 그쪽이 담당하므로 쉰다 — 중복 방지.
 * 게임 창이 닫혀 있거나 로비/인트로 화면이면 여기서 적립한다.
 *
 * 근무 XP는 게임 창과 동일한 공용 규칙(applyWorkTick)을 써서
 * 야근 일일 상한·오늘 업무 통계·진화 조건 카운터까지 똑같이 반영된다.
 */
export function useBackgroundXp(gameXpActiveRef: { current: boolean }) {
  useEffect(() => {
    const bridge = (window as any).electronBridge // eslint-disable-line @typescript-eslint/no-explicit-any

    // 근무 XP (일하는 중일 때 work-tick 수신)
    const offWork = bridge?.onWorkTick?.((payload: WorkTickPayload) => {
      if (gameXpActiveRef.current) return
      const raw = loadActivePet()
      if (!raw) return
      const tick = applyWorkTick(raw.workToday, payload.mode, todayIndex())
      if (!tick) return
      const behaviorProfile = tick.profileKey
        ? {
            ...raw.behaviorProfile,
            [tick.profileKey]: (raw.behaviorProfile[tick.profileKey] ?? 0) + WORK_PROFILE_TICK_MIN,
          }
        : raw.behaviorProfile
      upsertPet(
        normalizePet({
          ...raw,
          growth: raw.growth + tick.xp,
          workToday: tick.workToday,
          behaviorProfile,
          lastUpdated: Date.now(),
        }),
      )
    })

    // 방치 트리클 (게임 창이 쉬는 동안에만)
    const passiveId = setInterval(() => {
      if (gameXpActiveRef.current) return
      const raw = loadActivePet()
      if (!raw) return
      upsertPet(normalizePet({ ...raw, growth: raw.growth + PASSIVE_XP, lastUpdated: Date.now() }))
    }, PASSIVE_TICK_MS)

    return () => {
      offWork?.()
      clearInterval(passiveId)
    }
  }, [gameXpActiveRef])
}
