import type { Pet } from '../../types/pet'
import { formById } from '../../utils/species'
import { stageFromLevel } from '../../utils/progression'
import { daysTogether, graduateReward, petSpriteUrl } from '../../utils/pet'
import PetAvatar from '../../components/PetAvatar'
import Modal from '../../components/Modal'
import './graduation.css'

interface GraduationProps {
  pet: Pet
  level: number
  onClose: () => void
  /** 독립 보내기 확정 */
  onGraduate: () => void
}

export default function Graduation({
  pet,
  level,
  onClose,
  onGraduate,
}: GraduationProps) {
  const form = formById(pet.form)
  const reward = graduateReward(level, daysTogether(pet.createdAt))

  return (
    <Modal title="🎓 졸업식" onClose={onClose}>
      <div className="grad-body">
        <PetAvatar
          imageDataUrl={petSpriteUrl(pet)}
          stats={pet.stats}
          stage={stageFromLevel(level)}
          accessory={pet.accessory}
          species={form}
          stageIndex={form.tier}
          size={150}
          alt={pet.name}
        />
        <h3 className="grad-title">{pet.name}, 졸업을 축하해요! 🎉</h3>
        <p className="grad-text">
          {form.emoji} {form.name}까지 무사히 자랐어요.
          <br />
          {pet.ownerName}님과 함께한 <strong>{daysTogether(pet.createdAt)}일</strong>,
          정말 멋진 단짝이었어요.
        </p>
        <p className="grad-note">
          독립을 보내면 {pet.name}는 <strong>명예의 전당</strong>에 영원히 남고,
          새로운 단짝과 다시 시작해요.
        </p>
        <p className="grad-reward">
          🎁 졸업 선물: <strong>+{reward}🪙</strong> (남는 단짝에게)
        </p>
        <div className="grad-btns">
          <button type="button" className="grad-yes" onClick={onGraduate}>
            🎓 독립 보내기 (+{reward}🪙)
          </button>
          <button type="button" className="grad-no" onClick={onClose}>
            조금 더 함께할래요
          </button>
        </div>
      </div>
    </Modal>
  )
}
