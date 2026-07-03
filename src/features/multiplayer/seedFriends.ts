import type { Pet } from '../../types/pet'
import { normalizePet } from '../../utils/pet'

/** 시드 기반 간단한 펫 그림을 캔버스로 그려 data URL 반환 (친구 펫용 더미 그림) */
function drawSeedPet(hue: number, variant: number): string {
  const size = 320
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')
  if (!ctx) return ''

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, size, size)

  const cx = 160
  const cy = 175
  const body = `hsl(${hue} 68% 66%)`
  const dark = `hsl(${hue} 60% 48%)`

  // 귀 (variant에 따라 모양 변화)
  ctx.fillStyle = body
  if (variant % 2 === 0) {
    // 둥근 귀
    ctx.beginPath()
    ctx.arc(110, 95, 32, 0, Math.PI * 2)
    ctx.arc(210, 95, 32, 0, Math.PI * 2)
    ctx.fill()
  } else {
    // 뾰족 귀
    ctx.beginPath()
    ctx.moveTo(95, 110)
    ctx.lineTo(120, 40)
    ctx.lineTo(150, 105)
    ctx.closePath()
    ctx.moveTo(225, 110)
    ctx.lineTo(200, 40)
    ctx.lineTo(170, 105)
    ctx.closePath()
    ctx.fill()
  }

  // 몸통
  ctx.fillStyle = body
  ctx.beginPath()
  ctx.ellipse(cx, cy, 92, 100, 0, 0, Math.PI * 2)
  ctx.fill()

  // 볼터치
  ctx.fillStyle = 'rgba(244, 114, 182, 0.55)'
  ctx.beginPath()
  ctx.arc(112, 195, 16, 0, Math.PI * 2)
  ctx.arc(208, 195, 16, 0, Math.PI * 2)
  ctx.fill()

  // 눈
  ctx.fillStyle = '#1a1a1a'
  ctx.beginPath()
  ctx.arc(128, 165, 12, 0, Math.PI * 2)
  ctx.arc(192, 165, 12, 0, Math.PI * 2)
  ctx.fill()
  // 눈 하이라이트
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(132, 161, 4, 0, Math.PI * 2)
  ctx.arc(196, 161, 4, 0, Math.PI * 2)
  ctx.fill()

  // 입
  ctx.strokeStyle = dark
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.beginPath()
  if (variant % 3 === 0) {
    ctx.arc(160, 200, 18, 0, Math.PI) // 웃는 입
  } else {
    ctx.moveTo(145, 205)
    ctx.lineTo(160, 215)
    ctx.lineTo(175, 205)
  }
  ctx.stroke()

  return c.toDataURL('image/png')
}

const SEED_DEFS = [
  { name: '다람이', owner: '옆자리 동료', hue: 25, variant: 0, growth: 40, coins: 80 },
  { name: '뭉치', owner: '김대리', hue: 200, variant: 1, growth: 130, coins: 30 },
  { name: '치즈', owner: '박사원', hue: 50, variant: 2, growth: 600, coins: 220 },
  { name: '까망이', owner: '이주임', hue: 280, variant: 3, growth: 240, coins: 150 },
]

/** 친구 펫 시드 목록 생성 */
export function createSeedFriends(now: number): Pet[] {
  return SEED_DEFS.map((d, i) =>
    normalizePet({
      id: `friend_${i}`,
      name: d.name,
      ownerName: d.owner,
      imageDataUrl: drawSeedPet(d.hue, d.variant),
      growth: d.growth,
      coins: d.coins,
      stats: {
        hunger: 55 + ((i * 13) % 40),
        mood: 50 + ((i * 21) % 45),
        cleanliness: 45 + ((i * 31) % 50),
        energy: 60 + ((i * 17) % 35),
        health: 65 + ((i * 19) % 30),
      },
      // 친구들은 조금 전에 접속한 것처럼 보이게
      lastUpdated: now - (i + 1) * 90000,
      createdAt: now - (i + 3) * 86400000,
    }),
  )
}
