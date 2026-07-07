import { useState } from 'react'
import { spriteUrl } from '../../utils/pet'
import type { Form } from '../../utils/species'
import { tierName } from '../../utils/species'
import { EVOLUTION_CONDITIONS, checkCondition } from '../../utils/evolution-conditions'
import Modal from '../../components/Modal'
import './evolve.css'

/** 진화 후보의 실제 스프라이트(얼굴). 이미지 없으면 이모지 폴백 */
function EvoSprite({ id, emoji }: { id: string; emoji: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <>{emoji}</>
  return (
    <img
      className="evo-img"
      src={spriteUrl(id)}
      alt=""
      draggable={false}
      onError={() => setFailed(true)}
    />
  )
}

export interface EvolveOption {
  form: Form
  locked: boolean
  reason: string
}

interface EvolveProps {
  current: Form
  options: EvolveOption[]
  onEvolve: (formId: string) => void
  onClose: () => void
  behaviorProfile?: Record<string, number>
}

export default function Evolve({ current, options, onEvolve, onClose, behaviorProfile = {} }: EvolveProps) {
  const multi = options.length > 1
  return (
    <Modal title="✨ 진화!" onClose={onClose}>
      <p className="evo-intro">
        <strong>{current.emoji} {current.name}</strong>이(가) 진화할 준비가 됐어요!
        {multi ? ' 어떤 모습으로 진화할까요?' : ''}
      </p>

      <div className="evo-options">
        {options.map(({ form: f, locked, reason }) => {
          const special = f.requires === 'evostone' || f.requires === 'allHigh'
          const isCond = f.requires?.startsWith('cond:')
          const condKey = isCond ? f.requires!.slice(5) : null
          const condInfo = condKey ? EVOLUTION_CONDITIONS[condKey] : null
          const condCheck = condKey ? checkCondition(behaviorProfile, condKey) : null
          return (
            <button
              key={f.id}
              type="button"
              className={
                'evo-card' + (special ? ' special' : '') + (locked ? ' locked' : '')
              }
              disabled={locked}
              onClick={() => onEvolve(f.id)}
            >
              {special && <span className="evo-special-tag">합성</span>}
              <span className="evo-emoji">{locked ? '❔' : <EvoSprite id={f.id} emoji={f.emoji} />}</span>
              <span className="evo-name">{locked ? '???' : f.name}</span>
              {locked ? (
                <>
                  <span className="evo-lock">🔒 {reason}</span>
                  {condInfo && (
                    <span className="evo-cond-hint">{condInfo.hint}</span>
                  )}
                  {condCheck && (
                    <span className="evo-cond-progress">
                      {condCheck.progress}/{condCheck.threshold}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="evo-class">
                    {tierName(f.tier)} · {f.type}
                  </span>
                </>
              )}
            </button>
          )
        })}
      </div>

      {multi && <p className="evo-hint">한 번 선택하면 그 갈래로 자라요. 신중하게!</p>}
    </Modal>
  )
}
