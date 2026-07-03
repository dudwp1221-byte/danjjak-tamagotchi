import { useEffect, useRef, useState } from 'react'
import Modal from '../../components/Modal'
import './catch-game.css'

const W = 320
const H = 420
const DURATION = 20 // 초
const COIN_CAP = 15 // 한 판 최대 코인
const TREATS = ['🍙', '🍰', '☕', '🍎', '🍪', '🧀', '🍩']

interface FallItem {
  x: number
  y: number
  vy: number
  emoji: string
}

interface CatchGameProps {
  petImageDataUrl: string
  /** 게임 종료 시 보상 (코인, 기분 회복량) */
  onFinish: (coins: number, mood: number) => void
  onClose: () => void
}

type Phase = 'ready' | 'playing' | 'done'

export default function CatchGame({
  petImageDataUrl,
  onFinish,
  onClose,
}: CatchGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [phase, setPhase] = useState<Phase>('ready')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(DURATION)

  // 게임 상태 refs (rAF 루프에서 사용)
  const items = useRef<FallItem[]>([])
  const catcherX = useRef(W / 2)
  const scoreRef = useRef(0)
  const rewardedRef = useRef(false)
  const petImg = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new Image()
    img.src = petImageDataUrl
    img.onload = () => {
      petImg.current = img
    }
  }, [petImageDataUrl])

  const finish = () => {
    if (rewardedRef.current) return
    rewardedRef.current = true
    const coins = Math.min(COIN_CAP, scoreRef.current)
    const mood = Math.min(40, scoreRef.current * 2)
    setPhase('done')
    onFinish(coins, mood)
  }

  useEffect(() => {
    if (phase !== 'playing') return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let raf = 0
    const start = performance.now()
    let lastSpawn = 0

    const catcherW = 64
    const catcherY = H - 60

    const loop = (now: number) => {
      const elapsed = (now - start) / 1000
      const remaining = Math.max(0, DURATION - elapsed)
      setTimeLeft(Math.ceil(remaining))
      if (remaining <= 0) {
        finish()
        return
      }

      // 스폰 (시간이 지날수록 빨라짐)
      const spawnInterval = Math.max(420, 900 - elapsed * 22)
      if (now - lastSpawn > spawnInterval) {
        lastSpawn = now
        items.current.push({
          x: 24 + Math.random() * (W - 48),
          y: -24,
          vy: 2.2 + Math.random() * 1.8 + elapsed * 0.08,
          emoji: TREATS[Math.floor(Math.random() * TREATS.length)],
        })
      }

      // 배경
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#0f1830'
      ctx.fillRect(0, 0, W, H)

      // 아이템 이동 + 충돌
      const kept: FallItem[] = []
      ctx.font = '28px serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (const it of items.current) {
        it.y += it.vy
        // 잡힘 판정
        if (
          it.y >= catcherY - 24 &&
          it.y <= catcherY + 24 &&
          Math.abs(it.x - catcherX.current) < catcherW / 2 + 14
        ) {
          scoreRef.current += 1
          setScore(scoreRef.current)
          continue // 제거
        }
        if (it.y < H + 24) {
          ctx.fillText(it.emoji, it.x, it.y)
          kept.push(it)
        }
      }
      items.current = kept

      // 캐처(펫)
      const cx = catcherX.current
      if (petImg.current) {
        ctx.drawImage(
          petImg.current,
          cx - catcherW / 2,
          catcherY - catcherW / 2,
          catcherW,
          catcherW,
        )
      } else {
        ctx.font = '40px serif'
        ctx.fillText('🧺', cx, catcherY)
      }

      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const movePointer = (clientX: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * W
    catcherX.current = Math.max(20, Math.min(W - 20, x))
  }

  const startGame = () => {
    items.current = []
    scoreRef.current = 0
    rewardedRef.current = false
    setScore(0)
    setTimeLeft(DURATION)
    setPhase('playing')
  }

  return (
    <Modal title="🎮 간식 받기" onClose={onClose}>
      <div className="catch-hud">
        <span>⏱️ {timeLeft}s</span>
        <span>🍙 {score}개</span>
      </div>
      <div className="catch-stage">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="catch-canvas"
          onPointerMove={(e) => movePointer(e.clientX)}
          onPointerDown={(e) => movePointer(e.clientX)}
        />
        {phase === 'ready' && (
          <div className="catch-overlay">
            <p>펫을 움직여 떨어지는 간식을 받아요!</p>
            <p className="catch-sub">마우스/손가락으로 좌우 이동 · {DURATION}초</p>
            <button type="button" className="catch-btn" onClick={startGame}>
              시작!
            </button>
          </div>
        )}
        {phase === 'done' && (
          <div className="catch-overlay">
            <p className="catch-result">🍙 {score}개 받았어요!</p>
            <p className="catch-sub">
              +{Math.min(COIN_CAP, score)}🪙 · 기분 +{Math.min(40, score * 2)}
            </p>
            <div className="catch-done-btns">
              <button type="button" className="catch-btn" onClick={startGame}>
                다시
              </button>
              <button type="button" className="catch-btn ghost" onClick={onClose}>
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
