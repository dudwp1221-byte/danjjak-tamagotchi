import { useCallback, useEffect, useRef, useState } from 'react'
import { loadPets, getActiveId, loadSettings, applyTheme, upsertPet, loadPetMoveMode } from '../../utils/storage'
import { petMood } from '../../utils/stats'
import { resolveCare, careRemaining } from '../../utils/care'
import { addCoins } from '../../utils/account'
import { useBackgroundXp } from '../../hooks/useBackgroundXp'
import { formById } from '../../utils/species'
import { levelFromXp, stageFromLevel } from '../../utils/progression'
import { canEvolveNow } from '../../utils/evolve'
import { needLine, ambientLine, pokeLine } from '../../utils/desktopTalk'
import { accessoryEmoji, wornAccessories } from '../../utils/items'
import AccessorySprite from '../../components/AccessorySprite'
import { normalizePet, petSpriteUrl } from '../../utils/pet'
import type { Pet } from '../../types/pet'
import type { PetAction } from '../../types/pet'
import './desktop-pet.css'

function spriteUrl(pet: Pet): string {
  return petSpriteUrl(pet)
}

export default function DesktopPet() {
  const [pet, setPet] = useState<Pet | null>(null)
  // 기본값 -1 = 왼쪽 보기 (시작 위치가 화면 오른쪽이라 중앙을 향함). main.ts가 로드 시 동기화.
  const [dir, setDir] = useState<1 | -1>(-1)

  const [speech, setSpeech] = useState<string | null>(null)
  const [careEffect, setCareEffect] = useState<string | null>(null)
  const [careAction, setCareAction] = useState<PetAction | null>(null)
  const [speechOn, setSpeechOn] = useState(true)
  const speechOnRef = useRef(speechOn)
  speechOnRef.current = speechOn
  const speechTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // 펫 로드 + 테마
  useEffect(() => {
    applyTheme(loadSettings().theme)
    const refresh = () => {
      const pets = loadPets()
      const aid = getActiveId()
      const active = (aid && pets.find(p => p.id === aid)) || pets[0] || null
      setPet(active)
    }
    refresh()
    const id = setInterval(refresh, 5000)
    return () => clearInterval(id)
  }, [])

  // 이동 방향 수신
  useEffect(() => {
    const bridge = (window as any).electronBridge
    if (!bridge?.onPetDir) return
    return bridge.onPetDir((d: 1 | -1) => setDir(d))
  }, [])

  // 저장된 이동 모드를 메인 프로세스에 전달 (펫 창이 뜰 때마다 동기화)
  useEffect(() => {
    ;(window as any).electronBridge?.setPetMoveMode?.(loadPetMoveMode())
  }, [])

  // 백그라운드 XP: 게임 창의 PetGame이 적립 중이 아닐 때(창 닫힘/로비 화면) 바탕화면 펫이 담당 (중복 방지)
  // 야근 상한·업무 통계·진화 카운터까지 게임 창과 동일 규칙 — useBackgroundXp 참고
  const gameXpActiveRef = useRef(false)
  useEffect(() => {
    const bridge = (window as any).electronBridge
    return bridge?.onFullWindowState?.((active: boolean) => { gameXpActiveRef.current = active })
  }, [])
  useBackgroundXp(gameXpActiveRef)

  // 주기적 말걸기: 긴급한 필요는 ~5분마다, 평상시 힐링 대사는 ~18~26분마다 (시간당 2~3번)
  const lastTalkRef = useRef(0)
  useEffect(() => {
    const id = setInterval(() => {
      if (!pet || !speechOn) return
      const now = Date.now()
      const need = needLine(pet)
      const gap = need ? 5 * 60000 : (18 + Math.random() * 8) * 60000
      if (now - lastTalkRef.current < gap) return
      lastTalkRef.current = now
      setSpeech(need ?? ambientLine(pet))
      clearTimeout(speechTimer.current)
      speechTimer.current = setTimeout(() => setSpeech(null), 5000)
    }, 30000)
    return () => clearInterval(id)
  }, [pet, speechOn])

  // 진화 가능해지는 순간 즉시 알림 (한 번)
  const wasEvolvable = useRef(false)
  useEffect(() => {
    if (!pet) return
    const evolvable = canEvolveNow(pet, levelFromXp(pet.growth))
    if (evolvable && !wasEvolvable.current && speechOn) {
      setSpeech(needLine(pet) ?? '나… 진화할 수 있어요! ✨')
      clearTimeout(speechTimer.current)
      speechTimer.current = setTimeout(() => setSpeech(null), 6000)
    }
    wasEvolvable.current = evolvable
  }, [pet, speechOn])

  // 케어 액션 (localStorage 직접 업데이트)
  const handleCare = useCallback((action: PetAction) => {
    const pets = loadPets()
    const aid = getActiveId()
    const raw = (aid && pets.find(p => p.id === aid)) || pets[0]
    if (!raw) return
    // 게임과 동일한 규칙: 시간당 제한 + 큰 XP + 코인 (공용 util)
    const { result, xp, coins, nextCareXp } = resolveCare(raw, action)
    if (coins > 0) addCoins(coins) // 코인은 계정 지갑으로
    const updated = normalizePet({
      ...raw,
      stats: result.stats,
      growth: raw.growth + xp,
      totalActions: raw.totalActions + (result.wasted ? 0 : 1),
      careXp: nextCareXp,
      lastUpdated: Date.now(),
    })
    upsertPet(updated)
    setPet(updated)
    ;(window as any).electronBridge?.notifyPetChanged?.()
    const fx: Record<PetAction, string> = { feed: '😋', pet: '💕', wash: '✨', sleep: '💤', play: '🎉', gift: '🎁' }
    setCareEffect(fx[action])
    setCareAction(action)
    setTimeout(() => {
      setCareEffect(null)
      setCareAction(null)
    }, 900)
    // 말풍선 (말걸기 끔이면 생략 — 이펙트만 표시)
    if (speechOnRef.current) {
      const msg: Record<PetAction, string> = { feed: '맛있어요! 🍙', pet: '좋아요! 💕', wash: '개운해요! ✨', sleep: '잘게요~ 💤', play: '신나요! 🎉', gift: '고마워요! 🎁' }
      setSpeech(msg[action])
      clearTimeout(speechTimer.current)
      speechTimer.current = setTimeout(() => setSpeech(null), 3000)
    }
  }, [])

  const bridge = (window as any).electronBridge

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const b = (window as any).electronBridge
    const el = document.elementFromPoint(e.clientX, e.clientY)
    const interactive = el?.closest('button, a, [data-click]')
    b?.setClickThrough?.(!interactive)
  }, [])

  const handleMouseLeave = useCallback(() => {
    const b = (window as any).electronBridge
    b?.setClickThrough?.(true)
  }, [])

  // 펫을 콕 누르면 한마디 (말걸기 꺼져 있어도 직접 누른 거라 반응)
  const handlePoke = useCallback(() => {
    if (!pet) return
    setSpeech(pokeLine(pet))
    clearTimeout(speechTimer.current)
    speechTimer.current = setTimeout(() => setSpeech(null), 3000)
  }, [pet])

  const mood = pet ? petMood(pet.stats) : null
  const sleeping = pet ? pet.stats.energy < 25 : false
  const form = pet ? formById(pet.form) : null
  // 인게임 PetAvatar와 동일한 악세서리 배치를 위해 진화 단계 배율을 구한다.
  // 저장 좌표는 "아바타 박스(%)" 기준인데, 실제 그림은 박스 안에서 stage.scale 만큼
  // 축소돼 가운데 놓이므로, 그림(=dp-img 72px) 프레임 좌표로 변환해야 위치가 맞는다.
  const DP_IMG = 72
  const dpScale = pet ? stageFromLevel(levelFromXp(pet.growth)).scale : 1
  const dpBox = DP_IMG / dpScale
  const toWrap = (pct: number) => (((pct / 100) * dpBox - (dpBox - DP_IMG) / 2) / DP_IMG) * 100
  // 게임 창에서 착용한 악세서리(다중)를 바탕화면에서도 보여준다 (옷장 배치 반영)
  const wornList = pet
    ? wornAccessories(pet)
        .map((w) => ({ ...w, emoji: accessoryEmoji(w.id) }))
        .filter((w): w is typeof w & { emoji: string } => !!w.emoji)
    : []
  const distressed = pet
    ? Math.min(pet.stats.hunger, pet.stats.mood, pet.stats.cleanliness, pet.stats.energy) < 30
    : false

  if (!pet) {
    return (
      <div className="dp-empty" onClick={() => bridge?.openFullUI?.()}>
        🥚
        <span>게임창에서<br/>펫을 만들어요</span>
      </div>
    )
  }

  return (
    <div
      className={
        `dp-root${sleeping ? ' is-sleeping' : ''}` +
        `${distressed ? ' is-distressed' : ''}` +
        `${form ? ` dp-tier-${Math.min(form.tier, 4)}` : ''}` +
        `${careAction ? ` dp-action-${careAction}` : ''}`
      }
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 케어 이펙트 */}
      {careEffect && <div className="dp-care-fx">{careEffect}</div>}

      {/* 말풍선 */}
      {speech && <div className="dp-bubble">{speech}</div>}


      {/* 펫 */}
      <div
        className="dp-pet-wrap"
        data-click
        // dir: 1=오른쪽 보기, -1=왼쪽 보기 (main.ts 레일 기준).
        // 스프라이트 원본이 왼쪽 보기라 오른쪽을 보려면 뒤집어야 한다 — PetRoom과 동일 규칙.
        // (반전은 wrap에 걸어야 함: .dp-img의 keyframes transform이 인라인 반전을 덮어씀)
        style={{ transform: `scaleX(${dir === 1 ? -1 : 1})` }}
        onClick={handlePoke}
        onDoubleClick={() => bridge?.openFullUI?.()}
        title="클릭: 말 걸기 · 더블클릭: 게임 열기"
      >
        {form && !sleeping && !distressed && (
          <>
            <span className="dp-particle dp-particle-1" />
            {form.tier >= 2 && <span className="dp-particle dp-particle-2" />}
          </>
        )}
        {careAction && (
          <span className={`dp-action-burst dp-action-burst-${careAction}`} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        )}
        {sleeping ? (
          <div className="dp-sleeping">
            <img src={spriteUrl(pet)} alt={pet.name} className="dp-img" draggable={false} />
            <span className="dp-zzz">💤</span>
          </div>
        ) : (
          // dp-body가 둥실거림·케어 반응 애니메이션을 담당 — 악세서리도 함께 바운스한다.
          // 몸이 좌우반전되면 착용 장비도 몸에 붙은 채 같이 뒤집힌다.
          <span className="dp-body">
            <img src={spriteUrl(pet)} alt={pet.name} className="dp-img" draggable={false} />
            {wornList.map((w) => {
              // 인게임(PetAvatar)과 동일한 좌표계·크기 비율로 렌더 — 위치·크기 일치
              const p = w.placement ?? { x: 50, y: 10, s: 1 }
              return (
                <span
                  key={w.id}
                  className="dp-accessory"
                  style={{
                    left: `${toWrap(p.x)}%`,
                    top: `${toWrap(p.y)}%`,
                    fontSize: `${dpBox * 0.28 * p.s}px`,
                  }}
                  aria-hidden="true"
                >
                  <AccessorySprite
                    id={w.id}
                    emoji={w.emoji}
                    width={dpBox * 0.32 * p.s}
                    rotate={p.r ?? 0}
                    flip={p.flip ?? false}
                  />
                </span>
              )
            })}
          </span>
        )}
      </div>

      {/* 이름 — 펫 이미지 아래 중앙 */}
      <div className="dp-info">
        <span className="dp-name">{pet.name}</span>
        {mood && <span className="dp-mood">{mood.emoji}</span>}
      </div>

      {/* 케어 버튼 */}
      <div className="dp-care-btns">
        {([
          { action: 'feed' as const, icon: '🍙', label: '먹이주기' },
          { action: 'pet' as const, icon: '🤚', label: '쓰다듬기' },
          { action: 'wash' as const, icon: '🛁', label: '씻기기' },
          { action: 'sleep' as const, icon: '🛏️', label: '재우기' },
          { action: 'play' as const, icon: '🎮', label: '놀아주기' },
        ]).map(({ action, icon, label }) => {
          const left = careRemaining(pet, action)
          const capped = left <= 0
          return (
            <button
              key={action}
              type="button"
              className={'dp-care-btn' + (capped ? ' capped' : '')}
              onClick={() => handleCare(action)}
              disabled={capped}
              title={capped ? `${label} (이번 시각은 충분 — 다음 정각에 가능)` : `${label} (남은 ${left}회)`}
            >
              {icon}
              <span className="dp-care-count">{capped ? '⏳' : left}</span>
            </button>
          )
        })}
        <button
          type="button"
          className={`dp-care-btn dp-speech-toggle${speechOn ? '' : ' muted'}`}
          onClick={() => { setSpeechOn(v => !v); setSpeech(null) }}
          title={speechOn ? '말걸기 끄기' : '말걸기 켜기'}
        >{speechOn ? '💬' : '🔇'}</button>
      </div>
    </div>
  )
}
