import { describe, expect, it } from 'vitest'
import { createPet } from './pet'
import { formById } from './species'

describe('createPet', () => {
  it('이름을 비우면 뽑힌 종족의 기본 이름을 쓴다', () => {
    const p = createPet({ ownerName: 'a', name: '   ', imageDataUrl: 'data:,' })
    expect(p.name).toBe(formById(p.form).name)
    expect(p.name.length).toBeGreaterThan(0)
  })

  it('이름을 입력하면 그대로 쓴다', () => {
    const p = createPet({ ownerName: 'a', name: '몽실이', imageDataUrl: 'data:,' })
    expect(p.name).toBe('몽실이')
  })
})
