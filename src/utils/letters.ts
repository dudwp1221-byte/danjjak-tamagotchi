import type { Personality } from '../types/pet'
import type { Graduate } from './storage'
import { loadGraduates } from './storage'
import { bondStage } from './bond'

/**
 * 졸업 펫의 편지 — 졸업이 "상실"이 아니라 "관계의 연장"이 되도록,
 * 명예의 전당 졸업생이 가끔 근황 편지를 보내온다.
 * 유대가 깊었던 펫일수록 자주 소식이 온다. 보상 없음 — 순수한 정서 장치.
 */

const LETTER_KEY = 'danjjak-letter-last'
/** 편지 최소 간격 (ms) — 3일 */
const LETTER_COOLDOWN = 3 * 86400000
/** 쿨다운이 지났을 때 접속당 도착 확률 */
const LETTER_CHANCE = 0.35

/** 성격별 근황 본문 */
const BODIES: Record<Personality, string[]> = {
  foodie: [
    '여기는 맛있는 게 정말 많아요. 그런데 주인님이랑 나눠 먹던 간식이 제일 그리워요.',
    '오늘 엄청 큰 케이크를 발견했어요! 주인님 몫도 남겨뒀는데… 제가 다 먹어버렸어요. 헤헤.',
  ],
  sleepyhead: [
    '요즘도 낮잠은 꼬박꼬박 자요. 그런데 주인님이 토닥여주던 낮잠만큼 달콤하진 않아요.',
    '어젯밤 꿈에 주인님 책상이 나왔어요. 저, 잘 지내고 있으니 걱정 말아요.',
  ],
  cuddler: [
    '매일 저녁마다 주인님 생각을 해요. 여기서도 저는 사랑받고 있지만, 처음 쓰다듬어준 손길은 못 잊어요.',
    '보고 싶어서 편지를 썼어요. 답장은 못 받아도 괜찮아요. 마음은 늘 닿고 있으니까요.',
  ],
  cleanfreak: [
    '여기서도 제일 반짝반짝한 건 저예요! 주인님이 씻겨준 습관 덕분이에요.',
    '새 보금자리를 아주 깨끗하게 정리했어요. 주인님이 보면 분명 칭찬해줄 거예요.',
  ],
  playful: [
    '여기 친구들이랑 매일 신나게 놀아요! 그래도 주인님이랑 하던 가위바위보가 제일 재밌었어요.',
    '오늘은 새 기술을 연습했어요. 다음에 만나면 꼭 보여줄게요!',
  ],
  calm: [
    '별일 없이 느긋하게 지내요. 주인님이 알려준 대로, 서두르지 않고요.',
    '창밖을 보다가 문득 주인님 생각이 났어요. 그래서 이렇게 몇 자 적어요.',
  ],
}

/** 유대 단계별 맺음말 (졸업 시점의 유대) */
function closing(bond: number): string {
  const stage = bondStage(bond).name
  switch (stage) {
    case '운명의 단짝':
    case '둘도 없는 단짝':
      return '보고 싶어요. 우리, 언젠가 꼭 다시 만나요.'
    case '마음을 연 사이':
      return '주인님 덕분에 저는 여기서도 씩씩해요. 고마워요.'
    default:
      return '잘 지내요! 또 소식 전할게요.'
  }
}

export interface Letter {
  from: Graduate
  body: string
  closing: string
}

/**
 * 오늘 도착한 편지가 있는지 판정. 있으면 편지를 만들고 마지막 수신 시각을 기록한다.
 * (호출 시점에 소비되는 구조 — 하루 여러 번 호출돼도 쿨다운으로 보호)
 */
export function checkForLetter(now: number = Date.now()): Letter | null {
  const grads = loadGraduates().filter((g) => g.personality)
  if (grads.length === 0) return null
  let last = 0
  try {
    last = Number(localStorage.getItem(LETTER_KEY) ?? 0) || 0
  } catch { /* 무시 */ }
  // 첫 졸업 직후엔 바로 오지 않도록, 기록이 없으면 지금부터 쿨다운 시작
  if (last === 0) {
    try { localStorage.setItem(LETTER_KEY, String(now)) } catch { /* 무시 */ }
    return null
  }
  if (now - last < LETTER_COOLDOWN) return null
  if (Math.random() > LETTER_CHANCE) return null

  // 유대가 깊었던 졸업생일수록 자주 소식이 온다 (가중 추첨)
  const weights = grads.map((g) => 1 + (g.bond ?? 0) / 100)
  const total = weights.reduce((s, w) => s + w, 0)
  let r = Math.random() * total
  let from = grads[0]
  for (let i = 0; i < grads.length; i++) {
    r -= weights[i]
    if (r <= 0) { from = grads[i]; break }
  }

  try { localStorage.setItem(LETTER_KEY, String(now)) } catch { /* 무시 */ }
  const bodies = BODIES[from.personality!] ?? BODIES.calm
  return {
    from,
    body: bodies[Math.floor(Math.random() * bodies.length)],
    closing: closing(from.bond ?? 0),
  }
}
