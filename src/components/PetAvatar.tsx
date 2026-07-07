import { useEffect, useState } from 'react'
import type { PetStats, AccessoryPlacement } from '../types/pet'
import type { Stage } from '../utils/progression'
import type { Form } from '../utils/species'
import { overlaysFor } from '../utils/expression'
import { accessoryEmoji, accessoryAura } from '../utils/items'
import AccessorySprite from './AccessorySprite'
import { spriteUrl as formSpriteUrl } from '../utils/pet'
import './pet-avatar.css'

export type ReactionType = 'hop' | 'munch' | 'wiggle' | 'blink' | 'breathe'

function careVibe(stats: PetStats, distressed: boolean): string {
  if (distressed) return 'distressed'
  if (stats.energy < 25) return 'sleepy'
  if (stats.hunger < 30) return 'hungry'
  if (stats.cleanliness < 30) return 'dirty'
  if (stats.mood < 35) return 'sad'
  if (
    stats.hunger >= 80 &&
    stats.mood >= 80 &&
    stats.cleanliness >= 80 &&
    stats.energy >= 80
  ) {
    return 'happy'
  }
  return 'ok'
}

interface PetAvatarProps {
  imageDataUrl: string
  stats: PetStats
  stage: Stage
  accessory?: string | null
  /** 옷장에서 저장한 악세서리 배치 (없으면 기본 위치) */
  accessoryPos?: AccessoryPlacement | null
  /** 현재 형태 (오라/색조/희귀도 발광) */
  species?: Form
  /** 진화 단계 인덱스 0~3 (오라 강도) */
  stageIndex?: number
  size?: number
  /** 위급 시 떨림 애니메이션 */
  distressed?: boolean
  /** 컨디션 오버레이(얼룩/zzz 등) 표시 여부 */
  showOverlays?: boolean
  /** idle 둥실 애니메이션 */
  animate?: boolean
  /** 반응 종류 (reactTrigger가 바뀔 때 1회 재생) */
  reactType?: ReactionType | null
  /** 값이 바뀌면 반응 애니메이션을 재생 */
  reactTrigger?: number
  alt?: string
}

/**
 * 펫 그림 + 종족 오라 + 진화 배율 + 악세서리 + 컨디션 오버레이를 합친 표시 컴포넌트.
 */
export default function PetAvatar({
  imageDataUrl,
  stats,
  stage,
  accessory = null,
  accessoryPos = null,
  species,
  stageIndex = 0,
  size = 200,
  distressed = false,
  showOverlays = true,
  animate = true,
  reactType = null,
  reactTrigger = 0,
  alt = '펫',
}: PetAvatarProps) {
  const overlays = showOverlays ? overlaysFor(stats) : []
  const acc = accessoryEmoji(accessory)
  const auraId = accessoryAura(accessory)
  const imgSize = Math.round(size * stage.scale)
  const [spriteFailed, setSpriteFailed] = useState(false)
  const spriteUrl = species && !spriteFailed ? formSpriteUrl(species.id) : imageDataUrl
  const vibe = careVibe(stats, distressed)
  const tier = Math.min(Math.max(species?.tier ?? stageIndex, 0), 4)
  // 진화 단계가 높을수록 반짝임 증가 (완전체 2, 궁극체 3)
  const particleCount = tier >= 4 ? 3 : tier >= 3 ? 2 : 1
  const showParticles = animate && !!species && !spriteFailed && vibe !== 'distressed'

  useEffect(() => {
    setSpriteFailed(false)
  }, [imageDataUrl, species?.id])

  // 반응 애니메이션 1회 재생
  const [react, setReact] = useState<ReactionType | null>(null)
  useEffect(() => {
    if (!reactTrigger || !reactType) return
    setReact(reactType)
    const id = window.setTimeout(() => setReact(null), 650)
    return () => window.clearTimeout(id)
  }, [reactTrigger, reactType])

  return (
    <div
      className={`pet-avatar pa-vibe-${vibe} pa-tier-${tier}`}
      style={{ width: size, height: size }}
    >
      {species && (
        <span
          className="pa-aura"
          style={{
            width: imgSize * 1.35,
            height: imgSize * 1.35,
            background: `radial-gradient(circle, ${species.aura}, transparent 70%)`,
            opacity: 0.25 + stageIndex * 0.18,
          }}
        />
      )}
      <span
        className={
          'pa-img-wrap' +
          (animate ? ' is-animated' : '') +
          (distressed ? ' is-distressed' : '') +
          (react ? ` pa-action-${react}` : '')
        }
        style={{ width: imgSize, height: imgSize }}
      >
        <img
          className={
            'pa-img' +
            (react ? ` pa-react-${react}` : '')
          }
          src={spriteUrl}
          alt={alt}
          width={imgSize}
          height={imgSize}
          onError={() => {
            if (species && !spriteFailed) setSpriteFailed(true)
          }}
        />
        {species?.tint && (
          <span className="pa-tint" style={{ background: species.tint }} />
        )}
        {showParticles &&
          Array.from({ length: particleCount }, (_, i) => (
            <span key={i} className={`pa-particle pa-particle-${i + 1}`} />
          ))}
        {react && (
          <span className={`pa-action-fx pa-action-fx-${react}`} aria-hidden="true">
            <span />
            <span />
            <span />
            {react === 'breathe' && <b>Z</b>}
          </span>
        )}
      </span>
      {auraId && (
        <span
          className={`pa-acc-aura pa-acc-aura-${auraId}`}
          style={{ width: imgSize * 1.5, height: imgSize * 1.5 }}
          aria-hidden="true"
        >
          <i />
          <i />
          <i />
        </span>
      )}
      {acc && accessory && (
        <span
          className={'pa-accessory' + (accessoryPos ? ' pa-acc-custom' : '')}
          style={
            accessoryPos
              ? {
                  fontSize: size * 0.28 * accessoryPos.s,
                  left: `${accessoryPos.x}%`,
                  top: `${accessoryPos.y}%`,
                }
              : { fontSize: size * 0.28 }
          }
        >
          <AccessorySprite
            id={accessory}
            emoji={acc}
            width={size * 0.32 * (accessoryPos?.s ?? 1)}
          />
        </span>
      )}
      {overlays.map((o, i) => (
        <span key={i} className={`pa-overlay pa-${o.position} pa-anim-${o.anim}`}>
          {o.symbol}
        </span>
      ))}
    </div>
  )
}
