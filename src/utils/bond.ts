import type { Personality } from '../types/pet'

/**
 * 유대감(絆) — 기분(mood)과 달리 깎이지 않고 천천히 쌓이기만 하는 관계 지표.
 * 힐링 톤 유지: 감소·압박 없음, 능력치 영향 없음. 대사·기록의 친밀도만 깊어진다.
 * 상승원: 선물(최애 2배), 하루 첫 만남, 함께한 날 기념일.
 */
export interface BondStage {
  min: number
  name: string
  emoji: string
}

export const BOND_STAGES: BondStage[] = [
  { min: 0, name: '처음 만난 사이', emoji: '🌱' },
  { min: 20, name: '낯익은 사이', emoji: '🙂' },
  { min: 60, name: '친해진 사이', emoji: '😊' },
  { min: 140, name: '마음을 연 사이', emoji: '💛' },
  { min: 280, name: '둘도 없는 단짝', emoji: '💖' },
  { min: 500, name: '운명의 단짝', emoji: '✨' },
]

export function bondStage(bond: number): BondStage {
  return [...BOND_STAGES].reverse().find((s) => bond >= s.min)!
}

/** 다음 단계 (마지막 단계면 null) */
export function nextBondStage(bond: number): BondStage | null {
  return BOND_STAGES.find((s) => s.min > bond) ?? null
}

/** 성격별 최애 선물 (GIFT_ITEMS id) */
export const FAVORITE_GIFT: Record<Personality, string> = {
  foodie: 'gift_cake',
  playful: 'gift_ball',
  sleepyhead: 'gift_teddy',
  cuddler: 'gift_ring',
  cleanfreak: 'gift_flower',
  calm: 'gift_flower',
}

/** 최애 선물을 받았을 때 성격별 반응 한마디 */
export const FAVORITE_REACTION: Record<Personality, string> = {
  foodie: '내가 제일 좋아하는 케이크! 오늘 최고의 날이야! 🍰',
  playful: '공이다! 나랑 지금 당장 놀자! ⚽',
  sleepyhead: '푹신푹신해… 오늘 밤은 얘랑 같이 잘래. 🧸',
  cuddler: '반지…? 우리 진짜 단짝이라는 뜻이지? 💍',
  cleanfreak: '향기 좋다… 방 안이 다 환해졌어! 💐',
  calm: '고마워. 이런 소소한 순간이 제일 좋아. 💐',
}

/** 선물 1회의 유대 상승량 (최애면 2배) */
export function giftBondGain(affection: number, favorite: boolean): number {
  const base = Math.max(2, Math.round(affection / 5))
  return favorite ? base * 2 : base
}

/* ── 한글 조사 헬퍼 (받침 유무) ── */

function hasBatchim(word: string): boolean {
  const last = word.charCodeAt(word.length - 1)
  if (last < 0xac00 || last > 0xd7a3) return false
  return (last - 0xac00) % 28 > 0
}

/** 을/를 */
export function objectParticle(word: string): '을' | '를' {
  return hasBatchim(word) ? '을' : '를'
}

/** 이/가 */
export function subjectParticle(word: string): '이' | '가' {
  return hasBatchim(word) ? '이' : '가'
}
