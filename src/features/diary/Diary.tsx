import type { Pet } from '../../types/pet'
import { personalityDef } from '../../utils/personality'
import { daysTogether } from '../../utils/pet'
import { pickHighlights } from '../../utils/graduation'
import { bondStage, nextBondStage } from '../../utils/bond'
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

function formatDay(at: number): string {
  const d = new Date(at)
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export default function Diary({ pet, onClose, onWriteAi, writing, canWriteAi }: DiaryProps) {
  const p = personalityDef(pet.personality)
  const bond = bondStage(pet.bond)
  const nextBond = nextBondStage(pet.bond)
  // 추억 앨범 — 기록이 어느 정도 쌓였을 때만 (적으면 전체 목록과 중복)
  const highlights = pet.diary.length >= 5 ? pickHighlights(pet.diary, 8) : []

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
        <span className="diary-bond" title="선물·매일 만남·기념일로 깊어져요">
          {bond.emoji} {bond.name}
          {nextBond && (
            <span className="diary-bond-next">
              {' '}· 다음 「{nextBond.name}」까지 💞{nextBond.min - pet.bond}
            </span>
          )}
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

      {highlights.length > 0 && (
        <div className="diary-hl">
          <p className="diary-section-label">✨ 추억 앨범 — 함께한 여정</p>
          <div className="diary-hl-strip">
            {highlights.map((e, i) => (
              <div key={i} className="diary-hl-card">
                <span className="diary-hl-icon">{e.icon}</span>
                <span className="diary-hl-text">{e.text}</span>
                <span className="diary-hl-date">{formatDay(e.at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {pet.diary.length === 0 ? (
        <p className="diary-empty">아직 기록이 없어요. 함께 추억을 쌓아봐요!</p>
      ) : (
        <>
        {highlights.length > 0 && <p className="diary-section-label">📖 전체 기록</p>}
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
        </>
      )}
    </Modal>
  )
}
