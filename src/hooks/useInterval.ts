import { useEffect, useRef } from 'react'

/**
 * 일정 주기로 콜백을 실행하는 훅. (Dan Abramov 패턴)
 * delay가 null이면 멈춘다.
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return
    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}
