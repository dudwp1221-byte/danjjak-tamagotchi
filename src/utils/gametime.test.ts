import { describe, expect, it } from 'vitest'
import {
  BIRTH_HOUR,
  DAYS_PER_YEAR,
  REAL_MS_PER_GAME_DAY,
  REAL_MS_PER_GAME_YEAR,
  birthMonth,
  gameClock,
  phaseForHour,
  seasonForMonth,
} from './gametime'

/** 게임 1일에 해당하는 실제 시간(ms) */
const DAY = REAL_MS_PER_GAME_DAY

describe('gameClock', () => {
  it('태어난 직후엔 1일차 아침(BIRTH_HOUR)이다', () => {
    const c = gameClock(0, 0)
    expect(c.day).toBe(1)
    expect(c.hour).toBe(BIRTH_HOUR)
    expect(c.minute).toBe(0)
    expect(c.hhmm).toBe('08:00')
  })

  it('게임 1일(실제 약 27.6분)이 지나면 다음 날 같은 시각', () => {
    const c = gameClock(0, DAY)
    expect(c.day).toBe(2)
    expect(c.hour).toBe(BIRTH_HOUR)
  })

  it('게임 반나절이면 12시간이 흘러 저녁(20시)이 된다', () => {
    const c = gameClock(0, DAY / 2)
    expect(c.day).toBe(1)
    expect(c.hour).toBe(20)
  })

  it('실제 시각이 생성보다 빨라도 음수로 가지 않는다', () => {
    const c = gameClock(1000, 0)
    expect(c.day).toBe(1)
    expect(c.hour).toBe(BIRTH_HOUR)
  })

  it('자정을 넘기면 일차가 올라간다', () => {
    // 아침 8시에서 16게임시간 뒤 = 자정(24시) = 다음 날 0시
    const c = gameClock(0, (16 / 24) * DAY)
    expect(c.day).toBe(2)
    expect(c.hour).toBe(0)
  })
})

describe('phaseForHour', () => {
  it('시간대를 올바르게 분류한다', () => {
    expect(phaseForHour(6).key).toBe('dawn')
    expect(phaseForHour(12).key).toBe('day')
    expect(phaseForHour(18).key).toBe('evening')
    expect(phaseForHour(21).key).toBe('night')
    expect(phaseForHour(2).key).toBe('midnight')
  })

  it('낮은 어둡지 않고 한밤중이 가장 어둡다', () => {
    expect(phaseForHour(12).dark).toBe(0)
    expect(phaseForHour(2).dark).toBeGreaterThan(phaseForHour(21).dark)
  })
})

describe('게임 달력', () => {
  it('태어난 직후엔 1년 1월 1일 봄이다', () => {
    const c = gameClock(0, 0)
    expect(c.year).toBe(1)
    expect(c.month).toBe(1)
    expect(c.monthDay).toBe(1)
    expect(c.season.key).toBe('spring')
  })

  it('1월은 31일까지 — 31게임일째에 2월 1일이 된다', () => {
    const c = gameClock(0, 31 * DAY)
    expect(c.month).toBe(2)
    expect(c.monthDay).toBe(1)
  })

  it('2월은 28일까지 — 31+28=59게임일째에 3월 1일', () => {
    const c = gameClock(0, 59 * DAY)
    expect(c.month).toBe(3)
    expect(c.monthDay).toBe(1)
  })

  it('계절은 3달씩 순환한다', () => {
    expect(seasonForMonth(1).key).toBe('spring')
    expect(seasonForMonth(4).key).toBe('summer')
    expect(seasonForMonth(7).key).toBe('autumn')
    expect(seasonForMonth(10).key).toBe('winter')
    expect(seasonForMonth(12).key).toBe('winter')
  })

  it('여름(4월)은 1~3월(90일) 뒤부터다', () => {
    // 1월31+2월28+3월31 = 90게임일 경과 → 4월 1일 = 여름
    const c = gameClock(0, 90 * DAY)
    expect(c.month).toBe(4)
    expect(c.monthDay).toBe(1)
    expect(c.season.key).toBe('summer')
  })

  it('1년(365게임일 = 실제 7일)이면 2년차로 넘어간다', () => {
    expect(DAYS_PER_YEAR).toBe(365)
    const c = gameClock(0, DAYS_PER_YEAR * DAY)
    expect(c.year).toBe(2)
    expect(c.month).toBe(1)
    expect(c.monthDay).toBe(1)
  })

  it('12월 31일은 한 해의 마지막 날', () => {
    const c = gameClock(0, 364 * DAY)
    expect(c.year).toBe(1)
    expect(c.month).toBe(12)
    expect(c.monthDay).toBe(31)
  })

  it('isNight는 밤·한밤중에만 참', () => {
    expect(gameClock(0, 0).isNight).toBe(false) // 아침 8시
    expect(gameClock(0, DAY / 2).isNight).toBe(true) // 20시(밤)
  })
})

describe('birthMonth', () => {
  it('생성 시각의 실제 달(1~12)을 돌려준다', () => {
    const jan = new Date(2026, 0, 15).getTime()
    const dec = new Date(2026, 11, 1).getTime()
    expect(birthMonth(jan)).toBe(1)
    expect(birthMonth(dec)).toBe(12)
  })
})

describe('시간 비율 정합성', () => {
  it('게임 1년은 정확히 실제 7일이다', () => {
    expect(REAL_MS_PER_GAME_YEAR).toBe(7 * 24 * 60 * 60 * 1000)
    expect(REAL_MS_PER_GAME_DAY * DAYS_PER_YEAR).toBe(REAL_MS_PER_GAME_YEAR)
  })
})
