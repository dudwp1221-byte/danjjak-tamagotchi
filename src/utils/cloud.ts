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

/** 클라우드에 현재 데이터 업로드 (덮어쓰기) */
export async function pushCloud(uid: string): Promise<void> {
  if (!db) return
  await setDoc(doc(db, 'saves', uid), {
    data: snapshot(),
    updatedAt: Date.now(),
  })
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
