import { useEffect, useState } from 'react'

/**
 * 악세서리 스프라이트 (public/deco/{id}.webp) — 아트가 없으면 이모지로 폴백.
 * width는 착용 컨텍스트(아바타 크기 × 배치 배율)가 결정한다.
 */
export default function AccessorySprite({
  id,
  emoji,
  width,
  rotate = 0,
  flip = false,
}: {
  id: string
  emoji: string
  width: number | string
  /** 회전 각도 (도) */
  rotate?: number
  /** 좌우 반전 */
  flip?: boolean
}) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [id])
  const transform =
    rotate || flip ? `rotate(${rotate}deg) scaleX(${flip ? -1 : 1})` : undefined
  if (failed) {
    return transform ? (
      <span style={{ display: 'inline-block', transform }}>{emoji}</span>
    ) : (
      <>{emoji}</>
    )
  }
  return (
    <img
      className="acc-sprite"
      src={`/deco/${id}.webp`}
      style={{ width, transform }}
      alt=""
      draggable={false}
      onError={() => setFailed(true)}
    />
  )
}
