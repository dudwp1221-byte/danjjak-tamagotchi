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
const LAST = 3
// 각 장면 자동 진행 시간(ms). 마지막 장면은 멈춤.
const DURATIONS = [5500, 5000, 5500]

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

  // 장면별 효과음
  useEffect(() => {
    if (step === 2 && !beeped.current) {
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

      {/* 장면 0 — 늦은 밤 사무실 */}
      {step === 0 && (
        <div className="intro-scene" key="s0">
          <p className="intro-clock">오후 11 : 47</p>
          <p className="intro-place">· 모두가 퇴근한 사무실 ·</p>
          <p className="intro-line intro-l1">또, 야근이네요.</p>
          <p className="intro-line intro-l2">모니터 불빛만 조용히 깜빡이는 밤 —</p>
        </div>
      )}

      {/* 장면 1 — 위로 */}
      {step === 1 && (
        <div className="intro-scene" key="s1">
          <p className="intro-line intro-l1">오늘 하루도 버텨내느라,</p>
          <p className="intro-line intro-l2 intro-big">정말 수고 많았어요.</p>
        </div>
      )}

      {/* 장면 2 — 향수 */}
      {step === 2 && (
        <div className="intro-scene" key="s2">
          <p className="intro-line intro-l1">문득, 떠오르지 않나요?</p>
          <div className="intro-device intro-l2" aria-hidden="true">
            <div className="intro-device-screen">
              <span className="intro-egg">🥚</span>
            </div>
            <div className="intro-device-btns">
              <span />
              <span />
              <span />
            </div>
          </div>
          <p className="intro-line intro-l3">주머니 속에서 삐약대던, 그 작은 친구.</p>
        </div>
      )}

      {/* 장면 3 — 부화 & 타이틀 */}
      {step === LAST && (
        <div className="intro-scene intro-final" key="s3">
          <div className="intro-device is-hatch" aria-hidden="true">
            <div className="intro-glow" />
            <div className="intro-device-screen">
              <span className="intro-egg">🥚</span>
              <span className="intro-spark intro-spark-a">✦</span>
              <span className="intro-spark intro-spark-b">✧</span>
            </div>
            <div className="intro-device-btns">
              <span />
              <span />
              <span />
            </div>
          </div>
          <h1 className="intro-title">단짝 다마고치</h1>
          <p className="intro-subtitle">이번엔, 책상 서랍 속에서 몰래 키워요</p>
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
        </div>
      )}

      {step < LAST && <p className="intro-tap-hint">탭하여 계속 ›</p>}
    </div>
  )
}
