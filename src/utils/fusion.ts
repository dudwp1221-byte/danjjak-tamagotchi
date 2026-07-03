function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/** 두 펫 그림을 반투명하게 겹쳐 "2세" 그림을 만든다. */
export async function blendPets(a: string, b: string): Promise<string> {
  const size = 320
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')
  if (!ctx) return a
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, size, size)
  try {
    const [ia, ib] = await Promise.all([loadImage(a), loadImage(b)])
    ctx.globalAlpha = 0.6
    ctx.drawImage(ia, 0, 0, size, size)
    ctx.globalAlpha = 0.55
    ctx.drawImage(ib, 0, 0, size, size)
    ctx.globalAlpha = 1
  } catch {
    /* 한쪽 로드 실패 시 흰 배경 */
  }
  return c.toDataURL('image/png')
}

/** 두 이름을 합쳐 2세 이름을 제안한다. */
export function suggestChildName(a: string, b: string): string {
  const head = a.slice(0, Math.ceil(a.length / 2))
  const tail = b.slice(Math.floor(b.length / 2))
  const name = (head + tail).slice(0, 8)
  return name || '아가'
}
