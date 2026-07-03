import type { Pet } from '../../types/pet'
import { DAILY_MISSIONS } from '../../utils/missions'
import { todayIndex } from '../../utils/pet'
import Modal from '../../components/Modal'
import './missions.css'

interface MissionsProps {
  pet: Pet
  onClose: () => void
  /** 미션 보상 수령 */
  onClaim: (id: string) => void
}

export default function Missions({ pet, onClose, onClaim }: MissionsProps) {
  // 날짜가 지났으면 진행도/수령은 초기화된 것으로 표시
  const fresh = pet.missions.day === todayIndex()
  const progress = fresh ? pet.missions.progress : {}
  const claimed = fresh ? pet.missions.claimed : []

  const doneCount = DAILY_MISSIONS.filter((m) =>
    claimed.includes(m.id),
  ).length

  return (
    <Modal
      title="🎯 오늘의 미션"
      onClose={onClose}
      headerExtra={
        <span className="mis-count">
          {doneCount}/{DAILY_MISSIONS.length}
        </span>
      }
    >
      <div className="mis-list">
        {DAILY_MISSIONS.map((m) => {
          const cur = Math.min(progress[m.id] ?? 0, m.goal)
          const isDone = cur >= m.goal
          const isClaimed = claimed.includes(m.id)
          return (
            <div key={m.id} className="mis-item">
              <span className="mis-icon">{m.icon}</span>
              <div className="mis-info">
                <span className="mis-text">{m.text}</span>
                <div className="mis-bar">
                  <div
                    className="mis-bar-fill"
                    style={{ width: `${(cur / m.goal) * 100}%` }}
                  />
                </div>
                <span className="mis-prog">
                  {cur}/{m.goal}
                </span>
              </div>
              <button
                type="button"
                className={
                  'mis-claim' +
                  (isClaimed ? ' claimed' : isDone ? ' ready' : ' locked')
                }
                disabled={!isDone || isClaimed}
                onClick={() => onClaim(m.id)}
              >
                {isClaimed ? '완료 ✓' : `🪙 ${m.reward}`}
              </button>
            </div>
          )
        })}
      </div>
      <p className="mis-hint">미션은 매일 자정에 새로 갱신돼요.</p>
    </Modal>
  )
}
