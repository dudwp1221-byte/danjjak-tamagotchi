import { useEffect, useRef } from 'react'

/** 알림 권한을 요청한다. 허용되면 true */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const res = await Notification.requestPermission()
  return res === 'granted'
}

const COOLDOWN_MS = 5 * 60 * 1000

interface Options {
  enabled: boolean
  needsCare: boolean
  petName: string
}

/**
 * 탭이 가려진 상태에서 펫이 케어가 필요하면 브라우저 알림을 띄운다.
 * (5분 쿨다운으로 도배 방지)
 */
export function useCareNotifications({ enabled, needsCare, petName }: Options) {
  const lastNotified = useRef(0)

  useEffect(() => {
    if (!enabled || !needsCare) return
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    if (!document.hidden) return
    const now = Date.now()
    if (now - lastNotified.current < COOLDOWN_MS) return
    lastNotified.current = now
    try {
      new Notification('단짝이 기다려요 🥺', {
        body: `${petName}를 돌봐주세요!`,
        icon: '/icon.svg',
        tag: 'danjjak-care',
      })
    } catch {
      /* 일부 환경에서 생성자 알림 미지원 */
    }
  }, [enabled, needsCare, petName])
}
