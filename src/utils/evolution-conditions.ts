export const PROFILE_KEYS = {
  PETTED_OFTEN: 'petted_often',
  NIGHT_COMPANION: 'night_companion',
  PLAYFUL_MOMENTS: 'playful_moments',
  READING_SESSIONS: 'reading_sessions',
  TREAT_CAKE: 'treat_cake',
} as const

export type ProfileKey = (typeof PROFILE_KEYS)[keyof typeof PROFILE_KEYS]

export interface EvolutionCondition {
  profileKey: string
  threshold: number
  hint: string
}

export const EVOLUTION_CONDITIONS: Record<string, EvolutionCondition> = {
  petted_often: {
    profileKey: PROFILE_KEYS.PETTED_OFTEN,
    threshold: 50,
    hint: '자주 쓰다듬어 줄수록 더 깊은 유대가 생긴다고 한다...',
  },
  night_companion: {
    profileKey: PROFILE_KEYS.NIGHT_COMPANION,
    threshold: 10,
    hint: '밤을 함께 많이 보낸 작은 생명은 달빛을 닮아간다고 전해진다.',
  },
  playful_moments: {
    profileKey: PROFILE_KEYS.PLAYFUL_MOMENTS,
    threshold: 20,
    hint: '신나게 놀기를 반복하다 보면 전혀 다른 모습으로 피어난다고 한다.',
  },
  reading_sessions: {
    profileKey: PROFILE_KEYS.READING_SESSIONS,
    threshold: 15,
    hint: '조용히 책과 함께하는 시간이 쌓이면 특별한 지혜가 깃든다고 한다.',
  },
  treat_cake: {
    profileKey: PROFILE_KEYS.TREAT_CAKE,
    threshold: 5,
    hint: '달콤한 것을 자주 먹인 펫은 뜻밖의 방향으로 성장한다고 한다.',
  },
}

export function checkCondition(
  profile: Record<string, number>,
  conditionKey: string,
): { met: boolean; progress: number; threshold: number } {
  const cond = EVOLUTION_CONDITIONS[conditionKey]
  if (!cond) return { met: false, progress: 0, threshold: 1 }
  const progress = profile[cond.profileKey] ?? 0
  return { met: progress >= cond.threshold, progress, threshold: cond.threshold }
}
