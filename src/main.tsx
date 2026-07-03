import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { loadPets, unlockAllDex } from './utils/storage'
import { migrateFromPets } from './utils/account'
import './index.css'

// 어느 창(게임/바탕화면)이 먼저 뜨든, 계정 재화 이전을 진입 즉시 1회 실행
// (바탕화면 펫이 코인을 쓰기 전에 기존 펫 코인이 합산되도록)
migrateFromPets(loadPets())

// [치트] Ctrl+Shift+I → 도감 전체 해금 후 새로고침 (개발·확인용)
window.addEventListener(
  'keydown',
  (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
      e.preventDefault()
      unlockAllDex()
      location.reload()
    }
  },
  true,
)

const mode = new URLSearchParams(window.location.search).get('mode')

if (mode === 'desktop') {
  document.title = ''
  const { default: DesktopPet } = await import('./features/desktop/DesktopPet.tsx')
  createRoot(document.getElementById('root')!).render(
    <StrictMode><DesktopPet /></StrictMode>,
  )
} else {
  const { default: App } = await import('./App.tsx')
  createRoot(document.getElementById('root')!).render(
    <StrictMode><App /></StrictMode>,
  )
}

// PWA 서비스 워커 등록 (오프라인 지원)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* 등록 실패는 조용히 무시 */
    })
  })
}
