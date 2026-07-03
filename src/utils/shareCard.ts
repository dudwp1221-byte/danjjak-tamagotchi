import type { Pet } from '../types/pet'
import { petSpriteUrl } from './pet'

interface CardInfo {
  level: number
  stageLabel: string
  days: number
  score: number
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/** 펫 자랑 카드 이미지를 합성해 PNG data URL로 반환 */
export async function buildShareCard(pet: Pet, info: CardInfo): Promise<string> {
  const W = 600
  const H = 760
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')
  if (!ctx) return ''

  // 배경 그라데이션
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#2a2f4a')
  bg.addColorStop(1, '#15161d')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // 헤더
  ctx.fillStyle = '#c4b5fd'
  ctx.font = 'bold 30px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('단짝 다마고치', W / 2, 64)

  // 펫 그림 패널
  const panelX = 110
  const panelY = 100
  const panelSize = 380
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.4)'
  ctx.shadowBlur = 24
  ctx.shadowOffsetY = 10
  ctx.fillStyle = '#ffffff'
  roundRect(ctx, panelX, panelY, panelSize, panelSize, 28)
  ctx.fill()
  ctx.restore()

  try {
    const img = await loadImage(petSpriteUrl(pet))
    ctx.save()
    roundRect(ctx, panelX, panelY, panelSize, panelSize, 28)
    ctx.clip()
    ctx.drawImage(img, panelX, panelY, panelSize, panelSize)
    ctx.restore()
  } catch {
    /* 이미지 로드 실패 시 빈 패널 */
  }

  // 이름
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 40px system-ui, sans-serif'
  ctx.fillText(pet.name, W / 2, 545)

  // 주인 / 단계
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.font = '20px system-ui, sans-serif'
  ctx.fillText(
    `${pet.ownerName}님의 단짝 · Lv.${info.level} ${info.stageLabel}`,
    W / 2,
    578,
  )

  // 통계 배지 3개
  const badges = [
    { label: '함께한 날', value: `${info.days}일` },
    { label: '컨디션', value: `${info.score}점` },
    { label: '코인', value: `${pet.coins}` },
  ]
  const bw = 150
  const gap = 18
  const totalW = bw * 3 + gap * 2
  let bx = (W - totalW) / 2
  const by = 615
  badges.forEach((b) => {
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    roundRect(ctx, bx, by, bw, 90, 16)
    ctx.fill()
    ctx.fillStyle = '#7dd3fc'
    ctx.font = 'bold 30px system-ui, sans-serif'
    ctx.fillText(b.value, bx + bw / 2, by + 42)
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = '16px system-ui, sans-serif'
    ctx.fillText(b.label, bx + bw / 2, by + 70)
    bx += bw + gap
  })

  // 푸터
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = '16px system-ui, sans-serif'
  ctx.fillText('회사에서 몰래 키우는 나만의 펫 🥚', W / 2, H - 28)

  return c.toDataURL('image/png')
}

/** data URL → File 변환 (Web Share용) */
export function dataUrlToFile(dataUrl: string, filename: string): File | null {
  try {
    const [header, b64] = dataUrl.split(',')
    const mime = header.match(/:(.*?);/)?.[1] ?? 'image/png'
    const bin = atob(b64)
    const arr = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
    return new File([arr], filename, { type: mime })
  } catch {
    return null
  }
}
