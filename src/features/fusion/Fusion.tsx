import { useEffect, useState } from 'react'
import type { Pet } from '../../types/pet'
import { social } from '../multiplayer/backend'
import { blendPets, suggestChildName } from '../../utils/fusion'
import { levelFromXp, stageFromLevel } from '../../utils/progression'
import PetAvatar from '../../components/PetAvatar'
import Modal from '../../components/Modal'
import './fusion.css'

interface FusionProps {
  pet: Pet
  onClose: () => void
  /** 2세를 입양 (현재 펫을 새 펫으로 교체) */
  onAdopt: (name: string, imageDataUrl: string) => void
}

export default function Fusion({ pet, onClose, onAdopt }: FusionProps) {
  const [friends, setFriends] = useState<Pet[] | null>(null)
  const [partner, setPartner] = useState<Pet | null>(null)
  const [childImg, setChildImg] = useState<string | null>(null)
  const [childName, setChildName] = useState('')
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    let alive = true
    social.getFriends().then((list) => {
      if (alive) setFriends(list)
    })
    return () => {
      alive = false
    }
  }, [])

  const choosePartner = async (friend: Pet) => {
    setPartner(friend)
    setChildName(suggestChildName(pet.name, friend.name))
    const img = await blendPets(pet.imageDataUrl, friend.imageDataUrl)
    setChildImg(img)
  }

  const childStage = stageFromLevel(1)

  return (
    <Modal title="🧬 펫 합성소" onClose={onClose}>
      {!partner ? (
        <>
          <p className="fus-intro">
            {pet.name}와(과) 짝을 이룰 친구 펫을 골라보세요. 둘을 닮은 2세가
            태어나요!
          </p>
          {friends === null ? (
            <p className="fus-loading">불러오는 중…</p>
          ) : (
            <div className="fus-friends">
              {friends.map((f) => {
                const stage = stageFromLevel(levelFromXp(f.growth))
                return (
                  <button
                    key={f.id}
                    type="button"
                    className="fus-friend"
                    onClick={() => choosePartner(f)}
                  >
                    <PetAvatar
                      imageDataUrl={f.imageDataUrl}
                      stats={f.stats}
                      stage={stage}
                      size={70}
                      animate={false}
                      showOverlays={false}
                      alt={f.name}
                    />
                    <span className="fus-friend-name">{f.name}</span>
                  </button>
                )
              })}
            </div>
          )}
        </>
      ) : (
        <div className="fus-result">
          <div className="fus-parents">
            <div className="fus-parent">
              <img src={pet.imageDataUrl} alt={pet.name} />
              <span>{pet.name}</span>
            </div>
            <span className="fus-plus">+</span>
            <div className="fus-parent">
              <img src={partner.imageDataUrl} alt={partner.name} />
              <span>{partner.name}</span>
            </div>
          </div>

          <span className="fus-arrow">⬇️</span>

          <div className="fus-child">
            {childImg ? (
              <PetAvatar
                imageDataUrl={childImg}
                stats={{ hunger: 100, mood: 100, cleanliness: 100, energy: 100, health: 100 }}
                stage={childStage}
                size={150}
                animate
                showOverlays={false}
                alt="2세"
              />
            ) : (
              <p className="fus-loading">합성 중…</p>
            )}
            <input
              className="fus-name"
              value={childName}
              maxLength={8}
              onChange={(e) => setChildName(e.target.value)}
              aria-label="2세 이름"
            />
          </div>

          {confirming ? (
            <div className="fus-confirm">
              <p>
                2세를 입양하면 지금 키우던 <strong>{pet.name}</strong>와(과)
                작별하고 새로 시작해요. 계속할까요?
              </p>
              <div className="fus-confirm-btns">
                <button
                  type="button"
                  className="fus-yes"
                  onClick={() =>
                    childImg && onAdopt(childName.trim() || '아가', childImg)
                  }
                >
                  네, 입양할래요
                </button>
                <button
                  type="button"
                  className="fus-no"
                  onClick={() => setConfirming(false)}
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <div className="fus-actions">
              <button
                type="button"
                className="fus-adopt"
                disabled={!childImg}
                onClick={() => setConfirming(true)}
              >
                🐣 이 아이 입양하기
              </button>
              <button
                type="button"
                className="fus-retry"
                onClick={() => {
                  setPartner(null)
                  setChildImg(null)
                  setConfirming(false)
                }}
              >
                다른 짝 고르기
              </button>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
