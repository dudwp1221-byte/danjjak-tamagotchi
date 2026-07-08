import { useState } from 'react'
import type { Pet } from '../../types/pet'
import { SHOP_ITEMS, backgroundCss, getItem, type ShopItem } from '../../utils/items'
import { FURNITURE_ITEMS } from '../../utils/furniture'
import { ownsPremium } from '../../utils/premium'
import AccessorySprite from '../../components/AccessorySprite'
import FurnitureSprite from '../../components/FurnitureSprite'
import Modal from '../../components/Modal'
import './bag.css'

type BagTab = 'acc' | 'theme' | 'furniture'

interface BagProps {
  pet: Pet
  onUpdatePet: (patch: Partial<Pet>) => void
  /** 악세서리 위치 조정 — 옷장 편집기로 전환 */
  onOpenCloset: () => void
  onClose: () => void
}

/** 계정/펫이 보유한 아이템인지 (프리미엄은 계정 단위 소유) */
function ownedBy(pet: Pet, item: ShopItem): boolean {
  return pet.ownedItems.includes(item.id) || (!!item.premium && ownsPremium(item.id))
}

/**
 * 🎒 가방 — 보유한 꾸미기 아이템을 자유롭게 꺼내 쓰고(착용/배치) 넣는(해제/보관) 곳.
 * 상점은 구매 전용, 착용은 전부 여기서.
 */
/** 방에 동시에 꺼내 놓을 수 있는 가구 수 — 난잡함 방지 */
const MAX_PLACED = 6
/** 동시 착용 가능한 악세서리 수 (오라 포함) */
const MAX_WORN = 4

export default function Bag({ pet, onUpdatePet, onOpenCloset, onClose }: BagProps) {
  const [tab, setTab] = useState<BagTab>('acc')
  const [warn, setWarn] = useState<string | null>(null)

  const accs = SHOP_ITEMS.filter((i) => i.type === 'accessory' && ownedBy(pet, i))
  const themes = SHOP_ITEMS.filter((i) => i.type === 'background' && ownedBy(pet, i))
  const furniture = FURNITURE_ITEMS.filter((f) => pet.furniture.includes(f.id))
  const placed = pet.furniturePlaced ?? pet.furniture
  const wornIds = pet.accessories ?? (pet.accessory ? [pet.accessory] : [])

  const flash = (msg: string) => {
    setWarn(msg)
    window.setTimeout(() => setWarn(null), 2500)
  }

  /** 악세서리 다중 착용 토글 — 오라는 서로 배타(1개), 총 개수 제한 */
  const toggleAccessory = (item: ShopItem) => {
    let next: string[]
    if (wornIds.includes(item.id)) {
      next = wornIds.filter((w) => w !== item.id)
    } else {
      // 오라를 새로 끼면 기존 오라는 벗는다
      const base = item.aura ? wornIds.filter((w) => !getItem(w)?.aura) : [...wornIds]
      if (base.length >= MAX_WORN) {
        flash(`동시에 ${MAX_WORN}개까지만 착용할 수 있어요 — 먼저 하나를 벗어 주세요`)
        return
      }
      next = [...base, item.id]
    }
    onUpdatePet({ accessories: next, accessory: next[0] ?? null })
  }

  const toggleFurniture = (id: string) => {
    if (!placed.includes(id) && placed.length >= MAX_PLACED) {
      setWarn(`방에는 가구를 ${MAX_PLACED}개까지만 놓을 수 있어요 — 먼저 하나를 보관해 주세요`)
      window.setTimeout(() => setWarn(null), 2500)
      return
    }
    const next = placed.includes(id) ? placed.filter((p) => p !== id) : [...placed, id]
    onUpdatePet({ furniturePlaced: next })
  }

  return (
    <Modal title="🎒 가방" onClose={onClose}>
      <div className="bag-tabs">
        <button type="button" className={'bag-tab' + (tab === 'acc' ? ' active' : '')} onClick={() => setTab('acc')}>
          👗 치장 {accs.length > 0 && <em>{accs.length}</em>}
        </button>
        <button type="button" className={'bag-tab' + (tab === 'theme' ? ' active' : '')} onClick={() => setTab('theme')}>
          🖼️ 테마 {themes.length > 0 && <em>{themes.length}</em>}
        </button>
        <button type="button" className={'bag-tab' + (tab === 'furniture' ? ' active' : '')} onClick={() => setTab('furniture')}>
          🛋️ 가구 {furniture.length > 0 && <em>{furniture.length}</em>}
        </button>
      </div>

      {tab === 'acc' && (
        <>
          <p className="bag-hint">
            눌러서 착용/해제 (동시에 {MAX_WORN}개까지, 오라는 1개) — 위치·크기는 옷장에서
          </p>
          {warn && <p className="bag-warn">{warn}</p>}
          <div className="bag-grid">
            {accs.map((i) => {
              const wornNow = wornIds.includes(i.id)
              return (
                <button
                  key={i.id}
                  type="button"
                  className={'bag-slot' + (wornNow ? ' active' : '')}
                  onClick={() => toggleAccessory(i)}
                  title={i.desc}
                >
                  <span className="bag-slot-icon">
                    {i.aura ? i.emoji : <AccessorySprite id={i.id} emoji={i.emoji} width="2rem" />}
                  </span>
                  <span className="bag-slot-name">{i.name}</span>
                  {wornNow && <em className="bag-slot-tag">착용 중</em>}
                </button>
              )
            })}
          </div>
          {accs.length === 0 && <p className="bag-empty">아직 치장 아이템이 없어요 — 상점에서 사면 여기 담겨요 🛍️</p>}
          {accs.length > 0 && (
            <button type="button" className="bag-closet-btn" onClick={onOpenCloset}>
              🪞 옷장에서 위치·크기 조정
            </button>
          )}
        </>
      )}

      {tab === 'theme' && (
        <>
          <p className="bag-hint">눌러서 방 테마 적용/해제</p>
          <div className="bag-grid bag-grid-theme">
            {themes.map((i) => {
              const worn = pet.background === i.id
              const bg = backgroundCss(i.id)
              return (
                <button
                  key={i.id}
                  type="button"
                  className={'bag-slot bag-slot-theme' + (worn ? ' active' : '')}
                  onClick={() => onUpdatePet({ background: worn ? null : i.id })}
                  title={i.desc}
                >
                  <span className="bag-theme-thumb" style={bg ? { background: bg } : undefined} />
                  <span className="bag-slot-name">{i.name}</span>
                  {worn && <em className="bag-slot-tag">적용 중</em>}
                </button>
              )
            })}
          </div>
          {themes.length === 0 && <p className="bag-empty">아직 방 테마가 없어요 — 상점에서 사면 여기 담겨요 🛍️</p>}
        </>
      )}

      {tab === 'furniture' && (
        <>
          <p className="bag-hint">
            눌러서 방에 꺼내기/보관 (방에 {placed.length}/{MAX_PLACED}) — 방에서는 끌어서 자리를 옮겨요
          </p>
          {warn && <p className="bag-warn">{warn}</p>}
          <div className="bag-grid">
            {furniture.map((f) => {
              const out = placed.includes(f.id)
              return (
                <button
                  key={f.id}
                  type="button"
                  className={'bag-slot' + (out ? ' active' : '')}
                  onClick={() => toggleFurniture(f.id)}
                  title={f.desc}
                >
                  <span className="bag-slot-icon">
                    <FurnitureSprite id={f.id} emoji={f.emoji} />
                  </span>
                  <span className="bag-slot-name">{f.name}</span>
                  <em className="bag-slot-tag">{out ? '방에 있음' : '보관 중'}</em>
                </button>
              )
            })}
          </div>
          {furniture.length === 0 && <p className="bag-empty">아직 가구가 없어요 — 상점에서 사면 여기 담겨요 🛍️</p>}
        </>
      )}
    </Modal>
  )
}
