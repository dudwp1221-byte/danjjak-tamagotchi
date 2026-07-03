import type { Pet } from '../types/pet'
import { type Form, formById, nextForms } from './species'
import { stageIndexFromLevel } from './progression'
import { checkCondition } from './evolution-conditions'
import { gameClock } from './gametime'

export interface EvolveOption {
  form: Form
  locked: boolean
  reason: string
}

/**
 * 현재 펫이 진화할 수 있는 형태 목록 + 각 형태의 잠금 여부/사유.
 * 게임 화면(Evolve 버튼/모달)과 바탕화면 펫(진화 알림)이 동일 판정을 쓰도록 공용화.
 */
export function getEvolveOptions(pet: Pet, level: number): EvolveOption[] {
  const form = formById(pet.form)
  const requiredTier = stageIndexFromLevel(level)
  const raw =
    form.tier < requiredTier && form.next.length > 0 ? nextForms(form.id) : []
  if (raw.length === 0) return []

  const clock = gameClock(pet.createdAt)
  const lowestStat = Math.min(
    pet.stats.hunger,
    pet.stats.mood,
    pet.stats.cleanliness,
    pet.stats.energy,
    pet.stats.health,
  )

  return raw.map((f) => {
    let locked = false
    let reason = ''
    switch (f.requires) {
      case 'evostone':
        locked = !pet.ownedItems.includes('item_evostone')
        reason = '💠 진화의 돌 필요'
        break
      case 'allHigh':
        locked = lowestStat < 80
        reason = '모든 스탯 80↑ 필요'
        break
      case 'statMood':
        locked = pet.stats.mood < 70
        reason = '애정 70↑ 필요'
        break
      case 'statClean':
        locked = pet.stats.cleanliness < 70
        reason = '청결 70↑ 필요'
        break
      case 'statEnergy':
        locked = pet.stats.energy < 70
        reason = '기운 70↑ 필요'
        break
      case 'statHunger':
        locked = pet.stats.hunger < 70
        reason = '배부름 70↑ 필요'
        break
      case 'night':
        locked = !clock.isNight
        reason = '🌙 밤에만 진화'
        break
      case 'day':
        locked = clock.isNight
        reason = '☀️ 낮에만 진화'
        break
      case 'seasonSpring':
        locked = clock.season.key !== 'spring'
        reason = '🌸 봄에만 진화'
        break
      case 'seasonSummer':
        locked = clock.season.key !== 'summer'
        reason = '🌻 여름에만 진화'
        break
      case 'seasonAutumn':
        locked = clock.season.key !== 'autumn'
        reason = '🍂 가을에만 진화'
        break
      case 'seasonWinter':
        locked = clock.season.key !== 'winter'
        reason = '⛄ 겨울에만 진화'
        break
      default:
        if (f.requires?.startsWith('cond:')) {
          const condKey = f.requires.slice(5)
          const check = checkCondition(pet.behaviorProfile, condKey)
          locked = !check.met
          reason = `${check.progress}/${check.threshold}`
        }
    }
    return { form: f, locked, reason }
  })
}

/** 지금 당장(잠금 해제된 옵션이 하나라도) 진화 가능한지 */
export function canEvolveNow(pet: Pet, level: number): boolean {
  return getEvolveOptions(pet, level).some((o) => !o.locked)
}
