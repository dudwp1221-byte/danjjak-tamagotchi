import { useEffect, useState } from 'react'
import type { Pet } from '../../types/pet'
import {
  formById,
  fusionResult,
  tierName,
} from '../../utils/species'

/** 합성 예고 문구 — 결과 형태별 풍미 텍스트 (실루엣 유지용) */
const FUSE_FLAVOR: Record<string, string> = {
  fuse_light: '눈부신 기운이 느껴져요…',
  fuse_dark: '심연의 기운이 느껴져요…',
  fuse_steel: '단단한 강철의 기운이 느껴져요…',
  fuse_chaos: '종잡을 수 없는 혼돈의 기운이 느껴져요…',
}
import { levelFromXp, stageFromLevel } from '../../utils/progression'
import { petSpriteUrl } from '../../utils/pet'
import PetAvatar from '../../components/PetAvatar'
import Modal from '../../components/Modal'
import './fusion-evo.css'

// 궁극체(레벨 10)부터 합성·졸업 가능 — 엔드게임 마일스톤 정렬
export const FUSION_MIN_LEVEL = 10

interface FusionEvoProps {
  pet: Pet
  partners: Pet[]
  selfEligible: boolean
  onFuse: (partnerId: string, resultFormId: string) => void
  onClose: () => void
  /** 페이저 페이지로 임베드 (배경/닫기 없이 인라인 렌더) */
  embedded?: boolean
}

type Phase = 'choose' | 'preview' | 'fusing' | 'done'

export default function FusionEvo({
  pet,
  partners,
  selfEligible,
  onFuse,
  onClose,
  embedded,
}: FusionEvoProps) {
  const modalVariant = embedded ? 'inline' : 'modal'
  const [partner, setPartner] = useState<Pet | null>(null)
  const [phase, setPhase] = useState<Phase>('choose')
  const myForm = formById(pet.form)
  const result = partner ? fusionResult(myForm, formById(partner.form)) : null

  useEffect(() => {
    if (phase !== 'fusing') return
    const id = window.setTimeout(() => setPhase('done'), 1900)
    return () => window.clearTimeout(id)
  }, [phase])

  if (!selfEligible || partners.length === 0) {
    return (
      <Modal title="⚗️ 펫 합성" variant={modalVariant} onClose={onClose}>
        <p className="fe-empty">
          펫 합성은 <strong>레벨 {FUSION_MIN_LEVEL} 이상</strong> 펫 두 마리가
          필요해요.
          <br />
          {!selfEligible
            ? `지금 펫(${pet.name})을 레벨 ${FUSION_MIN_LEVEL} 이상으로 더 키워주세요!`
            : `보관함에 레벨 ${FUSION_MIN_LEVEL} 이상 펫이 한 마리 더 있어야 해요.`}
        </p>
      </Modal>
    )
  }

  // 합성 연출 중
  if (phase === 'fusing' && partner && result) {
    return (
      <Modal title="⚗️ 합성 중…" variant={modalVariant} onClose={() => {}}>
        <div className="fe-fusing">
          <div className="fe-orbit">
            <span className="fe-orb fe-orb-a">{myForm.emoji}</span>
            <span className="fe-orb fe-orb-b">
              {formById(partner.form).emoji}
            </span>
            <span className="fe-core" style={{ background: result.aura }} />
          </div>
          <p className="fe-fusing-text">두 영혼이 하나로 합쳐져요…</p>
        </div>
      </Modal>
    )
  }

  // 합성 결과 공개
  if (phase === 'done' && partner && result) {
    return (
      <Modal title="⚗️ 합성 완성!" variant={modalVariant} onClose={() => onFuse(partner.id, result.id)}>
        <div className="fe-preview fe-done">
          <span className="fe-burst">✨</span>
          <PetAvatar
            imageDataUrl={petSpriteUrl(pet)}
            stats={pet.stats}
            stage={stageFromLevel(levelFromXp(pet.growth))}
            species={result}
            stageIndex={3}
            size={170}
            alt={result.name}
          />
          <h3 className="fe-result-name">
            {result.emoji} {result.name}
          </h3>
          <p className="fe-result-class">
            {tierName(result.tier)} · {result.type}
          </p>
          <button
            type="button"
            className="fe-yes"
            onClick={() => onFuse(partner.id, result.id)}
          >
            완료 🎉
          </button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="⚗️ 펫 합성 (DNA 합성)" variant={modalVariant} onClose={onClose}>
      {!partner ? (
        <>
          <p className="fe-intro">
            <strong>{myForm.emoji} {pet.name}</strong>와(과) 합성할 단짝을
            골라요. 둘의 기운이 합쳐져 강력한 형태가 돼요!
          </p>
          <div className="fe-partners">
            {partners.map((p) => {
              const f = formById(p.form)
              return (
                <button
                  key={p.id}
                  type="button"
                  className="fe-partner"
                  onClick={() => setPartner(p)}
                >
                  <span className="fe-p-emoji">{f.emoji}</span>
                  <span className="fe-p-name">{p.name}</span>
                  <span className="fe-p-attr">
                    {tierName(f.tier)} · Lv.{levelFromXp(p.growth)}
                  </span>
                </button>
              )
            })}
          </div>
        </>
      ) : (
        result && (
          <div className="fe-preview">
            <div className="fe-parents">
              <span>{myForm.emoji} {pet.name}</span>
              <span className="fe-plus">+</span>
              <span>{formById(partner.form).emoji} {partner.name}</span>
            </div>
            <span className="fe-arrow">⬇️</span>
            <div className="fe-result-silhouette">❔</div>
            <p className="fe-result-hint">
              {FUSE_FLAVOR[result.id] ?? '알 수 없는 기운이 느껴져요…'}
            </p>
            <p className="fe-warn">
              ⚠️ {pet.name}이(가) 합성 형태가 되고, {partner.name}은(는) 함께
              녹아들어 사라져요. 되돌릴 수 없어요!
            </p>
            <div className="fe-btns">
              <button
                type="button"
                className="fe-yes"
                onClick={() => setPhase('fusing')}
              >
                ⚗️ 합성한다!
              </button>
              <button
                type="button"
                className="fe-no"
                onClick={() => setPartner(null)}
              >
                다시 고르기
              </button>
            </div>
          </div>
        )
      )}
    </Modal>
  )
}
