import UIIcon from '../../components/UIIcon'

interface StatBarProps {
  icon: string
  label: string
  value: number
  /** 전용 아이콘 이름 (public/ui) — 없으면 이모지 */
  iconName?: string
}

/** 위급 임계값 — 이 아래로 떨어지면 경고 표시 */
export const CRITICAL = 25

/** 0~100 스탯을 색상 게이지로 보여준다. */
export default function StatBar({ icon, label, value, iconName }: StatBarProps) {
  const v = Math.round(value)
  const color = v >= 60 ? '#22c55e' : v >= 30 ? '#eab308' : '#ef4444'
  const critical = v < CRITICAL
  return (
    <div className={'stat-bar' + (critical ? ' is-critical' : '')}>
      <span className="stat-icon" aria-hidden="true">
        {iconName ? <UIIcon name={iconName} emoji={icon} /> : icon}
      </span>
      <div className="stat-body">
        <div className="stat-top">
          <span className="stat-label">
            {label}
            {critical && <span className="stat-warn"> ⚠️</span>}
          </span>
          <span className="stat-value">{v}</span>
        </div>
        <div className="stat-track">
          <div
            className="stat-fill"
            style={{ width: `${v}%`, background: color }}
          />
        </div>
      </div>
    </div>
  )
}
