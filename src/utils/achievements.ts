import type { Pet } from '../types/pet'
import { formById } from './species'
import { PROFILE_KEYS } from './evolution-conditions'

export interface AchievementContext {
  pet: Pet
  level: number
  days: number
  score: number
}

export interface Achievement {
  id: string
  name: string
  emoji: string
  desc: string
  check: (ctx: AchievementContext) => boolean
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_care',
    name: '첫 돌봄',
    emoji: '🍼',
    desc: '처음으로 펫을 돌봤어요',
    check: ({ pet }) => pet.totalActions >= 1,
  },
  {
    id: 'care_25',
    name: '집사 입문',
    emoji: '🧹',
    desc: '25번 돌봤어요',
    check: ({ pet }) => pet.totalActions >= 25,
  },
  {
    id: 'care_100',
    name: '베테랑 집사',
    emoji: '🏅',
    desc: '100번 돌봤어요',
    check: ({ pet }) => pet.totalActions >= 100,
  },
  {
    id: 'level_3',
    name: '쑥쑥 자라요',
    emoji: '🌱',
    desc: '레벨 3 달성 (청소년)',
    check: ({ level }) => level >= 3,
  },
  {
    id: 'level_6',
    name: '어엿한 어른',
    emoji: '✨',
    desc: '레벨 6 달성 (어른)',
    check: ({ level }) => level >= 6,
  },
  {
    id: 'level_10',
    name: '전설의 단짝',
    emoji: '👑',
    desc: '레벨 10 달성 (전설)',
    check: ({ level }) => level >= 10,
  },
  {
    id: 'perfect',
    name: '완벽 컨디션',
    emoji: '💯',
    desc: '모든 스탯 90 이상',
    check: ({ pet }) =>
      pet.stats.hunger >= 90 &&
      pet.stats.mood >= 90 &&
      pet.stats.cleanliness >= 90 &&
      pet.stats.energy >= 90 &&
      pet.stats.health >= 90,
  },
  {
    id: 'rich',
    name: '코인 부자',
    emoji: '💰',
    desc: '코인 100개 보유',
    check: ({ pet }) => pet.coins >= 100,
  },
  {
    id: 'streak_3',
    name: '꾸준함의 미덕',
    emoji: '🔥',
    desc: '3일 연속 출석',
    check: ({ pet }) => pet.careStreak >= 3,
  },
  {
    id: 'week',
    name: '일주일 우정',
    emoji: '📅',
    desc: '함께한 지 7일째',
    check: ({ days }) => days >= 7,
  },
  {
    id: 'dressup',
    name: '멋쟁이',
    emoji: '🎩',
    desc: '악세서리를 착용했어요',
    check: ({ pet }) => pet.accessory !== null,
  },
  {
    id: 'decorator',
    name: '인테리어',
    emoji: '🖼️',
    desc: '방 배경을 꾸몄어요',
    check: ({ pet }) => pet.background !== null,
  },
  {
    id: 'collector',
    name: '수집가',
    emoji: '🧳',
    desc: '아이템 5개 보유',
    check: ({ pet }) => pet.ownedItems.length >= 5,
  },
  {
    id: 'rich_big',
    name: '코인 갑부',
    emoji: '🤑',
    desc: '코인 300개 보유',
    check: ({ pet }) => pet.coins >= 300,
  },
  {
    id: 'streak_7',
    name: '한결같은 마음',
    emoji: '🔥',
    desc: '7일 연속 출석',
    check: ({ pet }) => pet.careStreak >= 7,
  },
  {
    id: 'level_15',
    name: '완전체 단짝',
    emoji: '🌟',
    desc: '레벨 15 달성',
    check: ({ level }) => level >= 15,
  },
  {
    id: 'level_20',
    name: '최고의 단짝',
    emoji: '🏆',
    desc: '레벨 20(만렙) 달성',
    check: ({ level }) => level >= 20,
  },
  {
    id: 'care_500',
    name: '한결같은 손길',
    emoji: '🤲',
    desc: '500번 돌봤어요',
    check: ({ pet }) => pet.totalActions >= 500,
  },
  // ── 진화 ──
  {
    id: 'evolve_adult',
    name: '완전체 도달',
    emoji: '🦋',
    desc: '완전체(3단계)로 진화했어요',
    check: ({ pet }) => formById(pet.form).tier >= 2,
  },
  {
    id: 'evolve_legend',
    name: '궁극의 형태',
    emoji: '🐉',
    desc: '궁극체(최종 단계)로 진화했어요',
    check: ({ pet }) => formById(pet.form).tier >= 3,
  },
  // ── 방 꾸미기 ──
  {
    id: 'furniture_first',
    name: '집들이',
    emoji: '🪑',
    desc: '가구를 처음 들였어요',
    check: ({ pet }) => pet.furniture.length >= 1,
  },
  {
    id: 'furniture_3',
    name: '풀옵션 방',
    emoji: '🛋️',
    desc: '가구 3개를 모았어요',
    check: ({ pet }) => pet.furniture.length >= 3,
  },
  // ── 기록·습관 ──
  {
    id: 'diary_10',
    name: '추억 수집가',
    emoji: '📔',
    desc: '일기 10편을 남겼어요',
    check: ({ pet }) => pet.diary.length >= 10,
  },
  {
    id: 'schedule_first',
    name: '시간 약속',
    emoji: '⏰',
    desc: '일정을 처음 등록했어요',
    check: ({ pet }) => pet.schedules.length >= 1,
  },
  {
    id: 'petted_often',
    name: '쓰다듬기 장인',
    emoji: '🤚',
    desc: '50번 쓰다듬어줬어요',
    check: ({ pet }) => (pet.behaviorProfile[PROFILE_KEYS.PETTED_OFTEN] ?? 0) >= 50,
  },
  // ── 시간·부 ──
  {
    id: 'days_30',
    name: '한 달의 우정',
    emoji: '🗓️',
    desc: '함께한 지 30일째',
    check: ({ days }) => days >= 30,
  },
  {
    id: 'streak_30',
    name: '습관이 된 사랑',
    emoji: '💖',
    desc: '30일 연속 출석',
    check: ({ pet }) => pet.careStreak >= 30,
  },
  {
    id: 'coins_800',
    name: '드래곤의 보물',
    emoji: '💎',
    desc: '코인 800개 보유',
    check: ({ pet }) => pet.coins >= 800,
  },
]

/** 아직 달성하지 않았지만 지금 조건을 만족하는 업적 id 목록 */
export function newlyUnlocked(ctx: AchievementContext): string[] {
  return ACHIEVEMENTS.filter(
    (a) => !ctx.pet.achievements.includes(a.id) && a.check(ctx),
  ).map((a) => a.id)
}
