import type { Pet } from '../../types/pet'
import { applyDecay } from '../../utils/stats'
import { createSeedFriends } from './seedFriends'

/**
 * 소셜(멀티플레이) 백엔드 추상화.
 * 지금은 localStorage 기반 목업이며, 추후 Firebase 구현으로 교체할 수 있다.
 * (createFirebaseBackend 참고)
 */
export interface SocialBackend {
  /** 친구 펫 목록 (현재 시점 스탯 반영) */
  getFriends(): Promise<Pet[]>
  /** 친구에게 선물 보내기 → 친구 기분 상승 */
  sendGift(friendId: string): Promise<void>
  /** 내 펫을 서버에 공개(동기화) */
  publishMyPet(pet: Pet): Promise<void>
}

const FRIENDS_KEY = 'danjjak-friends'
const MY_PUBLISH_KEY = 'danjjak-my-public'

function loadFriends(now: number): Pet[] {
  try {
    const raw = localStorage.getItem(FRIENDS_KEY)
    if (raw) return JSON.parse(raw) as Pet[]
  } catch {
    /* ignore */
  }
  const seeded = createSeedFriends(now)
  try {
    localStorage.setItem(FRIENDS_KEY, JSON.stringify(seeded))
  } catch {
    /* ignore */
  }
  return seeded
}

function saveFriends(friends: Pet[]) {
  try {
    localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends))
  } catch {
    /* ignore */
  }
}

/** 로컬 목업 백엔드 */
export const localBackend: SocialBackend = {
  async getFriends() {
    const now = Date.now()
    const friends = loadFriends(now)
    // 표시 시점 기준으로 스탯 감소 반영 (친구도 살아있는 것처럼)
    return friends.map((f) => ({
      ...f,
      stats: applyDecay(f.stats, f.lastUpdated, now),
    }))
  },

  async sendGift(friendId) {
    const now = Date.now()
    const friends = loadFriends(now)
    const next = friends.map((f) =>
      f.id === friendId
        ? {
            ...f,
            stats: { ...f.stats, mood: Math.min(100, f.stats.mood + 15) },
            lastUpdated: now,
          }
        : f,
    )
    saveFriends(next)
  },

  async publishMyPet(pet) {
    try {
      localStorage.setItem(MY_PUBLISH_KEY, JSON.stringify(pet))
    } catch {
      /* ignore */
    }
  },
}

/**
 * Firebase 백엔드 (미구현 자리표시).
 * .env에 Firebase 설정을 넣고 firebase SDK를 설치한 뒤 이 함수를 구현하면
 * localBackend 대신 사용할 수 있다.
 */
export function createFirebaseBackend(): SocialBackend {
  throw new Error(
    'Firebase 백엔드가 아직 설정되지 않았습니다. firebase 설정/키를 추가한 뒤 구현하세요.',
  )
}

/** 현재 사용할 백엔드 (지금은 로컬 목업) */
export const social: SocialBackend = localBackend
