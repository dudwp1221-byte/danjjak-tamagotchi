import type { Pet } from '../../types/pet'
import { GIFT_ITEMS, type ShopItem } from '../../utils/items'
import Modal from '../../components/Modal'
import './gift.css'

interface GiftPickerProps {
  pet: Pet
  onClose: () => void
  /** 선물 주기 (아이템 1개 소모) */
  onGive: (item: ShopItem) => void
  /** 상점으로 이동 */
  onGoShop: () => void
}

export default function GiftPicker({ pet, onClose, onGive, onGoShop }: GiftPickerProps) {
  const owned = GIFT_ITEMS.filter((g) => (pet.gifts[g.id] ?? 0) > 0)

  return (
    <Modal title="🎁 선물하기" onClose={onClose}>
      <p className="gift-desc">선물을 주면 애정이 올라가요. 상점에서 사거나 이벤트로 모을 수 있어요.</p>

      {owned.length === 0 ? (
        <div className="gift-empty">
          <span className="gift-empty-emoji">🎁</span>
          <p>아직 가진 선물이 없어요.</p>
          <button type="button" className="gift-shop-btn" onClick={onGoShop}>
            🛍️ 상점에서 선물 사기
          </button>
        </div>
      ) : (
        <div className="gift-list">
          {owned.map((g) => (
            <div key={g.id} className="gift-item">
              <span className="gift-emoji">{g.emoji}</span>
              <div className="gift-info">
                <span className="gift-name">
                  {g.name} <span className="gift-count">×{pet.gifts[g.id]}</span>
                </span>
                <span className="gift-aff">💗 애정 +{g.affection}</span>
              </div>
              <button type="button" className="gift-give" onClick={() => onGive(g)}>
                선물하기
              </button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}
