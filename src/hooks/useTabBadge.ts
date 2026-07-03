import { useEffect } from 'react'

const BASE_TITLE = '단짝 다마고치'

/** 펫이 케어가 필요하면 탭 제목에 빨간 점을 붙인다. */
export function useTabBadge(needsCare: boolean) {
  useEffect(() => {
    document.title = needsCare ? `🔴 ${BASE_TITLE}` : BASE_TITLE
    return () => {
      document.title = BASE_TITLE
    }
  }, [needsCare])
}
