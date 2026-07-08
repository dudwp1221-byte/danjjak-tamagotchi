import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronBridge', {
  isElectron: true as const,
  toggleAlwaysOnTop: () => ipcRenderer.send('toggle-always-on-top'),
  toggleClickThrough: () => ipcRenderer.send('toggle-click-through'),
  openFullUI: () => ipcRenderer.send('open-full-ui'),
  hideDesktopPet: () => ipcRenderer.send('hide-desktop-pet'),
  showDesktopPet: () => ipcRenderer.send('show-desktop-pet'),
  setClickThrough: (active: boolean) => ipcRenderer.send('set-click-through-state', active),
  setPetMoveMode: (mode: string) => ipcRenderer.send('pet-move-mode', mode),
  setXpActive: (active: boolean) => ipcRenderer.send('xp-active', active),
  notifyPetChanged: () => ipcRenderer.send('pet-changed'),
  onPetChanged: (callback: () => void) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (_event: any) => callback()
    ipcRenderer.on('pet-changed', handler)
    return () => ipcRenderer.off('pet-changed', handler)
  },
  onOpenAccount: (callback: () => void) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (_event: any) => callback()
    ipcRenderer.on('open-account', handler)
    return () => ipcRenderer.off('open-account', handler)
  },
  onFullWindowState: (callback: (open: boolean) => void) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (_event: any, open: boolean) => callback(open)
    ipcRenderer.on('full-window', handler)
    return () => ipcRenderer.off('full-window', handler)
  },
  onWorkTick: (callback: (payload: unknown) => void) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (_event: any, payload: unknown) => callback(payload)
    ipcRenderer.on('work-tick', handler)
    return () => ipcRenderer.off('work-tick', handler)
  },
  onPetDir: (callback: (dir: 1 | -1) => void) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (_event: any, dir: 1 | -1) => callback(dir)
    ipcRenderer.on('pet-dir', handler)
    return () => ipcRenderer.off('pet-dir', handler)
  },
})
