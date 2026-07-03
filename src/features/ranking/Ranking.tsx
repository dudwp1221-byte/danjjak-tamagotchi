import { useEffect, useMemo, useState } from 'react'
import type { Pet } from '../../types/pet'
import { social } from '../multiplayer/backend'
import { levelFromXp, stageFromLevel } from '../../utils/progression'
import { formById } from '../../utils/species'
import { wellbeing } from '../../utils/stats'
import { daysTogether, petSpriteUrl, displaySpecies } from '../../utils/pet'
import PetAvatar from '../../components/PetAvatar'
import Modal from '../../components/Modal'
import './ranking.css'

interface RankingProps {
  pet: Pet
  onClose: () => void
}

/** 펫 점수 = 레벨*100 + 함께한 일수*5 + 컨디션 */
function petScore(p: Pet): number {
  return levelFromXp(p.growth) * 100 + daysTogether(p.createdAt) * 5 + wellbeing(p.stats)
}

const MEDALS = ['🥇', '🥈', '🥉']

export default function Ranking({ pet, onClose }: RankingProps) {
  const [friends, setFriends] = useState<Pet[] | null>(null)

  useEffect(() => {
    let alive = true
    social.getFriends().then((list) => {
      if (alive) setFriends(list)
    })
    return () => {
      alive = false
    }
  }, [])

  const ranked = useMemo(() => {
    if (!friends) return null
    const all = [...friends, pet]
    return all
      .map((p) => ({ pet: p, score: petScore(p), isMe: p.id === pet.id }))
      .sort((a, b) => b.score - a.score)
  }, [friends, pet])

  const myRank = ranked ? ranked.findIndex((r) => r.isMe) + 1 : 0

  return (
    <Modal
      title="🏅 명예의 전당"
      onClose={onClose}
      headerExtra={
        ranked ? <span className="rank-myrank">내 순위 {myRank}위</span> : null
      }
    >
      {ranked === null ? (
        <p className="rank-loading">불러오는 중…</p>
      ) : (
        <ol className="rank-list">
          {ranked.map((r, i) => {
            const level = levelFromXp(r.pet.growth)
            const stage = stageFromLevel(level)
            const form = formById(r.pet.form)
            return (
              <li
                key={r.pet.id}
                className={'rank-row' + (r.isMe ? ' me' : '')}
              >
                <span className="rank-pos">{MEDALS[i] ?? `${i + 1}`}</span>
                <PetAvatar
                  imageDataUrl={petSpriteUrl(r.pet)}
                  stats={r.pet.stats}
                  stage={stage}
                  accessory={r.pet.accessory}
                  species={displaySpecies(r.pet)}
                  stageIndex={form.tier}
                  size={48}
                  animate={false}
                  showOverlays={false}
                  alt={r.pet.name}
                />
                <div className="rank-info">
                  <span className="rank-name">
                    {r.pet.name}
                    {r.isMe && <span className="rank-tag">나</span>}
                  </span>
                  <span className="rank-sub">
                    {r.pet.ownerName} · Lv.{level}
                  </span>
                </div>
                <span className="rank-score">{r.score}</span>
              </li>
            )
          })}
        </ol>
      )}
      <p className="rank-hint">
        점수 = 레벨×100 + 함께한 일수×5 + 컨디션. 잘 돌볼수록 순위가 올라가요!
      </p>
    </Modal>
  )
}
