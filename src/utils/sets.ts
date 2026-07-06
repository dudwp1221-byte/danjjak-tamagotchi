import { getItem } from './items'
import { getFurniture } from './furniture'

/**
 * 꾸미기·가구 세트 — 완성해도 능력은 없다 (힐링 톤).
 * 보상은 연출: 펫의 한마디 + 일기 + 소량의 유대감.
 */
export interface ItemSet {
  id: string
  name: string
  emoji: string
  desc: string
  /** 구성 조각: SHOP_ITEMS(악세서리/배경) id 또는 FURNITURE_ITEMS id */
  pieces: string[]
  /** 완성 시 펫이 하는 말 */
  line: string
}

export const ITEM_SETS: ItemSet[] = [
  {
    id: 'set_cozy',
    name: '포근한 하루',
    emoji: '🧶',
    desc: '햇살 아래 뒹굴뒹굴, 완벽한 휴식',
    pieces: ['bg_sunny', 'fur_rug', 'fur_bed'],
    line: '창가 햇살에 러그, 푹신한 침대까지… 여기가 천국인가 봐. 🧶',
  },
  {
    id: 'set_scholar',
    name: '작은 서재',
    emoji: '📚',
    desc: '책 냄새 가득한 공부방',
    pieces: ['bg_library', 'fur_bookshelf', 'fur_desk'],
    line: '오늘부터 나, 교양 있는 단짝이야. 어려운 책도 읽을 수 있을 것 같아! 📚',
  },
  {
    id: 'set_dreamnight',
    name: '꿈꾸는 밤',
    emoji: '🌙',
    desc: '달빛 아래 별을 세는 밤',
    pieces: ['acc_moonveil', 'bg_night', 'fur_moon_lamp'],
    line: '달빛이 이렇게 포근한 줄 몰랐어. 오늘 밤은 좋은 꿈만 꿀 것 같아. 🌙',
  },
  {
    id: 'set_stargazer',
    name: '별의 여행자',
    emoji: '🌠',
    desc: '별이 쏟아지는 정원의 관측소',
    pieces: ['acc_starcrown', 'bg_stargarden', 'fur_telescope'],
    line: '봐, 별똥별이야! 우리 소원 빌자 — 나는 벌써 빌었어. 계속 같이 있게 해달라고. 🌠',
  },
  {
    id: 'set_healing',
    name: '느긋한 휴일',
    emoji: '♨️',
    desc: '온천과 물멍, 초록의 쉼표',
    pieces: ['bg_hotspring', 'fur_fishtank', 'fur_plant'],
    line: '아무것도 안 해도 되는 날… 이런 날이 제일 좋아. 너도 좀 쉬어. ♨️',
  },
]

/** 세트 완성 여부 (조각 = 계정 소유 아이템 + 이 펫의 가구) */
export function isSetComplete(set: ItemSet, ownedItems: string[], furniture: string[]): boolean {
  return set.pieces.every((id) => ownedItems.includes(id) || furniture.includes(id))
}

/** 조각의 표시 정보 (이름·이모지) — 상점/옷장 세트 목록용 */
export function pieceInfo(id: string): { name: string; emoji: string } {
  const item = getItem(id) ?? getFurniture(id)
  return item ? { name: item.name, emoji: item.emoji } : { name: id, emoji: '❔' }
}
