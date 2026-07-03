import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from 'react'

export type DrawTool = 'pen' | 'eraser' | 'fill' | 'eyedropper'

export interface DrawingCanvasHandle {
  /** 현재 그림을 PNG data URL로 반환 */
  exportDataUrl: () => string
  /** 전체 지우기 */
  clear: () => void
  /** 되돌리기 */
  undo: () => void
  /** 다시 실행 */
  redo: () => void
  /** 그려진 내용이 있는지 여부 */
  isEmpty: () => boolean
}

interface DrawingCanvasProps {
  width: number
  height: number
  color: string
  brushSize: number
  tool: DrawTool
  /** 좌우 대칭 그리기 */
  symmetry: boolean
  /** 스포이드로 색을 집었을 때 */
  onPickColor?: (hex: string) => void
}

/** rgb 0~255 → #rrggbb */
function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) => n.toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`
}

/** #rrggbb → [r,g,b] */
function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace('#', '')
  const full =
    m.length === 3
      ? m
          .split('')
          .map((c) => c + c)
          .join('')
      : m
  const n = parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(
  function DrawingCanvas(
    { width, height, color, brushSize, tool, symmetry, onPickColor },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const drawing = useRef(false)
    const lastPoint = useRef<{ x: number; y: number } | null>(null)
    const undoStack = useRef<ImageData[]>([])
    const redoStack = useRef<ImageData[]>([])

    const getCtx = () => canvasRef.current?.getContext('2d') ?? null

    useEffect(() => {
      const ctx = getCtx()
      if (!ctx) return
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }, [width, height])

    const pointerPos = (e: ReactPointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current!
      const rect = canvas.getBoundingClientRect()
      return {
        x: ((e.clientX - rect.left) / rect.width) * canvas.width,
        y: ((e.clientY - rect.top) / rect.height) * canvas.height,
      }
    }

    /** 변경 직전 상태 저장 (undo용), redo 스택 비움 */
    const snapshot = () => {
      const ctx = getCtx()
      if (!ctx) return
      undoStack.current.push(ctx.getImageData(0, 0, width, height))
      if (undoStack.current.length > 40) undoStack.current.shift()
      redoStack.current = []
    }

    const drawSegment = (
      from: { x: number; y: number },
      to: { x: number; y: number },
    ) => {
      const ctx = getCtx()
      if (!ctx) return
      ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color
      ctx.lineWidth = brushSize
      const stroke = (
        a: { x: number; y: number },
        b: { x: number; y: number },
      ) => {
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }
      stroke(from, to)
      if (symmetry) {
        stroke(
          { x: width - from.x, y: from.y },
          { x: width - to.x, y: to.y },
        )
      }
    }

    /** 색 추출 */
    const pickColorAt = (x: number, y: number) => {
      const ctx = getCtx()
      if (!ctx) return
      const d = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data
      onPickColor?.(rgbToHex(d[0], d[1], d[2]))
    }

    /** 플러드 필 (허용 오차 포함) */
    const floodFill = (sx: number, sy: number) => {
      const ctx = getCtx()
      if (!ctx) return
      const img = ctx.getImageData(0, 0, width, height)
      const data = img.data
      const x0 = Math.floor(sx)
      const y0 = Math.floor(sy)
      if (x0 < 0 || y0 < 0 || x0 >= width || y0 >= height) return
      const at = (x: number, y: number) => (y * width + x) * 4
      const start = at(x0, y0)
      const tr = data[start]
      const tg = data[start + 1]
      const tb = data[start + 2]
      const [fr, fg, fb] = hexToRgb(color)
      if (tr === fr && tg === fg && tb === fb) return
      const tol = 40
      const match = (i: number) =>
        Math.abs(data[i] - tr) <= tol &&
        Math.abs(data[i + 1] - tg) <= tol &&
        Math.abs(data[i + 2] - tb) <= tol
      const stack = [[x0, y0]]
      while (stack.length) {
        const [cx, cy] = stack.pop()!
        const i = at(cx, cy)
        if (!match(i)) continue
        data[i] = fr
        data[i + 1] = fg
        data[i + 2] = fb
        data[i + 3] = 255
        if (cx > 0) stack.push([cx - 1, cy])
        if (cx < width - 1) stack.push([cx + 1, cy])
        if (cy > 0) stack.push([cx, cy - 1])
        if (cy < height - 1) stack.push([cx, cy + 1])
      }
      ctx.putImageData(img, 0, 0)
    }

    const handlePointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
      const p = pointerPos(e)
      if (tool === 'eyedropper') {
        pickColorAt(p.x, p.y)
        return
      }
      if (tool === 'fill') {
        snapshot()
        floodFill(p.x, p.y)
        return
      }
      // pen / eraser
      snapshot()
      drawing.current = true
      lastPoint.current = p
      canvasRef.current?.setPointerCapture(e.pointerId)
      drawSegment(p, p)
    }

    const handlePointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (!drawing.current || !lastPoint.current) return
      const p = pointerPos(e)
      drawSegment(lastPoint.current, p)
      lastPoint.current = p
    }

    const stopDrawing = () => {
      drawing.current = false
      lastPoint.current = null
    }

    useImperativeHandle(ref, () => ({
      exportDataUrl: () => canvasRef.current?.toDataURL('image/png') ?? '',
      clear: () => {
        const ctx = getCtx()
        if (!ctx) return
        snapshot()
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
      },
      undo: () => {
        const ctx = getCtx()
        if (!ctx) return
        const prev = undoStack.current.pop()
        if (!prev) return
        redoStack.current.push(ctx.getImageData(0, 0, width, height))
        ctx.putImageData(prev, 0, 0)
      },
      redo: () => {
        const ctx = getCtx()
        if (!ctx) return
        const next = redoStack.current.pop()
        if (!next) return
        undoStack.current.push(ctx.getImageData(0, 0, width, height))
        ctx.putImageData(next, 0, 0)
      },
      isEmpty: () => undoStack.current.length === 0,
    }))

    const cursor =
      tool === 'eyedropper'
        ? 'copy'
        : tool === 'fill'
          ? 'cell'
          : tool === 'eraser'
            ? 'cell'
            : 'crosshair'

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="drawing-canvas"
        style={{ cursor }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDrawing}
        onPointerLeave={stopDrawing}
        onPointerCancel={stopDrawing}
      />
    )
  },
)

export default DrawingCanvas
