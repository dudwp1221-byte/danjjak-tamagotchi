import { useEffect, useState } from 'react'
import type { Pet } from '../../types/pet'
import { buildShareCard, dataUrlToFile } from '../../utils/shareCard'
import Modal from '../../components/Modal'
import './share-card.css'

interface ShareCardProps {
  pet: Pet
  level: number
  stageLabel: string
  days: number
  score: number
  onClose: () => void
}

export default function ShareCard({
  pet,
  level,
  stageLabel,
  days,
  score,
  onClose,
}: ShareCardProps) {
  const [card, setCard] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    let alive = true
    buildShareCard(pet, { level, stageLabel, days, score }).then((url) => {
      if (alive) setCard(url)
    })
    return () => {
      alive = false
    }
  }, [pet, level, stageLabel, days, score])

  const filename = `${pet.name}_단짝다마고치.png`

  const handleDownload = () => {
    if (!card) return
    const a = document.createElement('a')
    a.href = card
    a.download = filename
    a.click()
  }

  const handleShare = async () => {
    if (!card) return
    const file = dataUrlToFile(card, filename)
    const nav = navigator as Navigator & {
      canShare?: (data: { files: File[] }) => boolean
    }
    if (file && nav.share && nav.canShare?.({ files: [file] })) {
      try {
        await nav.share({
          files: [file],
          title: '단짝 다마고치',
          text: `${pet.name}를 자랑합니다! 🐣`,
        })
      } catch {
        /* 사용자가 취소 */
      }
    } else {
      handleDownload()
      setMsg('이미지를 저장했어요! 메신저에 공유해 보세요.')
    }
  }

  return (
    <Modal title="📸 펫 자랑하기" onClose={onClose}>
      <div className="share-preview">
        {card ? (
          <img src={card} alt="펫 자랑 카드" className="share-img" />
        ) : (
          <p className="share-loading">카드 만드는 중…</p>
        )}
      </div>
      <div className="share-btns">
        <button type="button" className="share-btn primary" onClick={handleShare}>
          📤 공유하기
        </button>
        <button type="button" className="share-btn" onClick={handleDownload}>
          💾 이미지 저장
        </button>
      </div>
      {msg && <p className="share-msg">{msg}</p>}
    </Modal>
  )
}
