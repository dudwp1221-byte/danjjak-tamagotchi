import type { Pet, PetStats, WorkToday } from '../types/pet'
import { personalityFromId, randomPersonality } from './personality'
import { formById, rollStarter, starterFromId, type Form } from './species'

/**
 * PetAvatar에 넘길 표시용 종족. 유년기도 이제 정식 FORM이라 그대로 반환.
 * (호출부 호환용 얇은 래퍼)
 */
export function displaySpecies(pet: { form: string }): Form {
  return formById(pet.form)
}

const DEFAULT_WORK_TODAY: WorkToday = {
  date: 0,
  workMinutes: 0,
  focusMinutes: 0,
  meetingMinutes: 0,
  overtimeMinutes: 0,
}

/** 방에 동시에 키울 수 있는 최대 펫 수 */
export const MAX_PETS = 6

/** 졸업(독립) 가능 최소 레벨 — 궁극체(10) 이상부터 */
export const GRADUATE_MIN_LEVEL = 10

/**
 * 졸업 시 주는 코인 보상.
 * 레벨이 높을수록(키우기 어려울수록) 가파르게, 함께한 일수도 반영.
 * 예) L10·3일 ≈ 120, L15·7일 ≈ 270, L20·14일 ≈ 485
 */
export function graduateReward(level: number, days: number): number {
  const levelPart = level * 10 + (level - GRADUATE_MIN_LEVEL) * level // 고레벨 가속
  const dayPart = days * 6
  return Math.max(0, Math.round(levelPart + dayPart))
}

/**
 * 펫의 "현재 모습" 프로필 이미지 URL (종족 스프라이트).
 * 최초에 유저가 그린 스케치(imageDataUrl)가 아니라 현재 진화한 형태를 쓴다.
 * 프로필/썸네일이 필요한 모든 곳에서 이 헬퍼로 통일한다.
 */
export function petSpriteUrl(pet: { form: string }): string {
  return `/sprites/${formById(pet.form).id}.png`
}

/** 새 펫의 초기 스탯 (모두 가득 찬 상태) */
export function createInitialStats(): PetStats {
  return { hunger: 100, mood: 100, cleanliness: 100, energy: 100, health: 100 }
}

/** 펫과 함께한 일수 (생성일 기준, 최소 1일째) */
export function daysTogether(createdAt: number, now: number = Date.now()): number {
  return Math.max(1, Math.floor((now - createdAt) / 86400000) + 1)
}

/** 로컬 자정 기준 날짜 인덱스 (출석 체크용) */
export function todayIndex(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return Math.floor(d.getTime() / 86400000)
}

/** 고유 ID 생성 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `pet_${Date.now()}_${Math.floor(Math.random() * 1e6)}`
}

/** 드로잉 결과와 이름으로 새 Pet 객체를 만든다. */
export function createPet(params: {
  ownerName: string
  /** 비워두면 뽑힌 종족의 기본 이름을 쓴다 */
  name: string
  imageDataUrl: string
}): Pet {
  const now = Date.now()
  const starter = rollStarter()
  return {
    id: generateId(),
    ownerName: params.ownerName,
    name: params.name.trim() || starter.name,
    imageDataUrl: params.imageDataUrl,
    stats: createInitialStats(),
    lastUpdated: now,
    createdAt: now,
    growth: 0,
    coins: 0,
    totalActions: 0,
    accessory: null,
    ownedItems: [],
    achievements: [],
    lastDailyClaim: 0,
    careStreak: 0,
    bond: 0,
    species: starter.line,
    form: starter.id,
    personality: randomPersonality(),
    diary: [{ at: now, icon: '🐣', text: `${params.name}와 처음 만났어요!` }],
    background: null,
    missions: { day: 0, progress: {}, claimed: [] },
    questStage: 0,
    lineQuestStage: 0,
    furniture: [],
    behaviorProfile: {},
    behaviorLog: [],
    workToday: { ...DEFAULT_WORK_TODAY },
    lastGoodnight: 0,
    schedules: [],
    careXp: { hour: 0, feed: 0, pet: 0, wash: 0, sleep: 0, play: 0 },
    gifts: {},
  }
}

/** 저장본/구버전 펫을 최신 스키마로 보정한다. (누락 필드 기본값 채움) */
export function normalizePet(raw: Partial<Pet> & Pick<Pet, 'id'>): Pet {
  return {
    id: raw.id,
    ownerName: raw.ownerName ?? '익명',
    name: raw.name ?? '단짝',
    imageDataUrl: raw.imageDataUrl ?? '',
    stats: { ...createInitialStats(), ...raw.stats }, // 누락 스탯(건강 등) 기본값 보정
    lastUpdated: raw.lastUpdated ?? Date.now(),
    createdAt: raw.createdAt ?? Date.now(),
    growth: raw.growth ?? 0,
    coins: raw.coins ?? 0,
    totalActions: raw.totalActions ?? 0,
    accessory: raw.accessory ?? null,
    ownedItems: raw.ownedItems ?? [],
    achievements: raw.achievements ?? [],
    lastDailyClaim: raw.lastDailyClaim ?? 0,
    careStreak: raw.careStreak ?? 0,
    bond: raw.bond ?? 0,
    ...(() => {
      const formId = raw.form ?? starterFromId(raw.id).id
      return { species: formById(formId).line, form: formId }
    })(),
    personality: raw.personality ?? personalityFromId(raw.id),
    diary: raw.diary ?? [],
    background: raw.background ?? null,
    missions: raw.missions ?? { day: 0, progress: {}, claimed: [] },
    questStage: raw.questStage ?? 0,
    lineQuestStage: raw.lineQuestStage ?? 0,
    furniture: raw.furniture ?? [],
    behaviorProfile: raw.behaviorProfile ?? {},
    behaviorLog: raw.behaviorLog ?? [],
    workToday: raw.workToday ?? { ...DEFAULT_WORK_TODAY },
    lastGoodnight: raw.lastGoodnight ?? 0,
    schedules: raw.schedules ?? [],
    careXp: { hour: 0, feed: 0, pet: 0, wash: 0, sleep: 0, play: 0, ...raw.careXp },
    gifts: raw.gifts ?? {},
  }
}
