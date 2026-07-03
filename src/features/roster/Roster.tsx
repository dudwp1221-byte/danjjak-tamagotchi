import { useState } from 'react'
import type { Pet } from '../../types/pet'
import { levelFromXp, stageFromLevel } from '../../utils/progression'
import { formById, tierName } from '../../utils/species'
import { loadGraduates } from '../../utils/storage'
import { petSpriteUrl, displaySpecies } from '../../utils/pet'
import PetAvatar from '../../components/PetAvatar'
import Modal from '../../components/Modal'
import './roster.css'

interface RosterProps {
  pets: Pet[]
  activeId: string
  onSwitch: (id: string) => void
  onDelete: (id: string) => void
  onAddNew: () => void
  onClose: () => void
}

export default function Roster({
  pets,
  activeId,
  onSwitch,
  onDelete,
  onAddNew,
  onClose,
}: RosterProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const graduates = loadGraduates()

  return (
    <Modal
      title="👪 우리 식구"
      onClose={onClose}
      headerExtra={<span className="ros-count">{pets.length}마리</span>}
    >
      <div className="ros-list">
        {pets.map((p) => {
          const level = levelFromXp(p.growth)
          const form = formById(p.form)
          const isActive = p.id === activeId
          return (
            <div key={p.id} className={'ros-card' + (isActive ? ' active' : '')}>
              <PetAvatar
                imageDataUrl={petSpriteUrl(p)}
                stats={p.stats}
                stage={stageFromLevel(level)}
                accessory={p.accessory}
                species={displaySpecies(p)}
                stageIndex={form.tier}
                size={56}
                animate={false}
                showOverlays={false}
                alt={p.name}
              />
              <div className="ros-info">
                <span className="ros-name">
                  {form.emoji} {p.name}
                </span>
                <span className="ros-sub">
                  {tierName(form.tier)} · {form.name} · Lv.{level}
                </span>
              </div>
              {confirmId === p.id ? (
                <div className="ros-confirm">
                  <button
                    type="button"
                    className="ros-del-yes"
                    onClick={() => {
                      onDelete(p.id)
                      setConfirmId(null)
                    }}
                  >
                    삭제
                  </button>
                  <button
                    type="button"
                    className="ros-del-no"
                    onClick={() => setConfirmId(null)}
                  >
                    취소
                  </button>
                </div>
              ) : (
                <div className="ros-actions">
                  {isActive ? (
                    <span className="ros-current">현재</span>
                  ) : (
                    <button
                      type="button"
                      className="ros-switch"
                      onClick={() => onSwitch(p.id)}
                    >
                      돌보기
                    </button>
                  )}
                  <button
                    type="button"
                    className="ros-del"
                    onClick={() => setConfirmId(p.id)}
                    aria-label="삭제"
                    title="떠나보내기"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button type="button" className="ros-add" onClick={onAddNew}>
        ➕ 새 펫 그리기
      </button>

      {graduates.length > 0 && (
        <div className="ros-grads">
          <p className="ros-grads-label">🎓 졸업생 (명예의 전당)</p>
          {graduates.map((g, i) => {
            const f = formById(g.species)
            return (
              <div key={i} className="ros-grad">
                <span>{f.emoji}</span>
                <span className="ros-grad-name">{g.name}</span>
                <span className="ros-grad-sub">
                  {f.name} · Lv.{g.level}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </Modal>
  )
}
