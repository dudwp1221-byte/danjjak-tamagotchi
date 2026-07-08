import { useEffect, useState } from 'react'
import {
  loadFocus,
  activeFocusSession,
  startFocusSession,
  abortFocusSession,
  isFocusDue,
  canStartFocus,
  FOCUS_DAILY_CAP,
  FOCUS_SESSION_MIN,
  FOCUS_COMPLETE_XP,
} from '../../utils/focus'
import Modal from '../../components/Modal'
import './pomodoro.css'

interface PomodoroTimerProps {
  petName: string
  onClose: () => void
  /** '업무 완료' — 60분을 채운 세션의 보상 수령 (PetGame이 XP+피로를 적용) */
  onClaim: () => void
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
 * 60분을 채우면 '업무 완료' 버튼으로 대량 XP를 받는다 (하루 3번). 스트릭·버프 없음.
 */
export default function PomodoroTimer({ petName, onClose, onClaim, isElectron = false }: PomodoroTimerProps) {
  const [, tick] = useState(0)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    const id = window.setInterval(() => tick((n) => n + 1), 1000)
    return () => window.clearInterval(id)
  }, [])

  const focus = loadFocus()
  const session = activeFocusSession()
  const due = isFocusDue()
  const remaining = session ? Math.max(0, Math.ceil((session.endsAt - Date.now()) / 1000)) : 0
  const capped = !canStartFocus()

  const phase: 'work' | 'done' | 'ready' = session ? (due ? 'done' : 'work') : 'ready'
  const total = FOCUS_SESSION_MIN * 60
  const ratio = phase === 'work' ? 1 - remaining / total : phase === 'done' ? 1 : 0
  const circumference = 2 * Math.PI * 54

  const start = () => {
    if (capped || session) return
    startFocusSession()
    setMsg(WORK_MSGS[Math.floor(Math.random() * WORK_MSGS.length)])
    tick((n) => n + 1)
  }

  const stop = () => {
    abortFocusSession()
    setMsg('중단했어요 — 보상은 없어요 🥲 (하루 횟수는 안 깎여요)')
    tick((n) => n + 1)
  }

  const claim = () => {
    onClaim() // PetGame이 대량 XP + 피로 적용 후 세션 제거
    setMsg('수고했어요! 대량 경험치를 받았어요 🎉')
    tick((n) => n + 1)
  }

  return (
    <Modal title="🍅 집중 타이머" onClose={onClose}>
      <div className="pomo-wrap">
        {/* 오늘 진행 현황 — 세션 도장 (하루 3번) */}
        <div className="pomo-status">
          <div className="pomo-stamps" title={`오늘 ${focus.completed}/${FOCUS_DAILY_CAP}번 완료`}>
            {Array.from({ length: FOCUS_DAILY_CAP }, (_, i) => (
              <span key={i} className={'pomo-stamp' + (i < focus.completed ? ' done' : '')}>
                🍅
              </span>
            ))}
          </div>
          <span className="pomo-buff" title="집중 완료 보상">
            완료 시 +{FOCUS_COMPLETE_XP} XP
          </span>
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
              {phase === 'work' && '집중 모드'}
              {phase === 'done' && '완료! 🎉'}
            </p>
          </div>
        </div>

        <p className="pomo-pet-msg">
          <strong>{petName}</strong>:{' '}
          {phase === 'done'
            ? '60분 다 했어요! "업무 완료"를 눌러줘요 🎁'
            : msg ?? (phase === 'work' ? '집중하는 중이에요…' : '오늘도 60분, 같이 달려볼까요?')}
        </p>

        <div className="pomo-btns">
          {phase === 'ready' && (
            <button type="button" className="pomo-btn pomo-btn--start" onClick={start} disabled={capped}>
              {capped ? '오늘 3번 다 했어요 🌙' : '시작하기'}
            </button>
          )}
          {phase === 'work' && (
            <button type="button" className="pomo-btn pomo-btn--stop" onClick={stop}>
              중단하기
            </button>
          )}
          {phase === 'done' && (
            <button type="button" className="pomo-btn pomo-btn--start" onClick={claim}>
              ✅ 업무 완료 — 보상 받기 🎉
            </button>
          )}
        </div>

        {/* 규칙 안내 — 한 줄씩, 쉽게 */}
        <div className="pomo-rules">
          <p>🔥 집중 타이머를 켠 동안에만 “집중 모드”예요 (평소 일은 “업무 중”)</p>
          <p>🎁 60분을 채우고 <b>업무 완료</b>를 누르면 → <b>대량 경험치 +{FOCUS_COMPLETE_XP} XP</b></p>
          <p>😮‍💨 대신 열심히 일해서 건강·기운·포만도가 조금 내려가요 — 완료 후 잘 챙겨주세요</p>
          <p>📅 하루 {FOCUS_DAILY_CAP}번까지 (연속·스트릭 같은 건 없어요)</p>
          <p>🚪 이 창을 닫아도 타이머는 계속 돌아가요 — “중단하기”를 눌러야만 취소돼요</p>
          {isElectron && <p>💻 3분 넘게 자리를 비우면 실패로 끝나요</p>}
          {capped && <p className="pomo-capped">오늘 몫은 다 채웠어요 — 내일 이어서! 🌙</p>}
        </div>
      </div>
    </Modal>
  )
}
