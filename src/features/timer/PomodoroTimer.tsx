import { useCallback, useEffect, useRef, useState } from 'react'
import Modal from '../../components/Modal'
import './pomodoro.css'

interface PomodoroTimerProps {
  petName: string
  onXpReward: (xp: number) => void
  onClose: () => void
}

type Phase = 'ready' | 'work' | 'break' | 'done'

const WORK_SEC = 25 * 60
const BREAK_SEC = 5 * 60

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
  '5분만 쉬자, 잘 했어 🥰',
  '잠깐 눈 감고 쉬어봐 😌',
]
const DONE_MSGS = [
  '해냈어! 최고야 🎉',
  '대단해~ 정말 열심히 했어! 🌟',
  '수고 많았어요! 오늘도 잘 했어 💕',
]

export default function PomodoroTimer({ petName, onXpReward, onClose }: PomodoroTimerProps) {
  const [phase, setPhase] = useState<Phase>('ready')
  const [remaining, setRemaining] = useState(WORK_SEC)
  const [sessions, setSessions] = useState(0)
  const [msg, setMsg] = useState(WORK_MSGS[0])
  const intervalRef = useRef<number | undefined>(undefined)

  const clearTick = () => window.clearInterval(intervalRef.current)

  const startWork = useCallback(() => {
    setPhase('work')
    setRemaining(WORK_SEC)
    setMsg(WORK_MSGS[Math.floor(Math.random() * WORK_MSGS.length)])
    clearTick()
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearTick()
          setPhase('break')
          setRemaining(BREAK_SEC)
          setMsg(BREAK_MSGS[Math.floor(Math.random() * BREAK_MSGS.length)])
          setSessions((s) => s + 1)
          onXpReward(20)
          return BREAK_SEC
        }
        return r - 1
      })
    }, 1000)
  }, [onXpReward])

  // break countdown
  useEffect(() => {
    if (phase !== 'break') return
    clearTick()
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearTick()
          setPhase('done')
          setMsg(DONE_MSGS[Math.floor(Math.random() * DONE_MSGS.length)])
          return 0
        }
        return r - 1
      })
    }, 1000)
    return clearTick
  }, [phase])

  useEffect(() => () => clearTick(), [])

  const total = phase === 'break' ? BREAK_SEC : WORK_SEC
  const ratio = phase === 'ready' ? 0 : 1 - remaining / total
  const circumference = 2 * Math.PI * 54

  return (
    <Modal title="🍅 집중 타이머" onClose={onClose}>
      <div className="pomo-wrap">
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
            <p className="pomo-time">
              {phase === 'ready' ? '25:00' : fmt(remaining)}
            </p>
            <p className="pomo-phase-label">
              {phase === 'ready' && '준비'}
              {phase === 'work' && '집중 중'}
              {phase === 'break' && '휴식'}
              {phase === 'done' && '완료!'}
            </p>
          </div>
        </div>

        <p className="pomo-pet-msg">
          <strong>{petName}</strong>: {msg}
        </p>

        {sessions > 0 && (
          <p className="pomo-sessions">완료 {sessions}세션 · +{sessions * 20} XP</p>
        )}

        <div className="pomo-btns">
          {(phase === 'ready' || phase === 'done') && (
            <button type="button" className="pomo-btn pomo-btn--start" onClick={startWork}>
              {phase === 'done' ? '한 번 더 🔥' : '시작하기'}
            </button>
          )}
          {phase === 'work' && (
            <button type="button" className="pomo-btn pomo-btn--stop" onClick={() => { clearTick(); setPhase('ready'); setRemaining(WORK_SEC) }}>
              중단
            </button>
          )}
          {phase === 'break' && (
            <button type="button" className="pomo-btn pomo-btn--skip" onClick={() => { clearTick(); setPhase('done'); setMsg(DONE_MSGS[0]) }}>
              휴식 건너뛰기
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
