import { useEffect, useRef, useState } from 'react'
import {
  isMuted,
  setMuted,
  playIntroChime,
  playEggHatch,
  playEggBeep,
} from '../../utils/sound'
import './intro.css'

interface IntroProps {
  /** 시작하기를 누르면 펫 만들기로 */
  onStart: () => void
  /** 클라우드 계정(로그인/로그아웃) 패널 열기 */
  onAccount?: () => void
  /** 계정 버튼 라벨 (로그인 상태 반영) */
  accountLabel?: string
}

const SEEN_KEY = 'danjjak.introSeen.v1'
const LAST = 4
// 각 장면 자동 진행 시간(ms). 마지막 장면은 멈춤.
const DURATIONS = [5200, 4600, 5200, 5200]

function prefersReduced(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * 늦은 밤 사무실 → 위로 → 향수(주머니 속 다마고치) → 부화 → 타이틀.
 * 탭으로 빨리 넘기거나 건너뛸 수 있고, 재방문/모션최소 설정이면 곧장 타이틀.
 */
// Electron(데스크톱)에서 실행 중이면 다운로드 버튼 숨김
const isElectronEnv =
  typeof window !== 'undefined' &&
  !!(window as { electronBridge?: unknown }).electronBridge

export default function Intro({ onStart, onAccount, accountLabel }: IntroProps) {
  const skip = prefersReduced() || localStorage.getItem(SEEN_KEY) === '1'
  const [step, setStep] = useState(skip ? LAST : 0)
  const [soundOn, setSoundOn] = useState(!isMuted())
  const beeped = useRef(false)

  // 장면 자동 진행
  useEffect(() => {
    if (step >= LAST) {
      localStorage.setItem(SEEN_KEY, '1')
      return
    }
    const id = window.setTimeout(
      () => setStep((s) => Math.min(LAST, s + 1)),
      DURATIONS[step],
    )
    return () => window.clearTimeout(id)
  }, [step])

  // 장면별 효과음 — 서랍 속 알 발견(3)에서 삐약, 부화(4)에서 해치
  useEffect(() => {
    if (step === 3 && !beeped.current) {
      beeped.current = true
      playEggBeep()
    }
    if (step === LAST) {
      playEggHatch()
      window.setTimeout(() => playIntroChime(), 260)
    }
  }, [step])

  const advance = () => {
    if (step < LAST) setStep((s) => Math.min(LAST, s + 1))
  }

  const skipAll = () => setStep(LAST)

  const toggleSound = () => {
    const next = !soundOn
    setSoundOn(next)
    setMuted(!next)
    if (next) playIntroChime()
  }

  return (
    <div
      className={`intro intro-step-${step}`}
      onClick={advance}
      role="presentation"
    >
      {/* 웹툰 컷 — 장면(transform 애니메이션) 밖 최상위에 깔아야 fixed가 화면 전체를 덮는다 */}
      <div
        key={`cut-${step}`}
        className={`intro-cut intro-cut-${['zoom', 'panup', 'zoomout', 'heartbeat', 'bloom'][step]}`}
        style={{
          backgroundImage: `url('/intro/${['intro_cut1', 'intro_cut1', 'intro_cut2', 'intro_cut3', 'intro_cut4'][step]}.webp')`,
        }}
        aria-hidden="true"
      />
      <div
        className={'intro-text-veil' + (step === LAST ? ' intro-veil-final' : '')}
        aria-hidden="true"
      />
      <div className="intro-vignette" aria-hidden="true" />
      <div className="intro-monitor" aria-hidden="true" />

      <div className="intro-top">
        <button
          type="button"
          className="intro-icon-btn"
          onClick={(e) => {
            e.stopPropagation()
            toggleSound()
          }}
          aria-label={soundOn ? '소리 끄기' : '소리 켜기'}
        >
          {soundOn ? '🔈 소리 켜짐' : '🔇 소리 켜기'}
        </button>
        {step < LAST && (
          <button
            type="button"
            className="intro-icon-btn"
            onClick={(e) => {
              e.stopPropagation()
              skipAll()
            }}
          >
            건너뛰기 ⏭
          </button>
        )}
      </div>

      {/* 장면 0 — 늦은 밤 사무실 (컷1, 느린 줌인) */}
      {step === 0 && (
        <div className="intro-scene" key="s0">
          <p className="intro-clock">오후 11 : 47</p>
          <p className="intro-place">· 모두가 퇴근한 사무실 ·</p>
          <p className="intro-line intro-l1">또, 야근이네요.</p>
          <p className="intro-line intro-l2">모니터 불빛만 조용히 깜빡이는 밤 —</p>
          <p className="intro-line intro-l3">식어버린 커피처럼, 마음도 조금 식어가요.</p>
        </div>
      )}

      {/* 장면 1 — 위로 (컷1 이어서, 위로 팬) */}
      {step === 1 && (
        <div className="intro-scene" key="s1">
          <p className="intro-line intro-l1">오늘 하루도 버텨내느라,</p>
          <p className="intro-line intro-l2 intro-big">정말 수고 많았어요.</p>
          <p className="intro-line intro-l3">아무도 말해주지 않아도 — 알고 있는 친구가 있다면.</p>
        </div>
      )}

      {/* 장면 2 — 향수 (컷2: 손바닥 위 다마고치, 느린 줌아웃) */}
      {step === 2 && (
        <div className="intro-scene" key="s2">
          <p className="intro-line intro-l1">문득, 떠오르지 않나요?</p>
          <p className="intro-line intro-l3 intro-line-bottom">주머니 속에서 삐약대던, 그 작은 친구.</p>
        </div>
      )}

      {/* 장면 3 — 서랍 속 알 (컷3, 두근거리는 줌인) */}
      {step === 3 && (
        <div className="intro-scene" key="s3">
          <p className="intro-line intro-l1">그런데 — 오늘, 서랍 속에서</p>
          <p className="intro-line intro-l2 intro-line-bottom">작은 온기가 반짝이고 있었어요.</p>
        </div>
      )}

      {/* 장면 4 — 부화 & 타이틀 (컷4, 빛 번짐) */}
      {step === LAST && (
        <div className="intro-scene intro-final" key="s4">
          <span className="intro-star intro-star-a" aria-hidden="true">✦</span>
          <span className="intro-star intro-star-b" aria-hidden="true">✧</span>
          <span className="intro-star intro-star-c" aria-hidden="true">✦</span>
          <h1 className="intro-title">단짝 다마고치</h1>
          <p className="intro-subtitle">그 시절의 작은 친구가, 이번엔 당신의 책상 위로 —</p>
          <button
            type="button"
            className="intro-start"
            onClick={(e) => {
              e.stopPropagation()
              onStart()
            }}
          >
            나의 단짝 만나러 가기
          </button>
          {onAccount && (
            <button
              type="button"
              className="intro-account"
              onClick={(e) => {
                e.stopPropagation()
                onAccount()
              }}
            >
              {accountLabel ?? '☁️ 로그인'}
            </button>
          )}
          {/* 웹에서만 — 바탕화면 펫까지 쓰는 데스크톱 앱(Windows) 다운로드. Electron에선 숨김 */}
          {!isElectronEnv && (
            <a
              className="intro-download"
              href="https://github.com/dudwp1221-byte/danjjak-tamagotchi/releases/latest/download/danjjak-windows.zip"
              onClick={(e) => e.stopPropagation()}
            >
              🖥️ Windows 앱 다운로드 <span className="intro-download-sub">(바탕화면 펫)</span>
            </a>
          )}
        </div>
      )}

      {step < LAST && <p className="intro-tap-hint">탭하여 계속 ›</p>}
    </div>
  )
}
