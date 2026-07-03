import { useState } from 'react'
import './mood-check.css'

export interface MoodOption {
  emoji: string
  label: string
  key: string
  petReply: string
}

export const MOOD_OPTIONS: MoodOption[] = [
  {
    key: 'great',
    emoji: '😊',
    label: '좋아요',
    petReply: '오늘 기분 좋구나! 나도 덩달아 기분 좋아져 🥰',
  },
  {
    key: 'okay',
    emoji: '😌',
    label: '평범해요',
    petReply: '그런 날도 있지! 그냥 같이 있어줄게 😊',
  },
  {
    key: 'tired',
    emoji: '😴',
    label: '피곤해요',
    petReply: '많이 힘들었구나... 오늘은 좀 쉬어요 💤',
  },
  {
    key: 'hard',
    emoji: '😔',
    label: '힘들어요',
    petReply: '수고했어요. 나 여기 있을게요 🫶',
  },
  {
    key: 'angry',
    emoji: '😤',
    label: '짜증나요',
    petReply: '그럴 수 있어. 잠깐 같이 숨 고르자 🌬️',
  },
]

const MOOD_KEY = 'dangjjak_mood_today'

export function getTodayMood(): string | null {
  try {
    const raw = localStorage.getItem(MOOD_KEY)
    if (!raw) return null
    const { date, mood } = JSON.parse(raw) as { date: number; mood: string }
    const today = Math.floor(Date.now() / 86400000)
    return date === today ? mood : null
  } catch {
    return null
  }
}

function saveTodayMood(mood: string) {
  localStorage.setItem(
    MOOD_KEY,
    JSON.stringify({ date: Math.floor(Date.now() / 86400000), mood }),
  )
}

interface MoodCheckProps {
  petName: string
  onClose: () => void
}

export default function MoodCheck({ petName, onClose }: MoodCheckProps) {
  const [selected, setSelected] = useState<MoodOption | null>(null)

  const handlePick = (opt: MoodOption) => {
    saveTodayMood(opt.key)
    setSelected(opt)
  }

  return (
    <div className="mc-backdrop" onClick={selected ? onClose : undefined}>
      <div className="mc-card" onClick={(e) => e.stopPropagation()}>
        {!selected ? (
          <>
            <p className="mc-question">오늘 기분 어때요?</p>
            <div className="mc-options">
              {MOOD_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  className="mc-option"
                  onClick={() => handlePick(opt)}
                >
                  <span className="mc-emoji">{opt.emoji}</span>
                  <span className="mc-label">{opt.label}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="mc-pet-name">{petName}</p>
            <p className="mc-reply">{selected.petReply}</p>
            <button type="button" className="mc-btn" onClick={onClose}>
              고마워 💕
            </button>
          </>
        )}
      </div>
    </div>
  )
}
