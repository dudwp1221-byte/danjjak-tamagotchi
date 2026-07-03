import { useState } from 'react'
import type { Schedule } from '../../types/pet'
import './schedule.css'

interface Props {
  schedules: Schedule[]
  onAdd: (title: string, at: number) => void
  onDelete: (id: string) => void
  onClose: () => void
}

function parseScheduleTime(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number)
  const now = new Date()
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0)
  // 이미 지났으면 내일로
  if (target.getTime() <= Date.now()) {
    target.setDate(target.getDate() + 1)
  }
  return target.getTime()
}

function formatAlarmTime(at: number): string {
  const d = new Date(at)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const hh = d.getHours().toString().padStart(2, '0')
  const mm = d.getMinutes().toString().padStart(2, '0')
  return isToday ? `오늘 ${hh}:${mm}` : `내일 ${hh}:${mm}`
}

function timeUntil(at: number): string {
  const diff = at - Date.now()
  if (diff <= 0) return '곧'
  const m = Math.round(diff / 60_000)
  if (m < 60) return `${m}분 후`
  const h = Math.floor(m / 60)
  const rm = m % 60
  return rm ? `${h}시간 ${rm}분 후` : `${h}시간 후`
}

export default function ScheduleManager({ schedules, onAdd, onDelete, onClose }: Props) {
  const [title, setTitle] = useState('')
  const [time, setTime] = useState(() => {
    const d = new Date()
    d.setMinutes(d.getMinutes() + 30)
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  })

  const upcoming = schedules.filter((s) => !s.notified).sort((a, b) => a.at - b.at)
  const done = schedules.filter((s) => s.notified)

  const handleAdd = () => {
    const t = title.trim()
    if (!t || !time) return
    onAdd(t, parseScheduleTime(time))
    setTitle('')
  }

  return (
    <div className="sch-backdrop" onClick={onClose}>
      <div className="sch-panel" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="sch-header">
          <span className="sch-icon">📅</span>
          <h2 className="sch-title">일정 알람</h2>
          <button type="button" className="sch-close" onClick={onClose}>✕</button>
        </div>

        <p className="sch-desc">시간이 되면 펫이 알려줄게요!</p>

        <div className="sch-form">
          <input
            type="text"
            className="sch-input"
            placeholder="일정 이름 (예: 팀 미팅)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            maxLength={30}
          />
          <input
            type="time"
            className="sch-time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
          <button type="button" className="sch-add-btn" onClick={handleAdd} disabled={!title.trim()}>
            추가
          </button>
        </div>

        {upcoming.length > 0 && (
          <div className="sch-section">
            <p className="sch-section-label">⏰ 예정된 일정</p>
            <ul className="sch-list">
              {upcoming.map((s) => (
                <li key={s.id} className="sch-item">
                  <div className="sch-item-info">
                    <span className="sch-item-title">{s.title}</span>
                    <span className="sch-item-time">{formatAlarmTime(s.at)} · {timeUntil(s.at)}</span>
                  </div>
                  <button
                    type="button"
                    className="sch-del-btn"
                    onClick={() => onDelete(s.id)}
                    aria-label="삭제"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {done.length > 0 && (
          <div className="sch-section">
            <p className="sch-section-label sch-done-label">✅ 완료된 일정</p>
            <ul className="sch-list sch-done-list">
              {done.slice(-3).map((s) => (
                <li key={s.id} className="sch-item sch-done">
                  <span className="sch-item-title">{s.title}</span>
                  <button
                    type="button"
                    className="sch-del-btn"
                    onClick={() => onDelete(s.id)}
                    aria-label="삭제"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {upcoming.length === 0 && done.length === 0 && (
          <p className="sch-empty">아직 등록된 일정이 없어요.<br />위에서 추가해보세요!</p>
        )}
      </div>
    </div>
  )
}
