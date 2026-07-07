/**
 * 펫 관련 공용 타입 정의.
 */

/** 업무 모드 (Electron 전용). 야근은 저녁 시간대에 자동 활성(버닝타임) */
export type WorkMode = 'idle' | 'working' | 'focused' | 'overtime'

/** 오늘의 업무 통계 (매일 0시에 초기화) */
export interface WorkToday {
  /** 로컬 자정 기준 날짜 인덱스 */
  date: number
  /** 일반 업무 시간 (분) */
  workMinutes: number
  /** 집중 모드 시간 (분) */
  focusMinutes: number
  /** 회의 모드 시간 (분) */
  meetingMinutes: number
  /** 야근 시간 (분) */
  overtimeMinutes: number
}

/** 자율 행동 상태 */
export type BehaviorState =
  | 'idle'
  | 'sleeping'
  | 'eating'
  | 'reading'
  | 'playing'
  | 'window_gazing'
  | 'wandering'

/** 행동 이력 한 항목 */
export interface BehaviorEvent {
  at: number
  state: BehaviorState
  duration: number
}

/** 펫 스탯 — 시간에 따라 감소하며, 회복 액션으로 채운다. (0~100) */
export interface PetStats {
  /** 포만도 (낮을수록 배고픔) */
  hunger: number
  /** 애정(유대) — UI 표기 "애정". 쓰다듬기·놀아주기·선물로 ↑, 씻기기로 살짝 ↓ */
  mood: number
  /** 청결도 */
  cleanliness: number
  /** 기운 (잠/휴식) */
  energy: number
  /** 건강 — 놀아주기로 ↑, 방치/과식 시 ↓ */
  health: number
}

/** 회복/상호작용 액션 종류 */
export type PetAction = 'feed' | 'pet' | 'wash' | 'sleep' | 'play' | 'gift'

/** 옷장에서 저장하는 악세서리 커스텀 배치 — 아바타 기준 % 좌표 + 크기 배율 */
export interface AccessoryPlacement {
  /** 가로 위치 (0~100, 아바타 컨테이너 기준 %) */
  x: number
  /** 세로 위치 (0~100) */
  y: number
  /** 크기 배율 (0.5~2) */
  s: number
}

/** 펫 기질(성격) */
export type Personality =
  | 'foodie'
  | 'sleepyhead'
  | 'cuddler'
  | 'cleanfreak'
  | 'playful'
  | 'calm'

/** 다이어리(성장 기록) 한 줄 */
export interface DiaryEntry {
  at: number
  icon: string
  text: string
}

/** 일일 미션 진행 상태 */
export interface MissionState {
  /** 미션이 갱신된 날짜 (epoch day index) */
  day: number
  /** 미션 id별 진행도 */
  progress: Record<string, number>
  /** 보상을 받은 미션 id */
  claimed: string[]
}

/** 하나의 펫. Canvas 드로잉 결과는 dataURL(PNG)로 보관한다. */
export interface Pet {
  id: string
  /** 주인(플레이어) 이름 */
  ownerName: string
  /** 펫 이름 */
  name: string
  /** Canvas로 그린 펫 그림 (data URL) */
  imageDataUrl: string
  stats: PetStats
  /** 마지막으로 스탯이 갱신된 시각 (epoch ms) */
  lastUpdated: number
  createdAt: number

  // --- 성장 / 재화 ---
  /** 누적 경험치 */
  growth: number
  /** 보유 코인 */
  coins: number
  /** 누적 케어 횟수 (업적용) */
  totalActions: number

  // --- 아이템 / 꾸미기 ---
  /** 착용 중인 악세서리 id (없으면 null) */
  accessory: string | null
  /** 옷장에서 조정한 악세서리 배치 — 키: `${악세서리id}@${형태id}` (진화하면 형태별로 다시 조정) */
  accessoryPos?: Record<string, AccessoryPlacement>
  /** 보유한 아이템 id 목록 */
  ownedItems: string[]

  // --- 진행도 ---
  /** 달성한 업적 id 목록 */
  achievements: string[]
  /** 마지막 출석 보상을 받은 날짜 (epoch day index) */
  lastDailyClaim: number
  /** 연속 출석 일수 */
  careStreak: number
  /** 유대감 — 깎이지 않고 쌓이기만 하는 관계 지표 (utils/bond.ts) */
  bond: number

  // --- 종족 / 성격 / 기록 ---
  /** 계통(트리) id (그릴 때 랜덤 획득) */
  species: string
  /** 현재 진화 형태 id (분기 진화로 변함) */
  form: string
  /** 타고난 기질 */
  personality: Personality
  /** 성장 기록 (최신순) */
  diary: DiaryEntry[]

  // --- 꾸미기 / 미션 ---
  /** 착용 중인 배경 id (없으면 null) */
  background: string | null
  /** 일일 미션 상태 */
  missions: MissionState
  /** 완료한 메인 스토리 퀘스트 챕터 수 */
  questStage: number
  /** 완료한 계통 스토리 퀘스트 챕터 수 */
  lineQuestStage: number

  // --- 가구 / 행동 ---
  /** 보유한 가구 id 목록 */
  furniture: string[]
  /** 방에서 직접 옮긴 가구 배치 — 키: 가구 id, 값: 무대 기준 % 좌표 */
  furniturePos?: Record<string, { x: number; y: number }>
  /** 행동 기반 진화 조건 추적 카운터 */
  behaviorProfile: Record<string, number>
  /** 최근 자율 행동 이력 (최대 100개) */
  behaviorLog: BehaviorEvent[]

  // --- 업무 동반 (Electron 전용) ---
  /** 오늘의 업무 통계 */
  workToday: WorkToday

  // --- 일상 루틴 ---
  /** 마지막 굿나잇 시각 (epoch ms, 0 = 없음) */
  lastGoodnight: number

  // --- 일정 알람 ---
  schedules: Schedule[]

  // --- 케어 XP 시간당 제한 ---
  /** 시간당 케어로 큰 XP를 받은 횟수 (hour = epoch 시각 인덱스, 매 시각 리셋) */
  careXp: { hour: number; feed: number; pet: number; wash: number; sleep: number; play: number }

  // --- 선물 인벤토리 ---
  /** 보유한 선물 아이템 (giftId → 개수). 상점 구매/이벤트로 모아서 선물하기로 사용 */
  gifts: Record<string, number>
}

export interface Schedule {
  id: string
  title: string
  /** 알람 발생 시각 (epoch ms) */
  at: number
  notified: boolean
}
