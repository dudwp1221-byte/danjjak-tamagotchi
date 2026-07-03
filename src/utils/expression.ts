import type { PetStats } from '../types/pet'

/**
 * 스탯 상태에 따라 펫 그림 위에 덧씌울 시각 효과를 계산한다.
 * (펫 그림 자체는 사용자가 그린 그대로 두고, 오버레이로 상태를 표현)
 */
export interface Overlay {
  /** 표시할 이모지/기호 */
  symbol: string
  /** 위치 클래스 (CSS에서 사용) */
  position: 'tl' | 'tr' | 'bl' | 'br' | 'center'
  /** 애니메이션 종류 */
  anim: 'float' | 'shake' | 'twinkle' | 'drop'
}

export function overlaysFor(stats: PetStats): Overlay[] {
  const list: Overlay[] = []

  if (stats.energy < 30) {
    list.push({ symbol: '💤', position: 'tr', anim: 'float' })
  }
  if (stats.cleanliness < 30) {
    // 꼬질꼬질 — 얼룩과 파리
    list.push({ symbol: '🪰', position: 'tl', anim: 'shake' })
    list.push({ symbol: '💩', position: 'br', anim: 'drop' })
  }
  if (stats.hunger < 30) {
    list.push({ symbol: '💧', position: 'bl', anim: 'drop' })
  }
  if (stats.mood < 30) {
    list.push({ symbol: '💢', position: 'tr', anim: 'shake' })
  }

  // 모든 스탯이 좋으면 반짝임
  const allGood =
    stats.hunger >= 70 &&
    stats.mood >= 70 &&
    stats.cleanliness >= 70 &&
    stats.energy >= 70
  if (allGood && list.length === 0) {
    list.push({ symbol: '✨', position: 'tl', anim: 'twinkle' })
    list.push({ symbol: '✨', position: 'br', anim: 'twinkle' })
  }

  return list
}
