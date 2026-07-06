import { useRef, useState } from 'react'
import type { Pet } from '../../types/pet'
import { createPet } from '../../utils/pet'
import DrawingCanvas, {
  type DrawingCanvasHandle,
  type DrawTool,
} from './DrawingCanvas'
import './pet-creator.css'

const CANVAS_SIZE = 320

const PALETTE = [
  '#000000',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#0ea5e9',
  '#6366f1',
  '#ec4899',
  '#a16207',
  '#ffffff',
]

const BRUSH_SIZES = [2, 6, 12, 24]

const TOOLS: { key: DrawTool; icon: string; label: string }[] = [
  { key: 'pen', icon: '✏️', label: '펜' },
  { key: 'fill', icon: '🪣', label: '채우기' },
  { key: 'eyedropper', icon: '💉', label: '스포이드' },
  { key: 'eraser', icon: '🧽', label: '지우개' },
]

interface PetCreatorProps {
  onCreated: (pet: Pet) => void
  /** 기존 주인 이름 (있으면 "내 이름" 입력 생략하고 그대로 사용) */
  ownerName?: string
}

export default function PetCreator({ onCreated, ownerName: existingOwner }: PetCreatorProps) {
  const canvasRef = useRef<DrawingCanvasHandle>(null)

  const [color, setColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(6)
  const [tool, setTool] = useState<DrawTool>('pen')
  const [symmetry, setSymmetry] = useState(false)
  const [petName, setPetName] = useState('')
  const [error, setError] = useState('')

  const handleSave = () => {
    if (canvasRef.current?.isEmpty()) {
      setError('펫을 먼저 그려 주세요!')
      return
    }
    const imageDataUrl = canvasRef.current?.exportDataUrl() ?? ''
    onCreated(
      createPet({
        ownerName: (existingOwner?.trim() || '익명'),
        // 비워두면 createPet이 뽑힌 종족의 기본 이름을 넣는다
        name: petName.trim(),
        imageDataUrl,
      }),
    )
  }

  return (
    <div className="pet-creator">
      <header className="pc-header">
        <h2>나만의 펫 그리기 🎨</h2>
        <p>마우스로 직접 그려서 단짝 펫을 만들어 보세요.</p>
      </header>

      <div className="pc-board">
        <DrawingCanvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          color={color}
          brushSize={brushSize}
          tool={tool}
          symmetry={symmetry}
          onPickColor={(hex) => {
            setColor(hex)
            setTool('pen')
          }}
        />

        <div className="pc-tools">
          {/* 도구 */}
          <div className="pc-tool-group">
            <span className="pc-label">도구</span>
            <div className="pc-tool-grid">
              {TOOLS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className={'pc-btn' + (tool === t.key ? ' is-active' : '')}
                  onClick={() => setTool(t.key)}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 색상 */}
          <div className="pc-tool-group">
            <span className="pc-label">색상</span>
            <div className="pc-palette">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={
                    'pc-swatch' +
                    (tool !== 'eraser' && color === c ? ' is-active' : '')
                  }
                  style={{ background: c }}
                  aria-label={`색상 ${c}`}
                  onClick={() => {
                    setColor(c)
                    if (tool === 'eraser') setTool('pen')
                  }}
                />
              ))}
              <input
                type="color"
                className="pc-color-input"
                value={color}
                aria-label="사용자 지정 색상"
                onChange={(e) => {
                  setColor(e.target.value)
                  if (tool === 'eraser') setTool('pen')
                }}
              />
            </div>
          </div>

          {/* 굵기 */}
          <div className="pc-tool-group">
            <span className="pc-label">굵기</span>
            <div className="pc-sizes">
              {BRUSH_SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={'pc-size' + (brushSize === s ? ' is-active' : '')}
                  onClick={() => setBrushSize(s)}
                  aria-label={`굵기 ${s}`}
                >
                  <span
                    className="pc-size-dot"
                    style={{ width: s, height: s }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* 옵션 / 편집 */}
          <div className="pc-tool-group">
            <span className="pc-label">편집</span>
            <div className="pc-actions">
              <button
                type="button"
                className={'pc-btn' + (symmetry ? ' is-active' : '')}
                onClick={() => setSymmetry((v) => !v)}
                title="좌우 대칭으로 그리기"
              >
                🪞 대칭 {symmetry ? 'ON' : 'OFF'}
              </button>
              <div className="pc-undo-row">
                <button
                  type="button"
                  className="pc-btn"
                  onClick={() => canvasRef.current?.undo()}
                >
                  ↩️ 되돌리기
                </button>
                <button
                  type="button"
                  className="pc-btn"
                  onClick={() => canvasRef.current?.redo()}
                >
                  ↪️ 다시
                </button>
              </div>
              <button
                type="button"
                className="pc-btn"
                onClick={() => canvasRef.current?.clear()}
              >
                🗑️ 전체 지우기
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pc-form">
        <label className="pc-field">
          <span>펫 이름</span>
          <input
            type="text"
            value={petName}
            placeholder="(선택) 비우면 종족 이름으로"
            maxLength={20}
            onChange={(e) => {
              setPetName(e.target.value)
              if (error) setError('')
            }}
          />
        </label>
      </div>

      {error && <p className="pc-error">{error}</p>}

      <button type="button" className="pc-save" onClick={handleSave}>
        이 펫으로 시작하기 🐣
      </button>
    </div>
  )
}
