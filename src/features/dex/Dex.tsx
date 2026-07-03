import {
  FORMS,
  STARTERS,
  GROWTH_ROOTS,
  lineForms,
  FOUR_SYMBOLS,
  FIENDS,
  ZODIAC,
  ARCHANGELS,
  SINS,
  HUANGLONG,
  tierName,
  formById,
  babyFormsForStarter,
} from '../../utils/species'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { loadDex, loadDexClaims, addDexClaim } from '../../utils/storage'
import { EVOLUTION_CONDITIONS } from '../../utils/evolution-conditions'
import Modal from '../../components/Modal'
import './dex.css'

interface DexProps {
  /** 현재 펫의 형태 (항상 발견 처리) */
  currentForm: string
  /** 도감 마일스톤 보상 지급 */
  onReward: (coins: number) => void
  onClose: () => void
  /** 페이저 페이지로 임베드 (배경/닫기 없이 인라인 렌더) */
  embedded?: boolean
}

/** 발견한 종족의 실제 스프라이트를 표시. 이미지 없으면 이모지로 폴백 */
function DexSprite({ id, emoji, large }: { id: string; emoji: string; large?: boolean }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <>{emoji}</>
  return (
    <img
      className={large ? 'dex-zoom-img' : 'dex-form-img'}
      src={`/sprites/${id}.png`}
      alt=""
      draggable={false}
      onError={() => setFailed(true)}
    />
  )
}

interface ZoomLink {
  id: string
  name: string
  emoji: string
  got: boolean
}

interface ZoomTarget {
  id: string
  name: string
  emoji: string
  meta?: string
  /** 연결 정보 (유년기 → 분화 계통 / 계통 루트 → 출신 유년기) */
  related?: { label: string; items: ZoomLink[] }
}

/** 도감 카드를 크게 보여주는 오버레이. 배경 클릭/Esc로 닫힌다. */
function DexZoom({
  target,
  onClose,
  onJump,
}: {
  target: ZoomTarget
  onClose: () => void
  /** 연결 칩 클릭 시 그 형태로 확대 이동 */
  onJump: (id: string) => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose() }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose])

  // 페이저 트랙의 transform 때문에 position:fixed 기준이 틀어지므로 body로 포탈
  return createPortal(
    <div className="dex-zoom-backdrop" onClick={onClose}>
      <div className="dex-zoom-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="dex-zoom-close" onClick={onClose} aria-label="닫기">✕</button>
        <div className="dex-zoom-stage">
          <DexSprite id={target.id} emoji={target.emoji} large />
        </div>
        <p className="dex-zoom-name">{target.name}</p>
        {target.meta && <p className="dex-zoom-meta">{target.meta}</p>}
        {target.related && target.related.items.length > 0 && (
          <div className="dex-zoom-related">
            <p className="dex-zoom-related-label">{target.related.label}</p>
            <div className="dex-zoom-related-row">
              {target.related.items.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  className="dex-zoom-chip"
                  disabled={!it.got}
                  onClick={() => onJump(it.id)}
                  title={it.got ? `${it.name} 크게 보기` : '미발견'}
                >
                  <span className="dex-zoom-chip-img">
                    {it.got ? <DexSprite id={it.id} emoji={it.emoji} /> : '❔'}
                  </span>
                  <span>{it.got ? it.name : '???'}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

const MILESTONES = [
  { p: 25, r: 50 },
  { p: 50, r: 100 },
  { p: 75, r: 200 },
  { p: 100, r: 500 },
]

export default function Dex({ currentForm, onReward, onClose, embedded }: DexProps) {
  const [, refresh] = useState(0)
  const [zoom, setZoom] = useState<ZoomTarget | null>(null)
  const discovered = new Set([...loadDex(), currentForm])

  /** 확대 대상 구성 — 유년기엔 분화 계통, 계통 루트엔 출신 유년기를 함께 보여준다 */
  const zoomFor = (id: string): ZoomTarget => {
    const f = formById(id)
    if (f.type === '유년기') {
      return {
        id: f.id,
        name: f.name,
        emoji: f.emoji,
        meta: '유년기',
        related: {
          label: '진화하면 이 계통으로 갈라져요',
          items: f.next.map((rid) => {
            const r = formById(rid)
            return { id: r.id, name: r.name, emoji: r.emoji, got: discovered.has(r.id) }
          }),
        },
      }
    }
    const target: ZoomTarget = {
      id: f.id,
      name: f.name,
      emoji: f.emoji,
      meta: f.hidden ? `${f.type}(히든)` : `${tierName(f.tier)} · ${f.type}`,
    }
    if (f.id === f.line) {
      const babies = babyFormsForStarter(f.id)
      if (babies.length > 0) {
        target.related = {
          label: '이 계통이 되는 유년기',
          items: babies.map((b) => ({ id: b.id, name: b.name, emoji: b.emoji, got: discovered.has(b.id) })),
        }
      }
    }
    return target
  }
  const total = FORMS.length
  const pct = Math.floor((discovered.size / total) * 100)
  const claims = loadDexClaims()

  return (
    <>
    {zoom && (
      <DexZoom
        target={zoom}
        onClose={() => setZoom(null)}
        onJump={(id) => setZoom(zoomFor(id))}
      />
    )}
    <Modal
      title="📚 진화 도감"
      variant={embedded ? 'inline' : 'modal'}
      onClose={onClose}
      headerExtra={
        <span className="dex-count">
          {discovered.size}/{total} ({pct}%)
        </span>
      }
    >
      <div className="dex-progress">
        <div className="dex-progress-track">
          <div className="dex-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="dex-milestones">
          {MILESTONES.map((m) => {
            const reached = pct >= m.p
            const claimed = claims.includes(m.p)
            return (
              <button
                key={m.p}
                type="button"
                className={
                  'dex-ms' +
                  (claimed ? ' claimed' : reached ? ' ready' : ' locked')
                }
                disabled={!reached || claimed}
                onClick={() => {
                  addDexClaim(m.p)
                  onReward(m.r)
                  refresh((n) => n + 1)
                }}
              >
                {m.p}% · {claimed ? '완료✓' : `🪙${m.r}`}
              </button>
            )
          })}
        </div>
      </div>
      {/* 유년기 (모든 펫의 시작) */}
      <div className="dex-line dex-babies">
        <p className="dex-line-title">🥚 유년기</p>
        <div className="dex-grid">
          {STARTERS.map((b) => {
            const got = discovered.has(b.id)
            return (
              <div
                key={b.id}
                className={'dex-form' + (got ? ' got' : ' locked')}
                title={got ? '유년기 · 크게 보기' : '미발견'}
                role={got ? 'button' : undefined}
                tabIndex={got ? 0 : undefined}
                onClick={got ? () => setZoom(zoomFor(b.id)) : undefined}
              >
                <span className="dex-form-emoji">
                  {got ? <DexSprite id={b.id} emoji={b.emoji} /> : '❔'}
                </span>
                <span className="dex-form-name">{got ? b.name : '???'}</span>
              </div>
            )
          })}
        </div>
      </div>
      {GROWTH_ROOTS.map((root) => {
        const forms = lineForms(root.line)
        // 단계별로 묶어서 트리 느낌 (성장기~궁극체)
        const byTier = [1, 2, 3, 4].map((t) =>
          forms.filter((f) => f.tier === t),
        )
        const gotAny = forms.some((f) => discovered.has(f.id))
        return (
          <div key={root.line} className="dex-line">
            <p className="dex-line-title">
              {gotAny ? `${root.emoji} ${root.name} 계통` : '??? 계통'}
            </p>
            <div className="dex-tiers">
              {byTier.map((tierForms, t) => (
                <div key={t} className="dex-tier">
                  {tierForms.map((f) => {
                    const got = discovered.has(f.id)
                    return (
                      <div
                        key={f.id}
                        className={'dex-form' + (got ? ' got' : ' locked')}
                        title={
                          got ? `${tierName(f.tier)} · ${f.type} · 크게 보기` : '미발견'
                        }
                        role={got ? 'button' : undefined}
                        tabIndex={got ? 0 : undefined}
                        onClick={got ? () => setZoom(zoomFor(f.id)) : undefined}
                      >
                        <span className="dex-form-emoji">
                          {got ? <DexSprite id={f.id} emoji={f.emoji} /> : '❔'}
                        </span>
                        <span className="dex-form-name">
                          {got ? f.name : '???'}
                        </span>
                        {got && (
                          <span className="dex-form-attr">
                            {f.type}
                          </span>
                        )}
                        {!got && f.requires?.startsWith('cond:') && (
                          <span className="dex-form-hint">
                            {EVOLUTION_CONDITIONS[f.requires.slice(5)]?.hint ?? '???'}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )
      })}
      {/* 히든(각성) 종족 */}
      {(
        [
          ['🐲 사신수', FOUR_SYMBOLS],
          ['👹 사흉수', FIENDS],
          ['🧧 12지신', ZODIAC],
          ['👼 4대천사', ARCHANGELS],
          ['😈 7대 죄악마', SINS],
          ['🐉 황룡', [HUANGLONG]],
        ] as const
      ).map(([label, forms]) => (
        <div key={label} className="dex-line dex-hidden">
          <p className="dex-line-title">{label} (히든)</p>
          <div className="dex-grid">
            {forms.map((f) => {
              const got = discovered.has(f.id)
              return (
                <div
                  key={f.id}
                  className={'dex-form' + (got ? ' got' : ' locked')}
                  style={got ? { borderColor: '#fcd34d' } : undefined}
                  title={got ? '히든 · 크게 보기' : '미발견'}
                  role={got ? 'button' : undefined}
                  tabIndex={got ? 0 : undefined}
                  onClick={got ? () => setZoom(zoomFor(f.id)) : undefined}
                >
                  <span className="dex-form-emoji">{got ? <DexSprite id={f.id} emoji={f.emoji} /> : '✦'}</span>
                  <span className="dex-form-name">{got ? f.name : '???'}</span>
                  {got && <span className="dex-form-attr">{f.type}</span>}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      <p className="dex-hint">
        펫을 그리면 랜덤 계통을 얻고, 키우면서 갈래마다 다른 모습으로 진화해요.
        궁극체는 조건을 갖추면 히든 종족으로 <strong>각성</strong>할 수 있어요!
      </p>
    </Modal>
    </>
  )
}
