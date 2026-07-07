import type { PetStats, AccessoryPlacement } from '../types/pet'
import { ZODIAC } from './species'

export type { AccessoryPlacement }

export type ItemType = 'accessory' | 'treat' | 'background' | 'tool' | 'gift'

export interface ShopItem {
  id: string
  name: string
  emoji: string
  price: number
  type: ItemType
  desc: string
  /** treat인 경우: 즉시 적용되는 스탯 부스트 */
  boost?: Partial<PetStats>
  /** background인 경우: CSS 배경 값 */
  bg?: string
  /** 시즌 한정 아이템이면 해당 시즌 키 */
  season?: string
  /** 명예(프레스티지) 아이템 — 고가, 후반 목표 */
  honor?: boolean
  /** 십이지 띠별 전용 부적 */
  zodiacCharm?: boolean
  /** 프리미엄(보석 구매) 상품 — 계정 단위 소유, 코인으로는 못 삼 */
  premium?: boolean
  /** 프리미엄인 경우 보석 가격 */
  gemPrice?: number
  /** gift인 경우: 선물 시 오르는 애정 */
  affection?: number
  /** accessory인 경우: 이모지 착용이 아니라 펫 주변 발광 이펙트 (위치 조정 불필요) */
  aura?: boolean
}

/** 형태(진화)마다 스프라이트가 달라지므로 배치는 악세서리+형태 조합으로 저장한다 */
export function placementKey(accessoryId: string, formId: string): string {
  return `${accessoryId}@${formId}`
}

/** 현재 착용 악세서리의 저장된 배치 (없으면 null → 기본 위치) */
export function accessoryPlacementFor(
  accessoryId: string | null,
  formId: string,
  saved: Record<string, AccessoryPlacement> | undefined,
): AccessoryPlacement | null {
  if (!accessoryId || !saved) return null
  return saved[placementKey(accessoryId, formId)] ?? null
}

/** 선물 아이템 카탈로그 (상점 구매/이벤트로 획득 → 보관 → 선물하기로 사용) */
export const GIFT_ITEMS: ShopItem[] = [
  { id: 'gift_flower', name: '들꽃 다발', emoji: '💐', type: 'gift', desc: '애정 +20', price: 25, affection: 20 },
  { id: 'gift_ball', name: '공', emoji: '⚽', type: 'gift', desc: '애정 +25', price: 35, affection: 25 },
  { id: 'gift_teddy', name: '곰인형', emoji: '🧸', type: 'gift', desc: '애정 +35', price: 55, affection: 35 },
  { id: 'gift_cake', name: '생일 케이크', emoji: '🎂', type: 'gift', desc: '애정 +45', price: 80, affection: 45 },
  { id: 'gift_ring', name: '우정의 반지', emoji: '💍', type: 'gift', desc: '애정 +60 (특별)', price: 150, affection: 60 },
]
function giftById(id: string): ShopItem | undefined {
  return GIFT_ITEMS.find((g) => g.id === id)
}
export { giftById }

/** 상점 카탈로그 */
export const SHOP_ITEMS: ShopItem[] = [
  // 악세서리 (한 번 구매 → 보유 → 착용, 코스메틱)
  { id: 'acc_ribbon', name: '리본', emoji: '🎀', price: 30, type: 'accessory', desc: '귀여운 리본' },
  { id: 'acc_hat', name: '모자', emoji: '🎩', price: 50, type: 'accessory', desc: '멋진 중절모' },
  { id: 'acc_glasses', name: '선글라스', emoji: '🕶️', price: 60, type: 'accessory', desc: '시크한 선글라스' },
  { id: 'acc_crown', name: '왕관', emoji: '👑', price: 120, type: 'accessory', desc: '진정한 단짝의 증표' },
  { id: 'acc_flower', name: '꽃', emoji: '🌸', price: 40, type: 'accessory', desc: '머리에 꽂는 꽃' },
  { id: 'acc_headphone', name: '헤드폰', emoji: '🎧', price: 60, type: 'accessory', desc: '작업용 무드 — 옷장에서 위치를 맞춰 주세요' },
  // 시즌 한정 악세서리
  { id: 'acc_butterfly', name: '나비', emoji: '🦋', price: 45, type: 'accessory', desc: '봄 한정!', season: 'spring' },
  { id: 'acc_strawhat', name: '밀짚모자', emoji: '👒', price: 55, type: 'accessory', desc: '여름 한정!', season: 'summer' },
  { id: 'acc_maple', name: '단풍잎', emoji: '🍁', price: 45, type: 'accessory', desc: '가을 한정!', season: 'autumn' },
  { id: 'acc_santa', name: '산타 모자', emoji: '🎅', price: 70, type: 'accessory', desc: '겨울 한정!', season: 'winter' },
  // 간식 (즉시 사용, 큰 회복)
  { id: 'treat_cake', name: '조각 케이크', emoji: '🍰', price: 25, type: 'treat', desc: '배고픔+기분 크게 회복', boost: { hunger: 60, mood: 20 } },
  { id: 'treat_coffee', name: '커피', emoji: '☕', price: 20, type: 'treat', desc: '기운 회복 (몰래 한 잔)', boost: { energy: 50 } },
  { id: 'treat_spa', name: '거품 목욕', emoji: '🧴', price: 30, type: 'treat', desc: '청결 완전 회복', boost: { cleanliness: 80 } },
  // 배경 (한 번 구매 → 착용, 무대 뒤 배경)
  { id: 'bg_sunny', name: '창가 햇살', emoji: '🌤️', price: 40, type: 'background', desc: '따스한 오후 창가', bg: 'linear-gradient(180deg, #fde68a, #fca5a5)' },
  { id: 'bg_night', name: '밤하늘', emoji: '🌙', price: 50, type: 'background', desc: '고요한 밤', bg: 'linear-gradient(180deg, #1e293b, #4c1d95)' },
  { id: 'bg_sakura', name: '벚꽃길', emoji: '🌸', price: 60, type: 'background', desc: '흩날리는 벚꽃', bg: 'linear-gradient(180deg, #fbcfe8, #f9a8d4)' },
  { id: 'bg_ocean', name: '바다', emoji: '🌊', price: 60, type: 'background', desc: '시원한 바닷가', bg: 'linear-gradient(180deg, #7dd3fc, #2563eb)' },
  { id: 'bg_office', name: '사무실', emoji: '🏢', price: 30, type: 'background', desc: '익숙한 그곳', bg: 'linear-gradient(180deg, #94a3b8, #475569)' },
  // 명예의 전당 (고가 — 후반 목표)
  { id: 'acc_halo', name: '천사 후광', emoji: '😇', price: 180, type: 'accessory', desc: '명예의 상징', honor: true },
  { id: 'acc_wings', name: '빛의 날개', emoji: '🪽', price: 250, type: 'accessory', desc: '고귀한 단짝의 날개', honor: true },
  { id: 'bg_galaxy', name: '은하수', emoji: '🌌', price: 220, type: 'background', desc: '별이 쏟아지는 밤하늘', bg: 'linear-gradient(180deg, #312e81, #0f172a)', honor: true },
  { id: 'bg_throne', name: '왕좌의 방', emoji: '👑', price: 320, type: 'background', desc: '전설의 단짝을 위한 자리', bg: 'linear-gradient(180deg, #7c2d12, #1c1917)', honor: true },
  // 컬렉션 라인 — 후반 코인 소비처. 전부 코스메틱, 능력 없음.
  // 가격 기준: 일일 실수입 ~130🪙 (출석~30+인사5+케어~40+미션37+미니게임~20), 졸업 보너스 ~1,000🪙/회.
  // 입문 1,200(약 열흘) → 최고 12,000(2~3달 또는 졸업 몇 번) — 힐링 톤이라 과한 그라인딩 금지.
  { id: 'acc_starcrown', name: '별의 관', emoji: '🌟', price: 1200, type: 'accessory', desc: '밤하늘의 별을 엮어 만든 관', honor: true },
  { id: 'acc_moonveil', name: '달빛 베일', emoji: '🌙', price: 2000, type: 'accessory', desc: '은은한 달빛이 감도는 베일', honor: true },
  { id: 'acc_aurorascarf', name: '오로라 목도리', emoji: '🧣', price: 3500, type: 'accessory', desc: '극광을 짜 넣은 포근한 목도리', honor: true },
  { id: 'acc_redstring', name: '인연의 붉은 실', emoji: '🧵', price: 6000, type: 'accessory', desc: '운명의 단짝이라는 증표', honor: true },
  { id: 'acc_universe', name: '작은 우주', emoji: '🪐', price: 12000, type: 'accessory', desc: '단짝의 곁을 도는 작은 우주', honor: true },
  { id: 'bg_hotspring', name: '노천 온천', emoji: '♨️', price: 1200, type: 'background', desc: '몸도 마음도 노곤노곤', bg: 'linear-gradient(180deg, #99f6e4, #57534e)', honor: true },
  { id: 'bg_library', name: '오래된 서재', emoji: '📜', price: 2000, type: 'background', desc: '책 냄새 가득한 조용한 오후', bg: 'linear-gradient(180deg, #a16207, #292524)', honor: true },
  { id: 'bg_cloudsea', name: '구름바다', emoji: '☁️', price: 4000, type: 'background', desc: '구름 위를 둥둥 떠다녀요', bg: 'linear-gradient(180deg, #e0f2fe, #93c5fd)', honor: true },
  { id: 'bg_stargarden', name: '별의 정원', emoji: '🌠', price: 8000, type: 'background', desc: '별이 피어나는 비밀 정원', bg: 'linear-gradient(180deg, #1e1b4b, #6d28d9 70%, #0c0a09)', honor: true },
  { id: 'bg_memoryroom', name: '추억의 방', emoji: '🖼️', price: 12000, type: 'background', desc: '함께한 날들이 걸려 있는 방', bg: 'linear-gradient(180deg, #e7d3b1, #8b5e34)', honor: true },
  // 도구
  // 각성 재료 — 일일 실수입 ~130🪙 기준 3~5일치. 히든은 후반 목표라 싸게 풀지 않는다.
  { id: 'item_evostone', name: '진화의 돌', emoji: '💠', price: 500, type: 'tool', desc: '특수(합성) 진화에 사용 (1회 소모)', honor: true },

  // ── 프리미엄 코스메틱 (보석 구매 · 계정 단위 소유) ──
  // 코인으로는 못 사고, 시각적 차이만 — 능력/성장에 영향 없음 (힐링 톤 유지)
  { id: 'pbg_aurora', name: '오로라 밤하늘', emoji: '🌌', type: 'background', desc: '일렁이는 극광 (프리미엄)', price: 0, premium: true, gemPrice: 40, bg: 'linear-gradient(180deg, #134e4a, #4c1d95 60%, #1e1b4b)' },
  { id: 'pbg_cafe', name: '아늑한 카페', emoji: '☕', type: 'background', desc: '비 오는 날의 창가 카페 (프리미엄)', price: 0, premium: true, gemPrice: 40, bg: 'linear-gradient(180deg, #d6c2a8, #6f5640)' },
  { id: 'pbg_sakura_night', name: '밤 벚꽃', emoji: '🌸', type: 'background', desc: '달빛 아래 흩날리는 벚꽃 (프리미엄)', price: 0, premium: true, gemPrice: 50, bg: 'linear-gradient(180deg, #4c1d3d, #831843 70%, #1e1b4b)' },
  // 프리미엄 치장은 오라(펫 주변 이펙트)만 — 착용형은 펫마다 body가 달라 어색해서 넣지 않는다
  { id: 'pacc_sparkle', name: '반짝임 오라', emoji: '✨', type: 'accessory', desc: '은은하게 반짝이는 단짝 (프리미엄)', price: 0, premium: true, gemPrice: 35, aura: true },
  { id: 'pacc_aurora', name: '오로라 오라', emoji: '🌈', type: 'accessory', desc: '무지갯빛 극광이 감도는 단짝 (프리미엄)', price: 0, premium: true, gemPrice: 45, aura: true },
  { id: 'pacc_moonglow', name: '달무리 오라', emoji: '🌖', type: 'accessory', desc: '포근한 달빛이 어리는 단짝 (프리미엄)', price: 0, premium: true, gemPrice: 40, aura: true },
]

// 십이지 띠별 전용 부적 (각 띠 전용, 1회 소모)
for (const z of ZODIAC) {
  SHOP_ITEMS.push({
    id: `charm_${z.id}`,
    name: `${z.name} 부적`,
    emoji: '🧧',
    price: 600,
    type: 'tool',
    desc: `${z.name}(으)로 각성 (1회 소모)`,
    zodiacCharm: true,
  })
}

export function getItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id)
}

/** 악세서리 emoji (아바타 표시용). 오라형은 이모지 착용이 아니므로 null */
export function accessoryEmoji(id: string | null): string | null {
  if (!id) return null
  const item = getItem(id)
  return item?.type === 'accessory' && !item.aura ? item.emoji : null
}

/** 착용 중인 악세서리가 오라형이면 해당 오라 id (아바타 이펙트용) */
export function accessoryAura(id: string | null): string | null {
  if (!id) return null
  const item = getItem(id)
  return item?.type === 'accessory' && item.aura ? item.id : null
}

/** 배경 CSS 값 (무대 표시용) */
export function backgroundCss(id: string | null): string | null {
  if (!id) return null
  const item = getItem(id)
  return item?.type === 'background' ? (item.bg ?? null) : null
}
