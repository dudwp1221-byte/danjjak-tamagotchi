import type { Pet } from '../types/pet'

/**
 * 계정(주인) 단위 재화·인벤토리. 펫이 아니라 주인이 들고 있는 것:
 * 코인, 선물함, 보유 아이템(악세서리·배경·도구 소유권).
 * (보석/구독은 premium.ts, 착용 중인 악세서리·배경은 펫별로 유지)
 */
const KEY = 'danjjak-account'

/** 획득 이력(대표 펫 후보) 한 항목 — 합성/졸업으로 사라져도 유지 */
export interface AvatarPoolEntry {
  name: string
  form: string
}

export interface AccountData {
  coins: number
  gifts: Record<string, number>
  ownedItems: string[]
  /** 계정 대표(프로필) 펫 id. 없으면 활성 펫으로 대체 */
  avatarPetId?: string
  /** 획득한 적 있는 모든 펫(현재 보유 + 합성·졸업으로 떠난 펫). id → {name, form} */
  avatarPool?: Record<string, AvatarPoolEntry>
}

const DEFAULT: AccountData = { coins: 0, gifts: {}, ownedItems: [], avatarPool: {} }

let cache: AccountData | null = null
const listeners = new Set<() => void>()

function read(): AccountData {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(KEY)
    cache = raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<AccountData>) } : { ...DEFAULT }
  } catch {
    cache = { ...DEFAULT }
  }
  return cache
}

function write(next: AccountData): void {
  cache = next
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // 무시
  }
  listeners.forEach((l) => l())
}

export function subscribeAccount(cb: () => void): () => void {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

/** 다른 창에서 계정이 바뀌었을 때 캐시 무효화 + 구독자 알림 */
export function refreshAccount(): void {
  cache = null
  listeners.forEach((l) => l())
}

// 같은 origin 다른 탭/창에서 계정 변경 시 동기화 (Electron은 usePet의 IPC로도 보강)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) refreshAccount()
  })
}

/** useSyncExternalStore용 스냅샷 (변경 없으면 동일 참조) */
export function getAccount(): AccountData {
  return read()
}

export function addCoins(n: number): void {
  const a = read()
  write({ ...a, coins: Math.max(0, Math.round(a.coins + n)) })
}

/** 코인 차감. 잔액 부족이면 false */
export function spendCoins(n: number): boolean {
  const a = read()
  if (a.coins < n) return false
  write({ ...a, coins: a.coins - n })
  return true
}

export function addGift(id: string): void {
  const a = read()
  write({ ...a, gifts: { ...a.gifts, [id]: (a.gifts[id] ?? 0) + 1 } })
}

/** 선물 1개 사용. 없으면 false */
export function useGift(id: string): boolean {
  const a = read()
  if ((a.gifts[id] ?? 0) <= 0) return false
  write({ ...a, gifts: { ...a.gifts, [id]: a.gifts[id] - 1 } })
  return true
}

/** 계정 대표(프로필) 펫 지정 */
export function setAvatarPet(id: string): void {
  const a = read()
  write({ ...a, avatarPetId: id })
}

/**
 * 획득 이력에 펫들을 기록(upsert). 현재 폼/이름으로 갱신.
 * 합성·졸업으로 목록에서 사라져도 이 이력은 남아 대표 펫 후보가 된다.
 * 변경이 없으면 write하지 않아 불필요한 리렌더를 막는다.
 */
export function recordAvatarPets(entries: { id: string; name: string; form: string }[]): void {
  if (entries.length === 0) return
  const a = read()
  const pool = { ...(a.avatarPool ?? {}) }
  let changed = false
  for (const e of entries) {
    const prev = pool[e.id]
    if (!prev || prev.name !== e.name || prev.form !== e.form) {
      pool[e.id] = { name: e.name, form: e.form }
      changed = true
    }
  }
  if (changed) write({ ...a, avatarPool: pool })
}

export function grantItem(id: string): void {
  const a = read()
  if (a.ownedItems.includes(id)) return
  write({ ...a, ownedItems: [...a.ownedItems, id] })
}

/**
 * 기존 펫별 데이터를 계정으로 1회 이전. (코인 합산, 선물·아이템 병합)
 * 계정이 이미 있으면 아무것도 안 함.
 */
export function migrateFromPets(pets: Pet[]): void {
  if (localStorage.getItem(KEY)) return
  const coins = pets.reduce((s, p) => s + (p.coins || 0), 0)
  const gifts: Record<string, number> = {}
  for (const p of pets) {
    for (const [k, v] of Object.entries(p.gifts || {})) {
      gifts[k] = (gifts[k] ?? 0) + v
    }
  }
  const ownedItems = [...new Set(pets.flatMap((p) => p.ownedItems || []))]
  write({ coins, gifts, ownedItems })
}
