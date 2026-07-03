import { useRef, useState } from 'react'
import Modal from '../../components/Modal'
import './rps.css'

type Hand = 'rock' | 'paper' | 'scissors'
type Result = 'win' | 'lose' | 'draw'

const HANDS: { key: Hand; emoji: string; label: string }[] = [
  { key: 'rock', emoji: '✊', label: '바위' },
  { key: 'paper', emoji: '✋', label: '보' },
  { key: 'scissors', emoji: '✌️', label: '가위' },
]

const EMOJI: Record<Hand, string> = {
  rock: '✊',
  paper: '✋',
  scissors: '✌️',
}

function judge(player: Hand, pet: Hand): Result {
  if (player === pet) return 'draw'
  if (
    (player === 'rock' && pet === 'scissors') ||
    (player === 'paper' && pet === 'rock') ||
    (player === 'scissors' && pet === 'paper')
  )
    return 'win'
  return 'lose'
}

const WIN_COIN = 3
const DRAW_COIN = 1

interface RPSProps {
  petImageDataUrl: string
  /** 라운드 보상 코인 지급 */
  onReward: (coins: number) => void
  /** 첫 플레이 시 1회 호출 (미션용) */
  onPlayed: () => void
  onClose: () => void
}

export default function RockPaperScissors({
  petImageDataUrl,
  onReward,
  onPlayed,
  onClose,
}: RPSProps) {
  const [playerPick, setPlayerPick] = useState<Hand | null>(null)
  const [petPick, setPetPick] = useState<Hand | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [score, setScore] = useState({ win: 0, lose: 0, draw: 0 })
  const playedOnce = useRef(false)

  const play = (hand: Hand) => {
    const pet = HANDS[Math.floor(Math.random() * 3)].key
    const r = judge(hand, pet)
    setPlayerPick(hand)
    setPetPick(pet)
    setResult(r)
    setScore((s) => ({ ...s, [r]: s[r] + 1 }))
    if (!playedOnce.current) {
      playedOnce.current = true
      onPlayed()
    }
    if (r === 'win') onReward(WIN_COIN)
    else if (r === 'draw') onReward(DRAW_COIN)
  }

  const reset = () => {
    setPlayerPick(null)
    setPetPick(null)
    setResult(null)
  }

  const resultText =
    result === 'win'
      ? `이겼어요! +${WIN_COIN}🪙`
      : result === 'draw'
        ? `비겼어요 +${DRAW_COIN}🪙`
        : '졌어요... 😢'

  return (
    <Modal title="✊ 가위바위보" onClose={onClose}>
      <div className="rps-score">
        <span>{score.win}승</span>
        <span>{score.draw}무</span>
        <span>{score.lose}패</span>
      </div>

      <div className="rps-arena">
        <div className="rps-side">
          <img src={petImageDataUrl} alt="펫" className="rps-pet" />
          <span className="rps-hand">{petPick ? EMOJI[petPick] : '❔'}</span>
        </div>
        <span className="rps-vs">VS</span>
        <div className="rps-side">
          <span className="rps-me">나</span>
          <span className="rps-hand">{playerPick ? EMOJI[playerPick] : '❔'}</span>
        </div>
      </div>

      {result ? (
        <>
          <p
            className={
              'rps-result ' +
              (result === 'win' ? 'win' : result === 'draw' ? 'draw' : 'lose')
            }
          >
            {resultText}
          </p>
          <button type="button" className="rps-again" onClick={reset}>
            다시 하기
          </button>
        </>
      ) : (
        <div className="rps-picks">
          {HANDS.map((h) => (
            <button
              key={h.key}
              type="button"
              className="rps-pick"
              onClick={() => play(h.key)}
            >
              <span className="rps-pick-emoji">{h.emoji}</span>
              {h.label}
            </button>
          ))}
        </div>
      )}
    </Modal>
  )
}
