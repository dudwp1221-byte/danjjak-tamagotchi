import { useCallback, useEffect, useRef, useState } from 'react'
import type { BehaviorState, Pet, PetStats } from '../types/pet'
import {
  BEHAVIOR_META,
  decideBehavior,
  randomDuration,
} from '../utils/behavior'
import { FURNITURE_ITEMS } from '../utils/furniture'
import { PROFILE_KEYS } from '../utils/evolution-conditions'

const BEHAVIOR_TICK_MS = 10000

interface UseBehaviorResult {
  behaviorState: BehaviorState
  behaviorLabel: string
  behaviorEmoji: string
}

export function useBehavior(
  pet: Pet,
  onStatAdjust: (delta: Partial<PetStats>) => void,
  onLog: (state: BehaviorState, duration: number) => void,
  onProfileRecord: (key: string, amount: number) => void,
  onPassiveXp?: (xp: number) => void,
): UseBehaviorResult {
  const [behaviorState, setBehaviorState] = useState<BehaviorState>('idle')
  const behaviorRef = useRef<BehaviorState>('idle')
  const startedAtRef = useRef(Date.now())
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const petRef = useRef(pet)
  petRef.current = pet

  const transition = useCallback(
    (next: BehaviorState) => {
      const prev = behaviorRef.current
      const duration = Date.now() - startedAtRef.current

      // 이전 행동 종료 처리
      if (prev !== 'idle') {
        onLog(prev, duration)

        // behaviorProfile 업데이트 — 해당 행동을 북돋는 보유 가구 중 최고 배율 적용 (중첩 없음)
        const furnitureBoost = (behavior: BehaviorState): number => {
          const p = petRef.current
          return Math.max(
            1,
            ...FURNITURE_ITEMS.filter(
              (f) =>
                p.furniture.includes(f.id) &&
                f.behaviorBonus?.activatesBehavior === behavior &&
                f.evolutionBonus,
            ).map((f) => f.evolutionBonus!.multiplier),
          )
        }
        if (prev === 'window_gazing') {
          onProfileRecord(PROFILE_KEYS.NIGHT_COMPANION, furnitureBoost('window_gazing'))
        } else if (prev === 'playing') {
          onProfileRecord(PROFILE_KEYS.PLAYFUL_MOMENTS, furnitureBoost('playing'))
        } else if (prev === 'reading') {
          onProfileRecord(PROFILE_KEYS.READING_SESSIONS, furnitureBoost('reading'))
        }
      }

      behaviorRef.current = next
      startedAtRef.current = Date.now()
      setBehaviorState(next)

      // 다음 상태 예약
      const dur = randomDuration(next)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        const p = petRef.current
        const hour = new Date().getHours()
        const decided = decideBehavior(p.stats, p.personality, p.furniture, hour)
        transition(decided)
      }, dur)
    },
    [onLog, onProfileRecord],
  )

  const onPassiveXpRef = useRef(onPassiveXp)
  onPassiveXpRef.current = onPassiveXp

  // 스탯 효과 + 패시브 XP (BEHAVIOR_TICK_MS마다 적용)
  useEffect(() => {
    const id = setInterval(() => {
      const meta = BEHAVIOR_META[behaviorRef.current]
      if (Object.keys(meta.statEffect).length > 0) {
        onStatAdjust(meta.statEffect)
      }
      if (meta.passiveXp > 0) {
        onPassiveXpRef.current?.(meta.passiveXp)
      }
    }, BEHAVIOR_TICK_MS)
    return () => clearInterval(id)
  }, [onStatAdjust])

  // 최초 시작
  useEffect(() => {
    const hour = new Date().getHours()
    const initial = decideBehavior(pet.stats, pet.personality, pet.furniture, hour)
    transition(initial)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const meta = BEHAVIOR_META[behaviorState]
  return {
    behaviorState,
    behaviorLabel: meta.label,
    behaviorEmoji: meta.emoji,
  }
}
