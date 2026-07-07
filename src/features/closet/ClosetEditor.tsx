import { useEffect, useRef, useState } from 'react'
import type { Pet, AccessoryPlacement } from '../../types/pet'
import { SHOP_ITEMS, placementKey, backgroundCss, type ShopItem } from '../../utils/items'
import { ownsPremium } from '../../utils/premium'
import { levelFromXp, stageFromLevel } from '../../utils/progression'
import { formById } from '../../utils/species'
import { petSpriteUrl } from '../../utils/pet'
import PetAvatar from '../../components/PetAvatar'
import AccessorySprite from '../../components/AccessorySprite'
import Modal from '../../components/Modal'
import './closet.css'

/** 기본 배치 — 머리 위 중앙 (기존 고정 오프셋과 비슷한 자리) */
const DEFAULT_POS: AccessoryPlacement = { x: 50, y: 10, s: 1 }
const AVATAR_SIZE = 200

interface ClosetEditorProps {
  pet: Pet
  onClose: () => void
  /** 착용/배치 저장 */
  onUpdatePet: (patch: Partial<Pet>) => void
}

/**
 * 옷장 — 내 펫 위에 악세서리를 직접 끌어다 배치하고 저장한다.
 * 배치는 형태(진화)별로 저장되어, 진화로 몸집이 바뀌면 다시 맞춰줄 수 있다.
 */
export default function ClosetEditor({ pet, onClose, onUpdatePet }: ClosetEditorProps) {
  const level = levelFromXp(pet.growth)
  const form = formById(pet.form)

  // 보유 악세서리 (일반 = 펫 소유, 프리미엄 오라 = 계정 소유)
  const owned = SHOP_ITEMS.filter(
    (i) =>
      i.type === 'accessory' &&
      (pet.ownedItems.includes(i.id) || (i.premium && ownsPremium(i.id))),
  )

  const [selId, setSelId] = useState<string | null>(pet.accessory)
  const selItem: ShopItem | undefined = owned.find((i) => i.id === selId)
  const isAura = !!selItem?.aura

  const savedPos = selId ? pet.accessoryPos?.[placementKey(selId, pet.form)] : undefined
  const [pos, setPos] = useState<AccessoryPlacement>(savedPos ?? DEFAULT_POS)
  const [savedFlash, setSavedFlash] = useState(false)

  // 다른 악세서리를 고르면 그 아이템의 저장된 배치(없으면 기본)로 리셋
  useEffect(() => {
    const saved = selId ? pet.accessoryPos?.[placementKey(selId, pet.form)] : undefined
    setPos(saved ?? DEFAULT_POS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selId])

  const boxRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const moveTo = (clientX: number, clientY: number) => {
    const box = boxRef.current
    if (!box) return
    const r = box.getBoundingClientRect()
    const x = Math.min(98, Math.max(2, ((clientX - r.left) / r.width) * 100))
    const y = Math.min(98, Math.max(2, ((clientY - r.top) / r.height) * 100))
    setPos((p) => ({ ...p, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 }))
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (!selItem || isAura) return
    dragging.current = true
    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
    moveTo(e.clientX, e.clientY)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragging.current) moveTo(e.clientX, e.clientY)
  }
  const endDrag = () => {
    dragging.current = false
  }

  const save = () => {
    if (!selId) {
      onUpdatePet({ accessory: null })
    } else if (isAura) {
      onUpdatePet({ accessory: selId })
    } else {
      onUpdatePet({
        accessory: selId,
        accessoryPos: {
          ...(pet.accessoryPos ?? {}),
          [placementKey(selId, pet.form)]: pos,
        },
      })
    }
    setSavedFlash(true)
    window.setTimeout(() => setSavedFlash(false), 1200)
  }

  const bg = backgroundCss(pet.background)

  return (
    <Modal title="👗 옷장" onClose={onClose}>
      <div className="closet">
        <p className="closet-hint">
          {selItem
            ? isAura
              ? '오라는 펫을 은은하게 감싸요 — 위치 조정이 필요 없어요 ✨'
              : '아이템을 끌어서 원하는 자리에 놓고, 저장을 눌러 주세요'
            : '아래에서 착용할 아이템을 골라 주세요'}
        </p>

        {/* 배치 무대 — 좌표계는 아바타 박스와 1:1 (저장 좌표 그대로 표시됨) */}
        <div className="closet-stage" style={bg ? { background: bg } : undefined}>
          <div
            ref={boxRef}
            className={'closet-avatar-box' + (selItem && !isAura ? ' editable' : '')}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <PetAvatar
              imageDataUrl={petSpriteUrl(pet)}
              stats={pet.stats}
              stage={stageFromLevel(level)}
              accessory={isAura ? selId : null}
              species={form}
              stageIndex={form.tier}
              size={AVATAR_SIZE}
              animate={false}
              showOverlays={false}
              alt={pet.name}
            />
            {selItem && !isAura && (
              <span
                className="closet-acc"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  fontSize: AVATAR_SIZE * 0.28 * pos.s,
                }}
              >
                <AccessorySprite
                  id={selItem.id}
                  emoji={selItem.emoji}
                  width={AVATAR_SIZE * 0.32 * pos.s}
                />
              </span>
            )}
          </div>
        </div>

        {/* 크기 조절 — 진화하면 몸집이 달라지니 형태별로 따로 저장된다 */}
        {selItem && !isAura && (
          <label className="closet-scale">
            <span>크기</span>
            <input
              type="range"
              min={0.6}
              max={1.8}
              step={0.05}
              value={pos.s}
              onChange={(e) => setPos((p) => ({ ...p, s: Number(e.target.value) }))}
            />
          </label>
        )}

        <div className="closet-actions">
          {selItem && !isAura && (
            <button type="button" className="closet-btn" onClick={() => setPos(DEFAULT_POS)}>
              기본 위치
            </button>
          )}
          <button type="button" className="closet-btn closet-save" onClick={save}>
            {savedFlash ? '저장했어요 ✔' : selId ? '이 모습으로 저장' : '벗은 모습으로 저장'}
          </button>
        </div>

        {/* 보유 악세서리 목록 */}
        <div className="closet-list">
          <button
            type="button"
            className={'closet-slot' + (selId === null ? ' active' : '')}
            onClick={() => setSelId(null)}
            title="착용 안 함"
          >
            <span className="closet-slot-emoji">🚫</span>
            <span className="closet-slot-name">안 함</span>
          </button>
          {owned.map((i) => (
            <button
              key={i.id}
              type="button"
              className={'closet-slot' + (selId === i.id ? ' active' : '')}
              onClick={() => setSelId(i.id)}
              title={i.desc}
            >
              <span className="closet-slot-emoji">
                {i.aura ? i.emoji : <AccessorySprite id={i.id} emoji={i.emoji} width="1.4em" />}
              </span>
              <span className="closet-slot-name">{i.name}</span>
              {i.aura && <span className="closet-slot-tag">오라</span>}
            </button>
          ))}
        </div>
        {owned.length === 0 && (
          <p className="closet-empty">아직 악세서리가 없어요 — 상점에서 구경해 보세요 🛍️</p>
        )}
      </div>
    </Modal>
  )
}
