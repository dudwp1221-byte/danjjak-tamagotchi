import { useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import { watchAuth } from '../utils/auth'

/** 현재 로그인 사용자 + 초기 인증 상태 확인 완료 여부 */
export function useAuth(): { user: User | null; ready: boolean } {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    return watchAuth((u) => {
      setUser(u)
      setReady(true)
    })
  }, [])
  return { user, ready }
}
