import { useEffect, useRef } from 'react'
import type { Schedule } from '../types/pet'

export function useScheduleAlarm(
  schedules: Schedule[],
  onAlarm: (s: Schedule) => void,
  onMarkNotified: (id: string) => void,
) {
  const onAlarmRef = useRef(onAlarm)
  const onMarkRef = useRef(onMarkNotified)
  onAlarmRef.current = onAlarm
  onMarkRef.current = onMarkNotified

  useEffect(() => {
    const check = () => {
      const now = Date.now()
      for (const s of schedules) {
        // 2분 이내의 미알림 일정만 처리
        if (!s.notified && s.at <= now && now - s.at < 120_000) {
          onAlarmRef.current(s)
          onMarkRef.current(s.id)
        }
      }
    }
    check()
    const id = setInterval(check, 30_000)
    return () => clearInterval(id)
  }, [schedules])
}
