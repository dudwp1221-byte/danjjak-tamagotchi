import {
  QUESTS,
  resolveStory,
  type Quest as QuestType,
  type QuestContext,
} from '../../utils/quests'
import Modal from '../../components/Modal'
import './quest.css'

interface QuestProps {
  ctx: QuestContext
  onClose: () => void
  /** 메인 챕터 완료 */
  onComplete: (reward: number) => void
  /** 현재 펫 계통의 스토리 퀘스트 */
  lineQuests: QuestType[]
  /** 계통 이름 (헤더용) */
  lineName: string
  /** 계통 완료 */
  onCompleteLine: (reward: number) => void
}

interface SectionProps {
  ctx: QuestContext
  quests: QuestType[]
  stage: number
  onComplete: (reward: number) => void
}

function QuestSection({ ctx, quests, stage, onComplete }: SectionProps) {
  const allDone = stage >= quests.length
  const current = allDone ? null : quests[stage]
  const canComplete = current ? current.check(ctx) : false
  return (
    <>
      {quests.slice(0, stage).map((q) => (
        <div key={q.id} className="quest-chapter done">
          <div className="quest-head">
            <span className="quest-title">{q.title}</span>
            <span className="quest-check">✓</span>
          </div>
          <p className="quest-story">{resolveStory(q, ctx)}</p>
        </div>
      ))}

      {current && (
        <div className="quest-chapter current">
          <div className="quest-head">
            <span className="quest-title">{current.title}</span>
          </div>
          <p className="quest-story">{resolveStory(current, ctx)}</p>
          <div className="quest-goal">
            🎯 목표: {current.goal}
            <span className={'quest-status' + (canComplete ? ' ok' : '')}>
              {canComplete ? '달성!' : '진행 중'}
            </span>
          </div>
          <button
            type="button"
            className="quest-claim"
            disabled={!canComplete}
            onClick={() => onComplete(current.reward)}
          >
            {canComplete
              ? `보상 받고 다음 이야기로 (+${current.reward}🪙)`
              : '목표를 먼저 달성하세요'}
          </button>
        </div>
      )}

      {allDone && (
        <div className="quest-end">
          <span className="quest-end-emoji">🏆</span>
          <p>이 이야기를 모두 완성했어요!</p>
        </div>
      )}
    </>
  )
}

export default function Quest({
  ctx,
  onClose,
  onComplete,
  lineQuests,
  lineName,
  onCompleteLine,
}: QuestProps) {
  return (
    <Modal title="📜 단짝과의 이야기" onClose={onClose}>
      <p className="quest-section-label">📖 메인 스토리</p>
      <QuestSection
        ctx={ctx}
        quests={QUESTS}
        stage={ctx.pet.questStage}
        onComplete={onComplete}
      />

      {lineQuests.length > 0 && (
        <>
          <p className="quest-section-label">🌱 {lineName} 계통 이야기</p>
          <QuestSection
            ctx={ctx}
            quests={lineQuests}
            stage={ctx.pet.lineQuestStage}
            onComplete={onCompleteLine}
          />
        </>
      )}
    </Modal>
  )
}
