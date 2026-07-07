import { useEffect, useRef, useState } from 'react'
import {
  loadFocus,
  focusBuffInfo,
  activeFocusSession,
  startFocusSession,
  abortFocusSession,
  FOCUS_DAILY_CAP,
  FOCUS_SESSION_MIN,
} from '../../utils/focus'
import Modal from '../../components/Modal'
import './pomodoro.css'

interface PomodoroTimerProps {
  petName: string
  onClose: () => void
  /** 데스크톱(Electron)에서만 자리 비움 자동 실패가 있음 — 안내 문구용 */
  isElectron?: boolean
}

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

/**
 * 집중 타이머 — 세션은 localStorage에 저장되어 이 창을 닫아도 계속 돈다.
 * 완료 보상·자리 비움 판정은 PetGame이 상시 처리하고, 이 컴포넌트는 보기/시작/중단만 담당.
 */
export default function PomodoroTimer({ petName, onClose, isElectron = false }: PomodoroTimerProps) {
  const [, tick] = useState(0)
  const [msg, setMsg] = useState<string | null>(null)
  // 열려 있는 동안 세션이 자연 종료되면 "완주" 화면을 보여주기 위한 추적
  const hadSession = useRef(!!activeFocusSession())
  const [justDone, setJustDone] = useState(false)

  useEffect(() => {
    const id = window.setInterval(() => {
      const s = activeFocusSession()
      if (hadSession.current && !s) setJustDone(true)
      hadSession.current = !!s
      tick((n) => n + 1)
    }, 1000)
    return () => window.clearInterval(id)
  }, [])

  const focus = loadFocus()
  const buff = focusBuffInfo()
  const session = activeFocusSession()
  const remaining = session ? Math.max(0, Math.ceil((session.endsAt - Date.now()) / 1000)) : 0
  const capped = focus.completed >= FOCUS_DAILY_CAP

  const phase: 'work' | 'done' | 'ready' = session ? 'work' : justDone ? 'done' : 'ready'
  const total = FOCUS_SESSION_MIN * 60
  const ratio = phase === 'work' ? 1 - remaining / total : phase === 'done' ? 1 : 0
  const circumference = 2 * Math.PI * 54

  const start = () => {
    startFocusSession()
    hadSession.current = true
    setJustDone(false)
    setMsg(WORK_MSGS[Math.floor(Math.random() * WORK_MSGS.length)])
    tick((n) => n + 1)
  }

  const stop = () => {
    abortFocusSession()
    hadSession.current = false
    setJustDone(false)
    setMsg('중단했어요 — 보상 없이 연속 기록이 끊겼어요 🥲')
    tick((n) => n + 1)
  }

  return (
    <Modal title="🍅 집중 타이머" onClose={onClose}>
      <div className="pomo-wrap">
        {/* 오늘 진행 현황 — 세션 도장 + 스트릭 + 버프 */}
        <div className="pomo-status">
          <div className="pomo-stamps" title={`오늘 ${focus.completed}/${FOCUS_DAILY_CAP}번 성공`}>
            {Array.from({ length: FOCUS_DAILY_CAP }, (_, i) => (
              <span key={i} className={'pomo-stamp' + (i < focus.completed ? ' done' : '')}>
                🍅
              </span>
            ))}
          </div>
          {focus.streak > 1 && <span className="pomo-streak">🔥 {focus.streak}연속</span>}
          {buff && (
            <span className="pomo-buff" title="집중 버프 — 그동안 펫이 더 빨리 자라요">
              ⚡ {buff.mult}배 성장 · {buff.remainMin}분
            </span>
          )}
        </div>

        <div className={`pomo-ring pomo-ring--${phase}`}>
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
            <p className="pomo-time">{phase === 'work' ? fmt(remaining) : READY_LABEL}</p>
            <p className="pomo-phase-label">
              {phase === 'ready' && '준비'}
              {phase === 'work' && '집중 중'}
              {phase === 'done' && '완주! 🎉'}
            </p>
          </div>
        </div>

        <p className="pomo-pet-msg">
          <strong>{petName}</strong>:{' '}
          {phase === 'done'
            ? '해냈어! 잠깐 쉬었다 와요 ☕'
            : msg ?? (phase === 'work' ? '집중하는 중이에요…' : '오늘도 1시간, 같이 달려볼까요?')}
        </p>

        <div className="pomo-btns">
          {phase !== 'work' && (
            <button type="button" className="pomo-btn pomo-btn--start" onClick={start}>
              {phase === 'done' ? '한 번 더 🔥' : '시작하기'}
            </button>
          )}
          {phase === 'work' && (
            <button type="button" className="pomo-btn pomo-btn--stop" onClick={stop}>
              중단하기
            </button>
          )}
        </div>

        {/* 규칙 안내 — 한 줄씩, 쉽게 */}
        <div className="pomo-rules">
          <p>⏰ 1시간을 채우면 → 보너스 XP를 받고, 그 후 1시간 동안 펫이 훨씬 빨리 자라요</p>
          <p>🔥 연속으로 성공하면 성장 속도가 더 세져요 (하루 {FOCUS_DAILY_CAP}번, 다 채우면 선물 🎁)</p>
          <p>🚪 이 창을 닫아도 타이머는 계속 돌아가요 — "중단하기"를 눌러야만 취소돼요</p>
          {isElectron && <p>💻 3분 넘게 자리를 비우면 실패로 끝나요</p>}
          {capped && <p className="pomo-capped">오늘 몫은 다 채웠어요 — 내일 이어서! 🌙</p>}
        </div>
      </div>
    </Modal>
  )
}
