import { describe, expect, it } from 'vitest'
import {
  FORMS,
  STARTERS,
  GROWTH_ROOTS,
  BABY_FORMS,
  HIDDEN_FORMS,
  formById,
} from './species'
import { EVOLUTION_CONDITIONS } from './evolution-conditions'

/**
 * 진화 그래프 전수 검증 — "진화 버튼 눌렀을 때 꼬인다" 류의 데이터 사고 방지.
 * 유년기(0) → 계통 루트(1) → 분기(2~4) 구조가 어디서도 어긋나지 않아야 한다.
 */
describe('종족 데이터 구조', () => {
  const ids = new Set(FORMS.map((f) => f.id))

  it('모든 next 참조가 실존하는 형태를 가리킨다', () => {
    for (const f of FORMS) {
      for (const n of f.next) {
        expect(ids.has(n), `${f.id}(${f.name}) → 없는 형태 ${n}`).toBe(true)
      }
    }
  })

  it('진화는 항상 정확히 한 단계 위 tier로 간다', () => {
    for (const f of FORMS) {
      for (const n of f.next) {
        const t = formById(n)
        expect(t.tier, `${f.id}(t${f.tier}) → ${n}(t${t.tier})`).toBe(f.tier + 1)
      }
    }
  })

  it('유년기(STARTERS)는 유년기 폼뿐이고, 분화 대상은 전부 계통 루트다', () => {
    expect(STARTERS.length).toBe(BABY_FORMS.length)
    for (const s of STARTERS) {
      expect(s.type).toBe('유년기')
      for (const n of s.next) {
        const root = formById(n)
        expect(root.id, `${s.name}의 분화 대상 ${n}는 계통 루트가 아님`).toBe(root.line)
        expect(root.tier).toBe(1)
      }
    }
  })

  it('모든 계통 루트는 최소 한 유년기에서 분화 가능하다 (진화 도달 불가 계통 없음)', () => {
    const reachable = new Set(BABY_FORMS.flatMap((b) => b.starters))
    for (const root of GROWTH_ROOTS) {
      expect(reachable.has(root.id), `${root.name}(${root.id}) 계통은 어떤 유년기에서도 못 감`).toBe(true)
    }
  })

  it('히든·합체 제외 모든 상위 형태는 아래에서 도달 가능하다', () => {
    const targets = new Set(FORMS.flatMap((f) => f.next))
    for (const f of FORMS) {
      if (f.tier === 0) continue // 유년기는 시작점
      if (f.hidden) continue // 각성 전용
      if (f.line === 'fuse') continue // 합체 전용
      if (f.id === f.line) continue // 계통 루트는 유년기에서 (위에서 검증)
      expect(targets.has(f.id), `${f.id}(${f.name})는 어떤 진화로도 도달 불가`).toBe(true)
    }
  })

  it('cond: 진화 조건 키가 전부 정의돼 있다', () => {
    for (const f of FORMS) {
      if (f.requires?.startsWith('cond:')) {
        const key = f.requires.slice(5)
        expect(EVOLUTION_CONDITIONS[key], `${f.id}의 조건 ${key} 미정의`).toBeDefined()
      }
    }
  })

  it('계통 내부 진화는 계통을 벗어나지 않는다 (유년기·합체·황룡 초각성 제외)', () => {
    for (const f of FORMS) {
      if (f.tier === 0) continue // 유년기 → 여러 계통 분화는 의도
      if (f.hidden) continue // 사신수 → 황룡 초각성은 의도된 계통 밖 연결
      for (const n of f.next) {
        const t = formById(n)
        const ok = t.line === f.line || t.line === 'fuse'
        expect(ok, `${f.id}(${f.line}) → ${n}(${t.line}) 계통 이탈`).toBe(true)
      }
    }
  })

  it('히든 형태는 일반(비히든) 진화 트리에 등장하지 않는다 (각성으로만 도달)', () => {
    const targets = new Set(FORMS.filter((f) => !f.hidden).flatMap((f) => f.next))
    for (const h of HIDDEN_FORMS) {
      expect(targets.has(h.id), `${h.id}(${h.name})가 일반 진화 트리에 노출됨`).toBe(false)
    }
  })
})
