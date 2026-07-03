import { useEffect, useState } from 'react'
import type { Pet } from '../../types/pet'
import {
  formById,
  nextForms,
  tierName,
} from '../../utils/species'
import PetAvatar from '../../components/PetAvatar'
import { stageFromLevel } from '../../utils/progression'
import { petSpriteUrl, displaySpecies } from '../../utils/pet'
import './species-reveal.css'

interface SpeciesRevealProps {
  pet: Pet
  /** 새로 발견한 형태인지 */
  isNew: boolean
  onContinue: () => void
}

export default function SpeciesReveal({ pet, isNew, onContinue }: SpeciesRevealProps) {
  const [revealed, setRevealed] = useState(false)
  const form = formById(pet.form)
  const branches = nextForms(form.id)

  useEffect(() => {
    const id = window.setTimeout(() => setRevealed(true), 1600)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <div className="rv-screen">
      {!revealed ? (
        <div className="rv-suspense">
          <div className="rv-egg">🥚</div>
          <p className="rv-dots">두근두근…</p>
        </div>
      ) : (
        <div className="rv-result">
          {isNew && (
            <span className="rv-rarity">
              <span className="rv-new">NEW</span>
            </span>
          )}

          <PetAvatar
            imageDataUrl={petSpriteUrl(pet)}
            stats={pet.stats}
            stage={stageFromLevel(1)}
            species={displaySpecies(pet)}
            stageIndex={0}
            size={200}
            alt={pet.name}
          />

          <h1 className="rv-title">
            {form.emoji} {form.name}
          </h1>
          <p className="rv-sub">
            {pet.name} · {tierName(form.tier)}
          </p>
          <p className="rv-class">{form.family} / {form.type}</p>
          {branches.length > 0 && (
            <p className="rv-desc">
              잘 키우면 <strong>{branches.length}가지 갈래</strong>로 다르게
              진화할 수 있어요!
            </p>
          )}

          <button type="button" className="rv-btn" onClick={onContinue}>
            키우러 가기 🐾
          </button>
        </div>
      )}
    </div>
  )
}
