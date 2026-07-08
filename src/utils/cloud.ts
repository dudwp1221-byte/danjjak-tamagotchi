import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase'

/** 동기화 대상 localStorage 키 접두사 (게임 데이터 전부 danjjak* 로 시작) */
const PREFIX = 'danjjak'

/** 현재 기기의 게임 데이터를 키-값 스냅샷으로 수집 */
function snapshot(): Record<string, string> {
  const out: Record<string, string> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith(PREFIX)) {
      const v = localStorage.getItem(k)
      if (v != null) out[k] = v
    }
  }
  return out
}

// 마지막으로 업로드한 스냅샷 지문 — 변화 없으면 쓰기 생략 (Firestore 쿼터 보호)
let lastPushed = ''
// 업로드 최소 간격(ms) — 잦은 호출이 겹쳐도 이 간격 안에서는 1회만 쓴다
const PUSH_MIN_INTERVAL = 120_000
let lastPushAt = 0
let pushing = false

/** 로그아웃 시에도 기기에 남겨둘 키 (계정과 무관한 기기 설정) */
const KEEP_ON_LOGOUT = new Set([
  'danjjak-settings', // 화면 테마·알림 토글
  'danjjak-onboarded', // 튜토리얼 시청 여부
  'danjjak.introSeen.v1', // 인트로 시청 여부
])

/**
 * 이 기기의 게임 저장 데이터를 지운다 (로그아웃 시).
 * 계정 데이터는 클라우드에 남아있으므로, 다음 게스트/다른 계정에 이전 데이터가
 * 새지 않도록 로컬만 비운다. 기기 설정(KEEP_ON_LOGOUT)은 남긴다.
 */
export function clearLocalSave(): void {
  const toRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith(PREFIX) && !KEEP_ON_LOGOUT.has(k)) toRemove.push(k)
  }
  for (const k of toRemove) localStorage.removeItem(k)
  lastPushed = '' // 다음 로그인 때 새 데이터가 정상 업로드되도록 지문 초기화
}

/**
 * 클라우드에 현재 데이터 업로드 (덮어쓰기).
 * - 데이터가 지난 업로드와 동일하면 생략
 * - 2분 이내 재호출은 생략 (force로 무시 가능 — 종료/로그아웃 시)
 */
export async function pushCloud(uid: string, force = false): Promise<void> {
  if (!db || pushing) return
  const data = snapshot()
  // 안전장치: 펫이 하나도 없는(로그아웃 직후 등) 빈 상태로는 클라우드를 덮어쓰지 않는다.
  // — 실수로 계정의 클라우드 저장본을 날려버리는 사고 방지.
  const petsRaw = data['danjjak-pets']
  if (!petsRaw || petsRaw === '[]') return
  const fingerprint = JSON.stringify(data)
  if (fingerprint === lastPushed) return
  if (!force && Date.now() - lastPushAt < PUSH_MIN_INTERVAL) return
  pushing = true
  try {
    await setDoc(doc(db, 'saves', uid), { data, updatedAt: Date.now() })
    lastPushed = fingerprint
    lastPushAt = Date.now()
  } finally {
    pushing = false
  }
}

/**
 * 클라우드 저장본 존재 여부만 확인 (localStorage는 건드리지 않음).
 * 있으면 updatedAt(ms), 없으면 null.
 */
export async function peekCloud(uid: string): Promise<number | null> {
  if (!db) return null
  const snap = await getDoc(doc(db, 'saves', uid))
  if (!snap.exists()) return null
  return (snap.data() as { updatedAt?: number }).updatedAt ?? 0
}

/**
 * 클라우드 데이터를 내려받아 localStorage에 복원한다.
 * 저장본이 있으면 updatedAt(ms)을, 없으면 null을 반환.
 * (복원 후에는 호출부에서 reload 해서 화면에 반영)
 */
export async function pullCloud(uid: string): Promise<number | null> {
  if (!db) return null
  const snap = await getDoc(doc(db, 'saves', uid))
  if (!snap.exists()) return null
  const payload = snap.data() as {
    data?: Record<string, string>
    updatedAt?: number
  }
  if (payload.data) {
    for (const [k, v] of Object.entries(payload.data)) {
      localStorage.setItem(k, v)
    }
  }
  return payload.updatedAt ?? 0
}
