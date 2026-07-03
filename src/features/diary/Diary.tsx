import type { Pet } from '../../types/pet'
import { personalityDef } from '../../utils/personality'
import { daysTogether } from '../../utils/pet'
import Modal from '../../components/Modal'
import './diary.css'

interface DiaryProps {
  pet: Pet
  onClose: () => void
  /** AI로 오늘 일기 쓰기 (API 키 있을 때만 활성) */
  onWriteAi?: () => void
  /** 일기 작성 중 */
  writing?: boolean
  /** AI 일기 사용 가능(API 키 보유) 여부 */
  canWriteAi?: boolean
}

function formatDate(at: number): string {
  const d = new Date(at)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${mm}.${dd} ${hh}:${mi}`
}

export default function Diary({ pet, onClose, onWriteAi, writing, canWriteAi }: DiaryProps) {
  const p = personalityDef(pet.personality)

  return (
    <Modal title="📖 단짝 일기" onClose={onClose}>
      <div className="diary-profile">
        <span className="diary-person">
          {p.emoji} {p.name}
        </span>
        <span className="diary-person-desc">{p.desc}</span>
        <span className="diary-days">
          {pet.ownerName}님과 함께한 지 {daysTogether(pet.createdAt)}일째
        </span>
      </div>

      {onWriteAi && (
        <button
          type="button"
          className="diary-ai-btn"
          disabled={writing || !canWriteAi}
          onClick={onWriteAi}
          title={canWriteAi ? '오늘 하루를 펫 시점으로 기록' : '설정에서 API 키를 먼저 입력해주세요'}
        >
          {writing ? '✍️ 쓰는 중...' : '✍️ AI로 오늘 일기 쓰기'}
        </button>
      )}

      {pet.diary.length === 0 ? (
        <p className="diary-empty">아직 기록이 없어요. 함께 추억을 쌓아봐요!</p>
      ) : (
        <ul className="diary-list">
          {pet.diary.map((e, i) => (
            <li key={i} className="diary-entry">
              <span className="diary-icon">{e.icon}</span>
              <div className="diary-content">
                <span className="diary-text">{e.text}</span>
                <span className="diary-time">{formatDate(e.at)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}
