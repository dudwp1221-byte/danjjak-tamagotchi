import type { DiaryEntry, Personality } from '../types/pet'
import type { Graduate } from './storage'
import { FORMS, formById, type Form } from './species'

/**
 * 졸업생의 폼을 찾는다. 정서화 이전 기록은 form id 없이
 * 종족 "이름"만 남아 있어서 이름 매칭으로 폴백한다.
 */
export function graduateForm(g: Graduate): Form | null {
  if (g.form) return formById(g.form)
  return FORMS.find((f) => f.name === g.species) ?? null
}

/**
 * 성격별 펫의 마지막 인사 — 졸업식에서 한 번 뽑아 명예의 전당에 함께 보관한다.
 * 치유 톤 유지: 이별의 슬픔보다 "고마움 + 잘 지낼게" 쪽으로.
 */
const LAST_WORDS: Record<Personality, string[]> = {
  foodie: [
    '매일 맛있는 밥 챙겨줘서 고마웠어. 이제 혼자서도 씩씩하게 잘 먹을게!',
    '너랑 나눠 먹은 간식이 제일 맛있었어. 다음에 만나면 내가 쏠게!',
  ],
  sleepyhead: [
    '포근하게 재워줘서 매일 좋은 꿈만 꿨어. 오늘 밤엔 내가 네 꿈에 놀러 갈게.',
    '졸릴 때마다 토닥여줘서 고마워. 어디서든 푹 자고 씩씩하게 지낼게.',
  ],
  cuddler: [
    '쓰다듬어 주던 손길, 절대 잊지 않을게. 보고 싶으면 명예의 전당에서 만나자.',
    '네 곁이 세상에서 제일 따뜻했어. 그 온기 안고 씩씩하게 다녀올게!',
  ],
  cleanfreak: [
    '반짝반짝 씻겨줘서 고마워. 제일 깨끗하고 멋진 모습으로 떠날게!',
    '너 덕분에 늘 뽀송했어. 어디 가서도 단정하게 잘 지낼게.',
  ],
  playful: [
    '같이 놀던 날들 전부 최고였어! 나 없어도 가끔은 신나게 웃어야 해?',
    '심심할 틈 없게 해줘서 고마워. 새로운 모험도 신나게 즐기고 올게!',
  ],
  calm: [
    '서두르지 않아도 괜찮다고 알려줘서 고마워. 천천히, 잘 지낼게.',
    '너와 보낸 느긋한 시간이 참 좋았어. 나는 나답게, 잘 살아볼게.',
  ],
}

/** 졸업하는 펫의 마지막 인사 한 줄을 뽑는다. */
export function pickLastWords(personality: Personality): string {
  const pool = LAST_WORDS[personality] ?? LAST_WORDS.calm
  return pool[Math.floor(Math.random() * pool.length)]
}

/**
 * 일기에서 회고용 하이라이트를 고른다.
 * 일기는 최신순 저장이므로 오래된 순으로 뒤집고, 처음~마지막을 고르게 표집해
 * "함께한 여정"이 한눈에 보이게 한다.
 */
export function pickHighlights(diary: DiaryEntry[], max = 6): DiaryEntry[] {
  const chrono = [...diary].reverse()
  if (chrono.length <= max) return chrono
  const step = (chrono.length - 1) / (max - 1)
  return Array.from({ length: max }, (_, i) => chrono[Math.round(i * step)])
}
