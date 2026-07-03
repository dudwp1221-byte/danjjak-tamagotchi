/**
 * 프리미엄(BM) 레이어 — 계정 단위 저장.
 * 펫(Pet)과 분리: 보석 잔액, 프리미엄 코스메틱 소유권, 단짝패스 구독 상태.
 *
 * ⚠️ 실결제는 아직 미구현. "충전"과 "구독"은 임시 스텁으로 무료 지급한다.
 *    결제 인프라가 정해지면 addGems / activatePass 진입점만 교체하면 된다.
 */

const WALLET_KEY = 'danjjak-wallet'
const ENT_KEY = 'danjjak-entitlements'
const PASS_KEY = 'danjjak-pass'

/* ── 보석(유료 재화) ───────────────────────── */

export function loadGems(): number {
  try {
    const raw = localStorage.getItem(WALLET_KEY)
    if (!raw) return 0
    const w = JSON.parse(raw) as { gems?: number }
    return Math.max(0, Math.floor(w.gems ?? 0))
  } catch {
    return 0
  }
}

function saveGems(gems: number): void {
  try {
    localStorage.setItem(WALLET_KEY, JSON.stringify({ gems: Math.max(0, Math.floor(gems)) }))
  } catch {
    // 무시
  }
}

/** 보석 충전 (지금은 결제 없이 즉시 지급하는 임시 스텁) */
export function addGems(amount: number): number {
  const next = loadGems() + Math.max(0, Math.floor(amount))
  saveGems(next)
  return next
}

/** 보석 차감. 잔액 부족이면 false */
export function spendGems(amount: number): boolean {
  const cur = loadGems()
  if (cur < amount) return false
  saveGems(cur - amount)
  return true
}

/* ── 프리미엄 코스메틱 소유권 (계정 단위, 펫 무관) ── */

export function loadEntitlements(): Set<string> {
  try {
    const raw = localStorage.getItem(ENT_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function saveEntitlements(set: Set<string>): void {
  try {
    localStorage.setItem(ENT_KEY, JSON.stringify([...set]))
  } catch {
    // 무시
  }
}

export function ownsPremium(id: string): boolean {
  return loadEntitlements().has(id)
}

export function grantPremium(id: string): void {
  const set = loadEntitlements()
  set.add(id)
  saveEntitlements(set)
}

/* ── 단짝패스 (구독) ───────────────────────── */

export interface PassState {
  active: boolean
  /** 구독 시작 시각(ms) */
  since: number
  /** 마지막 데일리 보상 수령 날짜 인덱스 */
  lastDaily: number
}

const DEFAULT_PASS: PassState = { active: false, since: 0, lastDaily: 0 }

export function loadPass(): PassState {
  try {
    const raw = localStorage.getItem(PASS_KEY)
    if (!raw) return { ...DEFAULT_PASS }
    return { ...DEFAULT_PASS, ...(JSON.parse(raw) as Partial<PassState>) }
  } catch {
    return { ...DEFAULT_PASS }
  }
}

function savePass(p: PassState): void {
  try {
    localStorage.setItem(PASS_KEY, JSON.stringify(p))
  } catch {
    // 무시
  }
}

/** 단짝패스 구독 시작 (지금은 결제 없이 활성화하는 임시 스텁) */
export function activatePass(now: number = nowMs()): void {
  const p = loadPass()
  savePass({ ...p, active: true, since: p.since || now })
}

export function cancelPass(): void {
  savePass({ ...loadPass(), active: false })
}

/** 로컬 자정 기준 날짜 인덱스 */
function todayIndex(now: number = nowMs()): number {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  return Math.floor(d.getTime() / 86400000)
}

function nowMs(): number {
  return new Date().getTime()
}

/** 단짝패스 데일리 보상 — 구독 중이고 오늘 아직 안 받았으면 지급 */
export const PASS_DAILY_GEMS = 5
export const PASS_DAILY_COINS = 30

export function canClaimPassDaily(now: number = nowMs()): boolean {
  const p = loadPass()
  return p.active && p.lastDaily < todayIndex(now)
}

export function claimPassDaily(
  now: number = nowMs(),
): { gems: number; coins: number } | null {
  if (!canClaimPassDaily(now)) return null
  const p = loadPass()
  savePass({ ...p, lastDaily: todayIndex(now) })
  addGems(PASS_DAILY_GEMS)
  return { gems: PASS_DAILY_GEMS, coins: PASS_DAILY_COINS }
}
