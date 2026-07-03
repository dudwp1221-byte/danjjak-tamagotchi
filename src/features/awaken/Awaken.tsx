import { useEffect, useState } from 'react'
import type { Pet } from '../../types/pet'
import {
  formById,
  FOUR_SYMBOLS,
  ZODIAC,
  ARCHANGELS,
  SINS,
  FIENDS,
  HUANGLONG,
  type Form,
} from '../../utils/species'
import { awakenCond, type AwakenCtx } from '../../utils/awaken'
import { gameSeasonKey, birthMonth } from '../../utils/gametime'
import { petSpriteUrl } from '../../utils/pet'
import { loadDex } from '../../utils/storage'
import { stageFromLevel } from '../../utils/progression'
import PetAvatar from '../../components/PetAvatar'
import Modal from '../../components/Modal'
import './awaken.css'

interface Category {
  id: string
  label: string
  emoji: string
  forms: Form[]
}

const CATS: Category[] = [
  { id: 'four', label: '사신수', emoji: '🐲', forms: FOUR_SYMBOLS },
  { id: 'fiend', label: '사흉수', emoji: '👹', forms: FIENDS },
  { id: 'zodiac', label: '12지신', emoji: '🧧', forms: ZODIAC },
  { id: 'angel', label: '4대천사', emoji: '👼', forms: ARCHANGELS },
  { id: 'sin', label: '7대 죄악마', emoji: '😈', forms: SINS },
  { id: 'lord', label: '황룡 (초각성)', emoji: '🐉', forms: [HUANGLONG] },
]

function costLabel(cost: { coins?: number; item?: string }): string {
  if (cost.item?.startsWith('charm_')) return '🧧 부적'
  if (cost.item === 'item_evostone') return '💠 진화의 돌'
  return `🪙 ${cost.coins ?? 0}`
}

interface AwakenProps {
  pet: Pet
  level: number
  onAwaken: (formId: string) => void
  onClose: () => void
}

export default function Awaken({ pet, level, onAwaken, onClose }: AwakenProps) {
  const [cat, setCat] = useState<Category | null>(null)
  const [picked, setPicked] = useState<Form | null>(null)
  const [revealed, setRevealed] = useState(false)
  const form = formById(pet.form)
  const ctx: AwakenCtx = {
    pet,
    level,
    dex: new Set([...loadDex(), pet.form]),
    season: gameSeasonKey(pet.createdAt),
    birthMonth: birthMonth(pet.createdAt),
  }

  useEffect(() => {
    if (!picked) return
    setRevealed(false)
    const id = window.setTimeout(() => setRevealed(true), 1500)
    return () => window.clearTimeout(id)
  }, [picked])

  // 각성 연출 + 결과
  if (picked) {
    return (
      <Modal
        title={revealed ? '✦ 각성 완성!' : '✦ 각성 중…'}
        onClose={revealed ? () => onAwaken(picked.id) : () => {}}
      >
        {!revealed ? (
          <div className="aw-ritual">
            <div className="aw-ring" style={{ borderColor: picked.aura }} />
            <span className="aw-ritual-emoji">{form.emoji}</span>
            <p className="aw-ritual-text">고대의 힘이 깃들어요…</p>
          </div>
        ) : (
          <div className="aw-done">
            <span className="aw-burst">✦</span>
            <PetAvatar
              imageDataUrl={petSpriteUrl(pet)}
              stats={pet.stats}
              stage={stageFromLevel(level)}
              species={picked}
              stageIndex={Math.min(picked.tier, 3)}
              size={170}
              alt={picked.name}
            />
            <h3 className="aw-result-name">
              {picked.emoji} {picked.name}
            </h3>
            {picked.lore && <p className="aw-lore">“{picked.lore}”</p>}
            <button
              type="button"
              className="aw-confirm"
              onClick={() => onAwaken(picked.id)}
            >
              완료 🎉
            </button>
          </div>
        )}
      </Modal>
    )
  }

  // 카테고리 내 형태들 (형태마다 개별 조건)
  if (cat) {
    return (
      <Modal title={`✦ ${cat.label}`} onClose={onClose}>
        <p className="aw-intro">
          {form.emoji} {pet.name}이(가) 닿을 수 있는 모습은…
        </p>
        <div className="aw-grid">
          {cat.forms.map((f) => {
            const cond = awakenCond(f.id)
            const ok = cond ? cond.check(ctx) : false
            return (
              <button
                key={f.id}
                type="button"
                className={'aw-form' + (ok ? '' : ' locked')}
                disabled={!ok}
                onClick={() => ok && setPicked(f)}
                title={ok ? '' : cond?.hint}
              >
                <span className="aw-form-emoji">{ok ? f.emoji : '❔'}</span>
                <span className="aw-form-name">{ok ? f.name : '???'}</span>
                <span className="aw-form-cond">
                  {ok ? costLabel(cond!.cost) : '🔒'}
                </span>
              </button>
            )
          })}
        </div>
        {/* 잠긴 형태들의 암시 */}
        <div className="aw-hints">
          {cat.forms
            .filter((f) => {
              const c = awakenCond(f.id)
              return c && !c.check(ctx)
            })
            .map((f) => (
              <p key={f.id} className="aw-hint-line">
                🔒 {awakenCond(f.id)!.hint}
              </p>
            ))}
        </div>
        <button type="button" className="aw-back" onClick={() => setCat(null)}>
          ← 다른 각성
        </button>
      </Modal>
    )
  }

  return (
    <Modal title="✦ 각성 (히든)" onClose={onClose}>
      <p className="aw-intro">
        전설의 존재로 <strong>각성</strong>하는 길은 쉽게 열리지 않아요. 저마다의
        <strong> 숨겨진 조건</strong>을 스스로 찾아야 비로소 모습을 드러내죠…
      </p>
      <div className="aw-cats">
        {CATS.map((c) => {
          // 그룹 내 하나라도 각성 가능하면 빛남
          const anyOk = c.forms.some((f) => {
            const cond = awakenCond(f.id)
            return cond && cond.check(ctx)
          })
          return (
            <button
              key={c.id}
              type="button"
              className={'aw-cat' + (anyOk ? ' ready' : '') + (c.id === 'lord' ? ' lord' : '')}
              onClick={() => setCat(c)}
            >
              <span className="aw-cat-emoji">{c.emoji}</span>
              <span className="aw-cat-name">{c.label}</span>
              <span className="aw-cat-info">{anyOk ? '✦ 각성 가능!' : '🔒 ???'}</span>
            </button>
          )
        })}
      </div>
    </Modal>
  )
}
