import { useCallback, useEffect, useRef, useState } from 'react'
import type { WorkMode, WorkToday } from '../types/pet'
import type { WorkTickPayload } from '../utils/work-activity'
import { applyWorkTick, WORK_PROFILE_TICK_MIN } from '../utils/work-activity'
import { useElectron } from './useElectron'
import { todayIndex } from '../utils/pet'

interface UseWorkActivityOptions {
  workToday: WorkToday
  onRewardXp: (xp: number) => void
  onRecordProfile: (key: string, amount: number) => void
  onUpdateWorkToday: (wt: WorkToday) => void
}

export interface UseWorkActivityResult {
  workMode: WorkMode
  todayWorkMin: number
  todayOvertimeMin: number
  todayFocusMin: number
}

function emptyWorkToday(): WorkToday {
  return { date: todayIndex(), workMinutes: 0, focusMinutes: 0, meetingMinutes: 0, overtimeMinutes: 0 }
}

/**
 * Electron 환경에서 업무 활동(키보드/마우스)을 감지해 XP를 지급하는 훅.
 * 야근(overtime)은 저녁 시간대에 메인 프로세스가 자동으로 판정해 보내준다.
 * 브라우저 환경에서는 no-op이며 workMode는 항상 'idle'이다.
 */
// 같은 창 내에서 펫 전환(리마운트)해도 마지막 업무 모드를 기억해 깜빡임 방지
let lastKnownMode: WorkMode = 'idle'

export function useWorkActivity({
  workToday,
  onRewardXp,
  onRecordProfile,
  onUpdateWorkToday,
}: UseWorkActivityOptions): UseWorkActivityResult {
  const { isElectron, bridge } = useElectron()
  const [workMode, setWorkModeState] = useState<WorkMode>(lastKnownMode)
  const setWorkMode = (m: WorkMode) => {
    lastKnownMode = m
    setWorkModeState(m)
  }

  // 로컬 뮤터블 ref로 틱마다 최신값 유지 (stale closure 방지)
  const wtRef = useRef<WorkToday>(workToday)
  const lastTickRef = useRef(0)

  const handleWorkTick = useCallback(
    (payload: WorkTickPayload) => {
      const mode = payload.mode
      if (mode === 'idle') return

      setWorkMode(mode)
      lastTickRef.current = Date.now()

      // 야근 상한·통계 갱신·XP 계산은 공용 규칙으로 (바탕화면 펫과 동일)
      const tick = applyWorkTick(wtRef.current, mode, todayIndex())
      if (!tick) return
      wtRef.current = tick.workToday

      if (tick.xp > 0) onRewardXp(tick.xp)
      if (tick.profileKey) onRecordProfile(tick.profileKey, WORK_PROFILE_TICK_MIN)

      onUpdateWorkToday(tick.workToday)
    },
    [onRewardXp, onRecordProfile, onUpdateWorkToday],
  )

  // Electron work-tick IPC 구독 + "게임 창이 XP 적립 중" 신호
  // (이 훅은 PetGame에서만 마운트되므로, 로비/인트로 화면에서는 신호가 꺼져
  //  바탕화면 펫이 적립을 이어받는다)
  useEffect(() => {
    if (!isElectron || !bridge) return
    bridge.setXpActive?.(true)
    const unsub = bridge.onWorkTick(handleWorkTick)
    return () => {
      bridge.setXpActive?.(false)
      unsub()
    }
  }, [isElectron, bridge, handleWorkTick])

  // 틱이 60초 이상 없으면 idle로 복귀
  useEffect(() => {
    const id = setInterval(() => {
      if (workMode !== 'idle' && Date.now() - lastTickRef.current > 65000) {
        setWorkMode('idle')
      }
    }, 15000)
    return () => clearInterval(id)
  }, [workMode])

  const today = todayIndex()
  const wt = wtRef.current.date === today ? wtRef.current : emptyWorkToday()

  return {
    workMode,
    todayWorkMin: Math.floor(wt.workMinutes),
    todayOvertimeMin: Math.floor(wt.overtimeMinutes),
    todayFocusMin: Math.floor(wt.focusMinutes),
  }
}
