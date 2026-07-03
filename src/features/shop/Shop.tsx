import { useState } from 'react'
import type { Pet } from '../../types/pet'
import { SHOP_ITEMS, GIFT_ITEMS, type ShopItem } from '../../utils/items'
import { FURNITURE_ITEMS, type FurnitureItem } from '../../utils/furniture'
import { gameClock } from '../../utils/gametime'
import {
  loadGems,
  addGems,
  spendGems,
  ownsPremium,
  grantPremium,
  loadPass,
  activatePass,
  cancelPass,
  canClaimPassDaily,
  claimPassDaily,
  PASS_DAILY_GEMS,
  PASS_DAILY_COINS,
} from '../../utils/premium'
import Modal from '../../components/Modal'
import './shop.css'

interface ShopProps {
  pet: Pet
  onClose: () => void
  /** 아이템 구매/사용/착용 처리 */
  onBuy: (item: ShopItem) => void
  /** 가구 구매 처리 */
  onBuyFurniture: (item: FurnitureItem) => void
  /** 펫 부분 갱신 (프리미엄 착용·패스 보상 코인 지급) */
  onUpdatePet: (patch: Partial<Pet>) => void
  /** 페이저 페이지로 임베드 (배경/닫기 없이 인라인 렌더) */
  embedded?: boolean
}

type ShopTab = 'items' | 'furniture' | 'premium'

const PREMIUM_BGS = SHOP_ITEMS.filter((i) => i.premium && i.type === 'background')
const PREMIUM_ACCS = SHOP_ITEMS.filter((i) => i.premium && i.type === 'accessory')

export default function Shop({ pet, onClose, onBuy, onBuyFurniture, onUpdatePet, embedded }: ShopProps) {
  const [tab, setTab] = useState<ShopTab>('items')
  // 프리미엄 상태 변경 시 강제 리렌더용
  const [, setVersion] = useState(0)
  const refresh = () => setVersion((v) => v + 1)

  // 게임 달력 계절 기준 (헤더·진화·각성과 동일한 계절을 사용)
  const season = gameClock(pet.createdAt).season
  // 시즌 한정 아이템은 해당 시즌에만 노출 (이미 보유한 건 항상)
  const available = SHOP_ITEMS.filter(
    (i) => !i.season || i.season === season.key || pet.ownedItems.includes(i.id),
  )
  // 코인 탭에는 프리미엄 제외
  const accessories = available.filter((i) => i.type === 'accessory' && !i.honor && !i.premium)
  const treats = available.filter((i) => i.type === 'treat')
  const backgrounds = available.filter((i) => i.type === 'background' && !i.honor && !i.premium)
  // 고급 꾸미기 = honor 코스메틱(도구 제외). 재료 = 도구(진화의 돌 + 부적)
  const prestige = available.filter((i) => i.honor && i.type !== 'tool')
  const materials = available.filter((i) => i.type === 'tool')

  const gems = loadGems()
  const pass = loadPass()
  const passClaimable = canClaimPassDaily()

  const renderItem = (item: ShopItem) => {
    const owned = pet.ownedItems.includes(item.id)
    // 악세서리·배경은 "착용형"
    const wearable = item.type === 'accessory' || item.type === 'background'
    const equipped =
      item.type === 'accessory'
        ? pet.accessory === item.id
        : item.type === 'background'
          ? pet.background === item.id
          : false
    const affordable = pet.coins >= item.price
    return (
      <div key={item.id} className="shop-item">
        <span className="shop-emoji">{item.emoji}</span>
        <div className="shop-info">
          <span className="shop-name">{item.name}</span>
          <span className="shop-desc">{item.desc}</span>
        </div>
        <button
          type="button"
          className={
            'shop-buy' +
            (equipped ? ' equipped' : '') +
            (!owned && !affordable ? ' disabled' : '')
          }
          disabled={!owned && !affordable}
          onClick={() => onBuy(item)}
        >
          {wearable && owned
            ? equipped
              ? '착용 중'
              : '착용하기'
            : `🪙 ${item.price}`}
        </button>
      </div>
    )
  }

  const renderFurniture = (item: FurnitureItem) => {
    const owned = pet.furniture.includes(item.id)
    const affordable = pet.coins >= item.price
    return (
      <div key={item.id} className="shop-item">
        <span className="shop-emoji">{item.emoji}</span>
        <div className="shop-info">
          <span className="shop-name">{item.name}</span>
          <span className="shop-desc">{item.desc}</span>
        </div>
        <button
          type="button"
          className={
            'shop-buy' +
            (owned ? ' equipped' : '') +
            (!owned && !affordable ? ' disabled' : '')
          }
          disabled={owned || !affordable}
          onClick={() => onBuyFurniture(item)}
        >
          {owned ? '보유 중' : `🪙 ${item.price}`}
        </button>
      </div>
    )
  }

  // 프리미엄 코스메틱: 보석으로 구매(계정 소유) → 펫에 착용
  const equipPremium = (item: ShopItem) => {
    if (item.type === 'background') onUpdatePet({ background: item.id })
    else if (item.type === 'accessory') onUpdatePet({ accessory: item.id })
  }

  const handlePremiumBuy = (item: ShopItem) => {
    if (ownsPremium(item.id)) {
      equipPremium(item)
      refresh()
      return
    }
    const cost = item.gemPrice ?? 0
    if (!spendGems(cost)) return
    grantPremium(item.id)
    equipPremium(item)
    refresh()
  }

  const renderPremium = (item: ShopItem) => {
    const owned = ownsPremium(item.id)
    const equipped =
      item.type === 'accessory'
        ? pet.accessory === item.id
        : item.type === 'background'
          ? pet.background === item.id
          : false
    const affordable = gems >= (item.gemPrice ?? 0)
    return (
      <div key={item.id} className="shop-item is-premium">
        <span className="shop-emoji">{item.emoji}</span>
        <div className="shop-info">
          <span className="shop-name">{item.name}</span>
          <span className="shop-desc">{item.desc}</span>
        </div>
        <button
          type="button"
          className={
            'shop-buy' +
            (equipped ? ' equipped' : '') +
            (!owned && !affordable ? ' disabled' : '')
          }
          disabled={!owned && !affordable}
          onClick={() => handlePremiumBuy(item)}
        >
          {owned ? (equipped ? '착용 중' : '착용하기') : `💎 ${item.gemPrice}`}
        </button>
      </div>
    )
  }

  return (
    <Modal
      title="🛍️ 상점"
      variant={embedded ? 'inline' : 'modal'}
      onClose={onClose}
      headerExtra={
        <span className="shop-coins">
          🪙 {pet.coins} · 💎 {gems}
        </span>
      }
    >
      <div className="shop-tabs">
        <button
          type="button"
          className={'shop-tab' + (tab === 'items' ? ' active' : '')}
          onClick={() => setTab('items')}
        >
          아이템
        </button>
        <button
          type="button"
          className={'shop-tab' + (tab === 'furniture' ? ' active' : '')}
          onClick={() => setTab('furniture')}
        >
          🪑 가구
        </button>
        <button
          type="button"
          className={'shop-tab' + (tab === 'premium' ? ' active' : '')}
          onClick={() => setTab('premium')}
        >
          ✨ 프리미엄
        </button>
      </div>

      {tab === 'items' && (
        <>
          <p className="shop-season">
            {season.emoji} {season.name} 시즌 한정 아이템이 있어요!
          </p>

          <p className="shop-cat">🎀 꾸미기</p>
          <p className="shop-section-label">악세서리 (펫)</p>
          <div className="shop-list">{accessories.map(renderItem)}</div>
          <p className="shop-section-label">배경 (방)</p>
          <div className="shop-list">{backgrounds.map(renderItem)}</div>
          <p className="shop-section-label">✨ 고급 꾸미기 (고가 한정)</p>
          <div className="shop-list">{prestige.map(renderItem)}</div>

          <p className="shop-cat">💗 케어</p>
          <p className="shop-section-label">간식 (즉시 스탯 회복)</p>
          <div className="shop-list">{treats.map(renderItem)}</div>
          <p className="shop-section-label">🎁 선물 (선물함에 모아 → 선물하기로 애정 ↑)</p>
          <div className="shop-list">
            {GIFT_ITEMS.map((g) => {
              const owned = pet.gifts[g.id] ?? 0
              const affordable = pet.coins >= g.price
              return (
                <div key={g.id} className="shop-item">
                  <span className="shop-emoji">{g.emoji}</span>
                  <div className="shop-info">
                    <span className="shop-name">
                      {g.name}
                      {owned > 0 && <span className="shop-owned"> · 보유 {owned}</span>}
                    </span>
                    <span className="shop-desc">{g.desc}</span>
                  </div>
                  <button
                    type="button"
                    className={'shop-buy' + (!affordable ? ' disabled' : '')}
                    disabled={!affordable}
                    onClick={() => onBuy(g)}
                  >
                    🪙 {g.price}
                  </button>
                </div>
              )
            })}
          </div>

          <p className="shop-cat">🧪 진화·각성 재료</p>
          <p className="shop-section-label">진화의 돌 · 십이지 부적 (특수 진화·각성에 사용)</p>
          <div className="shop-list">{materials.map(renderItem)}</div>
        </>
      )}

      {tab === 'furniture' && (
        <>
          <p className="shop-season">
            🪑 방에 가구를 두면 펫의 행동과 진화에 영향을 줘요!
          </p>
          <div className="shop-list">{FURNITURE_ITEMS.map(renderFurniture)}</div>
        </>
      )}

      {tab === 'premium' && (
        <>
          {/* 단짝패스 구독 */}
          <div className={'shop-pass' + (pass.active ? ' active' : '')}>
            <div className="shop-pass-head">
              <span className="shop-pass-title">🎫 단짝패스</span>
              {pass.active ? (
                <span className="shop-pass-badge">구독 중</span>
              ) : null}
            </div>
            <p className="shop-pass-desc">
              매일 💎{PASS_DAILY_GEMS} + 🪙{PASS_DAILY_COINS} 보상, 프리미엄 코스메틱 열람.
            </p>
            {pass.active ? (
              <div className="shop-pass-actions">
                <button
                  type="button"
                  className="shop-buy"
                  disabled={!passClaimable}
                  onClick={() => {
                    const r = claimPassDaily()
                    if (r) onUpdatePet({ coins: pet.coins + r.coins })
                    refresh()
                  }}
                >
                  {passClaimable ? '오늘 보상 받기' : '오늘 받음'}
                </button>
                <button
                  type="button"
                  className="shop-pass-cancel"
                  onClick={() => {
                    cancelPass()
                    refresh()
                  }}
                >
                  구독 해지
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="shop-buy"
                onClick={() => {
                  activatePass()
                  refresh()
                }}
              >
                구독하기 (임시 · 무료)
              </button>
            )}
          </div>

          {/* 보석 충전 (결제 전 임시 스텁) */}
          <p className="shop-section-label">💎 보석 충전 (임시 · 결제 준비 중)</p>
          <div className="shop-charge">
            {[100, 500, 1200].map((amt) => (
              <button
                key={amt}
                type="button"
                className="shop-charge-btn"
                onClick={() => {
                  addGems(amt)
                  refresh()
                }}
              >
                +💎 {amt}
              </button>
            ))}
          </div>

          {/* 프리미엄 코스메틱 */}
          <p className="shop-section-label">방 테마 (프리미엄)</p>
          <div className="shop-list">{PREMIUM_BGS.map(renderPremium)}</div>
          <p className="shop-section-label">펫 치장 (프리미엄)</p>
          <div className="shop-list">{PREMIUM_ACCS.map(renderPremium)}</div>
        </>
      )}

      <p className="shop-hint">
        코인은 펫을 돌보거나 출석·미션·미니게임으로 모을 수 있어요.
      </p>
    </Modal>
  )
}
