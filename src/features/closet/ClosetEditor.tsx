import { useEffect, useRef, useState } from 'react'
import type { Pet, AccessoryPlacement } from '../../types/pet'
import {
  SHOP_ITEMS,
  placementKey,
  backgroundCss,
  wornAccessories,
  type ShopItem,
} from '../../utils/items'
import { ownsPremium } from '../../utils/premium'
import { levelFromXp, stageFromLevel } from '../../utils/progression'
import { formById } from '../../utils/species'
import { petSpriteUrl } from '../../utils/pet'
import PetAvatar from '../../components/PetAvatar'
import AccessorySprite from '../../components/AccessorySprite'
import Modal from '../../components/Modal'
import './closet.css'

/** 기본 배치 — 머리 위 중앙 (기존 고정 오프셋과 비슷한 자리) */
const DEFAULT_POS: AccessoryPlacement = { x: 50, y: 10, s: 1, r: 0, flip: false }
const AVATAR_SIZE = 200

interface ClosetEditorProps {
  pet: Pet
  onClose: () => void
  /** 착용/배치 저장 */
  onUpdatePet: (patch: Partial<Pet>) => void
}

/**
 * 옷장 — 내 펫 위에 악세서리를 직접 끌어다 배치하고 저장한다 (다중 착용).
 * 목록에서 고른 아이템 하나를 편집하고, 나머지 착용 중인 아이템은 그대로 보인다.
 * 배치는 형태(진화)별로 저장되어, 진화로 몸집이 바뀌면 다시 맞춰줄 수 있다.
 */
export default function ClosetEditor({ pet, onClose, onUpdatePet }: ClosetEditorProps) {
  const level = levelFromXp(pet.growth)
  const form = formById(pet.form)
  const wornIds = pet.accessories ?? (pet.accessory ? [pet.accessory] : [])

  // 보유 악세서리 (일반 = 펫 소유, 프리미엄 오라 = 계정 소유)
  const owned = SHOP_ITEMS.filter(
    (i) =>
      i.type === 'accessory' &&
      (pet.ownedItems.includes(i.id) || (i.premium && ownsPremium(i.id))),
  )

  const [selId, setSelId] = useState<string | null>(wornIds[0] ?? null)
  const selItem: ShopItem | undefined = owned.find((i) => i.id === selId)
  const isAura = !!selItem?.aura
  const selWorn = !!selId && wornIds.includes(selId)

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

  /** 배치 저장 (+아직 안 입었으면 착용까지) */
  const save = () => {
    if (!selId) return
    const nextWorn = wornIds.includes(selId) ? wornIds : [...wornIds, selId]
    onUpdatePet({
      accessories: nextWorn,
      accessory: nextWorn[0] ?? null,
      ...(isAura
        ? {}
        : {
            accessoryPos: {
              ...(pet.accessoryPos ?? {}),
              [placementKey(selId, pet.form)]: pos,
            },
          }),
    })
    setSavedFlash(true)
    window.setTimeout(() => setSavedFlash(false), 1200)
  }

  /** 선택한 아이템 착용/해제 토글 */
  const toggleWear = () => {
    if (!selId) return
    const next = selWorn ? wornIds.filter((w) => w !== selId) : [...wornIds, selId]
    onUpdatePet({ accessories: next, accessory: next[0] ?? null })
  }

  const bg = backgroundCss(pet.background)
  // 무대에는 "편집 중인 것을 제외한" 착용 아이템을 그대로 보여준다 (편집 대상은 드래그 오버레이로)
  const stageWorn = wornAccessories(pet).filter((w) => w.id !== selId || isAura)

  return (
    <Modal title="👗 옷장" onClose={onClose}>
      <div className="closet">
        <p className="closet-hint">
          {selItem
            ? isAura
              ? '오라는 펫을 은은하게 감싸요 — 위치 조정이 필요 없어요 ✨'
              : '아이템을 끌어서 원하는 자리에 놓고, 저장을 눌러 주세요'
            : '아래에서 편집할 아이템을 골라 주세요 (여러 개 착용 가능)'}
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
              worn={stageWorn}
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
                  rotate={pos.r ?? 0}
                  flip={pos.flip ?? false}
                />
              </span>
            )}
          </div>
        </div>

        {/* 크기·회전·반전 — 진화하면 몸집이 달라지니 형태별로 따로 저장된다 */}
        {selItem && !isAura && (
          <>
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
            <label className="closet-scale">
              <span>회전</span>
              <input
                type="range"
                min={-180}
                max={180}
                step={5}
                value={pos.r ?? 0}
                onChange={(e) => setPos((p) => ({ ...p, r: Number(e.target.value) }))}
              />
              <em className="closet-deg">{pos.r ?? 0}°</em>
            </label>
          </>
        )}

        <div className="closet-actions">
          {selItem && !isAura && (
            <>
              <button
                type="button"
                className={'closet-btn' + (pos.flip ? ' closet-btn-on' : '')}
                onClick={() => setPos((p) => ({ ...p, flip: !p.flip }))}
                title="좌우 반전"
              >
                🪞 반전
              </button>
              <button type="button" className="closet-btn" onClick={() => setPos(DEFAULT_POS)}>
                초기화
              </button>
            </>
          )}
          {selItem && (
            <button type="button" className="closet-btn" onClick={toggleWear}>
              {selWorn ? '벗기' : '입기'}
            </button>
          )}
          {selItem && (
            <button type="button" className="closet-btn closet-save" onClick={save}>
              {savedFlash ? '저장했어요 ✔' : '배치 저장'}
            </button>
          )}
        </div>

        {/* 보유 악세서리 목록 — 착용 중인 것은 표시 */}
        <div className="closet-list">
          {owned.map((i) => (
            <button
              key={i.id}
              type="button"
              className={
                'closet-slot' +
                (selId === i.id ? ' active' : '') +
                (wornIds.includes(i.id) ? ' worn' : '')
              }
              onClick={() => setSelId(i.id)}
              title={i.desc + (wornIds.includes(i.id) ? ' (착용 중)' : '')}
            >
              <span className="closet-slot-emoji">
                {i.aura ? i.emoji : <AccessorySprite id={i.id} emoji={i.emoji} width="1.4em" />}
              </span>
              <span className="closet-slot-name">{i.name}</span>
              {i.aura && <span className="closet-slot-tag">오라</span>}
              {wornIds.includes(i.id) && <span className="closet-slot-worn">✔</span>}
            </button>
          ))}
        </div>
        {owned.length === 0 && (
          <p className="closet-empty">아직 악세서리가 없어요 — 상점에서 구경해 보세요 🛍️</p>
        )}
        {wornIds.length > 0 && (
          <button
            type="button"
            className="closet-btn closet-unwear-all"
            onClick={() => onUpdatePet({ accessories: [], accessory: null })}
          >
            🚫 전부 벗기
          </button>
        )}
      </div>
    </Modal>
  )
}
