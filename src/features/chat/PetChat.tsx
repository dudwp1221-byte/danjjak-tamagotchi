import { useEffect, useRef, useState } from 'react'
import type { Pet, BehaviorState } from '../../types/pet'
import { buildSystemPrompt, sendChat, getApiKey, type ChatMessage } from '../../utils/chat'
import Modal from '../../components/Modal'
import './pet-chat.css'

interface PetChatProps {
  pet: Pet
  behaviorState: BehaviorState
  onClose: () => void
}

const QUICK_CHIPS = ['오늘 어땠어?', '배고파?', '뭐 하고 싶어?', '힘내!', '보고 싶었어']

export default function PetChat({ pet, behaviorState, onClose }: PetChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const apiKey = getApiKey()
  const systemPrompt = buildSystemPrompt(pet, behaviorState)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // 채팅창 열리면 펫이 먼저 인사
  useEffect(() => {
    if (!apiKey) return
    setLoading(true)
    sendChat(apiKey, systemPrompt, [], '안녕! 나 왔어.')
      .then((text) => {
        setMessages([{ role: 'assistant', content: text }])
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    setInput('')
    setError(null)

    const next: ChatMessage[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(next)
    setLoading(true)

    try {
      const reply = await sendChat(apiKey, systemPrompt, messages, trimmed)
      setMessages([...next, { role: 'assistant', content: reply }])
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  if (!apiKey) {
    return (
      <Modal title={`💬 ${pet.name}와 대화`} onClose={onClose}>
        <div className="pc-no-key">
          <p className="pc-no-key-emoji">🔑</p>
          <p className="pc-no-key-text">
            대화 기능을 쓰려면 Anthropic API 키가 필요해요.
          </p>
          <p className="pc-no-key-sub">
            설정 → AI 대화 키에서 입력할 수 있어요.
          </p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title={`💬 ${pet.name}와 대화`} onClose={onClose}>
      <div className="pc-wrap">
        <div className="pc-messages">
          {messages.map((m, i) => (
            <div key={i} className={`pc-bubble pc-${m.role}`}>
              {m.role === 'assistant' && (
                <span className="pc-pet-name">{pet.name}</span>
              )}
              <p className="pc-text">{m.content}</p>
            </div>
          ))}
          {loading && (
            <div className="pc-bubble pc-assistant pc-loading">
              <span className="pc-pet-name">{pet.name}</span>
              <p className="pc-text pc-dots">
                <span>·</span><span>·</span><span>·</span>
              </p>
            </div>
          )}
          {error && (
            <p className="pc-error">오류: {error}</p>
          )}
          <div ref={bottomRef} />
        </div>

        {/* 빠른 입력 칩 */}
        {messages.length <= 2 && !loading && (
          <div className="pc-chips">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                className="pc-chip"
                onClick={() => send(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        <form
          className="pc-form"
          onSubmit={(e) => { e.preventDefault(); send(input) }}
        >
          <input
            ref={inputRef}
            className="pc-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`${pet.name}에게 말 걸기...`}
            maxLength={200}
            disabled={loading}
            autoFocus
          />
          <button
            type="submit"
            className="pc-send"
            disabled={!input.trim() || loading}
          >
            전송
          </button>
        </form>
      </div>
    </Modal>
  )
}
