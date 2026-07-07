import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Pet } from '../../types/pet'
import { wellbeing } from '../../utils/stats'
import { MAX_PETS, GRADUATE_MIN_LEVEL, graduateReward, daysTogether, petSpriteUrl, spriteUrl } from '../../utils/pet'
import { levelFromXp } from '../../utils/progression'
import { loadGraduates, type Graduate } from '../../utils/storage'
import { graduateForm } from '../../utils/graduation'
import { FURNITURE_ITEMS } from '../../utils/furniture'
import Memorial from '../graduation/Memorial'
import FurnitureSprite from '../../components/FurnitureSprite'
import './room.css'

interface RoomPet {
  id: string
  x: number   // 0~100 (%)
  y: number   // 0~100 (%)
  dx: number  // 이동 방향 (-1 | 1)
  dy: number  // 이동 방향 (-1 | 1)
  speed: number
  action: 'walk' | 'idle' | 'sleep'
  actionTimer: number
}

interface Props {
  pets: Pet[]
  activePetId: string
  onSwitch: (id: string) => void
  /** 새 단짝 만들기 */
  onAddNew: () => void
  /** 졸업(독립) 보내기 */
  onGraduate: (id: string) => void
  onClose: () => void
}

function initRoomPet(pet: Pet, index: number, total: number): RoomPet {
  const cols = Math.ceil(Math.sqrt(total))
  const col = index % cols
  const row = Math.floor(index / cols)
  return {
    id: pet.id,
    x: 15 + (col / Math.max(cols - 1, 1)) * 70,
    y: 50 + (row % 2) * 20,
    dx: Math.random() < 0.5 ? 1 : -1,
    dy: Math.random() < 0.5 ? 1 : -1,
    speed: 0.08 + Math.random() * 0.06,
    action: 'idle',
    actionTimer: Math.random() * 300,
  }
}

export default function PetRoom({ pets, activePetId, onSwitch, onAddNew, onGraduate, onClose }: Props) {
  const full = pets.length >= MAX_PETS
  const [memorial, setMemorial] = useState<Graduate | null>(null)
  const graduates = loadGraduates()
  // 돌보는 펫이 산 가구가 방에 실제로 놓인다
  const activePet = pets.find((p) => p.id === activePetId)
  const roomFurniture = FURNITURE_ITEMS.filter((f) => activePet?.furniture.includes(f.id))
  const [roomPets, setRoomPets] = useState<RoomPet[]>(() =>
    pets.map((p, i) => initRoomPet(p, i, pets.length)),
  )
  const frameRef = useRef<number | undefined>(undefined)
  const lastRef = useRef<number>(Date.now())

  useEffect(() => {
    const tick = () => {
      const now = Date.now()
      const dt = Math.min((now - lastRef.current) / 16, 4) // 최대 4프레임치
      lastRef.current = now

      setRoomPets((prev) =>
        prev.map((rp) => {
          let { x, y, dx, dy, action, actionTimer, speed } = rp
          actionTimer -= dt

          if (actionTimer <= 0) {
            // 다음 행동 결정
            const r = Math.random()
            if (r < 0.3) {
              action = 'sleep'
              actionTimer = 200 + Math.random() * 300
            } else if (r < 0.6) {
              action = 'idle'
              actionTimer = 80 + Math.random() * 150
              dx = Math.random() < 0.5 ? 1 : -1
              dy = Math.random() < 0.5 ? 1 : -1
            } else {
              action = 'walk'
              actionTimer = 150 + Math.random() * 200
              dx = Math.random() < 0.5 ? 1 : -1
              dy = Math.random() < 0.3 ? (Math.random() < 0.5 ? 1 : -1) : 0
            }
          }

          if (action === 'walk') {
            x = Math.max(5, Math.min(90, x + dx * speed * dt))
            y = Math.max(55, Math.min(88, y + dy * speed * dt * 0.3))
            if (x <= 5 || x >= 90) dx = -dx
            if (y <= 55 || y >= 88) dy = -dy
          }

          return { ...rp, x, y, dx, dy, action, actionTimer }
        }),
      )

      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  const petMap = Object.fromEntries(pets.map((p) => [p.id, p]))

  // 페이저 트랙(transform) 기준으로 붙지 않도록 body로 포탈
  return createPortal(
    <>
    <div className="room-backdrop" onClick={onClose}>
      <div className="room-container" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="room-header">
          <span>🏠 내 방</span>
          <span className="room-count">{pets.length}마리</span>
          <button type="button" className="room-close" onClick={onClose}>✕</button>
        </div>

        {/* 방 씬 */}
        <div className="room-scene">
          {/* 방 배경 요소 */}
          <div className="room-wall" />
          <div className="room-floor" />
          <div className="room-window">
            <div className="room-window-inner">🌤️</div>
          </div>

          {/* 가구 — 보유 가구가 실제로 놓인다 (없으면 기본 장식) */}
          {roomFurniture.length === 0 ? (
            <>
              <div className="room-deco room-deco-left">🛏️</div>
              <div className="room-deco room-deco-right">📚</div>
            </>
          ) : (
            roomFurniture.map((f, i) => (
              <div
                key={f.id}
                className="room-furniture"
                style={{
                  left: `${6 + (i * 86) / roomFurniture.length}%`,
                  bottom: `${30 + (i % 2) * 12}%`,
                }}
                title={f.name}
              >
                <FurnitureSprite id={f.id} emoji={f.emoji} />
              </div>
            ))
          )}

          {/* 펫들 */}
          {roomPets.map((rp) => {
            const pet = petMap[rp.id]
            if (!pet) return null
            const isActive = rp.id === activePetId
            const score = wellbeing(pet.stats)
            const moodEmoji = score >= 80 ? '😄' : score >= 50 ? '🙂' : '😐'

            return (
              <button
                key={rp.id}
                type="button"
                className={`room-pet${isActive ? ' is-active' : ''}${rp.action === 'sleep' ? ' is-sleeping' : ''}`}
                style={{
                  left: `${rp.x}%`,
                  top: `${rp.y}%`,
                }}
                onClick={() => onSwitch(rp.id)}
                title={`${pet.name} · ${score}점`}
              >
                {rp.action === 'sleep' ? (
                  <span className="room-pet-sleep">💤</span>
                ) : (
                  <img
                    src={petSpriteUrl(pet)}
                    alt={pet.name}
                    className="room-pet-img"
                    draggable={false}
                    // 스프라이트 기본이 왼쪽 보기 — 오른쪽 이동 시에만 뒤집는다.
                    // 이름·기분 이모지는 버튼이 아닌 이미지만 뒤집어 정방향 유지.
                    style={{ transform: `scaleX(${rp.dx > 0 ? -1 : 1})` }}
                  />
                )}
                <span className="room-pet-name">{pet.name}</span>
                {isActive && <span className="room-pet-active-dot" />}
                <span className="room-pet-mood">{moodEmoji}</span>
              </button>
            )
          })}
        </div>

        {/* 펫 목록 */}
        <div className="room-list">
          {pets.map((pet) => {
            const score = wellbeing(pet.stats)
            const isActive = pet.id === activePetId
            return (
              <div key={pet.id} className={`room-list-item${isActive ? ' is-active' : ''}`}>
                <button type="button" className="room-list-switch" onClick={() => onSwitch(pet.id)}>
                  <img src={petSpriteUrl(pet)} alt={pet.name} className="room-list-img" />
                  <span className="room-list-name">{pet.name}</span>
                  <span className="room-list-score">Lv.{levelFromXp(pet.growth)} · {score}점</span>
                  {isActive && <span className="room-list-badge">돌보는 중</span>}
                </button>
                {(() => {
                  const lv = levelFromXp(pet.growth)
                  const canGrad = lv >= GRADUATE_MIN_LEVEL
                  const rw = graduateReward(lv, daysTogether(pet.createdAt))
                  return (
                    <button
                      type="button"
                      className="room-grad-btn"
                      disabled={!canGrad}
                      title={canGrad ? `${pet.name} 졸업 보내기 (+${rw}🪙)` : `레벨 ${GRADUATE_MIN_LEVEL} 이상부터 졸업 가능`}
                      onClick={() => onGraduate(pet.id)}
                    >
                      {canGrad ? `🎓 졸업 +${rw}🪙` : `🎓 졸업 (Lv.${GRADUATE_MIN_LEVEL}~)`}
                    </button>
                  )
                })()}
              </div>
            )
          })}
          {!full && (
            <button type="button" className="room-add-btn" onClick={onAddNew}>
              ＋ 새 단짝 만들기
            </button>
          )}
        </div>
        {full && (
          <p className="room-full-note">
            방이 가득 찼어요 ({pets.length}/{MAX_PETS}). 🎓 졸업을 보내면 새 단짝을 받을 수 있어요.
          </p>
        )}

        {/* 명예의 전당 — 졸업한 단짝들의 초상 */}
        {graduates.length > 0 && (
          <div className="room-grads">
            <p className="room-grads-label">🏛️ 명예의 전당</p>
            <div className="room-grads-list">
              {graduates.map((g, i) => {
                const f = graduateForm(g)
                return (
                  <button
                    key={i}
                    type="button"
                    className="room-grad"
                    onClick={() => setMemorial(g)}
                    title="초상 보기"
                  >
                    {f ? (
                      <img className="room-grad-thumb" src={spriteUrl(f.id)} alt="" />
                    ) : (
                      <span className="room-grad-thumb-emoji">🎓</span>
                    )}
                    <span className="room-grad-name">{g.name}</span>
                    <span className="room-grad-sub">
                      {f ? f.name : g.species} · Lv.{g.level}
                    </span>
                    <span className="room-grad-go">›</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>

    {/* 명전 초상 — room-backdrop 클릭 닫힘에 휩쓸리지 않게 형제로 렌더 */}
    {memorial && <Memorial graduate={memorial} onClose={() => setMemorial(null)} />}
    </>,
    document.body,
  )
}
