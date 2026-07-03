import { describe, expect, it } from 'vitest'
import type { WorkToday } from '../types/pet'
import {
  applyWorkTick,
  OVERTIME_DAILY_CAP_MIN,
  WORK_XP_PER_TICK,
} from './work-activity'

const TODAY = 20000

function wt(partial: Partial<WorkToday> = {}): WorkToday {
  return {
    date: TODAY,
    workMinutes: 0,
    focusMinutes: 0,
    meetingMinutes: 0,
    overtimeMinutes: 0,
    ...partial,
  }
}

describe('applyWorkTick', () => {
  it('idle이면 아무것도 지급하지 않는다', () => {
    expect(applyWorkTick(wt(), 'idle', TODAY)).toBeNull()
  })

  it('working 틱은 0.25분 + XP를 적립한다', () => {
    const r = applyWorkTick(wt({ workMinutes: 10 }), 'working', TODAY)!
    expect(r.workToday.workMinutes).toBe(10.25)
    expect(r.workToday.focusMinutes).toBe(0)
    expect(r.xp).toBe(WORK_XP_PER_TICK.working)
    expect(r.profileKey).toBeNull()
  })

  it('focused 틱은 집중 시간과 진화 카운터 키를 함께 반영한다', () => {
    const r = applyWorkTick(wt(), 'focused', TODAY)!
    expect(r.workToday.workMinutes).toBe(0.25)
    expect(r.workToday.focusMinutes).toBe(0.25)
    expect(r.profileKey).toBe('work_focused')
  })

  it('overtime 틱은 야근 시간과 진화 카운터 키를 반영한다', () => {
    const r = applyWorkTick(wt(), 'overtime', TODAY)!
    expect(r.workToday.overtimeMinutes).toBe(0.25)
    expect(r.xp).toBe(WORK_XP_PER_TICK.overtime)
    expect(r.profileKey).toBe('work_overtime')
  })

  it('야근 일일 상한에 도달하면 지급하지 않는다', () => {
    const capped = wt({ overtimeMinutes: OVERTIME_DAILY_CAP_MIN })
    expect(applyWorkTick(capped, 'overtime', TODAY)).toBeNull()
  })

  it('야근 상한이어도 일반 업무 틱은 계속 적립된다', () => {
    const capped = wt({ overtimeMinutes: OVERTIME_DAILY_CAP_MIN, workMinutes: 100 })
    const r = applyWorkTick(capped, 'working', TODAY)!
    expect(r.workToday.workMinutes).toBe(100.25)
  })

  it('날짜가 바뀌면 통계를 초기화하고 새로 센다', () => {
    const yesterday = wt({ workMinutes: 300, overtimeMinutes: OVERTIME_DAILY_CAP_MIN })
    const r = applyWorkTick(yesterday, 'overtime', TODAY + 1)!
    expect(r.workToday.date).toBe(TODAY + 1)
    expect(r.workToday.workMinutes).toBe(0.25)
    expect(r.workToday.overtimeMinutes).toBe(0.25)
  })
})
