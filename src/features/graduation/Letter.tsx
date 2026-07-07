import type { Letter } from '../../utils/letters'
import { graduateForm } from '../../utils/graduation'
import Modal from '../../components/Modal'
import './graduation.css'

interface LetterProps {
  letter: Letter
  ownerName: string
  /** 간직하기 — 일기에 기록하고 닫는다 */
  onKeep: () => void
}

/** 졸업한 단짝에게서 온 편지 */
export default function LetterModal({ letter, ownerName, onKeep }: LetterProps) {
  const form = graduateForm(letter.from)
  // 닉네임을 안 정한 게스트는 "익명님께"가 어색하니 "주인님께"로
  const to = !ownerName || ownerName === '익명' ? '주인님' : `${ownerName}님`
  return (
    <Modal title="💌 편지가 왔어요" onClose={onKeep}>
      <div className="grad-letter">
        <div className="grad-letter-head">
          {form ? (
            <img className="grad-letter-thumb" src={`/sprites/${form.id}.png`} alt="" />
          ) : (
            <span className="grad-letter-thumb-emoji">🎓</span>
          )}
          <span className="grad-letter-from">
            졸업한 <strong>{letter.from.name}</strong>에게서
          </span>
        </div>
        <div className="grad-letter-paper">
          <p className="grad-letter-body">
            {to}께.
            <br />
            <br />
            {letter.body}
            <br />
            <br />
            {letter.closing}
          </p>
          <p className="grad-letter-sign">— {letter.from.name} 올림 💌</p>
        </div>
        <button type="button" className="grad-yes" onClick={onKeep}>
          소중히 간직하기
        </button>
      </div>
    </Modal>
  )
}
