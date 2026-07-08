import { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage, powerMonitor, screen } from 'electron'
import path from 'path'
import fs from 'fs'
import http from 'http'

// Windows 투명 창의 흰색 잔상(GPU 컴포지팅 아티팩트) 방지
app.disableHardwareAcceleration()

const isDev = !app.isPackaged
const PRELOAD = path.join(__dirname, 'preload.js')

// 렌더러 로드 주소.
// dev: Vite 서버 / prod: 내장 정적 서버(http). file://을 쓰면 런타임 절대경로 에셋
// (/sprites, /ui, /themes 등)이 파일시스템 루트로 잘못 풀려 전부 404가 되므로,
// 패키징된 앱에서는 dist를 http로 서빙해 웹과 동일하게 동작시킨다.
let INDEX_URL = isDev ? 'http://localhost:5173' : ''

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
}

/** 프로덕션: dist 폴더를 로컬 http로 서빙하고 base URL을 반환 */
function startStaticServer(): Promise<string> {
  const root = path.join(__dirname, '../dist')
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      try {
        const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
        let rel = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '')
        let filePath = path.join(root, rel)
        // 디렉터리 이탈 방지
        if (!filePath.startsWith(root)) filePath = path.join(root, 'index.html')
        // 파일 없으면 SPA 폴백(index.html)
        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          filePath = path.join(root, 'index.html')
        }
        const ext = path.extname(filePath).toLowerCase()
        res.setHeader('Content-Type', MIME[ext] ?? 'application/octet-stream')
        fs.createReadStream(filePath).pipe(res)
      } catch {
        res.statusCode = 500
        res.end('error')
      }
    })
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address()
      const port = typeof addr === 'object' && addr ? addr.port : 0
      resolve(`http://127.0.0.1:${port}`)
    })
  })
}
const STATE_FILE = path.join(app.getPath('userData'), 'window-state.json')

// 활동 감지 주기(ms) — 짧을수록 키보드·마우스에 빠르게 반응
const WORK_TICK_MS = 15000
// 집중 모드 진입에 필요한 연속 활성 틱 수 (20 × 15s = 5분)
const FOCUS_TICK_THRESHOLD = 20
// 야근(버닝타임) 시간대: 저녁 7시 ~ 새벽 6시
const OVERTIME_HOUR_START = 19
const OVERTIME_HOUR_END = 6

interface WindowState {
  x?: number
  y?: number
  width: number
  height: number
}

function loadWindowState(defaults: WindowState): WindowState {
  try {
    const raw = fs.readFileSync(STATE_FILE, 'utf-8')
    return { ...defaults, ...JSON.parse(raw) }
  } catch {
    return defaults
  }
}

function saveWindowState(win: BrowserWindow) {
  try {
    if (win.isDestroyed()) return
    fs.writeFileSync(STATE_FILE, JSON.stringify(win.getBounds()), 'utf-8')
  } catch {
    /* 저장 실패는 조용히 무시 (창 위치는 필수 데이터 아님) */
  }
}

let petWin: BrowserWindow | null = null   // 바탕화면 돌아다니는 펫 창
let fullWin: BrowserWindow | null = null
let tray: Tray | null = null
let alwaysOnTop = true
let clickThrough = false

// 게임 창의 PetGame이 XP를 적립 중인지 → 바탕화면 펫에 알려 적립 주체를 나눔 (중복 방지)
// 게임 창이 열려 있어도 로비/인트로 화면이면 false → 바탕화면 펫이 적립을 이어받는다
let gameXpActive = false
function sendFullWinState() {
  petWin?.webContents.send('full-window', gameXpActive)
}

// 바탕화면 펫 이동 상태
const PET_W = 160, PET_H = 160   // CSS와 맞춤
let petX = 200, petY = 200
let petVy = 1.2                   // 주 이동: 위아래
let petDir: 1 | -1 = 1
let wanderTimer: ReturnType<typeof setInterval> | null = null
let pauseTicks = 0
// 'left' | 'right' — 화면 가장자리 레일
let petSide: 'left' | 'right' = 'right'

// 업무 감지 상태
let consecutiveActiveTicks = 0

function createPetWindow() {
  const { workAreaSize } = screen.getPrimaryDisplay()
  // 오른쪽 아래에서 시작
  petX = workAreaSize.width - PET_W - 8
  petY = workAreaSize.height / 2

  petWin = new BrowserWindow({
    x: Math.round(petX),
    y: Math.round(petY),
    width: PET_W,
    height: PET_H,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      preload: PRELOAD,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  petWin.setTitle('')
  petWin.loadURL(INDEX_URL + '?mode=desktop')

  if (process.platform === 'darwin') {
    petWin.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  }

  // 타이틀 변경 자체를 차단 — Windows DWM 오버레이 방지
  petWin.webContents.on('page-title-updated', (e) => { e.preventDefault() })

  petWin.webContents.on('did-finish-load', () => {
    petWin?.setIgnoreMouseEvents(true, { forward: true })
    petWin?.setTitle('')
    petWin?.webContents.executeJavaScript('document.title = ""')
    sendFullWinState()
  })

  petWin.on('closed', () => { petWin = null })

  startWander()
}

function startWander() {
  if (wanderTimer) clearInterval(wanderTimer)

  wanderTimer = setInterval(() => {
    if (!petWin || !petWin.isVisible()) return

    const { workAreaSize } = screen.getPrimaryDisplay()
    const maxX = workAreaSize.width - PET_W
    const maxY = workAreaSize.height - PET_H

    // 가장자리 레일 목표 X (좌우 10px 여유)
    const targetX = petSide === 'right' ? maxX - 8 : 8

    // 멈춤 상태
    if (pauseTicks > 0) {
      pauseTicks--
      return
    }

    // 가끔 멈춤 (0.8%)
    if (Math.random() < 0.008) {
      pauseTicks = Math.floor((1000 + Math.random() * 3000) / 50)
      return
    }

    // Y 방향 랜덤 변경 (2%)
    if (Math.random() < 0.02) {
      petVy = (Math.random() * 1.8 + 0.5) * (Math.random() < 0.5 ? 1 : -1)
    }

    // X는 목표 레일로 부드럽게 당김
    petX += (targetX - petX) * 0.04 + (Math.random() - 0.5) * 0.5
    petY += petVy

    // Y 벽 반사
    if (petY < 0)    { petY = 0;    petVy =  Math.abs(petVy) }
    if (petY > maxY) { petY = maxY; petVy = -Math.abs(petVy) }

    // 방향: 오른쪽 레일에선 왼쪽 보기(-1), 왼쪽 레일에선 오른쪽 보기(1)
    const newDir: 1 | -1 = petSide === 'right' ? -1 : 1
    if (newDir !== petDir) {
      petDir = newDir
      petWin.webContents.send('pet-dir', petDir)
    }

    petWin.setPosition(Math.round(petX), Math.round(petY))
  }, 50)
}

function createFullWindow() {
  if (fullWin) {
    fullWin.focus()
    return
  }
  // 이전에 저장해 둔 창 위치/크기 복원 (없으면 기본값)
  const state = loadWindowState({ width: 480, height: 800 })
  fullWin = new BrowserWindow({
    x: state.x,
    y: state.y,
    width: state.width,
    height: state.height,
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#15161d', symbolColor: '#ffffff', height: 32 },
    webPreferences: {
      preload: PRELOAD,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })
  fullWin.loadURL(INDEX_URL)
  fullWin.webContents.on('did-finish-load', () => sendFullWinState())
  // 위치/크기 변경 시 저장 (닫히기 직전 bounds를 기록)
  const persist = () => { if (fullWin) saveWindowState(fullWin) }
  fullWin.on('resize', persist)
  fullWin.on('move', persist)
  fullWin.on('close', persist)
  fullWin.on('closed', () => {
    fullWin = null
    gameXpActive = false
    sendFullWinState()
  })
}

/** 게임 창을 열고(없으면 생성) 계정(로그인/로그아웃) 패널을 띄운다. */
function openAccount() {
  const existed = !!fullWin
  createFullWindow()
  if (!fullWin) return
  fullWin.focus()
  if (existed) {
    fullWin.webContents.send('open-account')
  } else {
    fullWin.webContents.once('did-finish-load', () => {
      fullWin?.webContents.send('open-account')
    })
  }
}

function updateTrayMenu() {
  if (!tray) return
  const isVisible = petWin?.isVisible() ?? false
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: '게임 열기', click: () => createFullWindow() },
      { label: '🔑 계정 (로그인/로그아웃)', click: () => openAccount() },
      { type: 'separator' },
      {
        label: isVisible ? '펫 숨기기' : '펫 보이기',
        click: () => {
          if (petWin?.isVisible()) {
            petWin.hide()
          } else {
            petWin?.show()
          }
          updateTrayMenu()
        },
      },
      { type: 'separator' },
      { label: '종료', click: () => app.quit() },
    ]),
  )
}

function createTray() {
  const icon = nativeImage.createEmpty()
  tray = new Tray(icon)
  tray.setToolTip('단짝 다마고치')
  updateTrayMenu()
  tray.on('double-click', () => createFullWindow())
}

/**
 * 30초마다 유저 활동을 감지해 work-tick IPC를 렌더러로 보낸다.
 * - idleSeconds < 60: 사용자 활성 상태일 때만 성장
 * - 저녁 7시~새벽 6시 활동: 야근(버닝타임) 자동 적용
 * - 5분 이상 연속 활동: 집중 모드
 */
function startWorkMonitor() {
  setInterval(() => {
    const payload = buildWorkTickPayload()
    if (!payload) return
    petWin?.webContents.send('work-tick', payload)
    fullWin?.webContents.send('work-tick', payload)
  }, WORK_TICK_MS)
}

function buildWorkTickPayload(): { mode: string; consecutiveTicks: number } | null {
  const idleSeconds = powerMonitor.getSystemIdleTime()
  if (idleSeconds >= 60) {
    consecutiveActiveTicks = 0
    return null
  }

  consecutiveActiveTicks++

  // 야근(버닝타임) 시간대: 저녁 7시~새벽 6시엔 활동 시 자동 야근 모드
  const hour = new Date().getHours()
  if (hour >= OVERTIME_HOUR_START || hour < OVERTIME_HOUR_END) {
    return { mode: 'overtime', consecutiveTicks: consecutiveActiveTicks }
  }

  const mode = consecutiveActiveTicks >= FOCUS_TICK_THRESHOLD ? 'focused' : 'working'
  return { mode, consecutiveTicks: consecutiveActiveTicks }
}

app.whenReady().then(async () => {
  // 프로덕션: 내장 정적 서버를 먼저 띄워 렌더러 base URL 확정 (창 생성 전)
  if (!isDev) INDEX_URL = await startStaticServer()

  createPetWindow()
  createTray()
  startWorkMonitor()

  app.on('activate', () => {
    if (!petWin) createPetWindow()
  })
})

app.on('window-all-closed', () => {
  // 트레이 앱이므로 모든 창이 닫혀도 종료하지 않음
})

ipcMain.on('toggle-always-on-top', () => {
  if (!petWin) return
  alwaysOnTop = !alwaysOnTop
  petWin.setAlwaysOnTop(alwaysOnTop)
})

ipcMain.on('toggle-click-through', () => {
  if (!petWin) return
  clickThrough = !clickThrough
  petWin.setIgnoreMouseEvents(clickThrough, { forward: true })
})

ipcMain.on('set-click-through-state', (_e, active: boolean) => {
  petWin?.setIgnoreMouseEvents(active, { forward: true })
})

// 게임 창의 PetGame 마운트/언마운트 신호 → 바탕화면 펫과 XP 적립 주체 조율
ipcMain.on('xp-active', (_e, active: boolean) => {
  gameXpActive = !!active
  sendFullWinState()
})

// 한 창에서 펫 데이터를 바꾸면 모든 창에 알려 localStorage를 다시 읽게 한다.
ipcMain.on('pet-changed', (e) => {
  for (const w of BrowserWindow.getAllWindows()) {
    if (w.webContents.id !== e.sender.id) w.webContents.send('pet-changed')
  }
})

ipcMain.on('open-full-ui', () => {
  createFullWindow()
})

ipcMain.on('hide-desktop-pet', () => {
  petWin?.hide()
  updateTrayMenu()
})

ipcMain.on('show-desktop-pet', () => {
  petWin?.show()
  updateTrayMenu()
})

