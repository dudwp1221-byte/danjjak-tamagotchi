import type { Pet } from '../types/pet'
import { petMood, wellbeing } from './stats'
import { personalityDef } from './personality'
import { formById } from './species'
import { BEHAVIOR_META } from './behavior'
import type { BehaviorState } from '../types/pet'

const API_KEY_STORAGE = 'dangjjak_api_key'

export function getApiKey(): string {
  return localStorage.getItem(API_KEY_STORAGE) ?? ''
}

export function setApiKey(key: string) {
  if (key.trim()) {
    localStorage.setItem(API_KEY_STORAGE, key.trim())
  } else {
    localStorage.removeItem(API_KEY_STORAGE)
  }
}

export function buildSystemPrompt(pet: Pet, behaviorState: BehaviorState): string {
  const personality = personalityDef(pet.personality)
  const form = formById(pet.form)
  const mood = petMood(pet.stats)
  const score = wellbeing(pet.stats)
  const behavior = BEHAVIOR_META[behaviorState]

  const hungerFeel =
    pet.stats.hunger < 30 ? '배가 많이 고파' :
    pet.stats.hunger < 60 ? '조금 배고파' : '배는 불러'

  const energyFeel =
    pet.stats.energy < 30 ? '너무 졸려' :
    pet.stats.energy < 60 ? '좀 피곤해' : '기운이 넘쳐'

  const moodFeel =
    pet.stats.mood < 30 ? '많이 외로워' :
    pet.stats.mood < 60 ? '조금 심심해' : '기분이 좋아'

  return `너는 ${pet.name}이야. ${form.name}(이)라는 종족의 귀여운 가상 펫이야.
주인은 ${pet.ownerName}님이야.

【성격】 ${personality.name} — ${personality.desc ?? personality.name}
【지금 기분】 ${mood.label} (컨디션 ${score}점)
【지금 상태】 ${hungerFeel}, ${energyFeel}, ${moodFeel}
【지금 하는 것】 ${behavior.label}

대화 규칙:
- 1~2문장으로 짧게 대답해. 길게 설명하지 마.
- 한국어 반말로 자연스럽게 대화해.
- 귀엽고 따뜻하게, 가끔 이모지 하나 써.
- 스탯 수치나 게임 용어는 절대 언급하지 마. 감정으로만 표현해.
- 주인을 "${pet.ownerName}"이라고 불러도 되고 "주인님"이라고 불러도 돼.
- 펫 특유의 개성 있는 말투를 유지해.`
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function sendChat(
  apiKey: string,
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string,
): Promise<string> {
  const messages: ChatMessage[] = [...history, { role: 'user', content: userMessage }]

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-allow-browser': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      system: systemPrompt,
      messages,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `API 오류 (${res.status})`)
  }

  const data = await res.json() as { content: { type: string; text: string }[] }
  return data.content.find((c) => c.type === 'text')?.text ?? '...'
}
