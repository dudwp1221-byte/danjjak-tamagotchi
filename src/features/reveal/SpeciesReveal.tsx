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
  // 알 스프라이트(public/intro/egg_glow.webp)가 있으면 사용, 없으면 이모지 폴백
  const [eggImgOk, setEggImgOk] = useState(true)
  const form = formById(pet.form)
  const branches = nextForms(form.id)

  useEffect(() => {
    const id = window.setTimeout(() => setRevealed(true), 1600)
    return () => window.clearTimeout(id)
  }, [])

  // 유년기(현재 형태)의 종족 색으로 알을 물들인다 — 감성 + 어떤 아이가 나올지 살짝 암시
  const eggTint = form.aura
  return (
    <div className="rv-screen">
      {!revealed ? (
        <div className="rv-suspense">
          <div
            className="rv-egg"
            style={{ '--egg-tint': eggTint } as React.CSSProperties}
          >
            {eggImgOk ? (
              <span className="rv-egg-wrap">
                <img
                  className="rv-egg-img"
                  src="/intro/egg_glow.webp"
                  alt=""
                  draggable={false}
                  onError={() => setEggImgOk(false)}
                />
                {/* 알 모양을 마스크로 써서 종족 색만 은은하게 입힌다 */}
                <span className="rv-egg-tint" />
              </span>
            ) : (
              '🥚'
            )}
          </div>
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
