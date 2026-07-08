import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { auth, firebaseReady } from './firebase'

export { firebaseReady }

/** 아이디는 Firebase 이메일 인증에 맞춰 내부적으로 가짜 도메인을 붙인다. */
const ID_DOMAIN = '@danjjak.app'

/** 아이디 정규화 (소문자 + 공백 제거) — 대소문자/공백 변형 계정 난립 방지 */
function normalizeId(id: string): string {
  return id.trim().toLowerCase()
}

function toEmail(id: string): string {
  return `${normalizeId(id)}${ID_DOMAIN}`
}

/** 허용 아이디 형식: 영문/숫자/밑줄, 3~20자 */
const ID_PATTERN = /^[a-z0-9_]{3,20}$/

/** 아이디 형식 검사 — 통과하면 null, 아니면 안내 메시지 */
export function validateId(id: string): string | null {
  const norm = normalizeId(id)
  if (!ID_PATTERN.test(norm)) {
    return '아이디는 영문/숫자/밑줄(_) 3~20자로 만들어주세요.'
  }
  return null
}

/** Firebase 인증 에러를 한국어 안내로 변환 */
function friendlyError(e: unknown): string {
  const code = (e as { code?: string })?.code ?? ''
  switch (code) {
    case 'auth/email-already-in-use':
      return '이미 사용 중인 아이디예요.'
    case 'auth/invalid-email':
      return '아이디에 쓸 수 없는 문자가 있어요. (영문/숫자 권장)'
    case 'auth/weak-password':
      return '비밀번호는 6자 이상이어야 해요.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return '아이디 또는 비밀번호가 올바르지 않아요.'
    case 'auth/too-many-requests':
      return '시도가 너무 많아요. 잠시 후 다시 시도해주세요.'
    case 'auth/network-request-failed':
      return '네트워크 연결을 확인해주세요.'
    default:
      return '문제가 발생했어요. 다시 시도해주세요.'
  }
}

export class AuthError extends Error {}

export async function signUp(id: string, pw: string): Promise<User> {
  if (!auth) throw new AuthError('계정 로그인이 아직 설정되지 않았어요.')
  const idErr = validateId(id)
  if (idErr) throw new AuthError(idErr)
  try {
    const cred = await createUserWithEmailAndPassword(auth, toEmail(id), pw)
    return cred.user
  } catch (e) {
    throw new AuthError(friendlyError(e))
  }
}

export async function logIn(id: string, pw: string): Promise<User> {
  if (!auth) throw new AuthError('계정 로그인이 아직 설정되지 않았어요.')
  try {
    const cred = await signInWithEmailAndPassword(auth, toEmail(id), pw)
    return cred.user
  } catch (e) {
    throw new AuthError(friendlyError(e))
  }
}

export async function logOut(): Promise<void> {
  if (auth) await signOut(auth)
}

/** 아이디만 표시용으로 복원 (이메일에서 도메인 제거) */
export function displayId(user: User | null): string {
  if (!user?.email) return ''
  return user.email.replace(ID_DOMAIN, '')
}

export function watchAuth(cb: (user: User | null) => void): () => void {
  if (!auth) {
    cb(null)
    return () => {}
  }
  return onAuthStateChanged(auth, cb)
}
