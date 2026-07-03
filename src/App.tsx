import { useEffect, useState } from 'react'
import type { Pet } from './types/pet'
import Intro from './features/intro/Intro'
import PetCreator from './features/pet-creator/PetCreator'
import PetGame from './features/pet-status/PetGame'
import SpeciesReveal from './features/reveal/SpeciesReveal'
import {
  applyTheme,
  discoverSpecies,
  getActiveId,
  loadPets,
  loadSettings,
  removePet,
  setActiveId,
  upsertPet,
} from './utils/storage'
import { migrateFromPets } from './utils/account'
import { useAuth } from './hooks/useAuth'
import { displayId, firebaseReady, logOut } from './utils/auth'
import { pushCloud } from './utils/cloud'
import Lobby from './features/lobby/Lobby'
import './App.css'

const GUEST_KEY = 'danjjak-guest'

type Screen = 'title' | 'create' | 'reveal' | 'play'

function App() {
  const [screen, setScreen] = useState<Screen>('title')
  const [pets, setPets] = useState<Pet[]>([])
  const [activeId, setActiveIdState] = useState<string | null>(null)
  const [revealNew, setRevealNew] = useState(false)
  const [guest, setGuest] = useState(() => localStorage.getItem(GUEST_KEY) === '1')
  const [forceLobby, setForceLobby] = useState(false)

  const activePet = pets.find((p) => p.id === activeId) ?? null

  const { user, ready } = useAuth()

  // 로그인되면 강제 로비 해제
  useEffect(() => {
    if (user) setForceLobby(false)
  }, [user])

  // 로비에 머무는 동안 바탕화면 펫이 XP를 적립하므로, 게임 화면으로 돌아올 때
  // 저장소를 다시 읽어 PetGame이 옛 값으로 진행도를 덮어쓰지 않게 한다
  useEffect(() => {
    if (!forceLobby) setPets(loadPets())
  }, [forceLobby])

  // 로그인 상태면 진행 상황을 클라우드에 자동 저장 (30초마다 + 종료/로그아웃 시)
  useEffect(() => {
    if (!user) return
    const push = () => { void pushCloud(user.uid) }
    const id = window.setInterval(push, 30000)
    window.addEventListener('beforeunload', push)
    return () => {
      window.clearInterval(id)
      window.removeEventListener('beforeunload', push)
      push()
    }
  }, [user])

  // 트레이 "계정" 메뉴 → 로비로 이동
  useEffect(() => {
    const bridge = (window as { electronBridge?: { onOpenAccount?: (cb: () => void) => () => void } }).electronBridge
    return bridge?.onOpenAccount?.(() => setForceLobby(true))
  }, [])

  // 시작 시 테마 적용 + 보관함 로드
  useEffect(() => {
    applyTheme(loadSettings().theme)
    const list = loadPets()
    // 기존 펫별 코인·선물·아이템 → 계정 지갑으로 1회 이전
    migrateFromPets(list)
    if (list.length > 0) {
      const stored = getActiveId()
      const aid = stored && list.some((p) => p.id === stored) ? stored : list[0].id
      setActiveId(aid)
      setActiveIdState(aid)
      setPets(list)
      const ap = list.find((p) => p.id === aid)!
      discoverSpecies(ap.form)
      setScreen('play')
    }
  }, [])

  const makeActive = (id: string) => {
    setActiveId(id)
    setActiveIdState(id)
  }

  const handleCreated = (newPet: Pet) => {
    upsertPet(newPet)
    setPets(loadPets())
    makeActive(newPet.id)
    setRevealNew(discoverSpecies(newPet.form))
    setScreen('reveal')
  }

  const handleAddNew = () => setScreen('create')

  const handleSwitch = (id: string) => {
    // 전환 전에 최신 저장 상태를 다시 읽어 진행도 유실 방지
    // (활성 펫은 usePet이 계속 localStorage에 저장하지만 App의 pets는 그동안 옛 값)
    setPets(loadPets())
    makeActive(id)
    setScreen('play')
  }

  const handleDelete = (id: string) => {
    const remaining = removePet(id)
    setPets(remaining)
    if (remaining.length === 0) {
      setActiveIdState(null)
      setScreen('create')
      return
    }
    if (id === activeId) makeActive(remaining[0].id)
  }

  const handleGuest = () => {
    localStorage.setItem(GUEST_KEY, '1')
    setGuest(true)
    setForceLobby(false)
  }

  const handleLogout = async () => {
    await logOut()
    localStorage.removeItem(GUEST_KEY)
    setGuest(false)
    setForceLobby(false)
    // user가 null이 되며 로비가 다시 표시됨
  }

  // 인증 확인 중에는 깜빡임 방지용 빈 화면
  if (firebaseReady && !ready) {
    return <main className="app" />
  }

  const isElectron = typeof window !== 'undefined' && !!(window as { electronBridge?: unknown }).electronBridge

  const showLobby = forceLobby || (firebaseReady && !user && !guest)
  if (showLobby) {
    return (
      <main className="app">
        {isElectron && <div className="app-drag" aria-hidden="true" />}
        <Lobby onGuest={handleGuest} />
      </main>
    )
  }

  return (
    <main className="app">
      {isElectron && <div className="app-drag" aria-hidden="true" />}
      {screen === 'title' && (
        <Intro
          onStart={() => setScreen('create')}
          onAccount={() => setForceLobby(true)}
          accountLabel={user ? `☁️ ${displayId(user)}` : '☁️ 로그인'}
        />
      )}

      {screen === 'create' && (
        <PetCreator onCreated={handleCreated} ownerName={pets[0]?.ownerName} />
      )}

      {screen === 'reveal' && activePet && (
        <SpeciesReveal
          pet={activePet}
          isNew={revealNew}
          onContinue={() => setScreen('play')}
        />
      )}

      {screen === 'play' && activePet && (
        <PetGame
          key={activePet.id}
          initialPet={activePet}
          pets={pets}
          onAddNew={handleAddNew}
          onSwitch={handleSwitch}
          onDelete={handleDelete}
          loggedInId={user ? displayId(user) : null}
          onLogout={handleLogout}
          onGoLobby={() => setForceLobby(true)}
        />
      )}
    </main>
  )
}

export default App
