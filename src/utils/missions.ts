/** 미션 진행을 일으키는 이벤트 종류 */
export type MissionEvent = 'care' | 'minigame'

export interface MissionDef {
  id: string
  icon: string
  text: string
  goal: number
  reward: number
  event: MissionEvent
}

/** 매일 주어지는 미션 (고정 3종) */
export const DAILY_MISSIONS: MissionDef[] = [
  { id: 'care5', icon: '🍙', text: '펫 5번 돌보기', goal: 5, reward: 12, event: 'care' },
  { id: 'play1', icon: '🎮', text: '미니게임 1판 하기', goal: 1, reward: 10, event: 'minigame' },
  { id: 'care10', icon: '💕', text: '펫 10번 돌보기', goal: 10, reward: 15, event: 'care' },
]

export function missionDef(id: string): MissionDef | undefined {
  return DAILY_MISSIONS.find((m) => m.id === id)
}
