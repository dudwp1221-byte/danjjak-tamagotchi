/**
 * 갈래(타입)별 전용 대사 — 같은 계통이라도 진화 갈래에 따라 말투·개성이 달라진다.
 * 타입 47종을 14개 성격 그룹으로 묶어 관리.
 */

const GROUP_OF: Record<string, string> = {
  용형: 'dragon', 황제룡형: 'dragon',
  파충류형: 'reptile', 공룡형: 'reptile',
  조류형: 'bird',
  수생형: 'aqua', 양서류형: 'aqua',
  야수형: 'beast', 포유류형: 'beast', 마수형: 'beast', 성수형: 'beast', 환수형: 'beast',
  곤충형: 'bug',
  식물형: 'plant',
  순수기계형: 'machine', 로봇형: 'machine', 거대로봇형: 'machine',
  사이보그형: 'machine', 병기형: 'machine', 인형형: 'machine',
  천사형: 'angel', 대천사형: 'angel', 타천사형: 'angel',
  악마형: 'devil', 마왕형: 'devil', 마신형: 'devil',
  언데드형: 'ghost', 정령형: 'ghost',
  음식형: 'food',
  전사형: 'hero', 기사형: 'hero', 성기사형: 'hero',
  마법사형: 'hero', 현자형: 'hero', 수행자형: 'hero',
  신수형: 'divine', 수호형: 'divine', 흉수형: 'divine',
}

const LINES: Record<string, string[]> = {
  dragon: ['크앙! …은 장난이에요 🐉', '언젠가 하늘을 가를 거예요', '용의 심장은 늘 뜨거워요 🔥'],
  reptile: ['햇볕 좋다~ 일광욕 타임 🦎', '느릿느릿, 그게 제 매력이죠', '꼬리 살랑살랑~'],
  bird: ['짹짹! 좋은 바람이 불어요', '날개를 활짝 펴고 싶은 날이에요', '높은 곳에서 보면 다 작아 보여요~'],
  aqua: ['뽀글뽀글~ 🫧', '물놀이 가고 싶어요!', '촉촉한 게 최고예요 💧'],
  beast: ['그루밍 중… 방해 금지예요 🐾', '털 좀 봐주세요, 윤기 나죠?', '같이 뒹굴래요?'],
  bug: ['더듬이가 간질간질해요', '오늘도 부지런히 움직여야죠!', '반짝이는 걸 발견했어요! ✨'],
  plant: ['광합성 타임이에요 ☀️', '물 한 모금이면 충분히 행복해요', '새싹이 근질근질~ 🌱'],
  machine: ['위이잉— 시스템 정상 가동!', '나사 하나가 근질거려요', '충전 완료! 오늘도 풀파워 ⚡'],
  angel: ['오늘도 당신을 지켜볼게요 🪽', '작은 기도를 하나 했어요', '빛이 참 따뜻하죠?'],
  devil: ['후후, 세계정복은… 내일부터', '악당도 쉬는 날이 필요해요 😈', '무서워 보여도 착해요. 진짜예요!'],
  ghost: ['부우… 놀랐죠? 헤헤 👻', '밤공기가 참 좋아요', '스르륵~ 지나가는 중입니다'],
  food: ['저… 맛있어 보여도 먹으면 안 돼요!', '달콤한 하루 되세요 🍡', '설탕 충전 완료!'],
  hero: ['오늘도 수련! 얍! 🗡️', '주인님은 제가 지켜요', '검 손질은 기본 중의 기본이죠'],
  divine: ['…당신을 오래 지켜봤습니다', '신의 가호가 함께하기를', '이 힘은 당신을 위해 쓰겠습니다 ✦'],
}

/** 타입에 어울리는 전용 대사 하나 (해당 없으면 null) */
export function typeLine(petType: string): string | null {
  const g = GROUP_OF[petType]
  if (!g) return null
  const arr = LINES[g]
  return arr[Math.floor(Math.random() * arr.length)]
}
