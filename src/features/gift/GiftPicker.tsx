import type { Pet } from '../../types/pet'
import { GIFT_ITEMS, type ShopItem } from '../../utils/items'
import { personalityDef } from '../../utils/personality'
import { FAVORITE_GIFT, giftBondGain, objectParticle, bondStage, nextBondStage } from '../../utils/bond'
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
  const person = personalityDef(pet.personality)
  const favId = FAVORITE_GIFT[pet.personality]
  const fav = GIFT_ITEMS.find((g) => g.id === favId)

  return (
    <Modal title="🎁 선물하기" onClose={onClose}>
      {/* 유대 = 깎이지 않고 쌓이기만 하는 우리 사이의 친밀도. 단계가 오르면 대사·기록이 깊어짐 */}
      {(() => {
        const bond = pet.bond ?? 0
        const stage = bondStage(bond)
        const next = nextBondStage(bond)
        return (
          <div className="gift-bond">
            <div className="gift-bond-row">
              <span className="gift-bond-stage">{stage.emoji} {stage.name}</span>
              <span className="gift-bond-val">💞 {bond}</span>
            </div>
            {next && (
              <div className="gift-bond-track">
                <div
                  className="gift-bond-fill"
                  style={{ width: `${Math.min(100, Math.round((bond / next.min) * 100))}%` }}
                />
              </div>
            )}
            <p className="gift-bond-desc">
              <strong>유대</strong>는 우리 사이의 친밀도예요. 선물·매일 인사로 쌓이기만 하고
              절대 줄지 않아요 — 깊어질수록 펫이 더 다정하게 말을 걸어요.
              {next && ` (다음: ${next.emoji} ${next.name})`}
            </p>
          </div>
        )
      })()}
      <p className="gift-desc">
        선물은 애정과 함께 <strong>유대</strong>를 쌓고, 일기에 추억으로 남아요.
      </p>
      {fav && (
        <p className="gift-fav-hint">
          💡 {person.emoji} {person.name} 성격은 {fav.emoji} <strong>{fav.name}</strong>
          {objectParticle(fav.name)} 제일 좋아해요! (유대 2배)
        </p>
      )}

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
          {owned.map((g) => {
            const favorite = g.id === favId
            return (
              <div key={g.id} className={'gift-item' + (favorite ? ' is-fav' : '')}>
                <span className="gift-emoji">{g.emoji}</span>
                <div className="gift-info">
                  <span className="gift-name">
                    {g.name} <span className="gift-count">×{pet.gifts[g.id]}</span>
                    {favorite && <span className="gift-fav-badge">💖 최애</span>}
                  </span>
                  <span className="gift-aff">
                    💗 애정 +{g.affection} · 💞 유대 +{giftBondGain(g.affection ?? 20, favorite)}
                  </span>
                </div>
                <button type="button" className="gift-give" onClick={() => onGive(g)}>
                  선물하기
                </button>
              </div>
            )
          })}
        </div>
      )}
    </Modal>
  )
}
