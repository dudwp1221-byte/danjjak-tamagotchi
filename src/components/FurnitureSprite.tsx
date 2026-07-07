import { useState } from 'react'

/**
 * 가구 스프라이트 (public/deco/{id}.webp) — 아직 아트가 없는 가구는 이모지로 폴백.
 * 크기는 부모(.pg-furniture-item 등)의 CSS가 결정한다.
 */
export default function FurnitureSprite({ id, emoji }: { id: string; emoji: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <>{emoji}</>
  return (
    <img
      className="furn-sprite"
      src={`/deco/${id}.webp`}
      alt=""
      draggable={false}
      onError={() => setFailed(true)}
    />
  )
}
