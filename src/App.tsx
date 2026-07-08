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
  const [forceLobby, setForceLobby] = useState(false)

  const activePet = pets.find((p) => p.id === activeId) ?? null

  const { user, ready } = useAuth()

  // 인트로 "만나러 가기"/로그인 완료 후 실제 게임으로 진입:
  // 저장된 펫이 있으면 이어서(play), 없으면 새로 만들기(create).
  const enterGame = () => {
    const list = loadPets()
    setPets(list)
    if (list.length > 0) {
      const stored = getActiveId()
      const aid = stored && list.some((p) => p.id === stored) ? stored : list[0].id
      setActiveId(aid)
      setActiveIdState(aid)
      discoverSpecies(list.find((p) => p.id === aid)!.form)
      setScreen('play')
    } else {
      setScreen('create')
    }
  }

  // 로비에서 로그인 성공 시(로비를 띄운 상태에서만) 게임으로 진입.
  // 이미 로그인된 채 재방문한 경우엔 인트로부터 보게 두고, "만나러 가기"로 진입한다.
  useEffect(() => {
    if (user && forceLobby) {
      setForceLobby(false)
      enterGame()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // 로비에 머무는 동안 바탕화면 펫이 XP를 적립하므로, 게임 화면으로 돌아올 때
  // 저장소를 다시 읽어 PetGame이 옛 값으로 진행도를 덮어쓰지 않게 한다
  useEffect(() => {
    if (!forceLobby) setPets(loadPets())
  }, [forceLobby])

  // 로그인 상태면 진행 상황을 계정(서버)에 자동 저장.
  // pushCloud가 자체적으로 "변화 없으면 생략 + 최소 2분 간격"을 지켜 쿼터를 보호하고,
  // 종료/로그아웃 시에만 간격 무시(force)로 마지막 상태를 확실히 남긴다.
  useEffect(() => {
    if (!user) return
    const push = () => { void pushCloud(user.uid) }
    const flush = () => { void pushCloud(user.uid, true) }
    const id = window.setInterval(push, 60000)
    window.addEventListener('beforeunload', flush)
    return () => {
      window.clearInterval(id)
      window.removeEventListener('beforeunload', flush)
      flush()
    }
  }, [user])

  // 트레이 "계정" 메뉴 → 로비로 이동
  useEffect(() => {
    const bridge = (window as { electronBridge?: { onOpenAccount?: (cb: () => void) => () => void } }).electronBridge
    return bridge?.onOpenAccount?.(() => setForceLobby(true))
  }, [])

  // 시작 시 테마 적용 + 보관함 로드.
  // 저장된 펫이 있어도 게임으로 자동 점프하지 않는다 — 매 방문마다 인트로부터
  // 보여주고, 인트로의 "만나러 가기"에서 enterGame()으로 이어서 진입한다.
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
    setForceLobby(false)
    enterGame()
  }

  const handleLogout = async () => {
    await logOut()
    localStorage.removeItem(GUEST_KEY)
    // 로그아웃하면 로비(로그인 화면)를 다시 띄운다
    setForceLobby(true)
  }

  // 인증 확인 중에는 깜빡임 방지용 빈 화면
  if (firebaseReady && !ready) {
    return <main className="app" />
  }

  const isElectron = typeof window !== 'undefined' && !!(window as { electronBridge?: unknown }).electronBridge

  // 로비(로그인 화면)는 사용자가 인트로/설정에서 로그인을 누르거나 로그아웃했을 때만 뜬다.
  // 매 방문의 첫 화면은 항상 인트로 → 인트로의 로그인 버튼으로 로비 진입.
  const showLobby = forceLobby
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
          onStart={enterGame}
          onAccount={() => setForceLobby(true)}
          accountLabel={user ? `👤 ${displayId(user)}` : '👤 계정 로그인'}
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
