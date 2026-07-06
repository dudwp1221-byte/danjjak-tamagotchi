import type { Graduate } from '../../utils/storage'
import { tierName } from '../../utils/species'
import { personalityDef } from '../../utils/personality'
import { graduateForm } from '../../utils/graduation'
import Modal from '../../components/Modal'
import './graduation.css'

function formatDate(at: number): string {
  const d = new Date(at)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

interface MemorialProps {
  graduate: Graduate
  onClose: () => void
}

/** 명예의 전당 초상 — 졸업생 한 명의 기록을 돌아보는 기념관 */
export default function Memorial({ graduate: g, onClose }: MemorialProps) {
  const form = graduateForm(g)
  const person = g.personality ? personalityDef(g.personality) : null

  return (
    <Modal title="🏛️ 명예의 전당" onClose={onClose}>
      <div className="grad-mem-body">
        <div className="grad-mem-frame">
          {form ? (
            <img className="grad-mem-img" src={`/sprites/${form.id}.png`} alt={g.name} />
          ) : (
            <span className="grad-mem-emoji">🎓</span>
          )}
        </div>
        <h3 className="grad-mem-name">
          {form?.emoji} {g.name}
        </h3>
        <p className="grad-mem-sub">
          {form ? `${tierName(form.tier)} · ${form.name}` : g.species} · Lv.{g.level}
        </p>
        <div className="grad-mem-rows">
          <span className="grad-chip">🎓 {formatDate(g.at)} 졸업</span>
          {g.days != null && <span className="grad-chip">🗓️ 함께한 {g.days}일</span>}
          {g.totalActions != null && <span className="grad-chip">💞 돌봄 {g.totalActions}번</span>}
          {person && (
            <span className="grad-chip">
              {person.emoji} {person.name}
            </span>
          )}
        </div>

        {g.lastWords && (
          <p className="grad-mem-quote">
            <span className="grad-mem-quote-label">{g.name}의 마지막 인사</span>
            “{g.lastWords}”
          </p>
        )}
        {g.farewell && (
          <p className="grad-mem-quote">
            <span className="grad-mem-quote-label">{g.ownerName ?? '주인'}님이 남긴 한마디</span>
            “{g.farewell}”
          </p>
        )}

        {g.highlights && g.highlights.length > 0 && (
          <>
            <p className="grad-mem-memories-label">📖 함께한 날들</p>
            <ul className="grad-memories">
              {g.highlights.map((e, i) => (
                <li key={i} className="grad-memory">
                  <span className="grad-memory-icon">{e.icon}</span>
                  <span className="grad-memory-text">{e.text}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </Modal>
  )
}
