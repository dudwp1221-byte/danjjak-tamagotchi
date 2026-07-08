import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { WeatherInfo } from '../../utils/weather'
import { fetchWeather } from '../../utils/weather'
import { buildSystemPrompt, getApiKey, sendChat } from '../../utils/chat'
import type { Pet, PetAction } from '../../types/pet'
import { usePet } from '../../hooks/usePet'
import { useBehavior } from '../../hooks/useBehavior'
import { useElectron } from '../../hooks/useElectron'
import { useWorkActivity } from '../../hooks/useWorkActivity'
import { petMood, wellbeing } from '../../utils/stats'
import { daysTogether, graduateReward, petSpriteUrl, spriteUrl, displaySpecies, todayIndex } from '../../utils/pet'
import { grantItem, addGift, useGift as consumeGift, setAvatarPet, recordAvatarPets } from '../../utils/account'
import { useAccount } from '../../hooks/useAccount'
import {
  isMuted,
  playAchievement,
  playAction,
  playLevelUp,
  setMuted,
} from '../../utils/sound'
import { ACHIEVEMENTS, newlyUnlocked } from '../../utils/achievements'
import { personalityDef } from '../../utils/personality'
import {
  bondStage,
  giftBondGain,
  objectParticle,
  subjectParticle,
  FAVORITE_GIFT,
  FAVORITE_REACTION,
} from '../../utils/bond'
import { ITEM_SETS, isSetComplete } from '../../utils/sets'
import { checkForLetter, type Letter } from '../../utils/letters'
import LetterModal from '../graduation/Letter'
import {
  formById,
  tierName,
} from '../../utils/species'
import { levelFromXp, MINIGAME_DAILY_COIN_CAP } from '../../utils/progression'
import { getEvolveOptions } from '../../utils/evolve'
import { careRemaining, CARE_HOURLY_CAP } from '../../utils/care'
import { pickPetLine } from '../../utils/petLines'
import { lineQuestsFor } from '../../utils/quests'
import { awakenCond, AWAKEN_CONDS, canAttemptAwaken, isAwakenEligible, type AwakenCtx } from '../../utils/awaken'
import { backgroundCss, wornAccessories, type ShopItem } from '../../utils/items'
import {
  focusBuffInfo,
  activeFocusSession,
  completeDueFocusSession,
  abortFocusSession,
  FOCUS_IDLE_FAIL_SEC,
} from '../../utils/focus'
import { FURNITURE_ITEMS, type FurnitureItem } from '../../utils/furniture'
import { PROFILE_KEYS } from '../../utils/evolution-conditions'
import { WORK_MODE_META, WORK_XP_PER_TICK } from '../../utils/work-activity'
import { BEHAVIOR_META } from '../../utils/behavior'
import { generateTodaySummary } from '../../utils/today-summary'
import { gameClock, gameSeasonKey, birthMonth } from '../../utils/gametime'
import {
  applyTheme,
  discoverSpecies,
  loadDex,
  isOnboarded,
  loadSettings,
  markOnboarded,
  saveSettings,
  addGraduate,
  type Settings as AppSettings,
  type Theme,
} from '../../utils/storage'
import { useTabBadge } from '../../hooks/useTabBadge'
import { useCareNotifications } from '../../hooks/useCareNotifications'
import PetAvatar, { type ReactionType } from '../../components/PetAvatar'
import Shop from '../shop/Shop'
import Achievements from '../achievements/Achievements'
import Friends from '../multiplayer/Friends'
import ShareCard from '../multiplayer/ShareCard'
import Settings from '../settings/Settings'
import Onboarding from '../onboarding/Onboarding'
import CatchGame from '../minigame/CatchGame'
import RockPaperScissors from '../minigame/RockPaperScissors'
import Diary from '../diary/Diary'
import Missions from '../missions/Missions'
import FusionEvo, { FUSION_MIN_LEVEL } from '../fusion-evo/FusionEvo'
import Awaken from '../awaken/Awaken'
import Quest from '../quest/Quest'
import WelcomeBack from '../welcome/WelcomeBack'
import Dex from '../dex/Dex'
import PetRoom from '../room/PetRoom'
import Evolve from '../evolution/Evolve'
import PetChat from '../chat/PetChat'
import GiftPicker from '../gift/GiftPicker'
import Graduation from '../graduation/Graduation'
import MoodCheck, { getTodayMood } from '../mood/MoodCheck'
import ClosetEditor from '../closet/ClosetEditor'
import Bag from '../bag/Bag'
import FurnitureSprite from '../../components/FurnitureSprite'
import UIIcon from '../../components/UIIcon'
import PomodoroTimer from '../timer/PomodoroTimer'
import ScheduleManager from '../schedule/ScheduleManager'
import ScheduleAlarm from '../schedule/ScheduleAlarm'
import { useScheduleAlarm } from '../../hooks/useScheduleAlarm'
import Modal from '../../components/Modal'
import StatBar, { CRITICAL } from './StatBar'
import './pet-game.css'

type ModalKind =
  | 'shop'
  | 'achievements'
  | 'friends'
  | 'share'
  | 'settings'
  | 'gamehub'
  | 'catch'
  | 'rps'
  | 'diary'
  | 'missions'
  | 'quest'
  | 'dex'
  | 'roster'
  | 'evolve'
  | 'fusionevo'
  | 'awaken'
  | 'chat'
  | 'timer'
  | 'schedule'
  | 'gift'
  | 'graduate'
  | 'profile'
  | 'closet'
  | 'bag'
  | null

type GrowthFx = {
  kind: 'level' | 'evolve' | 'fusion' | 'awaken'
  title: string
  subtitle: string
  fromFormId?: string
  toFormId?: string
  key: number
} | null


interface PetGameProps {
  initialPet: Pet
  /** 보관함의 모든 펫 */
  pets: Pet[]
  /** 새 펫 그리기 화면으로 */
  onAddNew: () => void
  /** 다른 펫으로 전환 */
  onSwitch: (id: string) => void
  /** 펫 떠나보내기 */
  onDelete: (id: string) => void
  /** 로그인된 아이디 (게스트면 null) */
  loggedInId?: string | null
  /** 로그아웃 → 로비로 */
  onLogout?: () => void
  /** 로비(로그인 화면)로 이동 */
  onGoLobby?: () => void
}

export default function PetGame({
  initialPet,
  pets,
  onAddNew,
  onSwitch,
  onDelete,
  loggedInId = null,
  onLogout,
  onGoLobby,
}: PetGameProps) {
  const {
    pet,
    care,
    reward,
    adjust,
    addBond,
    update,
    spendCoins,
    unlock,
    claimDaily,
    addDiary,
    recordMission,
    claimMission,
    completeQuest,
    completeLineQuest,
    recordProfile,
    addBehaviorLog,
    level,
    progress,
    stage,
  } = usePet(initialPet)

  const { behaviorState, behaviorLabel, behaviorEmoji } = useBehavior(
    pet,
    adjust,
    addBehaviorLog,
    recordProfile,
    useCallback((xp: number) => reward(0, xp), [reward]),
  )

  const { isElectron, bridge } = useElectron()

  const {
    workMode,
    todayWorkMin,
    todayOvertimeMin,
  } = useWorkActivity({
    workToday: pet.workToday,
    furniture: pet.furniture,
    onRewardXp: (xp) => {
      reward(0, xp)
      // 가속 체감: 틱마다 레벨바에 +XP 플로팅
      setWorkPop({ text: `+${xp} XP`, key: Date.now() })
    },
    onRecordProfile: recordProfile,
    onUpdateWorkToday: (wt) => update({ workToday: wt }),
  })

  // 야근 중 특별 말풍선
  useEffect(() => {
    if (workMode !== 'overtime') return
    const OVERTIME_LINES = [
      '힘내세요! 🥹',
      '커피 한 잔 어때요? ☕',
      '오늘도 야근이군요...',
      '몸 꼭 챙기세요 💪',
      '같이 있을게요 🌙',
    ]
    const id = window.setInterval(() => {
      if (document.hidden) return
      const line = OVERTIME_LINES[Math.floor(Math.random() * OVERTIME_LINES.length)]
      setSpeech(line)
      window.setTimeout(() => setSpeech(null), 3500)
    }, 20000)
    return () => window.clearInterval(id)
  }, [workMode])

  // 계정 대표(프로필) 펫 — 지정 없으면 현재 펫
  const account = useAccount()
  // 획득 이력 기록: 보유 펫 + 현재(진화·합성으로 폼이 바뀐) 활성 펫
  useEffect(() => {
    recordAvatarPets([
      ...pets.map((p) => ({ id: p.id, name: p.name, form: p.form })),
      { id: pet.id, name: pet.name, form: pet.form },
    ])
  }, [pets, pet.id, pet.name, pet.form])
  // 대표 펫의 표시용 폼/이름 (활성 펫이면 라이브 객체 → 보유 목록 → 이력 pool 순).
  // App의 pets 배열은 스냅샷이라 활성 펫이 진화해도 옛 폼을 들고 있음 — 라이브 pet을 먼저 봐야 한다.
  const avatarEntry = account.avatarPetId
    ? account.avatarPetId === pet.id
      ? pet
      : pets.find((p) => p.id === account.avatarPetId) ?? account.avatarPool?.[account.avatarPetId]
    : undefined
  const avatarForm = avatarEntry?.form ?? pet.form
  const avatarName = avatarEntry?.name ?? pet.name

  const personality = personalityDef(pet.personality)
  const clock = gameClock(pet.createdAt)
  const form = formById(pet.form)
  // 진화 가능 형태 + 잠금 판정 (게임·바탕화면 펫 공용 로직)
  const evolveList = getEvolveOptions(pet, level)
  const canEvolve = evolveList.length > 0
  // 각성 자격: 궁극체 게이트(canAttemptAwaken) + 히든 조건을 하나라도 충족했을 때만 버튼 노출
  const canAwaken = useMemo(() => {
    if (!canAttemptAwaken(pet)) return false
    const ctx: AwakenCtx = {
      pet,
      level,
      dex: new Set([...loadDex(), pet.form]),
      season: gameSeasonKey(pet.createdAt),
      birthMonth: birthMonth(pet.createdAt),
    }
    return Object.keys(AWAKEN_CONDS).some((id) => isAwakenEligible(id, ctx))
  }, [pet, level])
  const giftCount = Object.values(pet.gifts).reduce((a, b) => a + b, 0)
  // 집중 타이머 버프/세션 — usePet 틱(2초)마다 리렌더되므로 매 렌더 재계산으로 충분
  const focusBuff = focusBuffInfo()
  const focusSession = activeFocusSession()
  const { stats } = pet
  const [settings, setSettings] = useState<AppSettings>(loadSettings)

  /** 액션 시 잠깐 보여줄 하트 등 효과 */
  const [effect, setEffect] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [graduateId, setGraduateId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(pet.name)
  const saveName = () => {
    // 비우고 저장하면 현재 형태의 기본(종족) 이름으로
    const next = nameDraft.trim() || formById(pet.form).name
    if (next !== pet.name) update({ name: next })
    setEditingName(false)
  }
  const [reactType, setReactType] = useState<ReactionType | null>(null)
  const [reactKey, setReactKey] = useState(0)
  const [pop, setPop] = useState<{ text: string; key: number } | null>(null)
  // 업무 틱마다 레벨바 위로 뜨는 +XP 플로팅 (가속 체감용)
  const [workPop, setWorkPop] = useState<{ text: string; key: number } | null>(null)
  const [growthFx, setGrowthFx] = useState<GrowthFx>(null)
  const [muted, setMutedState] = useState(isMuted())
  const [modal, setModal] = useState<ModalKind>(null)
  const [showOnboarding, setShowOnboarding] = useState(() => !isOnboarded())
  // 자리를 비운 시간 (마운트 시 1회 계산). 온보딩 첫 실행이 아니고 5분 이상이면 환영
  const [awayMs] = useState(() => Date.now() - initialPet.lastUpdated)
  const [showWelcome, setShowWelcome] = useState(
    () => isOnboarded() && Date.now() - initialPet.lastUpdated >= 5 * 60 * 1000,
  )
  const [, forceRerender] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  // 선물 팝업 → 상점 "선물" 분류로 바로 이동시키는 신호 (카운터)
  const [shopGiftSignal, setShopGiftSignal] = useState(0)
  // 가구 드래그 배치 (놓는 순간 pet.furniturePos에 저장)
  const stageRef = useRef<HTMLDivElement>(null)
  const [furnDrag, setFurnDrag] = useState<{ id: string; x: number; y: number } | null>(null)

  // 하단 탭 = 가로 페이저 (시각 순서). 0:상점 1:놀이 2:케어(홈) 3:합성 4:도감
  // 페이지 DOM 순서는 그대로 두고 CSS order로 위치를 잡는다(홈 블록 이동 방지).
  const PAGE_COUNT = 5
  const CARE_TAB = 2
  const [tab, setTab] = useState(CARE_TAB) // 게임 켜질 때 항상 케어 화면
  // 드래그(스와이프) 상태 — 손가락/마우스 이동량(px)을 실시간 반영
  const [dragDx, setDragDx] = useState(0)
  const dragRef = useRef<{ x: number; y: number; active: boolean; decided: boolean; horiz: boolean; pointerId: number }>({
    x: 0, y: 0, active: false, decided: false, horiz: false, pointerId: -1,
  })
  const viewportRef = useRef<HTMLDivElement | null>(null)

  const onPagerDown = useCallback((e: React.PointerEvent) => {
    // 버튼/입력/스크롤 컨트롤 위에서 시작한 제스처는 페이징으로 가로채지 않음
    const t = e.target as HTMLElement
    if (t.closest('button, input, textarea, a, select, [role="slider"]')) return
    dragRef.current = { x: e.clientX, y: e.clientY, active: true, decided: false, horiz: false, pointerId: e.pointerId }
  }, [])

  const onPagerMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current
    if (!d.active) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (!d.decided) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
      // 세로 스크롤이 우세하면 페이징 취소 (페이지 내부 스크롤 존중)
      d.decided = true
      d.horiz = Math.abs(dx) > Math.abs(dy)
      if (!d.horiz) { d.active = false; return }
      // 가로 드래그 확정 → 포인터를 캡처해 버튼/텍스트 위를 지나도 끊기지 않게
      try { viewportRef.current?.setPointerCapture(d.pointerId) } catch { /* noop */ }
    }
    // 네이티브 텍스트/이미지 드래그·선택 억제 (버벅임 방지)
    e.preventDefault()
    // 끝 페이지에서 더 당기면 저항 (1/3)
    const atEdge = (tab === 0 && dx > 0) || (tab === PAGE_COUNT - 1 && dx < 0)
    setDragDx(atEdge ? dx / 3 : dx)
  }, [tab])

  const endPager = useCallback(() => {
    const d = dragRef.current
    try { if (d.pointerId >= 0) viewportRef.current?.releasePointerCapture(d.pointerId) } catch { /* noop */ }
    if (!d.active && !d.decided) { setDragDx(0); return }
    const w = viewportRef.current?.offsetWidth ?? 320
    const dx = dragDx
    let next = tab
    if (dx <= -Math.min(60, w * 0.25) && tab < PAGE_COUNT - 1) next = tab + 1
    else if (dx >= Math.min(60, w * 0.25) && tab > 0) next = tab - 1
    dragRef.current = { x: 0, y: 0, active: false, decided: false, horiz: false, pointerId: -1 }
    setDragDx(0)
    if (next !== tab) setTab(next)
  }, [dragDx, tab])

  // 탭 전환(스와이프·하단 탭 클릭 모두) 시 그 페이지를 항상 맨 위부터 보이게.
  // .pet-game 패널이 min-height만 갖고 있어 실제 스크롤은 .pg-page가 아니라
  // 문서(window) 단위로 일어난다 — 긴 탭(도감 등)에서 내려간 채로 다른 탭에
  // 진입하면 그 스크롤 위치가 그대로 유지돼 중간부터 보이는 문제 방지.
  useEffect(() => {
    window.scrollTo({ top: 0 })
    const page = viewportRef.current?.querySelector<HTMLElement>(`.pg-page[data-tab="${tab}"]`)
    page?.scrollTo({ top: 0 })
  }, [tab])

  // 마운트 시 한 번 계산 (initialPet.behaviorLog 기준)
  const todaySummary = useMemo(
    () => generateTodaySummary(initialPet.behaviorLog),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  // 날씨
  const [weather, setWeather] = useState<WeatherInfo | null>(null)
  useEffect(() => {
    fetchWeather().then(setWeather).catch(() => {})
  }, [])

  // 감정 체크인 — 오늘 아직 안 했으면 WelcomeBack 닫힌 후 표시
  const [showMoodCheck, setShowMoodCheck] = useState(false)

  // 일정 알람
  const [activeAlarm, setActiveAlarm] = useState<import('../../types/pet').Schedule | null>(null)
  useScheduleAlarm(
    pet.schedules,
    (s) => setActiveAlarm(s),
    (id) => update({ schedules: pet.schedules.map((s) => s.id === id ? { ...s, notified: true } : s) }),
  )

  // 굿나잇/굿모닝 감지
  const isMorning = (() => { const h = new Date().getHours(); return h >= 5 && h < 11 })()
  const wasGoodnight = (() => {
    if (!initialPet.lastGoodnight) return false
    const gn = new Date(initialPet.lastGoodnight)
    const today = new Date(); today.setHours(0,0,0,0)
    return gn < today && (Date.now() - initialPet.lastGoodnight) < 18 * 3600000
  })()

  // 오늘의 한마디 (아침 첫 방문)
  const [morningMsg, setMorningMsg] = useState<string | null>(null)
  useEffect(() => {
    if (!isMorning || !wasGoodnight) return
    const MSGS = [
      '좋은 아침이에요! ☀️ 오늘도 같이 힘내요!',
      '잘 잤어요? 😊 오늘도 좋은 하루!',
      '아침이다~ 오늘도 여기 있을게요 🌸',
    ]
    setMorningMsg(MSGS[Math.floor(Math.random() * MSGS.length)])
  }, [isMorning, wasGoodnight])

  // 펫 일기 AI 생성 중 상태
  const [petDiaryLoading, setPetDiaryLoading] = useState(false)
  const toastTimer = useRef<number | undefined>(undefined)
  const showToast = useCallback((msg: string) => {
    setToast(msg)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 1800)
  }, [])

  // AI로 오늘 일기 쓰기 (일기 모달 안에서 호출)
  const writeAiDiary = useCallback(async () => {
    if (!getApiKey()) { showToast('설정에서 API 키를 먼저 입력해주세요'); return }
    setPetDiaryLoading(true)
    try {
      const summary = generateTodaySummary(pet.behaviorLog)
      const summaryText = summary.length
        ? summary.map((l) => l.text).join(', ')
        : '조용히 기다렸어'
      const prompt = `오늘 하루 "${pet.name}"의 일기를 펫 시점으로 2~3문장으로 써줘. 오늘 한 것: ${summaryText}. 주인인 ${pet.ownerName}님에 대한 감정을 담아서, 귀엽고 따뜻하게.`
      const entry = await sendChat(getApiKey(), buildSystemPrompt(pet, behaviorState), [], prompt)
      addDiary('📝', entry)
      showToast('📝 펫 일기를 썼어요!')
    } catch {
      showToast('일기 쓰기 실패 😢')
    } finally {
      setPetDiaryLoading(false)
    }
  }, [pet, behaviorState, addDiary, showToast])

  const setNotifications = useCallback((value: boolean) => {
    setSettings((s) => {
      const next = { ...s, notifications: value }
      saveSettings(next)
      return next
    })
  }, [])

  const setTheme = useCallback((value: Theme) => {
    setSettings((s) => {
      const next = { ...s, theme: value }
      saveSettings(next)
      applyTheme(value)
      return next
    })
  }, [])

  // 게임 시계(+함께한 일수)를 흐르게 하려고 주기적으로 리렌더.
  // 게임 1분 ≈ 실제 1.15초로 빠르게 흐르므로 1.5초마다 갱신한다. (백그라운드 탭은 건너뜀)
  useEffect(() => {
    const id = window.setInterval(() => {
      if (!document.hidden) forceRerender((n) => n + 1)
    }, 1500)
    return () => window.clearInterval(id)
  }, [])

  const triggerReaction = useCallback((type: ReactionType) => {
    setReactType(type)
    setReactKey((k) => k + 1)
  }, [])

  const growthFxTimer = useRef<number | undefined>(undefined)
  const triggerGrowthFx = useCallback((fx: Omit<NonNullable<GrowthFx>, 'key'>) => {
    window.clearTimeout(growthFxTimer.current)
    setGrowthFx({ ...fx, key: Date.now() })
    growthFxTimer.current = window.setTimeout(() => setGrowthFx(null), 1700)
  }, [])

  useEffect(() => () => window.clearTimeout(growthFxTimer.current), [])

  // 레벨업 감지
  const prevLevel = useRef(level)
  useEffect(() => {
    if (level > prevLevel.current) {
      showToast(`🎉 레벨 업! Lv.${level} (${stage.label})`)
      addDiary(stage.badge, `레벨 ${level} 달성! (${stage.label})`)
      playLevelUp()
      triggerGrowthFx({
        kind: 'level',
        title: `Lv.${level}`,
        subtitle: stage.label,
      })
    }
    prevLevel.current = level
  }, [level, stage.label, stage.badge, showToast, addDiary, triggerGrowthFx])


  const handleAction = useCallback(
    (action: PetAction) => {
      const react: Record<PetAction, ReactionType> = { feed: 'munch', pet: 'hop', wash: 'wiggle', sleep: 'breathe', play: 'hop', gift: 'wiggle' }
      // 시간당 한도 소진 시 보상 없이 반응만 (펫 직접 클릭 등 우회 방지)
      if (careRemaining(pet, action) <= 0) {
        triggerReaction(react[action])
        showToast('이번 시각은 충분히 돌봤어요 — 다음 정각에 다시 🕐')
        return
      }
      const result = care(action)
      recordMission('care')
      playAction(action)
      const fx: Record<PetAction, string> = { feed: '😋', pet: '💕', wash: '✨', sleep: '💤', play: '🎉', gift: '🎁' }
      const gain: Record<PetAction, string> = { feed: '🍙 +35', pet: '💗 +25', wash: '🫧 +40', sleep: '⚡ +45', play: '💗 신나요!', gift: '💝 애정 +40' }
      triggerReaction(react[action])
      setEffect(fx[action])
      setPop({ text: gain[action], key: Date.now() })
      window.setTimeout(() => setEffect(null), 800)
      if (result.wasted) showToast('이미 충분한데 행복해요! 💕')
    },
    [pet, care, showToast, recordMission, triggerReaction],
  )

  // 미니게임 일일 코인 상한 — 반복 파밍으로 경제가 무너지지 않게. 기분 보상은 계속 준다 (힐링 톤)
  const grantMinigameCoins = useCallback(
    (coins: number): number => {
      const KEY = 'danjjak-minigame-coins'
      const today = todayIndex()
      let rec = { day: today, total: 0 }
      try {
        const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null') as { day: number; total: number } | null
        if (raw && raw.day === today) rec = raw
      } catch { /* 무시 */ }
      const granted = Math.max(0, Math.min(coins, MINIGAME_DAILY_COIN_CAP - rec.total))
      if (granted > 0) {
        reward(granted)
        try {
          localStorage.setItem(KEY, JSON.stringify({ day: today, total: rec.total + granted }))
        } catch { /* 무시 */ }
      }
      if (granted < coins) {
        showToast(
          granted > 0
            ? `+${granted}🪙 — 오늘 미니게임 코인은 여기까지! (기분은 계속 올라요)`
            : '오늘 미니게임 코인은 다 모았어요. 기분은 계속 올라요 😊',
        )
      }
      return granted
    },
    [reward, showToast],
  )

  // 유대감 상승 + 단계가 오르면 축하 (일기·토스트)
  const gainBond = useCallback(
    (amount: number) => {
      const before = bondStage(pet.bond)
      const after = bondStage(pet.bond + amount)
      addBond(amount)
      if (after.min > before.min) {
        showToast(`${after.emoji} ${pet.name}와 "${after.name}"${subjectParticle(after.name)} 됐어요!`)
        addDiary(after.emoji, `${pet.ownerName}님과 "${after.name}"${subjectParticle(after.name)} 되었어요. 마음이 몽글몽글해요.`)
      }
    },
    [pet.bond, pet.name, pet.ownerName, addBond, showToast, addDiary],
  )

  // 선물 주기 (선물함에서 아이템 1개 소모 → 애정·유대 ↑, 일기에 남는다)
  const giveGift = useCallback(
    (item: ShopItem) => {
      if (!consumeGift(item.id)) return
      adjust({ mood: item.affection ?? 20, health: 4 })
      reward(0, 4)
      recordMission('care')
      triggerReaction('wiggle')
      const favorite = FAVORITE_GIFT[pet.personality] === item.id
      const bondGain = giftBondGain(item.affection ?? 20, favorite)
      addDiary(
        item.emoji,
        favorite
          ? `제일 좋아하는 ${item.name}${objectParticle(item.name)} 받았어요! 최고의 하루예요!`
          : `${item.name}${objectParticle(item.name)} 선물받았어요. 마음이 따뜻해져요.`,
      )
      setEffect(favorite ? '💖' : '🎁')
      setPop({
        text: favorite ? `💖 최애 선물! 유대 +${bondGain}` : `💝 애정 +${item.affection ?? 20} · 유대 +${bondGain}`,
        key: Date.now(),
      })
      window.setTimeout(() => setEffect(null), 800)
      setModal(null)
      if (favorite) {
        setSpeech(FAVORITE_REACTION[pet.personality])
        window.setTimeout(() => setSpeech(null), 4500)
      }
      showToast(favorite ? `${item.emoji} 최애 선물이에요! 정말 좋아해요 💖` : `${item.emoji} 선물했어요! 좋아해요 💝`)
      // 마지막에 호출 — 단계 상승 축하 토스트가 선물 토스트에 덮이지 않게
      gainBond(bondGain)
    },
    [adjust, reward, recordMission, triggerReaction, showToast, pet.personality, gainBond, addDiary],
  )

  const toggleMute = () => {
    const next = !muted
    setMuted(next)
    setMutedState(next)
  }

  // 출석 보상 (하루 1회)
  useEffect(() => {
    const r = claimDaily()
    if (r) {
      showToast(`📅 출석 보상 +${r.amount}🪙 · ${r.streak}일 연속`)
    }
  }, [claimDaily, showToast])



  // 펫 말풍선 (가끔 한마디)
  const [speech, setSpeech] = useState<string | null>(null)
  const petRef = useRef(pet)
  petRef.current = pet
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.hidden) return
      setSpeech(
        pickPetLine(
          petRef.current.stats,
          petRef.current.personality,
          gameClock(petRef.current.createdAt),
          formById(petRef.current.form).type,
        ),
      )
      window.setTimeout(() => setSpeech(null), 3500)
    }, 14000)
    return () => window.clearInterval(id)
  }, [])

  // 업무 틱 +XP 플로팅 자동 소멸
  useEffect(() => {
    if (!workPop) return
    const id = window.setTimeout(() => setWorkPop(null), 1400)
    return () => window.clearTimeout(id)
  }, [workPop])

  // 업무 모드 전환 순간 연출 — "일하면 빨리 큰다" 시스템의 존재를 알려주는 핵심 피드백
  const prevWorkModeRef = useRef(workMode)
  useEffect(() => {
    const prev = prevWorkModeRef.current
    prevWorkModeRef.current = workMode
    if (prev === workMode || workMode === 'idle') return
    if (workMode === 'working' && prev === 'idle') {
      showToast('💼 업무 감지! 일하는 동안 XP 가속 ⚡')
      setSpeech('오늘도 화이팅이에요! 💪')
      window.setTimeout(() => setSpeech(null), 3500)
    } else if (workMode === 'focused' && prev !== 'focused') {
      showToast('🔥 집중 모드 진입! XP 2배 가속')
      setSpeech('우와, 엄청 집중하고 있어요! 🔥')
      window.setTimeout(() => setSpeech(null), 3500)
    } else if (workMode === 'overtime' && prev !== 'overtime') {
      showToast('🌙 야근 버닝타임! XP 3배 가속')
    }
  }, [workMode, showToast])

  // 하루 첫 만남 인사 — "출근하면 반겨주는 존재" 리듬의 시작점.
  // 요일·시간대별 인사 + 소액 코인 + 일기 기록 (하루 1회)
  useEffect(() => {
    const KEY = 'danjjak-daily-greet'
    const today = String(todayIndex())
    if (localStorage.getItem(KEY) === today) return
    localStorage.setItem(KEY, today)
    const dow = new Date().getDay()
    const h = new Date().getHours()
    const base =
      h < 6 ? '이 시간에… 무리하지 말아요' :
      h < 12 ? '좋은 아침이에요' :
      h < 18 ? '오늘도 만나서 반가워요' : '늦게라도 와줘서 좋아요'
    const week =
      dow === 1 ? ' 월요일은 가볍게 시작해요!' :
      dow === 5 ? ' 조금만 힘내면 주말이에요!' :
      dow === 0 || dow === 6 ? ' 주말에도 함께라 행복해요!' : ''
    const t = window.setTimeout(() => {
      setSpeech(`${base}, ${pet.name} 출근 완료! ☀️${week}`)
      window.setTimeout(() => setSpeech(null), 5200)
      reward(5)
      gainBond(2) // 매일 만나는 것만으로도 유대가 깊어진다
      showToast('☀️ 오늘의 첫 인사 +5🪙')
      addDiary('☀️', '오늘도 함께 하루를 시작했어요.')
    }, 1500)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 함께한 날 기념일 — 만렙 이후에도 이어지는 정서적 성장축 (펫별 1회씩)
  useEffect(() => {
    const MILESTONES = [7, 30, 50, 100, 200, 365]
    const KEY = `danjjak-anniv-${pet.id}`
    const days = daysTogether(pet.createdAt)
    const done = Number(localStorage.getItem(KEY) ?? 0)
    const hit = [...MILESTONES].reverse().find((m) => days >= m && m > done)
    if (!hit) return
    localStorage.setItem(KEY, String(hit))
    const t = window.setTimeout(() => {
      setSpeech(`우리가 함께한 지 벌써 ${hit}일이에요! 고마워요 💛`)
      window.setTimeout(() => setSpeech(null), 6000)
      reward(hit) // 기념일 숫자만큼 코인 선물
      gainBond(10)
      showToast(`🎂 함께한 지 ${hit}일 기념 +${hit}🪙`)
      addDiary('🎂', `함께한 지 ${hit}일이 되었어요. 앞으로도 잘 부탁해요!`)
    }, 3800) // 출근 인사 말풍선이 끝난 뒤
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pet.id])

  // 졸업 펫의 편지 — 접속 후 한 번, 출근인사·기념일 말풍선이 끝난 뒤 확인 (letters.ts가 쿨다운·확률 관리)
  const [letter, setLetter] = useState<Letter | null>(null)
  useEffect(() => {
    const t = window.setTimeout(() => {
      const l = checkForLetter()
      if (l) setLetter(l)
    }, 7000)
    return () => window.clearTimeout(t)
  }, [])

  // 세트 완성 감지 — 능력 보상 없이 연출로만 축하 (한마디 + 일기 + 소량 유대)
  useEffect(() => {
    const KEY = `danjjak-sets-${pet.id}`
    let done: string[] = []
    try {
      done = JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[]
    } catch { /* 무시 */ }
    const completed = ITEM_SETS.filter((s) => isSetComplete(s, pet.ownedItems, pet.furniture))
    const fresh = completed.filter((s) => !done.includes(s.id))
    if (fresh.length === 0) return
    // 한 번에 하나만 축하하고 그 세트만 기록 — 남은 세트는 다음 렌더에서 이어서 축하.
    // (타이머로 미루면 클린업에 잘려 축하가 영영 유실될 수 있어 동기로 처리)
    const s = fresh[0]
    try {
      localStorage.setItem(KEY, JSON.stringify([...done, s.id]))
    } catch { /* 무시 */ }
    setSpeech(s.line)
    window.setTimeout(() => setSpeech(null), 6000)
    showToast(`${s.emoji} 세트 완성 — 「${s.name}」!`)
    addDiary(s.emoji, `「${s.name}」 세트를 완성했어요. ${s.desc}!`)
    gainBond(5)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pet.ownedItems.length, pet.furniture.length, pet.id])

  // 가끔 눈 깜빡이듯 생기 (blink)
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.hidden) return
      triggerReaction('blink')
    }, 5500)
    return () => window.clearInterval(id)
  }, [triggerReaction])

  // 콤보 보너스: 모든 스탯을 높게 유지하면 주기적으로 보상
  useEffect(() => {
    const id = window.setInterval(() => {
      const s = petRef.current.stats
      if (s.hunger >= 80 && s.mood >= 80 && s.cleanliness >= 80 && s.energy >= 80) {
        reward(2, 3)
        showToast('🌟 최상 컨디션 보너스! +2🪙')
      }
    }, 30000)
    return () => window.clearInterval(id)
  }, [reward, showToast])

  // 집중 세션 상시 판정 — 타이머 창이 닫혀 있어도 완료 보상·자리 비움 실패가 동작한다
  const focusIdleSecRef = useRef(0)
  useEffect(() => {
    const id = window.setInterval(() => {
      const r = completeDueFocusSession()
      if (r) {
        focusIdleSecRef.current = 0
        if (r.capped) {
          showToast('🍅 세션 완료! (오늘 보상은 이미 다 받았어요)')
        } else {
          const parts = [`+${r.xp} XP`, `${r.buffMin}분간 ${r.mult}배 성장`]
          if (r.coins > 0) parts.push(`+${r.coins}🪙`)
          reward(r.coins, r.xp)
          showToast(`🍅 집중 완주! ${parts.join(' · ')}`)
        }
        return
      }
      // 데스크톱: 세션 중 3분 연속 자리 비움이면 실패
      if (isElectron && activeFocusSession()) {
        if (workMode === 'idle') {
          focusIdleSecRef.current += 1
          if (focusIdleSecRef.current >= FOCUS_IDLE_FAIL_SEC) {
            focusIdleSecRef.current = 0
            abortFocusSession()
            showToast('🍅 자리를 오래 비워서 집중이 끊겼어요 😢')
          }
        } else {
          focusIdleSecRef.current = 0
        }
      }
    }, 1000)
    return () => window.clearInterval(id)
  }, [isElectron, workMode, reward, showToast])

  // 상점 구매/사용/착용
  const buyItem = useCallback(
    (item: ShopItem) => {
      // 도구(진화의 돌 등) — 소모품. 보유 목록은 중복 없이 관리되므로 다 쓰기 전엔 재구매 불가
      if (item.type === 'tool') {
        if (pet.ownedItems.includes(item.id)) {
          showToast('이미 보유 중이에요 — 사용한 뒤 다시 살 수 있어요')
          return
        }
        if (pet.coins < item.price) {
          showToast('코인이 부족해요 🥲')
          return
        }
        if (spendCoins(item.price)) {
          grantItem(item.id)
          showToast(`${item.emoji} ${item.name} 구매 완료!`)
        }
        return
      }
      // 선물 — 즉시 사용 X, 선물함(계정)에 적립
      if (item.type === 'gift') {
        if (pet.coins < item.price) {
          showToast('코인이 부족해요 🥲')
          return
        }
        if (spendCoins(item.price)) {
          addGift(item.id)
          showToast(`${item.emoji} ${item.name} 구매! 선물함에 담겼어요 🎁`)
        }
        return
      }
      const wearable = item.type === 'accessory' || item.type === 'background'
      if (wearable) {
        // 상점은 구매만 — 착용/해제는 인게임 🎒 가방에서
        if (pet.ownedItems.includes(item.id)) {
          showToast('이미 보유 중이에요 — 🎒 가방에서 착용해요')
          return
        }
        if (pet.coins < item.price) {
          showToast('코인이 부족해요 🥲')
          return
        }
        if (spendCoins(item.price)) {
          grantItem(item.id)
          showToast(`${item.emoji} ${item.name} 구매! 🎒 가방에 담겼어요`)
        }
      } else {
        if (pet.coins < item.price) {
          showToast('코인이 부족해요 🥲')
          return
        }
        if (spendCoins(item.price)) {
          adjust(item.boost ?? {})
          // 케이크 간식 → treat_cake 프로필 카운터
          if (item.id === 'item_cake') {
            recordProfile(PROFILE_KEYS.TREAT_CAKE)
          }
          showToast(`${item.emoji} ${item.name} 냠냠!`)
        }
      }
    },
    [pet, spendCoins, adjust, showToast, recordProfile],
  )

  const buyFurniture = useCallback(
    (item: FurnitureItem) => {
      if (pet.furniture.includes(item.id)) return
      if (pet.coins < item.price) {
        showToast('코인이 부족해요 🥲')
        return
      }
      if (spendCoins(item.price)) {
        update({ furniture: [...pet.furniture, item.id] })
        showToast(`${item.emoji} ${item.name} 구매! 🎒 가방에서 방에 꺼내 놓아요`)
      }
    },
    [pet, spendCoins, update, showToast],
  )

  const mood = petMood(stats)
  const score = wellbeing(stats)
  const days = daysTogether(pet.createdAt)
  const distressed =
    Math.min(stats.hunger, stats.mood, stats.cleanliness, stats.energy) <
    CRITICAL
  const inCombo =
    Math.min(stats.hunger, stats.mood, stats.cleanliness, stats.energy) >= 80

  // 탭 제목 배지 + 케어 알림
  useTabBadge(distressed)
  useCareNotifications({
    enabled: settings.notifications,
    needsCare: distressed,
    petName: pet.name,
  })

  // 업적 자동 해금
  useEffect(() => {
    const ids = newlyUnlocked({ pet, level, days, score })
    if (ids.length > 0) {
      unlock(ids)
      reward(15 * ids.length) // 업적 보상 코인
      playAchievement()
      const first = ACHIEVEMENTS.find((a) => a.id === ids[0])
      if (first) {
        showToast(`🏆 업적 달성: ${first.emoji} ${first.name} (+15🪙)`)
        addDiary('🏆', `업적 달성: ${first.name}`)
      }
    }
  }, [pet, level, days, score, unlock, reward, showToast, addDiary])

  return (
    <div className="pet-game">
      <header className="pg-header">
        <button
          type="button"
          className="pg-avatar-chip"
          onClick={() => setModal('profile')}
          title="대표 펫 지정"
          aria-label="대표 펫 지정"
        >
          <img src={petSpriteUrl({ form: avatarForm })} alt={avatarName} draggable={false} />
        </button>
        <div className="pg-header-info">
          <h2 className="pg-name">
            <span className="pg-stage-badge">{stage.badge}</span>{' '}
            {editingName ? (
              <span className="pg-name-edit-wrap">
                <input
                  className="pg-name-input"
                  value={nameDraft}
                  autoFocus
                  maxLength={20}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveName()
                    else if (e.key === 'Escape') setEditingName(false)
                  }}
                />
                <button
                  type="button"
                  className="pg-name-save"
                  title="확인"
                  onClick={saveName}
                >
                  ✓
                </button>
              </span>
            ) : (
              <>
                {pet.name}
                <button
                  type="button"
                  className="pg-name-edit"
                  title="이름 수정"
                  onClick={() => { setNameDraft(pet.name); setEditingName(true) }}
                >
                  ✏️
                </button>
              </>
            )}
          </h2>
          <p className="pg-owner">
            {pet.ownerName}님과 함께한 지 <strong>{days}일째</strong>
          </p>
          <p
            className="pg-clock"
            title={`${clock.season.name} · ${clock.phase.name} · 게임 속 시간은 빠르게 흘러요`}
          >
            {clock.season.emoji} 게임 {clock.year}년 {clock.month}월 {clock.monthDay}일 ·{' '}
            {clock.phase.emoji} {clock.hhmm}
          </p>
        </div>
        <div className="pg-header-btns">
          {weather && (
            <span className="pg-weather" title={`${weather.label} ${weather.temp}°C`}>
              {weather.emoji} {weather.temp}°
            </span>
          )}
          <span className="pg-coins" title="코인">
            <UIIcon name="ui_coin" emoji="🪙" /> {pet.coins}
            <button
              type="button"
              className="pg-coins-plus"
              onClick={() => setTab(0)}
              title="상점에서 코인 쓰기"
              aria-label="상점 열기"
            >
              +
            </button>
          </span>
          {/* 보석(유료 재화)은 상시 노출하지 않는다 — 상점 프리미엄 탭 안에서만 (치유 톤: 과금 압박 금지) */}
          <button
            type="button"
            className="pg-icon-btn"
            onClick={toggleMute}
            title={muted ? '소리 켜기' : '소리 끄기'}
            aria-label={muted ? '소리 켜기' : '소리 끄기'}
          >
            {muted ? (
              <UIIcon name="ui_sound_off" emoji="🔇" size="1.1em" />
            ) : (
              <UIIcon name="ui_sound_on" emoji="🔊" size="1.1em" />
            )}
          </button>
          <button
            type="button"
            className="pg-icon-btn"
            onClick={() => setModal('bag')}
            title="가방 (치장·테마·가구 꺼내 쓰기)"
            aria-label="가방 (치장·테마·가구 꺼내 쓰기)"
          >
            <UIIcon name="ui_bag" emoji="🎒" size="1.1em" />
          </button>
          {/* 내 방은 새 펫 입양 입구이기도 하므로 펫 수와 무관하게 항상 노출 */}
          <button
            type="button"
            className="pg-icon-btn"
            onClick={() => setModal('roster')}
            title="내 방 (펫 교체·새 식구 입양)"
            aria-label="내 방 (펫 교체·새 식구 입양)"
          >
            <UIIcon name="ui_room" emoji="🏠" size="1.1em" />
          </button>
          <button
            type="button"
            className="pg-icon-btn"
            onClick={() => setModal('settings')}
            title="설정"
            aria-label="설정"
          >
            <UIIcon name="ui_settings" emoji="⚙️" size="1.1em" />
          </button>
        </div>
      </header>

      <div
        className="pg-pager"
        ref={viewportRef}
        onPointerDown={onPagerDown}
        onPointerMove={onPagerMove}
        onPointerUp={endPager}
        onPointerCancel={endPager}
      >
      <div
        className="pg-pager-track"
        style={{
          transform: `translateX(calc(${-tab * 100}% + ${dragDx}px))`,
          transition: dragDx === 0 ? 'transform 0.28s cubic-bezier(0.22,0.61,0.36,1)' : 'none',
        }}
      >
      <section className="pg-page pg-page-home" style={{ order: 2 }} data-tab={2}>
      {/* 방 테마는 무대 전체가 아니라 "방 영역"(::before)에 칠한다 —
          .pg-stage 자체는 room-first 레이아웃에서 transparent!important 고정이라 인라인 배경이 안 먹음 */}
      <div
        ref={stageRef}
        className={'pg-stage' + (backgroundCss(pet.background) ? ' has-bg' : '')}
        style={
          backgroundCss(pet.background)
            ? ({ '--stage-bg': backgroundCss(pet.background)! } as React.CSSProperties)
            : undefined
        }
      >
        <div
          className={`pg-season-tint pg-season-${clock.season.key}`}
          aria-hidden="true"
        />
        {clock.phase.dark > 0 && (
          <div
            className="pg-night"
            style={{ opacity: clock.phase.dark }}
            aria-hidden="true"
          />
        )}
        {clock.isNight && (
          <span className="pg-sleep-z" aria-hidden="true">
            💤
          </span>
        )}
        {/* 방에 꺼내 놓은 가구 — 끌어서 자리 이동, 꺼내기/보관은 🎒 가방에서 */}
        {(pet.furniturePlaced ?? pet.furniture).length > 0 && (
          <div className="pg-furniture">
            {FURNITURE_ITEMS.filter((f) => (pet.furniturePlaced ?? pet.furniture).includes(f.id)).map((f, i, arr) => {
              const dragPos = furnDrag?.id === f.id ? furnDrag : null
              const saved = pet.furniturePos?.[f.id]
              // 저장된 배치가 없으면 바닥을 따라 균등 분산 (지그재그로 겹침 방지, 바닥 라인)
              const pos = dragPos ?? saved ?? {
                x: 10 + (i * 80) / Math.max(arr.length - 1, 1),
                y: 58 + (i % 2) * 10,
              }
              return (
                <span
                  key={f.id}
                  className={'pg-furniture-item' + (dragPos ? ' dragging' : '')}
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  title={`${f.name} — ${f.desc} (끌어서 옮기기)`}
                  onPointerDown={(e) => {
                    // 페이저 스와이프에 먹히지 않게
                    e.stopPropagation()
                    e.currentTarget.setPointerCapture?.(e.pointerId)
                    setFurnDrag({ id: f.id, x: pos.x, y: pos.y })
                  }}
                  onPointerMove={(e) => {
                    if (furnDrag?.id !== f.id) return
                    e.stopPropagation()
                    const r = stageRef.current?.getBoundingClientRect()
                    if (!r) return
                    const x = Math.min(96, Math.max(4, ((e.clientX - r.left) / r.width) * 100))
                    // 가구는 바닥 영역(하단 절반)에만 — 벽에 뜬 침대 같은 난잡함 방지
                    const y = Math.min(88, Math.max(45, ((e.clientY - r.top) / r.height) * 100))
                    setFurnDrag({ id: f.id, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 })
                  }}
                  onPointerUp={(e) => {
                    if (furnDrag?.id !== f.id) return
                    e.stopPropagation()
                    update({
                      furniturePos: { ...(pet.furniturePos ?? {}), [f.id]: { x: furnDrag.x, y: furnDrag.y } },
                    })
                    setFurnDrag(null)
                  }}
                  onPointerCancel={() => setFurnDrag(null)}
                >
                  <FurnitureSprite id={f.id} emoji={f.emoji} />
                </span>
              )
            })}
          </div>
        )}

        <div className="pg-room-decor" aria-hidden="true">
          <span className="pg-room-window" />
          <span className="pg-room-lamp" />
          <span className="pg-room-rug" />
          <span className="pg-room-shelf" />
        </div>

        {speech && <div className="pg-speech">{speech}</div>}
        <button
          type="button"
          className="pg-avatar-tap"
          onClick={() => handleAction('pet')}
          title="쓰다듬기"
          aria-label="펫 쓰다듬기"
        >
          <PetAvatar
            imageDataUrl={petSpriteUrl(pet)}
            stats={stats}
            stage={stage}
            worn={wornAccessories(pet)}
            species={displaySpecies(pet)}
            stageIndex={form.tier}
            size={150}
            distressed={distressed}
            reactType={reactType}
            reactTrigger={reactKey}
            alt={pet.name}
          />
        </button>
        {/* 업무 가속 연출 — 일하는 동안 펫 주변 스파크·오라 (모드별 강도) */}
        {workMode !== 'idle' && (
          <div className={`pg-work-fx pg-work-fx-${workMode}`} aria-hidden="true">
            <span className="pg-spark pg-spark-1">⚡</span>
            <span className="pg-spark pg-spark-2">⚡</span>
            <span className="pg-spark pg-spark-3">✨</span>
            <span className="pg-spark pg-spark-4">⚡</span>
          </div>
        )}
        {growthFx && (
          <div
            key={growthFx.key}
            className={`pg-growth-fx pg-growth-${growthFx.kind}`}
            aria-hidden="true"
          >
            <span className="pg-growth-ring" />
            <span className="pg-growth-ray pg-growth-ray-1" />
            <span className="pg-growth-ray pg-growth-ray-2" />
            <span className="pg-growth-ray pg-growth-ray-3" />
            <span className="pg-growth-ray pg-growth-ray-4" />
            {growthFx.fromFormId && growthFx.toFormId && (
              <span className="pg-evo-morph">
                <img
                  className="pg-evo-sprite pg-evo-before"
                  src={spriteUrl(growthFx.fromFormId)}
                  alt=""
                  draggable={false}
                />
                <img
                  className="pg-evo-sprite pg-evo-after"
                  src={spriteUrl(growthFx.toFormId)}
                  alt=""
                  draggable={false}
                />
              </span>
            )}
            <span className="pg-growth-title">{growthFx.title}</span>
            <span className="pg-growth-subtitle">{growthFx.subtitle}</span>
          </div>
        )}
        {effect && <span className="pg-effect">{effect}</span>}
        {pop && (
          <span key={pop.key} className="pg-statpop">
            {pop.text}
          </span>
        )}
        {/* 기분 + 자율 행동을 한 줄로 (텍스트 줄 수 줄이기) */}
        <p className="pg-mood">
          {mood.emoji} {mood.label}
          <span className="pg-behavior" title="현재 자율 행동">
            {' '}· {behaviorEmoji} {behaviorLabel}
          </span>
        </p>
        <p className="pg-score">
          컨디션 {score}점 ·{' '}
          <span className="pg-person" title={`성격: ${personality.desc}`}>
            {personality.emoji} {personality.name}
          </span>
        </p>
        {inCombo && <span className="pg-combo">🌟 최상 컨디션</span>}

        {/* 형태 이름 + 분류(레벨·타입·속성) */}
        <p className="pg-species">
          {form.emoji} {form.name}
        </p>
        <p className="pg-class">
          {tierName(form.tier)} · {form.type}
        </p>

        {/* 업무 성장 상태 칩 — 항상 표시. 일하면 가속, 아니면 방치 성장.
            웹은 시스템 입력 감지가 불가능하므로 집중 타이머가 가속 수단 — 칩을 누르면 타이머로 */}
        <button
          type="button"
          className={`pg-work-badge pg-work-${workMode}`}
          onClick={() => setModal('timer')}
          title={
            isElectron
              ? `펫은 가만히 둬도 자라고(방치), 컴퓨터로 일하면 더 빨리 자라요. 오늘 업무 ${todayWorkMin}분${todayOvertimeMin > 0 ? ` · 야근 ${todayOvertimeMin}분` : ''} · 누르면 집중 타이머`
              : '웹에서는 업무 자동 감지가 안 돼요 (데스크톱 앱 전용). 집중 타이머를 완주하면 XP 버프를 받아요!'
          }
        >
          {workMode === 'idle'
            ? `💤 방치 성장중 · ${isElectron ? '일하면 XP 가속' : '🍅 타이머로 가속'}`
            : `${WORK_MODE_META[workMode].emoji} ${WORK_MODE_META[workMode].label} · XP 가속 중 ⚡`}
        </button>
        {focusSession && (
          <button
            type="button"
            className="pg-work-badge pg-focus-buff"
            onClick={() => setModal('timer')}
            title="집중 세션 진행 중 — 창을 닫아도 계속 돌아가요. 누르면 타이머 열기"
          >
            🍅 집중 중 · {(() => {
              const left = Math.max(0, Math.ceil((focusSession.endsAt - Date.now()) / 1000))
              return `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`
            })()} 남음
          </button>
        )}
        {focusBuff && (
          <div className="pg-work-badge pg-focus-buff" title="집중 버프 — 그동안 업무·케어 XP가 배로 붙어요">
            ⚡ ×{focusBuff.mult} 성장 중 · {focusBuff.remainMin}분
          </div>
        )}

        {canEvolve && (
          <button
            type="button"
            className="pg-evolve-btn"
            onClick={() => setModal('evolve')}
          >
            ✨ 진화할 수 있어요!
          </button>
        )}

        {canAwaken && (
          <button
            type="button"
            className="pg-awaken-btn"
            onClick={() => setModal('awaken')}
          >
            ✦ 각성할 수 있어요!
          </button>
        )}

        {/* 레벨 / 경험치 바 */}
        <div className="pg-level">
          <span className="pg-level-label">Lv.{level}</span>
          <div className={'pg-xp-track' + (workPop ? ' is-ticking' : '')}>
            <div
              className="pg-xp-fill"
              style={{ width: `${Math.round(progress.ratio * 100)}%` }}
            />
          </div>
          <span className="pg-xp-text">
            {progress.maxed ? 'MAX' : `${progress.current}/${progress.needed}`}
          </span>
          {workPop && (
            <span key={workPop.key} className="pg-xp-pop">
              {workPop.text}
            </span>
          )}
        </div>

        {/* 경험치 획득 속도 (현재 상태 기준 추정치) */}
        {!progress.maxed && (() => {
          const passivePerSec = (BEHAVIOR_META[behaviorState]?.passiveXp ?? 0) / 10
          const workPerSec = workMode !== 'idle' ? (WORK_XP_PER_TICK[workMode] ?? 0) / 15 : 0
          const perSec = passivePerSec + workPerSec
          const working = workMode !== 'idle'
          return (
            <p
              className="pg-xp-rate"
              title="펫은 가만히 둬도 천천히 자라고(방치), 컴퓨터로 일하면(키보드·마우스 사용) 더 빨리 자라요. 늦은 시간엔 야근 버닝타임으로 가속! 케어로도 추가 획득."
            >
              ⏳ 초당 +{perSec.toFixed(2)} XP ·{' '}
              {working
                ? `${WORK_MODE_META[workMode].emoji} ${WORK_MODE_META[workMode].label} 가속 중`
                : '💤 방치 성장 (일하면 더 빨라져요)'}
            </p>
          )
        })()}
      </div>

      {/* 4대 스탯 게이지 — 각 케어로 오르는 항목이 달라요 */}
      <div className="pg-stats">
        <StatBar icon="🍙" iconName="stat_hunger" label="포만도" value={stats.hunger} />
        <StatBar icon="💗" iconName="stat_love" label="애정" value={stats.mood} />
        <StatBar icon="🛁" iconName="stat_clean" label="청결도" value={stats.cleanliness} />
        <StatBar icon="⚡" iconName="stat_energy" label="기운" value={stats.energy} />
        <StatBar icon="❤️‍🩹" iconName="stat_health" label="건강" value={stats.health} />
      </div>

      {/* 메인 액션 — 6종 (3열 × 2행) */}
      <div className="pg-main-actions">
        {(
          [
            { action: 'feed',  icon: '🍙', label: '먹이', hint: '포만도 ↑' },
            { action: 'pet',   icon: '🤚', label: '터치', hint: '애정 ↑' },
            { action: 'wash',  icon: '🛁', label: '목욕', hint: '청결도 ↑' },
            { action: 'sleep', icon: '🛏️', label: '잠', hint: '기운 ↑' },
            { action: 'play',  icon: '🎮', label: '놀이', hint: '애정·건강 ↑' },
            { action: 'gift',  icon: '🎁', label: '선물', hint: '선물 아이템을 주면 애정 ↑↑' },
          ] as const
        ).map(({ action, icon, label, hint }) => {
          const limited = action !== 'gift'
          const left = limited ? careRemaining(pet, action) : Infinity
          const capped = limited && left <= 0
          return (
            <button
              key={action}
              type="button"
              className={`pg-main-action pg-act-${action}` + (capped ? ' is-capped' : '')}
              onClick={() => (action === 'gift' ? setModal('gift') : handleAction(action))}
              disabled={capped}
              title={hint}
            >
              <span className="pg-main-action-icon">
                <UIIcon name={`act_${action === 'pet' ? 'touch' : action}`} emoji={icon} size="1.15em" />
              </span>
              <span>{label}</span>
              <span className="pg-main-action-charge" aria-hidden="true">
                {action === 'gift'
                  ? (giftCount > 0 ? `보유 ${giftCount}` : '')
                  : capped
                    ? '🕐 다음 정각'
                    : `✨ ${left}/${CARE_HOURLY_CAP}`}
              </span>
            </button>
          )
        })}
      </div>

      {/* 서랍 — 나머지 전부 */}
      <div className="pg-drawer">
        <button
          type="button"
          className={'pg-drawer-toggle' + (drawerOpen ? ' open' : '')}
          onClick={() => setDrawerOpen((v) => !v)}
        >
          {drawerOpen ? '▲ 접기' : '··· 더보기'}
        </button>
        {drawerOpen && (
          <div className="pg-drawer-body">
            {/* 우리 식구 (펫 교체) */}
            <div className="pg-drawer-section">
              <span className="pg-drawer-label">우리 식구</span>
              <div className="pg-drawer-row">
                <button type="button" className="pg-drawer-btn" onClick={() => setModal('roster')}><UIIcon name="ui_room" emoji="🏠" /> 내 방 · 펫 교체{pets.length > 1 ? ` (${pets.length})` : ''}</button>
              </div>
            </div>
            {/* 추가 케어 */}
            <div className="pg-drawer-section">
              <span className="pg-drawer-label">케어</span>
              <div className="pg-drawer-row">
                <button type="button" className="pg-drawer-btn" onClick={() => setModal('chat')} title="펫과 대화 (AI · 설정에서 키 입력)"><UIIcon name="menu_chat" emoji="💬" /> 대화</button>
                <button type="button" className="pg-drawer-btn" onClick={() => setModal('timer')} title="1시간 집중 타이머 — 완주하면 XP 버프"><UIIcon name="menu_timer" emoji="🍅" /> 집중 타이머</button>
                <button type="button" className="pg-drawer-btn" onClick={() => setModal('schedule')} title="일정 등록 — 시간 되면 펫이 알려줘요"><UIIcon name="menu_schedule" emoji="📅" /> 일정</button>
              </div>
            </div>
            {/* 놀기 */}
            <div className="pg-drawer-section">
              <span className="pg-drawer-label">놀기</span>
              <div className="pg-drawer-row">
                <button type="button" className="pg-drawer-btn" onClick={() => setModal('missions')} title="매일 바뀌는 미션 — 완료하면 코인 보상"><UIIcon name="menu_mission" emoji="📋" /> 일일 미션</button>
                <button type="button" className="pg-drawer-btn" onClick={() => setModal('quest')}><UIIcon name="menu_story" emoji="📜" /> 이야기</button>
              </div>
            </div>
            {/* 키우기 */}
            <div className="pg-drawer-section">
              <span className="pg-drawer-label">키우기</span>
              <div className="pg-drawer-row">
                <button type="button" className="pg-drawer-btn" onClick={() => setModal('diary')}><UIIcon name="menu_diary" emoji="📖" /> 일기</button>
                <button type="button" className="pg-drawer-btn" onClick={() => setModal('achievements')}><UIIcon name="menu_trophy" emoji="🏆" /> 업적</button>
              </div>
            </div>
            {/* 친구 */}
            <div className="pg-drawer-section">
              <span className="pg-drawer-label">친구</span>
              <div className="pg-drawer-row">
                <button type="button" className="pg-drawer-btn" onClick={() => setModal('friends')}><UIIcon name="menu_friends" emoji="👀" /> 친구</button>
                <button type="button" className="pg-drawer-btn" onClick={() => setModal('share')}><UIIcon name="menu_share" emoji="📸" /> 자랑</button>
              </div>
            </div>
          </div>
        )}
      </div>
      </section>{/* /page 0 (케어 홈) */}

      <section className="pg-page pg-page-scroll" style={{ order: 1 }} data-tab={1}>
        <Modal variant="inline" title="🎮 미니게임" onClose={() => {}}>
          <div className="pg-gamehub">
            <button type="button" className="pg-game-card" onClick={() => setModal('catch')}>
              <span className="pg-game-emoji">🍙</span>
              <span className="pg-game-name">간식 받기</span>
              <span className="pg-game-desc">떨어지는 간식을 받아요</span>
            </button>
            <button type="button" className="pg-game-card" onClick={() => setModal('rps')}>
              <span className="pg-game-emoji">✊</span>
              <span className="pg-game-name">가위바위보</span>
              <span className="pg-game-desc">펫과 한 판 승부!</span>
            </button>
          </div>
        </Modal>
      </section>

      <section className="pg-page pg-page-scroll" style={{ order: 3 }} data-tab={3}>
        <FusionEvo
          embedded
          pet={pet}
          selfEligible={level >= FUSION_MIN_LEVEL}
          partners={pets.filter(
            (p) => p.id !== pet.id && levelFromXp(p.growth) >= FUSION_MIN_LEVEL,
          )}
          onFuse={(partnerId, resultFormId) => {
            const partner = pets.find((p) => p.id === partnerId)
            const result = formById(resultFormId)
            update({
              form: resultFormId,
              species: result.line,
              // 각성 이력은 합성 자손에게 계승 — 각성↔합성 무한 반복 차단
              awakened: pet.awakened || !!partner?.awakened || formById(pet.form).hidden || (partner ? formById(partner.form).hidden : false),
              growth: Math.max(pet.growth, 1800),
              // 이름을 직접 안 지어준 펫은 합체 형태의 이름으로
              ...(pet.name === formById(pet.form).name ? { name: result.name } : {}),
            })
            discoverSpecies(resultFormId)
            addDiary('🧬', `${partner?.name ?? '단짝'}와 합성해 ${result.name}이(가) 되었어요!`)
            playLevelUp()
            triggerGrowthFx({ kind: 'fusion', title: result.name, subtitle: tierName(result.tier), fromFormId: form.id, toFormId: result.id })
            showToast(`⚗️ 합성 성공! ${result.emoji} ${result.name}`)
            onDelete(partnerId)
            setTab(CARE_TAB)
          }}
          onClose={() => setTab(CARE_TAB)}
        />
      </section>

      <section className="pg-page pg-page-scroll" style={{ order: 4 }} data-tab={4}>
        <Dex
          embedded
          currentForm={pet.form}
          onReward={(coins) => { reward(coins); showToast(`📚 도감 보상 +${coins}🪙`) }}
          onClose={() => setTab(CARE_TAB)}
        />
      </section>

      <section className="pg-page pg-page-scroll" style={{ order: 0 }} data-tab={0}>
        <Shop embedded pet={pet} onBuy={buyItem} onBuyFurniture={buyFurniture} onUpdatePet={update} focusGiftSignal={shopGiftSignal} onClose={() => setTab(CARE_TAB)} />
      </section>
      </div>{/* /track */}
      </div>{/* /viewport */}

      <nav className="pg-bottom-tabs" aria-label="주요 메뉴">
        {([
          { i: 0, icon: '🛒', name: 'tab_shop', label: '상점' },
          { i: 1, icon: '🎮', name: 'tab_game', label: '놀이' },
          { i: 2, icon: '🧸', name: 'tab_care', label: '케어' },
          { i: 3, icon: '🧬', name: 'tab_fusion', label: '합성' },
          { i: 4, icon: '📚', name: 'tab_dex', label: '도감' },
        ] as const).map(({ i, icon, name, label }) => (
          <button
            key={i}
            type="button"
            className={
              'pg-tab-btn' +
              (tab === i ? ' active' : '') +
              (i === CARE_TAB ? ' pg-tab-main' : '')
            }
            onClick={() => setTab(i)}
          >
            <span><UIIcon name={name} emoji={icon} size="1.2em" /></span>
            <b>{label}</b>
          </button>
        ))}
      </nav>

      {toast && <div className="pg-toast">{toast}</div>}



      {showOnboarding && (
        <Onboarding
          petName={pet.name}
          onDone={() => {
            markOnboarded()
            setShowOnboarding(false)
          }}
        />
      )}

      {showWelcome && !showOnboarding && (
        <WelcomeBack
          petName={pet.name}
          awayMs={awayMs}
          createdAt={pet.createdAt}
          beforeMs={initialPet.lastUpdated}
          moodEmoji={mood.emoji}
          moodLabel={mood.label}
          score={score}
          behaviorSummary={todaySummary}
          morningMsg={morningMsg}
          onClose={() => {
            setShowWelcome(false)
            if (!getTodayMood()) setShowMoodCheck(true)
          }}
        />
      )}
      {showMoodCheck && !showWelcome && (
        <MoodCheck petName={pet.name} onClose={() => setShowMoodCheck(false)} />
      )}
      {letter && !showWelcome && (
        <LetterModal
          letter={letter}
          ownerName={pet.ownerName}
          onKeep={() => {
            addDiary('💌', `졸업한 ${letter.from.name}에게서 편지가 왔어요. 소중히 간직했어요.`)
            setLetter(null)
          }}
        />
      )}

      {modal === 'gift' && (
        <GiftPicker
          pet={pet}
          onGive={giveGift}
          onGoShop={() => { setModal(null); setTab(0); setShopGiftSignal((n) => n + 1) }}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'graduate' && (() => {
        const gp = pets.find((p) => p.id === graduateId)
        if (!gp) return null
        return (
          <Graduation
            pet={gp}
            level={levelFromXp(gp.growth)}
            onClose={() => setModal('roster')}
            onGraduate={(memoir) => {
              const gLevel = levelFromXp(gp.growth)
              const gDays = daysTogether(gp.createdAt)
              const coins = graduateReward(gLevel, gDays)
              reward(coins) // 코인은 계정 지갑으로
              addGraduate({
                name: gp.name,
                species: formById(gp.form).name,
                level: gLevel,
                at: Date.now(),
                form: gp.form,
                ownerName: gp.ownerName,
                personality: gp.personality,
                days: gDays,
                totalActions: gp.totalActions,
                bond: gp.bond,
                highlights: memoir.highlights,
                farewell: memoir.farewell || undefined,
                lastWords: memoir.lastWords,
              })
              setModal(null)
              showToast(`🏛️ ${gp.name}의 초상이 명예의 전당에 걸렸어요 (+${coins}🪙)`)
              onDelete(gp.id)
            }}
          />
        )
      })()}
      {modal === 'achievements' && (
        <Achievements pet={pet} onClose={() => setModal(null)} />
      )}
      {modal === 'profile' && (() => {
        // 획득한 적 있는 모든 펫(보유 + 합성·졸업으로 떠난 펫). 현재 보유를 앞에.
        const ownedIds = new Set(pets.map((p) => p.id))
        const poolList = Object.entries(account.avatarPool ?? {}).map(([id, e]) => ({ id, name: e.name, form: e.form }))
        const list = poolList.length > 0 ? poolList : pets.map((p) => ({ id: p.id, name: p.name, form: p.form }))
        list.sort((a, b) => Number(ownedIds.has(b.id)) - Number(ownedIds.has(a.id)))
        return (
          <Modal title="🖼️ 대표 펫 지정" onClose={() => setModal(null)}>
            <p className="pg-profile-hint">지금까지 함께한 모든 펫 중에서 골라요. (합성·졸업한 펫도 포함)</p>
            <div className="pg-profile-grid">
              {list.map((p) => {
                const selected = (account.avatarPetId ?? pet.id) === p.id
                const gone = !ownedIds.has(p.id)
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={'pg-profile-pet' + (selected ? ' selected' : '')}
                    onClick={() => {
                      setAvatarPet(p.id)
                      showToast('🖼️ 대표 펫을 바꿨어요')
                      setModal(null)
                    }}
                  >
                    <img src={petSpriteUrl({ form: p.form })} alt={p.name} draggable={false} />
                    <span>{p.name}{gone ? ' 👋' : ''}</span>
                    {selected && <em className="pg-profile-check">✓</em>}
                  </button>
                )
              })}
            </div>
          </Modal>
        )
      })()}
      {modal === 'friends' && (
        <Friends
          onClose={() => setModal(null)}
          onGiftSent={() => {
            reward(2)
            showToast('🎁 선물을 보냈어요! +2🪙')
          }}
        />
      )}
      {modal === 'share' && (
        <ShareCard
          pet={pet}
          level={level}
          stageLabel={stage.label}
          days={days}
          score={score}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'diary' && (
        <Diary
          pet={pet}
          onClose={() => setModal(null)}
          onWriteAi={writeAiDiary}
          writing={petDiaryLoading}
          canWriteAi={!!getApiKey()}
        />
      )}
      {modal === 'quest' && (
        <Quest
          ctx={{ pet, level, days }}
          onComplete={(rewardCoins) => {
            completeQuest(rewardCoins)
            showToast(`📜 새 이야기 해금! +${rewardCoins}🪙`)
          }}
          lineQuests={lineQuestsFor(pet.species)}
          lineName={formById(pet.species).name}
          onCompleteLine={(rewardCoins) => {
            completeLineQuest(rewardCoins)
            showToast(`🌱 계통 이야기 해금! +${rewardCoins}🪙`)
          }}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'missions' && (
        <Missions
          pet={pet}
          onClaim={(id) => {
            const amount = claimMission(id)
            if (amount > 0) showToast(`🎯 미션 완료! +${amount}🪙`)
          }}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'catch' && (
        <CatchGame
          petImageDataUrl={petSpriteUrl(pet)}
          onFinish={(coins, mood) => {
            if (coins > 0) grantMinigameCoins(coins)
            if (mood > 0) adjust({ mood })
            recordMission('minigame')
          }}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'rps' && (
        <RockPaperScissors
          petImageDataUrl={petSpriteUrl(pet)}
          onReward={(coins) => grantMinigameCoins(coins)}
          onPlayed={() => recordMission('minigame')}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'settings' && (
        <Settings
          notifications={settings.notifications}
          onToggleNotifications={setNotifications}
          theme={settings.theme}
          onToggleTheme={setTheme}
          onAlwaysOnTop={isElectron && bridge ? bridge.toggleAlwaysOnTop : undefined}
          onClickThrough={isElectron && bridge ? bridge.toggleClickThrough : undefined}
          loggedInId={loggedInId}
          onLogout={onLogout}
          onGoLobby={onGoLobby}
          onReplayTutorial={() => {
            setModal(null)
            setShowOnboarding(true)
          }}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'roster' && (
        <PetRoom
          pets={pets}
          activePetId={pet.id}
          onSwitch={(id) => { onSwitch(id); setModal(null) }}
          onAddNew={() => { setModal(null); onAddNew() }}
          onGraduate={(id) => { setGraduateId(id); setModal('graduate') }}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'evolve' && evolveList.length > 0 && (
        <Evolve
          current={form}
          options={evolveList}
          behaviorProfile={pet.behaviorProfile}
          onEvolve={(formId) => {
            const next = formById(formId)
            const patch: Partial<typeof pet> = {
              form: formId,
              species: next.line,
            }
            // 이름을 직접 안 지어준 펫(= 현재 형태 기본 이름 그대로)은 새 형태 이름으로
            if (pet.name === form.name) patch.name = next.name
            // 특수 진화는 진화의 돌 1개 소모
            if (next.requires === 'evostone') {
              const owned = [...pet.ownedItems]
              const idx = owned.indexOf('item_evostone')
              if (idx >= 0) owned.splice(idx, 1)
              patch.ownedItems = owned
            }
            update(patch)
            discoverSpecies(formId)
            addDiary('✨', `${next.name}(으)로 진화했어요!`)
            playLevelUp()
            triggerGrowthFx({
              kind: 'evolve',
              title: next.name,
              subtitle: tierName(next.tier),
              fromFormId: form.id,
              toFormId: next.id,
            })
            setModal(null)
            showToast(`✨ ${next.emoji} ${next.name}(으)로 진화!`)
          }}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'awaken' && (
        <Awaken
          pet={pet}
          level={level}
          onAwaken={(formId) => {
            const next = formById(formId)
            const cost = awakenCond(formId)?.cost ?? { coins: 250 }
            // 이름을 직접 안 지어준 펫은 각성한 모습의 이름으로
            const namePatch = pet.name === form.name ? { name: next.name } : {}
            if (cost.item) {
              if (!pet.ownedItems.includes(cost.item)) return
              const owned = [...pet.ownedItems]
              owned.splice(owned.indexOf(cost.item), 1)
              update({
                form: formId,
                species: next.line,
                ownedItems: owned,
                awakened: true,
                growth: Math.max(pet.growth, 1800),
                ...namePatch,
              })
            } else {
              if (!spendCoins(cost.coins ?? 0)) {
                showToast('코인이 부족해요 🥲')
                return
              }
              update({
                form: formId,
                species: next.line,
                awakened: true,
                growth: Math.max(pet.growth, 1800),
                ...namePatch,
              })
            }
            discoverSpecies(formId)
            addDiary('✦', `${next.name}(으)로 각성했어요!`)
            playLevelUp()
            triggerGrowthFx({
              kind: 'awaken',
              title: next.name,
              subtitle: tierName(next.tier),
              fromFormId: form.id,
              toFormId: next.id,
            })
            setModal(null)
            showToast(`✦ ${next.emoji} ${next.name} 각성!`)
          }}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'chat' && (
        <PetChat
          pet={pet}
          behaviorState={behaviorState}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'bag' && (
        <Bag
          pet={pet}
          onUpdatePet={update}
          onOpenCloset={() => setModal('closet')}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'closet' && (
        <ClosetEditor pet={pet} onUpdatePet={update} onClose={() => setModal('bag')} />
      )}
      {modal === 'timer' && (
        <PomodoroTimer petName={pet.name} isElectron={isElectron} onClose={() => setModal(null)} />
      )}
      {modal === 'schedule' && (
        <ScheduleManager
          schedules={pet.schedules}
          onAdd={(title, at) => {
            const newSchedule: import('../../types/pet').Schedule = {
              id: `sch_${Date.now()}`,
              title,
              at,
              notified: false,
            }
            update({ schedules: [...pet.schedules, newSchedule] })
            showToast(`📅 "${title}" 일정 등록!`)
          }}
          onDelete={(id) => update({ schedules: pet.schedules.filter((s) => s.id !== id) })}
          onClose={() => setModal(null)}
        />
      )}
      {activeAlarm && (
        <ScheduleAlarm
          schedule={activeAlarm}
          petName={pet.name}
          onDismiss={() => {
            setSpeech(`⏰ ${activeAlarm.title} 시간이에요!`)
            window.setTimeout(() => setSpeech(null), 4000)
            setActiveAlarm(null)
          }}
        />
      )}
    </div>
  )
}
