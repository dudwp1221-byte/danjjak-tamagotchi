import type { BehaviorEvent, BehaviorState } from '../types/pet'

interface StateMeta {
  emoji: string
  singular: string
  plural?: string
  withDur?: boolean
}

const STATE_META: Record<BehaviorState, StateMeta> = {
  sleeping: { emoji: '💤', singular: '낮잠을 잤어요', plural: '낮잠을 %%번 잤어요' },
  eating: { emoji: '🍽️', singular: '혼자 밥을 챙겨 먹었어요', plural: '밥을 %%번 챙겨 먹었어요' },
  reading: { emoji: '📖', singular: '책을 읽었어요', withDur: true },
  playing: { emoji: '🎮', singular: '신나게 놀았어요', withDur: true },
  window_gazing: { emoji: '🌙', singular: '창밖을 바라봤어요', withDur: true },
  wandering: { emoji: '🚶', singular: '돌아다녔어요' },
  idle: { emoji: '😌', singular: '조용히 쉬었어요', withDur: true },
}

function msToText(ms: number): string {
  const m = Math.floor(ms / 60000)
  if (m < 2) return '잠깐'
  if (m < 60) return `${m}분`
  const h = Math.floor(m / 60)
  const rm = m % 60
  return rm ? `${h}시간 ${rm}분` : `약 ${h}시간`
}

export interface SummaryLine {
  emoji: string
  text: string
}

/**
 * 오늘(자정~현재) 또는 최근 24시간의 행동 이력을 읽어
 * 자연스러운 한국어 요약 줄을 최대 3개 반환한다.
 */
export function generateTodaySummary(behaviorLog: BehaviorEvent[]): SummaryLine[] {
  if (behaviorLog.length === 0) return []

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const cutoff = Math.max(todayStart.getTime(), Date.now() - 86400000)

  const events = behaviorLog.filter((e) => e.at >= cutoff)
  if (events.length === 0) return []

  const totals: Partial<Record<BehaviorState, { count: number; totalMs: number }>> = {}
  for (const e of events) {
    if (!totals[e.state]) totals[e.state] = { count: 0, totalMs: 0 }
    totals[e.state]!.count++
    totals[e.state]!.totalMs += e.duration
  }

  const sorted = (
    Object.entries(totals) as [BehaviorState, { count: number; totalMs: number }][]
  )
    .filter(([s]) => s !== 'idle' && s !== 'wandering')
    .sort((a, b) => b[1].totalMs - a[1].totalMs)

  const lines: SummaryLine[] = []
  for (const [state, { count, totalMs }] of sorted.slice(0, 3)) {
    const meta = STATE_META[state]
    const dur = msToText(totalMs)

    let text: string
    if (meta.plural && count > 1) {
      text = meta.plural.replace('%%', String(count))
      if (totalMs > 120000) text += ` (${dur})`
    } else if (meta.withDur && totalMs > 60000) {
      text = `${dur} ${meta.singular}`
    } else {
      text = meta.singular
    }

    lines.push({ emoji: meta.emoji, text })
  }

  return lines
}
