import { useEffect, useState } from 'react'

/**
 * 게임 UI 아이콘 (public/ui/{name}.webp) — 에셋이 아직 없으면 이모지로 폴백.
 * docs/IMAGE-PROMPTS.md F섹션의 아이콘이 도착하는 순간 코드 수정 없이 교체된다.
 */
export default function UIIcon({
  name,
  emoji,
  size,
  className,
}: {
  name: string
  emoji: string
  /** 미지정 시 1em (주변 글자 크기 따름) */
  size?: number | string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [name])
  if (failed) return <>{emoji}</>
  return (
    <img
      className={'ui-icon' + (className ? ` ${className}` : '')}
      src={`/ui/${name}.webp`}
      style={size ? { width: size, height: size } : undefined}
      alt=""
      draggable={false}
      onError={() => setFailed(true)}
    />
  )
}
