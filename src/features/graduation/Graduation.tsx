import { useEffect, useMemo, useState } from 'react'
import type { DiaryEntry, Pet } from '../../types/pet'
import { formById } from '../../utils/species'
import { stageFromLevel } from '../../utils/progression'
import { daysTogether, graduateReward, petSpriteUrl } from '../../utils/pet'
import { personalityDef } from '../../utils/personality'
import { bondStage } from '../../utils/bond'
import { pickHighlights, pickLastWords } from '../../utils/graduation'
import PetAvatar from '../../components/PetAvatar'
import Modal from '../../components/Modal'
import './graduation.css'

/** 졸업식에서 만들어져 명예의 전당에 함께 보관되는 기록 */
export interface GraduationMemoir {
  farewell: string
  lastWords: string
  highlights: DiaryEntry[]
}

interface GraduationProps {
  pet: Pet
  level: number
  onClose: () => void
  /** 배웅 연출까지 끝난 뒤 호출 — 독립 확정 */
  onGraduate: (memoir: GraduationMemoir) => void
}

/** 돌아보기 → 작별 인사 → 배웅 */
type Step = 'recall' | 'farewell' | 'sendoff'

function formatDay(at: number): string {
  const d = new Date(at)
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

/** 배웅 연출 길이 (ms) — CSS 애니메이션과 맞춰야 한다 */
const SENDOFF_MS = 3000

export default function Graduation({
  pet,
  level,
  onClose,
  onGraduate,
}: GraduationProps) {
  const [step, setStep] = useState<Step>('recall')
  const [farewell, setFarewell] = useState('')

  const form = formById(pet.form)
  const days = daysTogether(pet.createdAt)
  const reward = graduateReward(level, days)
  const person = personalityDef(pet.personality)
  // 마지막 인사·하이라이트는 졸업식 동안 고정
  const lastWords = useMemo(() => pickLastWords(pet.personality), [pet.personality])
  const highlights = useMemo(() => pickHighlights(pet.diary), [pet.diary])

  // 배웅 연출이 끝나면 독립 확정
  useEffect(() => {
    if (step !== 'sendoff') return
    const t = setTimeout(() => {
      onGraduate({ farewell: farewell.trim(), lastWords, highlights })
    }, SENDOFF_MS)
    return () => clearTimeout(t)
  }, [step]) // eslint-disable-line react-hooks/exhaustive-deps

  // 배웅 중엔 닫기(Esc/배경 클릭)로 연출이 끊기지 않게
  const handleClose = step === 'sendoff' ? () => {} : onClose

  const portrait = (
    <PetAvatar
      imageDataUrl={petSpriteUrl(pet)}
      stats={pet.stats}
      stage={stageFromLevel(level)}
      accessory={pet.accessory}
      species={form}
      stageIndex={form.tier}
      size={step === 'recall' ? 120 : 150}
      alt={pet.name}
    />
  )

  return (
    <Modal title="🎓 졸업식" onClose={handleClose}>
      {step === 'recall' && (
        <div className="grad-body">
          {portrait}
          <h3 className="grad-title">{pet.name}와의 시간</h3>
          <div className="grad-chips">
            <span className="grad-chip">🗓️ 함께한 {days}일</span>
            <span className="grad-chip">💞 돌봄 {pet.totalActions}번</span>
            <span className="grad-chip">
              {person.emoji} {person.name}
            </span>
            <span className="grad-chip">
              {bondStage(pet.bond).emoji} {bondStage(pet.bond).name}
            </span>
          </div>
          <p className="grad-text">
            처음 만난 날부터 지금의 {form.emoji} <strong>{form.name}</strong> 모습이 되기까지,
            <br />
            {pet.ownerName}님과 이런 날들을 보냈어요.
          </p>
          {highlights.length > 0 && (
            <ul className="grad-memories">
              {highlights.map((e, i) => (
                <li key={i} className="grad-memory">
                  <span className="grad-memory-icon">{e.icon}</span>
                  <span className="grad-memory-text">{e.text}</span>
                  <span className="grad-memory-date">{formatDay(e.at)}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="grad-btns">
            <button type="button" className="grad-yes" onClick={() => setStep('farewell')}>
              작별 인사하러 가기
            </button>
            <button type="button" className="grad-no" onClick={onClose}>
              조금 더 함께할래요
            </button>
          </div>
        </div>
      )}

      {step === 'farewell' && (
        <div className="grad-body">
          {portrait}
          <p className="grad-bubble">“{lastWords}”</p>
          <p className="grad-text">
            {pet.name}가 마지막 인사를 건네요.
            <br />
            떠나는 {pet.name}에게 한마디를 남겨주세요.
          </p>
          <textarea
            className="grad-farewell-input"
            value={farewell}
            onChange={(e) => setFarewell(e.target.value.slice(0, 80))}
            placeholder="남긴 말은 명예의 전당 초상 옆에 함께 걸려요 (건너뛰어도 돼요)"
            rows={2}
          />
          <p className="grad-note">
            독립을 보내면 {pet.name}는 <strong>명예의 전당</strong>에 초상으로 영원히 남아요.
          </p>
          <p className="grad-reward">
            🎁 졸업 선물: <strong>+{reward}🪙</strong> (남는 단짝에게)
          </p>
          <div className="grad-btns">
            <button type="button" className="grad-yes" onClick={() => setStep('sendoff')}>
              🎓 독립 보내기
            </button>
            <button type="button" className="grad-no" onClick={onClose}>
              조금 더 함께할래요
            </button>
          </div>
        </div>
      )}

      {step === 'sendoff' && (
        <div className="grad-body grad-sendoff">
          <div className="grad-sendoff-stage">
            <div className="grad-sendoff-pet">{portrait}</div>
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} className={`grad-star grad-star-${i}`}>
                {i % 3 === 0 ? '✨' : i % 3 === 1 ? '⭐' : '🌟'}
              </span>
            ))}
          </div>
          <p className="grad-sendoff-text">
            {pet.name}가 새로운 여행을 떠나요.
            <br />
            함께한 {days}일, 고마웠어요.
          </p>
        </div>
      )}
    </Modal>
  )
}
