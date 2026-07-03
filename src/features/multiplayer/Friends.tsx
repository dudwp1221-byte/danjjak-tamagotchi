import { useEffect, useState } from 'react'
import type { Pet } from '../../types/pet'
import { levelFromXp, stageFromLevel } from '../../utils/progression'
import { formById } from '../../utils/species'
import { wellbeing } from '../../utils/stats'
import { daysTogether, petSpriteUrl, displaySpecies } from '../../utils/pet'
import PetAvatar from '../../components/PetAvatar'
import Modal from '../../components/Modal'
import { social } from './backend'
import './friends.css'

interface FriendsProps {
  onClose: () => void
  /** 선물을 보냈을 때 플레이어에게 줄 보상 처리 */
  onGiftSent: () => void
}

export default function Friends({ onClose, onGiftSent }: FriendsProps) {
  const [friends, setFriends] = useState<Pet[] | null>(null)
  const [gifted, setGifted] = useState<Set<string>>(new Set())

  useEffect(() => {
    let alive = true
    social.getFriends().then((list) => {
      if (alive) setFriends(list)
    })
    return () => {
      alive = false
    }
  }, [])

  const handleGift = async (friend: Pet) => {
    if (gifted.has(friend.id)) return
    await social.sendGift(friend.id)
    setGifted((prev) => new Set(prev).add(friend.id))
    setFriends(
      (prev) =>
        prev?.map((f) =>
          f.id === friend.id
            ? { ...f, stats: { ...f.stats, mood: Math.min(100, f.stats.mood + 15) } }
            : f,
        ) ?? prev,
    )
    onGiftSent()
  }

  return (
    <Modal title="👀 친구 펫 구경" onClose={onClose}>
      {friends === null ? (
        <p className="friends-loading">불러오는 중…</p>
      ) : (
        <div className="friends-list">
          {friends.map((f) => {
            const level = levelFromXp(f.growth)
            const stage = stageFromLevel(level)
            const score = wellbeing(f.stats)
            const form = formById(f.form)
            return (
              <div key={f.id} className="friend-card">
                <PetAvatar
                  imageDataUrl={petSpriteUrl(f)}
                  stats={f.stats}
                  stage={stage}
                  accessory={f.accessory}
                  species={displaySpecies(f)}
                  stageIndex={form.tier}
                  size={90}
                  animate={false}
                  showOverlays={false}
                  alt={f.name}
                />
                <div className="friend-info">
                  <span className="friend-name">
                    {stage.badge} {f.name}
                  </span>
                  <span className="friend-owner">{f.ownerName}</span>
                  <span className="friend-meta">
                    Lv.{level} · 컨디션 {score} · {daysTogether(f.createdAt)}일째
                  </span>
                </div>
                <button
                  type="button"
                  className={'friend-gift' + (gifted.has(f.id) ? ' done' : '')}
                  onClick={() => handleGift(f)}
                  disabled={gifted.has(f.id)}
                >
                  {gifted.has(f.id) ? '보냄 ✓' : '🎁 선물'}
                </button>
              </div>
            )
          })}
        </div>
      )}
      <p className="friends-hint">
        친구에게 선물을 보내면 친구 펫의 기분이 좋아지고, 나도 코인을 받아요!
        <br />
        (지금은 로컬 데모 · 추후 Firebase로 실제 친구 연동 예정)
      </p>
    </Modal>
  )
}
