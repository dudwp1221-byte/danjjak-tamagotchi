import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { BehaviorEvent, BehaviorState, DiaryEntry, Pet, PetAction, PetStats } from '../types/pet'
import { useInterval } from './useInterval'
import { adjustStats, applyDecay, type CareResult } from '../utils/stats'
import { resolveCare } from '../utils/care'
import { levelFromXp, levelProgress, stageFromLevel, MAX_LEVEL, OVERFLOW_XP_PER_COIN } from '../utils/progression'
import { todayIndex } from '../utils/pet'
import { personalityDef } from '../utils/personality'
import { isGameNight } from '../utils/gametime'
import {
  DAILY_MISSIONS,
  missionDef,
  type MissionEvent,
} from '../utils/missions'
import { upsertPet, loadPets, trickleInactivePets, PETS_KEY } from '../utils/storage'
import { PROFILE_KEYS } from '../utils/evolution-conditions'
import { useAccount } from './useAccount'
import { addCoins as acctAddCoins, spendCoins as acctSpendCoins, refreshAccount } from '../utils/account'

const TICK_MS = 2000
/** 오프라인(앱 꺼둔 동안) 감소 하한선 */
const OFFLINE_FLOOR = 30

/**
 * 성격 + 게임 시간대를 합친 스탯 감소 배수.
 * - 성격별 배수(예: 먹보=배고픔 빠름, 느긋이=전반적으로 느림)
 * - 게임이 밤이면: 자는 시간이라 기운(energy)이 천천히 회복(음수 배수)된다.
 */
function decayMultFor(p: Pet): Partial<PetStats> {
  const base = personalityDef(p.personality).decayMult
  const night = isGameNight(p.createdAt)
  return {
    hunger: base.hunger ?? 1,
    mood: base.mood ?? 1,
    cleanliness: base.cleanliness ?? 1,
    health: base.health ?? 1,
    // 밤엔 음수 배수로 기운이 서서히 차오른다 (clamp 100)
    energy: night ? -0.3 : (base.energy ?? 1),
  }
}

/**
 * 살아있는 펫 상태를 관리하는 중앙 훅.
 * 스탯 자동 감소 · 저장 · 케어 · 성장(레벨)을 담당한다.
 */
export function usePet(initialPet: Pet) {
  // 진입 시 오프라인 경과 시간 반영. 오프라인 그레이스 하한 30 →
  // 앱을 꺼둔 동안엔 스탯이 30 밑으로 안 떨어져서 자고 일어나도 안 비참함.
  // initialPet(App 상태)은 로비에 다녀오는 동안 바탕화면 펫이 적립한 진행도보다
  // 오래됐을 수 있으므로, 저장소의 최신값을 우선해 덮어쓰기 사고를 막는다.
  const [pet, setPet] = useState<Pet>(() => {
    const base = loadPets().find((p) => p.id === initialPet.id) ?? initialPet
    return {
      ...base,
      stats: applyDecay(
        base.stats,
        base.lastUpdated,
        Date.now(),
        decayMultFor(base),
        OFFLINE_FLOOR,
      ),
      lastUpdated: Date.now(),
    }
  })

  // 주기적으로 스탯 감소 (성격 + 속성)
  useInterval(() => {
    setPet((p) => ({
      ...p,
      stats: applyDecay(p.stats, Date.now() - TICK_MS, Date.now(), decayMultFor(p)),
      lastUpdated: Date.now(),
    }))
  }, TICK_MS)

  // 항상 최신 펫을 가리키는 ref (이벤트 콜백에서 동기적으로 결과를 계산하기 위함)
  const petRef = useRef(pet)
  petRef.current = pet

  // 변경 시 저장 (보관함의 해당 펫 갱신)
  useEffect(() => {
    upsertPet(pet)
  }, [pet])

  // 다른 창(바탕화면 펫)의 케어를 실시간 반영.
  // storage 이벤트는 같은 origin의 "다른" 창에서 변경할 때만 발생하므로
  // 자기 자신의 저장(위 effect)으로는 호출되지 않아 피드백 루프가 없다.
  useEffect(() => {
    const syncFromStorage = () => {
      refreshAccount() // 코인·선물·아이템(계정)도 최신화
      const fresh = loadPets().find((p) => p.id === petRef.current.id)
      if (!fresh) return
      setPet((prev) => ({
        ...prev,
        stats: fresh.stats,
        growth: fresh.growth,
        totalActions: fresh.totalActions,
        behaviorProfile: fresh.behaviorProfile,
        careXp: fresh.careXp,
        lastUpdated: fresh.lastUpdated,
      }))
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === PETS_KEY) syncFromStorage()
    }
    window.addEventListener('storage', onStorage)
    // Electron: 창 간 storage 이벤트가 불안정하므로 IPC로도 동기화
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const offIpc = (window as any).electronBridge?.onPetChanged?.(syncFromStorage)
    return () => {
      window.removeEventListener('storage', onStorage)
      offIpc?.()
    }
  }, [])

  /** 케어 액션 수행 → 결과(보상/낭비) 반환 */
  const care = useCallback((action: PetAction): CareResult => {
    // setPet 업데이터는 동기 실행이 보장되지 않으므로, 결과는 ref로 먼저 계산한다.
    const p = petRef.current
    // 시간당 제한 + 큰 XP + 속성 배수는 공용 util에서 (바탕화면 펫과 동일 규칙)
    const { result, xp: baseXp, coins, nextCareXp } = resolveCare(p, action)
    const xp = Math.round(baseXp)

    // 코인은 계정(주인) 지갑으로
    if (coins > 0) acctAddCoins(coins)
    // 연속 클릭 시 다음 호출이 갱신된 스탯/카운터를 보도록 ref를 먼저 당겨둔다.
    petRef.current = { ...p, stats: result.stats, careXp: nextCareXp }
    setPet((prev) => {
      const next: Pet = {
        ...prev,
        stats: result.stats,
        growth: prev.growth + xp,
        totalActions: prev.totalActions + (result.wasted ? 0 : 1),
        careXp: nextCareXp,
        lastUpdated: Date.now(),
      }
      // 쓰다듬기 성공 시 petted_often 카운터 증가
      if (!result.wasted && action === 'pet') {
        next.behaviorProfile = {
          ...prev.behaviorProfile,
          [PROFILE_KEYS.PETTED_OFTEN]:
            (prev.behaviorProfile[PROFILE_KEYS.PETTED_OFTEN] ?? 0) + 1,
        }
      }
      return next
    })
    return result
  }, [])

  /** 코인 차감 (상점 등) — 계정 지갑. 잔액 부족이면 false */
  const spendCoins = useCallback((amount: number): boolean => {
    return acctSpendCoins(amount)
  }, [])

  /** 펫 정보 부분 갱신 (아이템 장착 등) */
  const update = useCallback((patch: Partial<Pet>) => {
    setPet((p) => ({ ...p, ...patch }))
  }, [])

  /** 코인(계정)/경험치(펫) 보상 지급 */
  // 내 방에서 기다리는 비활성 펫들도 1분마다 조금씩 성장 (활성 펫의 ~20%)
  useEffect(() => {
    const id = window.setInterval(() => trickleInactivePets(pet.id), 60000)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pet.id])

  // 만렙 이후 넘치는 XP를 코인으로 바꿔주는 누산기 (OVERFLOW_XP_PER_COIN당 1코인)
  const overflowXp = useRef(0)
  const reward = useCallback((coins: number, xp = 0) => {
    if (coins) acctAddCoins(coins)
    if (!xp) return
    setPet((p) => {
      if (levelFromXp(p.growth) >= MAX_LEVEL) {
        // 성장은 끝났지만, 함께 일한 시간이 용돈으로 돌아온다
        overflowXp.current += xp
        const earned = Math.floor(overflowXp.current / OVERFLOW_XP_PER_COIN)
        if (earned > 0) {
          overflowXp.current -= earned * OVERFLOW_XP_PER_COIN
          acctAddCoins(earned)
        }
        return p
      }
      return { ...p, growth: p.growth + xp }
    })
  }, [])

  /** 스탯 증감 (보상/페널티/간식 등) */
  const adjust = useCallback((delta: Partial<PetStats>) => {
    setPet((p) => ({ ...p, stats: adjustStats(p.stats, delta) }))
  }, [])

  /** 유대감 상승 (감소 없음 — bond.ts 참고) */
  const addBond = useCallback((amount: number) => {
    setPet((p) => ({ ...p, bond: (p.bond ?? 0) + amount }))
  }, [])

  /** 미션 이벤트 기록 (진행도 증가, 날짜 바뀌면 자동 초기화) */
  const recordMission = useCallback((event: MissionEvent) => {
    setPet((p) => {
      const today = todayIndex()
      const base =
        p.missions.day === today
          ? p.missions
          : { day: today, progress: {}, claimed: [] }
      const progress = { ...base.progress }
      let touched = base !== p.missions
      for (const m of DAILY_MISSIONS) {
        if (m.event === event) {
          const cur = progress[m.id] ?? 0
          if (cur < m.goal) {
            progress[m.id] = cur + 1
            touched = true
          }
        }
      }
      if (!touched) return p
      return { ...p, missions: { ...base, progress } }
    })
  }, [])

  /** 미션 보상 수령. 받은 코인 반환 (못 받으면 0) */
  const claimMission = useCallback((id: string): number => {
    // 판정은 최신 ref로 동기 계산 (setPet 업데이터 밖에서 코인 지급해야 하므로)
    const p = petRef.current
    const today = todayIndex()
    if (p.missions.day !== today) return 0
    const def = missionDef(id)
    if (!def) return 0
    const cur = p.missions.progress[id] ?? 0
    if (cur < def.goal || p.missions.claimed.includes(id)) return 0
    const nextMissions = { ...p.missions, claimed: [...p.missions.claimed, id] }
    petRef.current = { ...p, missions: nextMissions }
    setPet((prev) => ({ ...prev, missions: nextMissions }))
    acctAddCoins(def.reward)
    return def.reward
  }, [])

  /** 현재 메인 퀘스트 챕터 완료 → 다음 챕터로, 보상 지급 */
  const completeQuest = useCallback((reward: number) => {
    if (reward) acctAddCoins(reward)
    setPet((p) => ({ ...p, questStage: p.questStage + 1 }))
  }, [])

  /** 현재 계통 퀘스트 챕터 완료 */
  const completeLineQuest = useCallback((reward: number) => {
    if (reward) acctAddCoins(reward)
    setPet((p) => ({ ...p, lineQuestStage: p.lineQuestStage + 1 }))
  }, [])

  /** 다이어리 기록 추가 (최신순, 최대 60개 — 단, 가장 오래된 "첫 만남" 기록은 지우지 않는다) */
  const addDiary = useCallback((icon: string, text: string) => {
    setPet((p) => {
      const entry: DiaryEntry = { at: Date.now(), icon, text }
      const next = [entry, ...p.diary]
      const diary =
        next.length <= 60 ? next : [...next.slice(0, 59), next[next.length - 1]]
      return { ...p, diary }
    })
  }, [])

  /** behaviorProfile 카운터 증가 */
  const recordProfile = useCallback((key: string, amount = 1) => {
    setPet((p) => ({
      ...p,
      behaviorProfile: {
        ...p.behaviorProfile,
        [key]: (p.behaviorProfile[key] ?? 0) + amount,
      },
    }))
  }, [])

  /** 행동 이력 기록 (최대 100개) */
  const addBehaviorLog = useCallback((state: BehaviorState, duration: number) => {
    setPet((p) => {
      const entry: BehaviorEvent = { at: Date.now(), state, duration }
      return { ...p, behaviorLog: [entry, ...p.behaviorLog].slice(0, 100) }
    })
  }, [])

  /** 업적 해금 (이미 있는 건 무시) */
  const unlock = useCallback((ids: string[]) => {
    setPet((p) => {
      const set = new Set(p.achievements)
      let changed = false
      ids.forEach((id) => {
        if (!set.has(id)) {
          set.add(id)
          changed = true
        }
      })
      return changed ? { ...p, achievements: [...set] } : p
    })
  }, [])

  /** 오늘 출석 보상이 아직이면 지급. 받았으면 결과 반환, 아니면 null */
  const claimDaily = useCallback((): { amount: number; streak: number } | null => {
    const p = petRef.current
    const today = todayIndex()
    if (p.lastDailyClaim >= today) return null
    const continued = p.lastDailyClaim === today - 1
    const streak = continued ? p.careStreak + 1 : 1
    const amount = 15 + Math.min(streak - 1, 7) * 3
    petRef.current = { ...p, lastDailyClaim: today, careStreak: streak }
    setPet((prev) => ({ ...prev, lastDailyClaim: today, careStreak: streak }))
    acctAddCoins(amount)
    return { amount, streak }
  }, [])

  const level = useMemo(() => levelFromXp(pet.growth), [pet.growth])
  const progress = useMemo(() => levelProgress(pet.growth), [pet.growth])
  const stage = useMemo(() => stageFromLevel(level), [level])

  // 코인·선물·아이템은 계정(주인) 단위 — 펫에 합쳐서 반환 (읽기 코드 호환)
  const account = useAccount()
  const mergedPet = useMemo<Pet>(
    () => ({ ...pet, coins: account.coins, gifts: account.gifts, ownedItems: account.ownedItems }),
    [pet, account],
  )

  return {
    pet: mergedPet,
    setPet,
    care,
    spendCoins,
    update,
    reward,
    adjust,
    addBond,
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
  }
}
