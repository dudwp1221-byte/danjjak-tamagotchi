import { useCallback, useEffect, useRef, useState } from 'react'
import type { WorkMode } from '../../types/pet'
import {
  loadFocus,
  focusBuffInfo,
  completeFocusSession,
  failFocusSession,
  FOCUS_DAILY_CAP,
  FOCUS_SESSION_XP,
  FOCUS_SESSION_MIN,
  FOCUS_BREAK_MIN,
  FOCUS_BUFF_MIN,
  FOCUS_IDLE_FAIL_SEC,
} from '../../utils/focus'
import Modal from '../../components/Modal'
import './pomodoro.css'

interface PomodoroTimerProps {
  petName: string
  /** 완료 보상 지급 (xp, coins) */
  onReward: (xp: number, coins: number, msg: string) => void
  onClose: () => void
  /** Electron 여부 — 자리 비움 자동 실패는 시스템 유휴 감지가 되는 데스크톱에서만 */
  isElectron?: boolean
  /** 현재 업무 모드 (Electron: idle = 자리 비움) */
  workMode?: WorkMode
}

type Phase = 'ready' | 'work' | 'break' | 'done' | 'failed'

const WORK_SEC = FOCUS_SESSION_MIN * 60
const BREAK_SEC = FOCUS_BREAK_MIN * 60
const READY_LABEL = `${String(FOCUS_SESSION_MIN).padStart(2, '0')}:00`

function fmt(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0')
  const s = (sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

const WORK_MSGS = [
  '같이 열심히 하자! 🔥',
  '집중! 나도 응원할게 💪',
  '파이팅! 잘 하고 있어 ✨',
]
const BREAK_MSGS = [
  '수고했어! 잠깐 쉬어요 ☕',
  '10분만 쉬자, 잘 했어 🥰',
  '잠깐 눈 감고 쉬어봐 😌',
]
const DONE_MSGS = [
  '해냈어! 최고야 🎉',
  '대단해~ 정말 열심히 했어! 🌟',
  '수고 많았어요! 오늘도 잘 했어 💕',
]
const FAIL_MSGS = [
  '괜찮아, 다음엔 꼭 완주하자 🥲',
  '집중이 끊겼어… 다시 해볼까? 💪',
]

const pick = (arr: readonly string[]) => arr[Math.floor(Math.random() * arr.length)]

/**
 * 집중 타이머 — 1시간 완주하면 즉시 XP + 1시간 집중 버프(업무·케어 XP 배수).
 * 연속 완주로 버프가 강해지고, 보상은 하루 4세션까지. 중단·자리 비움은 실패.
 * 카운트다운은 목표 시각(timestamp) 기반 — 백그라운드 탭 스로틀링에도 정확하다.
 */
export default function PomodoroTimer({
  petName,
  onReward,
  onClose,
  isElectron = false,
  workMode = 'idle',
}: PomodoroTimerProps) {
  const [phase, setPhase] = useState<Phase>('ready')
  const [remaining, setRemaining] = useState(WORK_SEC)
  const [msg, setMsg] = useState('오늘도 집중해 볼까요?')
  const [, forceTick] = useState(0)
  const intervalRef = useRef<number | undefined>(undefined)
  const endAtRef = useRef(0)
  // Electron: 연속 자리 비움 시간(초) — 임계 넘으면 세션 자동 실패
  const idleSecRef = useRef(0)
  const workModeRef = useRef(workMode)
  workModeRef.current = workMode

  const focus = loadFocus()
  const buff = focusBuffInfo()
  const capped = focus.completed >= FOCUS_DAILY_CAP

  const clearTick = () => window.clearInterval(intervalRef.current)

  const finishWork = useCallback(() => {
    clearTick()
    const r = completeFocusSession()
    if (r.capped) {
      setMsg(`오늘 보상 세션(${FOCUS_DAILY_CAP}개)을 다 채웠어요 — 내일 또 만나요 😊`)
    } else {
      const parts = [`+${r.xp} XP`, `${r.buffMin}분간 XP ×${r.mult}`]
      if (r.coins > 0) parts.push(`+${r.coins}🪙`)
      setMsg(
        r.finisher
          ? `오늘의 집중을 모두 완주했어요! ${pick(DONE_MSGS)}`
          : pick(DONE_MSGS),
      )
      onReward(r.xp, r.coins, `🍅 집중 완주! ${parts.join(' · ')}`)
    }
    setPhase('break')
    endAtRef.current = Date.now() + BREAK_SEC * 1000
    setRemaining(BREAK_SEC)
    window.setTimeout(() => setMsg(pick(BREAK_MSGS)), 3500)
  }, [onReward])
  const finishWorkRef = useRef(finishWork)
  finishWorkRef.current = finishWork

  const failWork = useCallback((reason: string) => {
    clearTick()
    failFocusSession()
    setPhase('failed')
    setRemaining(WORK_SEC)
    setMsg(reason)
  }, [])

  const startWork = useCallback(() => {
    setPhase('work')
    setRemaining(WORK_SEC)
    setMsg(pick(WORK_MSGS))
    idleSecRef.current = 0
    endAtRef.current = Date.now() + WORK_SEC * 1000
    clearTick()
    intervalRef.current = window.setInterval(() => {
      // 자리 비움 감지 (데스크톱 전용) — 3분 연속 유휴면 집중이 끊긴 것
      if (isElectron) {
        if (workModeRef.current === 'idle') {
          idleSecRef.current += 1
          if (idleSecRef.current >= FOCUS_IDLE_FAIL_SEC) {
            failWork('자리를 오래 비워서 집중이 끊겼어요 😢 (스트릭 리셋)')
            return
          }
        } else {
          idleSecRef.current = 0
        }
      }
      const left = Math.ceil((endAtRef.current - Date.now()) / 1000)
      if (left <= 0) {
        finishWorkRef.current()
        return
      }
      setRemaining(left)
    }, 1000)
  }, [isElectron, failWork])

  // 휴식 카운트다운
  useEffect(() => {
    if (phase !== 'break') return
    clearTick()
    intervalRef.current = window.setInterval(() => {
      const left = Math.ceil((endAtRef.current - Date.now()) / 1000)
      if (left <= 0) {
        clearTick()
        setPhase('done')
        setMsg(pick(DONE_MSGS))
        setRemaining(0)
        return
      }
      setRemaining(left)
    }, 1000)
    return clearTick
  }, [phase])

  // 버프 남은 시간 표시 갱신 (분 단위라 30초면 충분)
  useEffect(() => {
    const id = window.setInterval(() => forceTick((n) => n + 1), 30000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => () => clearTick(), [])

  const total = phase === 'break' ? BREAK_SEC : WORK_SEC
  const ratio = phase === 'ready' || phase === 'failed' ? 0 : 1 - remaining / total
  const circumference = 2 * Math.PI * 54

  return (
    <Modal title="🍅 집중 타이머" onClose={onClose}>
      <div className="pomo-wrap">
        {/* 오늘 진행 현황 — 세션 도장 + 스트릭 + 버프 */}
        <div className="pomo-status">
          <div className="pomo-stamps" title={`오늘 ${focus.completed}/${FOCUS_DAILY_CAP} 세션 완주`}>
            {Array.from({ length: FOCUS_DAILY_CAP }, (_, i) => (
              <span key={i} className={'pomo-stamp' + (i < focus.completed ? ' done' : '')}>
                🍅
              </span>
            ))}
          </div>
          {focus.streak > 1 && <span className="pomo-streak">🔥 {focus.streak}연속</span>}
          {buff && (
            <span className="pomo-buff" title="업무·케어 XP에 곱해지는 집중 버프">
              ⚡ XP ×{buff.mult} · {buff.remainMin}분
            </span>
          )}
        </div>

        <div className={`pomo-ring pomo-ring--${phase === 'failed' ? 'ready' : phase}`}>
          <svg viewBox="0 0 120 120" className="pomo-svg">
            <circle cx="60" cy="60" r="54" className="pomo-track" />
            <circle
              cx="60" cy="60" r="54"
              className="pomo-progress"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - ratio)}
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="pomo-inner">
            <p className="pomo-time">
              {phase === 'ready' || phase === 'failed' ? READY_LABEL : fmt(remaining)}
            </p>
            <p className="pomo-phase-label">
              {phase === 'ready' && '준비'}
              {phase === 'work' && '집중 중'}
              {phase === 'break' && '휴식'}
              {phase === 'done' && '완료!'}
              {phase === 'failed' && '다시 도전'}
            </p>
          </div>
        </div>

        <p className="pomo-pet-msg">
          <strong>{petName}</strong>: {phase === 'failed' ? pick(FAIL_MSGS) : msg}
        </p>

        <div className="pomo-btns">
          {(phase === 'ready' || phase === 'done' || phase === 'failed') && (
            <button type="button" className="pomo-btn pomo-btn--start" onClick={startWork}>
              {phase === 'ready' ? '시작하기' : '한 번 더 🔥'}
            </button>
          )}
          {phase === 'work' && (
            <button
              type="button"
              className="pomo-btn pomo-btn--stop"
              onClick={() => failWork('중단했어요 — 보상 없이 스트릭이 끊겼어요')}
            >
              중단 (스트릭 리셋)
            </button>
          )}
          {phase === 'break' && (
            <button
              type="button"
              className="pomo-btn pomo-btn--skip"
              onClick={() => { clearTick(); setPhase('done'); setMsg(pick(DONE_MSGS)) }}
            >
              휴식 건너뛰기
            </button>
          )}
        </div>

        {/* 규칙 안내 */}
        <div className="pomo-rules">
          <p>· 1시간 완주 = +{FOCUS_SESSION_XP} XP + {FOCUS_BUFF_MIN}분간 업무·케어 XP 버프</p>
          <p>· 연속 완주할수록 버프 강화 (×1.5 → ×1.75 → ×2.0)</p>
          <p>· 보상은 하루 {FOCUS_DAILY_CAP}세션 — 다 채우면 보너스 🎁</p>
          <p>
            · 중단하면 스트릭이 끊겨요
            {isElectron ? ' · 3분 이상 자리를 비워도 실패!' : ''}
          </p>
          {capped && <p className="pomo-capped">오늘 보상 세션을 모두 채웠어요 — 내일 이어서! 🌙</p>}
        </div>
      </div>
    </Modal>
  )
}
