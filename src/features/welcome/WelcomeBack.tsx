import { gameClock } from '../../utils/gametime'
import type { SummaryLine } from '../../utils/today-summary'
import './welcome-back.css'

interface WelcomeBackProps {
  petName: string
  awayMs: number
  /** 펫 생성 시각 (게임 시간 경과 계산용) */
  createdAt: number
  /** 자리 비우기 직전 시각 (게임 시간 경과 계산용) */
  beforeMs: number
  moodEmoji: string
  moodLabel: string
  score: number
  /** 오늘 자율 행동 요약 (없으면 표시 안 함) */
  behaviorSummary?: SummaryLine[]
  /** 굿모닝 메시지 (아침 첫 방문 시) */
  morningMsg?: string | null
  onClose: () => void
}

function formatDuration(ms: number): string {
  const m = Math.floor(ms / 60000)
  if (m < 60) return `${m}분`
  const h = Math.floor(m / 60)
  const rm = m % 60
  if (h < 24) return rm ? `${h}시간 ${rm}분` : `${h}시간`
  const d = Math.floor(h / 24)
  const rh = h % 24
  return rh ? `${d}일 ${rh}시간` : `${d}일`
}

export default function WelcomeBack({
  petName,
  awayMs,
  createdAt,
  beforeMs,
  moodEmoji,
  moodLabel,
  score,
  behaviorSummary,
  morningMsg,
  onClose,
}: WelcomeBackProps) {
  const away = formatDuration(awayMs)
  const missed =
    score < 40
      ? `${petName}가 많이 기다렸나 봐요. 얼른 돌봐주세요!`
      : score < 70
        ? `${petName}가 기다리고 있었어요.`
        : `${petName}는 잘 지내고 있었어요!`

  const before = gameClock(createdAt, beforeMs)
  const now = gameClock(createdAt, beforeMs + awayMs)
  const gameDays = now.day - before.day
  const seasonChanged = before.season.key !== now.season.key
  const gamePassed =
    gameDays >= 1
      ? `그 사이 게임 속 ${gameDays}일이 흘렀어요` +
        (seasonChanged ? ` — ${now.season.emoji} ${now.season.name}이 됐어요!` : '')
      : null

  const hasSummary = behaviorSummary && behaviorSummary.length > 0

  return (
    <div className="wb-backdrop" onClick={onClose}>
      <div
        className="wb-card"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="wb-emoji">{moodEmoji}</div>
        <h2 className="wb-title">다녀오셨어요?</h2>
        <p className="wb-away">
          <strong>{away}</strong> 만에 돌아왔어요
        </p>
        {gamePassed && <p className="wb-gametime">🕰️ {gamePassed}</p>}
        {morningMsg
          ? <p className="wb-morning">🌅 {morningMsg}</p>
          : <p className="wb-missed">{missed}</p>
        }

        {hasSummary && (
          <div className="wb-summary">
            <p className="wb-summary-title">그 사이에 {petName}는...</p>
            <ul className="wb-summary-list">
              {behaviorSummary!.map((line, i) => (
                <li key={i} className="wb-summary-item">
                  <span className="wb-summary-emoji">{line.emoji}</span>
                  <span>{line.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="wb-status">
          지금 기분: {moodEmoji} {moodLabel} · 컨디션 {score}점
        </p>
        <button type="button" className="wb-btn" onClick={onClose}>
          돌보러 가기
        </button>
      </div>
    </div>
  )
}
