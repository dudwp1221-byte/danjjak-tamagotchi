import { useEffect, useState } from 'react'

/**
 * 악세서리 스프라이트 (public/deco/{id}.webp) — 아트가 없으면 이모지로 폴백.
 * width는 착용 컨텍스트(아바타 크기 × 배치 배율)가 결정한다.
 */
export default function AccessorySprite({
  id,
  emoji,
  width,
}: {
  id: string
  emoji: string
  width: number | string
}) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [id])
  if (failed) return <>{emoji}</>
  return (
    <img
      className="acc-sprite"
      src={`/deco/${id}.webp`}
      style={{ width }}
      alt=""
      draggable={false}
      onError={() => setFailed(true)}
    />
  )
}
