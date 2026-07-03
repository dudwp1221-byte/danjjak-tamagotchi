import { useState } from 'react'
import './onboarding.css'

interface OnboardingProps {
  petName: string
  onDone: () => void
}

interface Step {
  emoji: string
  title: string
  body: string
}

export default function Onboarding({ petName, onDone }: OnboardingProps) {
  const STEPS: Step[] = [
    {
      emoji: '🐣',
      title: `${petName}와 만났어요!`,
      body: '회사에서 몰래 키우는 나만의 단짝 펫이에요. 잘 돌봐주면 무럭무럭 자라요.',
    },
    {
      emoji: '🍙',
      title: '4가지를 돌봐주세요',
      body: '배고픔·기분·청결·기운은 시간이 지나면 줄어들어요. 먹이주기·쓰다듬기·씻기기·재우기로 채워주세요.',
    },
    {
      emoji: '🌱',
      title: '켜두면 알아서 자라요',
      body: '방치해도 펫이 스스로 먹고 자고 놀면서 천천히 성장해요. 가끔 들여다보며 돌봐주면 더 빨리 자라요.',
    },
    {
      emoji: '🌙',
      title: '게임 속 시간이 흘러요',
      body: '게임 시간은 빠르게 흘러서 아침·낮·밤이 바뀌고 봄·여름·가을·겨울이 지나가요(게임 1년 ≈ 실제 7일). 어떤 진화나 전설의 각성은 특정 계절·밤에만, 또는 태어난 달에만 열려요!',
    },
    {
      emoji: '🏆',
      title: '키우는 재미가 가득',
      body: '돌볼수록 레벨업하며 진화하고, 코인을 모아 상점에서 꾸밀 수 있어요. 업적·친구 구경·자랑 카드도 즐겨보세요!',
    },
  ]

  const [step, setStep] = useState(0)
  const isLast = step === STEPS.length - 1
  const cur = STEPS[step]

  return (
    <div className="onb-backdrop">
      <div className="onb-card" role="dialog" aria-modal="true">
        <div className="onb-emoji">{cur.emoji}</div>
        <h2 className="onb-title">{cur.title}</h2>
        <p className="onb-body">{cur.body}</p>

        <div className="onb-dots">
          {STEPS.map((_, i) => (
            <span key={i} className={'onb-dot' + (i === step ? ' active' : '')} />
          ))}
        </div>

        <div className="onb-btns">
          {!isLast && (
            <button type="button" className="onb-skip" onClick={onDone}>
              건너뛰기
            </button>
          )}
          <button
            type="button"
            className="onb-next"
            onClick={() => (isLast ? onDone() : setStep((s) => s + 1))}
          >
            {isLast ? '시작하기 🎉' : '다음'}
          </button>
        </div>
      </div>
    </div>
  )
}
