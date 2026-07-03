import { useState } from 'react'
import { signUp, logIn, firebaseReady, AuthError } from '../../utils/auth'
import { pushCloud, pullCloud } from '../../utils/cloud'
import './lobby.css'

interface LobbyProps {
  /** 로그인 없이(게스트) 시작 */
  onGuest: () => void
}

/**
 * 게임 진입 전 로비. 로그인/회원가입 또는 게스트로 시작.
 * 인증 성공 시 App의 useAuth가 user를 감지해 자동으로 게임 화면으로 넘어간다.
 * (클라우드 저장본이 있으면 복원 후 새로고침)
 */
export default function Lobby({ onGuest }: LobbyProps) {
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const doSignUp = async () => {
    if (!id.trim() || pw.length < 6) {
      setErr('아이디를 입력하고 비밀번호는 6자 이상으로 해주세요.')
      return
    }
    setBusy(true)
    setErr('')
    try {
      const u = await signUp(id, pw)
      await pushCloud(u.uid)
      // user 감지 → App이 게임 화면으로 전환
    } catch (e) {
      setErr(e instanceof AuthError ? e.message : '가입에 실패했어요.')
      setBusy(false)
    }
  }

  const doLogIn = async () => {
    if (!id.trim() || !pw) {
      setErr('아이디와 비밀번호를 입력해주세요.')
      return
    }
    setBusy(true)
    setErr('')
    try {
      const u = await logIn(id, pw)
      // 로그인은 항상 "내 계정 데이터 불러오기". 저장본이 없으면(첫 로그인) 현재 데이터 업로드.
      // → 클라우드를 실수로 덮어쓰는 일이 없어 안전.
      const ts = await pullCloud(u.uid)
      if (ts === null) {
        await pushCloud(u.uid)
        // user 감지 → 게임 화면으로
      } else {
        window.location.reload() // 불러온 데이터 반영
      }
    } catch (e) {
      setErr(e instanceof AuthError ? e.message : '로그인에 실패했어요.')
      setBusy(false)
    }
  }

  return (
    <div className="lobby">
      <div className="lobby-card">
        <div className="lobby-emoji">🐣</div>
        <h1 className="lobby-title">오피스 펫</h1>
        <p className="lobby-tagline">책상 서랍 속에서 몰래 키우는 내 단짝</p>

        {firebaseReady ? (
          <>
            <input
              className="lobby-input"
              type="text"
              placeholder="아이디 (영문/숫자)"
              autoComplete="username"
              value={id}
              onChange={(e) => setId(e.target.value)}
              disabled={busy}
            />
            <input
              className="lobby-input"
              type="password"
              placeholder="비밀번호 (6자 이상)"
              autoComplete="current-password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              disabled={busy}
              onKeyDown={(e) => { if (e.key === 'Enter') void doLogIn() }}
            />
            {err && <p className="lobby-err">{err}</p>}
            <div className="lobby-btns">
              <button type="button" className="lobby-btn primary" disabled={busy} onClick={doLogIn}>
                로그인
              </button>
              <button type="button" className="lobby-btn" disabled={busy} onClick={doSignUp}>
                회원가입
              </button>
            </div>
            <button type="button" className="lobby-guest" disabled={busy} onClick={onGuest}>
              로그인 없이 둘러보기 ›
            </button>
          </>
        ) : (
          <>
            <p className="lobby-note">
              클라우드 저장이 아직 설정되지 않았어요. 로컬로 바로 시작할 수 있어요.
            </p>
            <button type="button" className="lobby-btn primary" onClick={onGuest}>
              시작하기
            </button>
          </>
        )}
      </div>
    </div>
  )
}
