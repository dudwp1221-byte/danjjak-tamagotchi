import type { DiaryEntry, Personality, Pet } from '../types/pet'
import { normalizePet } from './pet'
import { FORMS } from './species'
import { levelFromXp, MAX_LEVEL } from './progression'

const STORAGE_KEY = 'danjjak-pet'

/** 저장된 펫을 불러온다. 없거나 손상되면 null. */
export function loadPet(): Pet | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const pet = JSON.parse(raw) as Partial<Pet> & { id?: string }
    // 최소한의 형태 검증
    if (!pet?.id || !pet.stats || !pet.imageDataUrl) return null
    // 구버전 저장본도 최신 스키마로 보정
    return normalizePet(pet as Partial<Pet> & { id: string })
  } catch {
    return null
  }
}

/** 펫을 저장한다. */
export function savePet(pet: Pet): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pet))
  } catch {
    // 용량 초과 등은 조용히 무시
  }
}

/** 저장된 펫을 삭제한다. */
export function clearPet(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // 무시
  }
}

/* ── 여러 마리 보관함 ─────────────────────── */

export const PETS_KEY = 'danjjak-pets'
const ACTIVE_KEY = 'danjjak-active'

/** 모든 펫을 불러온다. (구버전 단일 펫은 자동 이전) */
export function loadPets(): Pet[] {
  try {
    const raw = localStorage.getItem(PETS_KEY)
    if (raw) {
      const arr = JSON.parse(raw) as (Partial<Pet> & { id?: string })[]
      return arr
        .filter((p) => p?.id && p.stats && p.imageDataUrl)
        .map((p) => normalizePet(p as Partial<Pet> & { id: string }))
    }
    // 구버전 단일 펫 이전
    const legacy = loadPet()
    if (legacy) {
      savePets([legacy])
      setActiveId(legacy.id)
      clearPet()
      return [legacy]
    }
    return []
  } catch {
    return []
  }
}

export function savePets(pets: Pet[]): void {
  try {
    localStorage.setItem(PETS_KEY, JSON.stringify(pets))
  } catch {
    // 무시
  }
}

export function getActiveId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_KEY)
  } catch {
    return null
  }
}

export function setActiveId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_KEY, id)
  } catch {
    // 무시
  }
}

/** 펫을 추가하거나(없으면) 갱신한다(있으면). */
export function upsertPet(pet: Pet): void {
  const pets = loadPets()
  const idx = pets.findIndex((p) => p.id === pet.id)
  if (idx >= 0) pets[idx] = pet
  else pets.push(pet)
  savePets(pets)
}

/**
 * 비활성 펫 트리클 성장 — 내 방에서 기다리는 펫들도 조금씩 자란다.
 * 1분 간격 호출 기준 기본 0.15XP(≈9XP/시간, 활성 방치 성장의 ~20%). 만렙이면 생략.
 */
export function trickleInactivePets(activeId: string, xp = 0.15): void {
  const pets = loadPets()
  let changed = false
  for (const p of pets) {
    if (p.id === activeId) continue
    if (levelFromXp(p.growth) >= MAX_LEVEL) continue
    p.growth += xp
    changed = true
  }
  if (changed) savePets(pets)
}

/** 펫을 삭제하고 남은 펫 목록을 반환한다. */
export function removePet(id: string): Pet[] {
  const pets = loadPets().filter((p) => p.id !== id)
  savePets(pets)
  return pets
}

/* ── 설정 ───────────────────────────────── */

const SETTINGS_KEY = 'danjjak-settings'

export type Theme = 'dark' | 'light'

export interface Settings {
  /** 케어 알림(브라우저 알림) 사용 여부 */
  notifications: boolean
  /** 화면 테마 */
  theme: Theme
}

const DEFAULT_SETTINGS: Settings = {
  notifications: false,
  theme: 'dark',
}

/** 테마를 문서에 적용 */
export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // 무시
  }
}

/* ── 온보딩 ─────────────────────────────── */

const ONBOARD_KEY = 'danjjak-onboarded'

export function isOnboarded(): boolean {
  try {
    return localStorage.getItem(ONBOARD_KEY) === '1'
  } catch {
    return true
  }
}

export function markOnboarded(): void {
  try {
    localStorage.setItem(ONBOARD_KEY, '1')
  } catch {
    // 무시
  }
}

/* ── 졸업생 (명예의 전당) ─────────────────── */

const GRADUATES_KEY = 'danjjak-graduates'

export interface Graduate {
  name: string
  /** 종족 표시 이름 (구버전 저장본은 이 값만 있음) */
  species: string
  level: number
  at: number
  /* ── 아래는 졸업 정서화 이후 기록 — 구버전 졸업생에는 없다 ── */
  /** 폼 id — 명전 초상 스프라이트용 */
  form?: string
  ownerName?: string
  personality?: Personality
  /** 함께한 일수 */
  days?: number
  /** 돌봐준 횟수 */
  totalActions?: number
  /** 유대감 (utils/bond.ts 단계 표시용) */
  bond?: number
  /** 추억 일기 하이라이트 (오래된 순, 최대 6개) */
  highlights?: DiaryEntry[]
  /** 주인이 남긴 한마디 */
  farewell?: string
  /** 펫이 남긴 마지막 인사 */
  lastWords?: string
}

export function loadGraduates(): Graduate[] {
  try {
    const raw = localStorage.getItem(GRADUATES_KEY)
    return raw ? (JSON.parse(raw) as Graduate[]) : []
  } catch {
    return []
  }
}

/**
 * 명전 최대 인원. 클라우드 저장이 Firestore 문서 1개(1MB 상한)에 전체 데이터를
 * 담는 구조라 무한정 늘릴 수 없다 — 회고 포함 1명 ≈ 1.5KB, 100명 ≈ 150KB.
 */
const GRADUATES_MAX = 100

export function addGraduate(g: Graduate): void {
  try {
    const list = loadGraduates()
    list.unshift(g)
    localStorage.setItem(GRADUATES_KEY, JSON.stringify(list.slice(0, GRADUATES_MAX)))
  } catch {
    // 무시
  }
}

/* ── 랭킹전 명예 점수 ─────────────────────── */

const HONOR_KEY = 'danjjak-honor'

export function loadHonor(): number {
  try {
    return Number(localStorage.getItem(HONOR_KEY) ?? '0') || 0
  } catch {
    return 0
  }
}

/** 명예 점수 누적. 누적 총합 반환 */
export function addHonor(points: number): number {
  const total = loadHonor() + points
  try {
    localStorage.setItem(HONOR_KEY, String(total))
  } catch {
    /* 무시 */
  }
  return total
}

export interface HonorTier {
  label: string
  emoji: string
}

export function honorTier(points: number): HonorTier {
  if (points >= 700) return { label: '다이아', emoji: '💎' }
  if (points >= 350) return { label: '플래티넘', emoji: '🔷' }
  if (points >= 150) return { label: '골드', emoji: '🥇' }
  if (points >= 50) return { label: '실버', emoji: '🥈' }
  return { label: '브론즈', emoji: '🥉' }
}

/* ── 도감(발견한 종족) ───────────────────── */

const DEX_KEY = 'danjjak-dex'

export function loadDex(): string[] {
  try {
    const raw = localStorage.getItem(DEX_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

/** [치트] 도감 전체 해금 — 모든 형태를 발견 처리 */
export function unlockAllDex(): void {
  localStorage.setItem(DEX_KEY, JSON.stringify(FORMS.map((f) => f.id)))
}

/** [치트] 도감 초기화 */
export function resetDex(): void {
  localStorage.removeItem(DEX_KEY)
}

/** 종족을 도감에 등록. 새로 발견했으면 true */
export function discoverSpecies(id: string): boolean {
  try {
    const dex = loadDex()
    if (dex.includes(id)) return false
    dex.push(id)
    localStorage.setItem(DEX_KEY, JSON.stringify(dex))
    return true
  } catch {
    return false
  }
}

const DEXCLAIM_KEY = 'danjjak-dexclaims'

export function loadDexClaims(): number[] {
  try {
    const raw = localStorage.getItem(DEXCLAIM_KEY)
    return raw ? (JSON.parse(raw) as number[]) : []
  } catch {
    return []
  }
}

export function addDexClaim(milestone: number): void {
  try {
    const list = loadDexClaims()
    if (!list.includes(milestone)) {
      list.push(milestone)
      localStorage.setItem(DEXCLAIM_KEY, JSON.stringify(list))
    }
  } catch {
    /* 무시 */
  }
}
