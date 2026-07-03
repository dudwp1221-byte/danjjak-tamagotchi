import type { Pet } from '../../types/pet'
import { ACHIEVEMENTS } from '../../utils/achievements'
import Modal from '../../components/Modal'
import './achievements.css'

interface AchievementsProps {
  pet: Pet
  onClose: () => void
}

export default function Achievements({ pet, onClose }: AchievementsProps) {
  const unlocked = new Set(pet.achievements)
  const count = unlocked.size

  return (
    <Modal
      title="🏆 업적"
      onClose={onClose}
      headerExtra={
        <span className="ach-count">
          {count}/{ACHIEVEMENTS.length}
        </span>
      }
    >
      <div className="ach-grid">
        {ACHIEVEMENTS.map((a) => {
          const got = unlocked.has(a.id)
          return (
            <div key={a.id} className={'ach-card' + (got ? ' got' : ' locked')}>
              <span className="ach-emoji">{got ? a.emoji : '🔒'}</span>
              <span className="ach-name">{a.name}</span>
              <span className="ach-desc">{a.desc}</span>
            </div>
          )
        })}
      </div>
    </Modal>
  )
}
