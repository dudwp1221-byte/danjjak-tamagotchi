import type { WorkTickPayload } from '../utils/work-activity'

export interface ElectronBridge {
  isElectron: true
  toggleAlwaysOnTop: () => void
  toggleClickThrough: () => void
  openFullUI: () => void
  onWorkTick: (cb: (payload: WorkTickPayload) => void) => () => void
  onOpenAccount?: (cb: () => void) => () => void
  /** 게임 창의 PetGame이 XP 적립 중인지 (창 열림 여부가 아님 — 로비 화면이면 false) */
  onFullWindowState?: (cb: (open: boolean) => void) => () => void
  /** PetGame 마운트/언마운트 시 XP 적립 주체 신호 (게임 창 → 메인) */
  setXpActive?: (active: boolean) => void
  notifyPetChanged?: () => void
  onPetChanged?: (cb: () => void) => () => void
}

declare global {
  interface Window {
    electronBridge?: ElectronBridge
  }
}

export function useElectron() {
  const isElectron =
    typeof window !== 'undefined' && !!window.electronBridge
  const bridge = isElectron ? window.electronBridge! : null
  return { isElectron, bridge }
}
