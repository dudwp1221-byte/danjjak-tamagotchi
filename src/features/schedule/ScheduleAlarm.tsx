import type { Schedule } from '../../types/pet'
import './schedule.css'

const PET_MSGS = [
  '잊지 않았죠? 제가 기억해뒀어요! 🐾',
  '시간이 됐어요! 빨리 확인해요~',
  '딩동! 일정 시간이에요!',
  '펫이 알려드려요 — 지금이에요!',
]

interface Props {
  schedule: Schedule
  petName: string
  onDismiss: () => void
}

export default function ScheduleAlarm({ schedule, petName, onDismiss }: Props) {
  const msg = PET_MSGS[Math.floor(schedule.id.charCodeAt(0) % PET_MSGS.length)]

  return (
    <div className="sch-alarm-backdrop" onClick={onDismiss}>
      <div
        className="sch-alarm-card"
        role="alertdialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sch-alarm-icon">⏰</div>
        <p className="sch-alarm-label">{petName}의 알람</p>
        <h2 className="sch-alarm-title">{schedule.title}</h2>
        <p className="sch-alarm-pet-msg">{msg}</p>
        <button type="button" className="sch-alarm-dismiss" onClick={onDismiss}>
          확인했어요!
        </button>
      </div>
    </div>
  )
}
