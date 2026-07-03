import { useEffect, useRef, useState } from 'react'
import { AmbientPlayer as Player, AMBIENT_META, nextAmbient, type AmbientType } from '../../utils/ambient-sound'
import './ambient.css'

export default function AmbientPlayer() {
  const playerRef = useRef(new Player())
  const [current, setCurrent] = useState<AmbientType | null>(null)
  const [vol, setVol] = useState(0.35)

  useEffect(() => () => playerRef.current.stop(), [])

  const toggle = () => {
    const next = nextAmbient(current)
    if (next) {
      playerRef.current.play(next)
    } else {
      playerRef.current.stop()
    }
    setCurrent(next)
  }

  const handleVol = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value)
    setVol(v)
    playerRef.current.setVolume(v)
  }

  const meta = current ? AMBIENT_META[current] : null

  return (
    <div className={`amb-wrap${current ? ' amb-playing' : ''}`}>
      <button
        type="button"
        className="amb-btn"
        onClick={toggle}
        title={meta ? `${meta.label} 재생 중 — 클릭해서 변경` : '힐링 BGM 켜기'}
      >
        {meta ? `${meta.emoji} ${meta.label}` : '🎵 BGM'}
      </button>
      {current && (
        <input
          type="range"
          className="amb-vol"
          min={0}
          max={1}
          step={0.05}
          value={vol}
          onChange={handleVol}
          title="볼륨"
          aria-label="볼륨"
        />
      )}
    </div>
  )
}
