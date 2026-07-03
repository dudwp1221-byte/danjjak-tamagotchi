import type { Pet } from '../types/pet'

export interface QuestContext {
  pet: Pet
  level: number
  days: number
}

export interface Quest {
  id: string
  title: string
  /** 목표 안내 */
  goal: string
  /** 진행 중 보여줄 이야기 (분기에 따라 달라질 수 있어 함수도 허용) */
  story: string | ((ctx: QuestContext) => string)
  reward: number
  /** 완료 조건 */
  check: (ctx: QuestContext) => boolean
}

/** 현재 형태 id에서 진화 갈래 키 추출 (예: liz_fire2 → 'fire') */
export function branchKey(formId: string): string {
  const parts = formId.split('_')
  return parts[1] ? parts[1].replace(/[0-9]+$/, '') : ''
}

/** 갈래별 스토리 텍스트 선택 */
function branchStory(
  map: Record<string, string>,
  fallback: string,
): (ctx: QuestContext) => string {
  return (ctx) => map[branchKey(ctx.pet.form)] ?? fallback
}

/** 퀘스트의 스토리를 현재 컨텍스트로 해석 */
export function resolveStory(q: Quest, ctx: QuestContext): string {
  return typeof q.story === 'function' ? q.story(ctx) : q.story
}

/** 단짝과의 이야기 — 순차 진행 스토리 퀘스트 */
export const QUESTS: Quest[] = [
  {
    id: 'q1',
    title: '제1화 · 첫 만남',
    goal: '펫을 한 번 돌봐주기',
    story:
      '책상 서랍 속, 작은 알이 톡 하고 깨어났어요. "이제부터 너의 단짝이 되어줄게."',
    reward: 10,
    check: ({ pet }) => pet.totalActions >= 1,
  },
  {
    id: 'q2',
    title: '제2화 · 친해지기',
    goal: '레벨 2 달성',
    story:
      '조금씩 마음을 여는 단짝. 함께 보낸 시간이 둘 사이를 가깝게 만들어요.',
    reward: 15,
    check: ({ level }) => level >= 2,
  },
  {
    id: 'q3',
    title: '제3화 · 아슬아슬',
    goal: '10번 돌봐주기',
    story:
      '상사의 발소리가 들릴 때마다 심장이 쿵! 그래도 단짝을 지키는 손길은 멈추지 않아요.',
    reward: 20,
    check: ({ pet }) => pet.totalActions >= 10,
  },
  {
    id: 'q4',
    title: '제4화 · 무럭무럭',
    goal: '레벨 4 달성',
    story: '어느새 훌쩍 자란 단짝. 사무실 한 켠이 둘만의 아지트가 되었어요.',
    reward: 30,
    check: ({ level }) => level >= 4,
  },
  {
    id: 'q5',
    title: '제5화 · 단짝의 증표',
    goal: '악세서리 착용하기',
    story: '작은 선물을 달아주자 단짝이 환하게 웃어요. 우리만의 특별한 표시!',
    reward: 35,
    check: ({ pet }) => pet.accessory !== null,
  },
  {
    id: 'q6',
    title: '제6화 · 영원한 단짝',
    goal: '레벨 8 달성',
    story:
      '오랜 시간을 함께한 둘. 이제는 말하지 않아도 통하는 진짜 단짝이 되었어요. 🎉',
    reward: 60,
    check: ({ level }) => level >= 8,
  },
]

/* ── 계통별 스토리 퀘스트 ───────────────────── */

const GATES = [2, 5, 8]
const REWARDS = [15, 25, 45]

/** 3챕터 계통 퀘스트 생성 (레벨 2/5/8 게이트) */
function lineQuest(
  lineId: string,
  chapters: {
    title: string
    goal: string
    story: string | ((ctx: QuestContext) => string)
  }[],
): Quest[] {
  return chapters.map((c, i) => ({
    id: `${lineId}_lq${i}`,
    title: c.title,
    goal: c.goal,
    story: c.story,
    reward: REWARDS[i],
    check: ({ level }) => level >= GATES[i],
  }))
}

const G = ['레벨 2 달성', '레벨 5 달성', '레벨 8 달성']

/** 계통(line id) → 스토리 퀘스트 체인. 3막은 진화 갈래에 따라 달라진다. */
export const LINE_QUESTS: Record<string, Quest[]> = {
  liz: lineQuest('liz', [
    { title: '도롱이의 모험 ①', goal: G[0], story: '작은 도마뱀이 사무실 화분 사이에서 첫 햇볕을 쬐어요.' },
    { title: '도롱이의 모험 ②', goal: G[1], story: '불꽃·물방울·바람의 기운 중 무엇에 끌릴까? 마음이 자라나요.' },
    { title: '도롱이의 모험 ③', goal: G[2], story: branchStory({
      fire: '활화산 같은 분노를 품은 화염룡! 마왕 염제룡으로 군림해요. 🔥',
      aqua: '깊은 바다의 지혜를 얻은 해룡! 자비로운 해신룡이 되었어요. 🌊',
      wind: '폭풍을 타고 나는 비룡! 하늘의 풍신룡으로 승천해요. 🌀',
    }, '전설의 용으로 가는 길!') },
  ]),
  fl: lineQuest('fl', [
    { title: '솜뭉치 일기 ①', goal: G[0], story: '복슬복슬 솜뭉치가 책상 위를 데굴데굴 굴러다녀요.' },
    { title: '솜뭉치 일기 ②', goal: G[1], story: '용맹한 야수가 될까, 포근한 천사가 될까?' },
    { title: '솜뭉치 일기 ③', goal: G[2], story: branchStory({
      beast: '백수의 왕으로 우뚝 섰어요! 포효 한 번에 사무실이 조용해져요. 🦁',
      holy: '날개를 활짝 편 대천사! 모두를 지키는 수호자가 되었어요. 😇',
    }, '한층 늠름해진 단짝!') },
  ]),
  sd: lineQuest('sd', [
    { title: '새싹의 노래 ①', goal: G[0], story: '작은 새싹이 모니터 빛을 받고 쑥 자라났어요.' },
    { title: '새싹의 노래 ②', goal: G[1], story: '울창한 나무가 될지, 위험한 독초가 될지 갈림길.' },
    { title: '새싹의 노래 ③', goal: G[2], story: branchStory({
      tree: '거대한 수호목이 되어 맑은 공기를 뿜어내요. 🌲',
      poison: '치명적인 역병군주로… 함부로 건드리면 안 돼요. ☠️',
    }, '사무실의 작은 숲이 되었어요.') },
  ]),
  rb: lineQuest('rb', [
    { title: '깡통의 기록 ①', goal: G[0], story: '버려진 부품들이 모여 삐걱삐걱 깡통이가 됐어요.' },
    { title: '깡통의 기록 ②', goal: G[1], story: '듬직한 로봇이 될까, 날카로운 사이보그가 될까.' },
    { title: '깡통의 기록 ③', goal: G[2], story: branchStory({
      mech: '강철의 심장을 가진 강철신! 든든한 수호 로봇이에요. 🛡️',
      cyborg: '모든 것을 부수는 파괴병기로 각성했어요. 🚀',
    }, '최강 병기 완성!') },
  ]),
  gh: lineQuest('gh', [
    { title: '도깨비불 전설 ①', goal: G[0], story: '깜깜한 탕비실에 작은 불꽃 영혼이 떠다녀요.' },
    { title: '도깨비불 전설 ②', goal: G[1], story: '빛의 천사로, 혹은 어둠의 악마로… 마음이 갈려요.' },
    { title: '도깨비불 전설 ③', goal: G[2], story: branchStory({
      angel: '창공신으로 승천! 사무실을 비추는 빛이 되었어요. 🕊️',
      demon: '마왕으로 타락… 어둠의 군주가 강림했어요. 👹',
    }, '신성한 힘이 깃들었어요!') },
  ]),
  dl: lineQuest('dl', [
    { title: '인형의 비밀 ①', goal: G[0], story: '낡은 헝겊인형에 살며시 생명이 깃들었어요.' },
    { title: '인형의 비밀 ②', goal: G[1], story: '신비한 꼭두각시, 혹은 용맹한 병정으로 자라나요.' },
    { title: '인형의 비밀 ③', goal: G[2], story: branchStory({
      puppet: '실을 다루는 인형술사가 되었어요. 신비롭죠. 🎭',
      knight: '빛나는 성기사로! 정의를 수호해요. 🛡️',
    }, '진짜 영웅의 풍모를 갖췄어요!') },
  ]),
  sl: lineQuest('sl', [
    { title: '말랑이 연구 ①', goal: G[0], story: '책상 위 정체불명의 젤리가 말랑말랑 움직여요.' },
    { title: '말랑이 연구 ②', goal: G[1], story: '온갖 것을 흡수하며 점점 신기한 모습으로 변해요.' },
    { title: '말랑이 연구 ③', goal: G[2], story: branchStory({
      chi: '온갖 것이 뒤섞인 혼돈체로! 예측 불가능해요. 🌀',
      rb: '눈부신 무지개신으로! 모두를 행복하게 해요. 🌈',
    }, '경이로운 존재가 되었어요!') },
  ]),
  bd: lineQuest('bd', [
    { title: '병아리 성장기 ①', goal: G[0], story: '삐약삐약 작은 병아리가 키보드 위를 종종거려요.' },
    { title: '병아리 성장기 ②', goal: G[1], story: '뜨거운 불새로, 차가운 서리새로 날개를 펴요.' },
    { title: '병아리 성장기 ③', goal: G[2], story: branchStory({
      fire: '불멸의 봉황으로 부활! 잿더미에서 다시 날아올라요. 🔥',
      ice: '우아한 설풍조로! 눈보라를 가르며 활공해요. 🦢',
    }, '하늘의 제왕이 되었어요!') },
  ]),
  aq: lineQuest('aq', [
    { title: '올챙이 일지 ①', goal: G[0], story: '머그컵 속에서 올챙이가 헤엄치고 있어요.' },
    { title: '올챙이 일지 ②', goal: G[1], story: '늠름한 개구리로, 사나운 물고기로 자라나요.' },
    { title: '올챙이 일지 ③', goal: G[2], story: branchStory({
      frog: '비를 부르는 우신이 되었어요. 가뭄 걱정 끝! 🌧️',
      fish: '심해를 지배하는 심해왕으로! 🐋',
    }, '깊은 물을 다스려요!') },
  ]),
  kn: lineQuest('kn', [
    { title: '견습생의 길 ①', goal: G[0], story: '용기 있는 견습생이 사무실 모험을 떠나요.' },
    { title: '견습생의 길 ②', goal: G[1], story: '검의 길과 마법의 길, 어느 쪽을 택할까?' },
    { title: '견습생의 길 ③', goal: G[2], story: branchStory({
      war: '빛의 검을 든 성검사로! 정의의 화신이에요. 🗡️',
      mage: '만물의 이치를 깨친 대현자로! 🔮',
    }, '전설로 남을 영웅이 되었어요!') },
  ]),
  dr: lineQuest('dr', [
    { title: '새끼용 연대기 ①', goal: G[0], story: '알에서 갓 깨어난 새끼용이 호기심에 가득 찼어요.' },
    { title: '새끼용 연대기 ②', goal: G[1], story: '화염의 길과 빙결의 길, 운명이 갈려요.' },
    { title: '새끼용 연대기 ③', goal: G[2], story: branchStory({
      fire: '세상을 태우는 종말룡으로! 두려움의 상징이에요. 🌋',
      ice: '만년설의 빙하룡으로! 시간을 얼려버려요. 🧊',
    }, '하늘을 뒤덮는 전설의 용으로!') },
  ]),
  un: lineQuest('un', [
    { title: '한밤의 괴담 ①', goal: G[0], story: '야근 중인 사무실, 작은 미라가 꼬물꼬물 깨어났어요.' },
    { title: '한밤의 괴담 ②', goal: G[1], story: '느릿한 좀비로, 매혹의 뱀파이어로 변해가요.' },
    { title: '한밤의 괴담 ③', goal: G[2], story: branchStory({
      zombie: '죽음을 다루는 리치로! 언데드 군단을 거느려요. ☠️',
      vamp: '밤의 진조로! 우아하고 치명적이에요. 🩸',
    }, '밤을 지배하는 군주가 되었어요!') },
  ]),
  mt: lineQuest('mt', [
    { title: '광석의 노래 ①', goal: G[0], story: '굴러다니던 돌멩이가 반짝 빛을 내기 시작했어요.' },
    { title: '광석의 노래 ②', goal: G[1], story: '영롱한 보석으로, 단단한 골렘으로 자라나요.' },
    { title: '광석의 노래 ③', goal: G[2], story: branchStory({
      gem: '빛을 굴절시키는 프리즘신으로! 영롱해요. 🔆',
      golem: '대지를 떠받치는 대지신으로! 🌍',
    }, '위엄을 갖췄어요!') },
  ]),
  st: lineQuest('st', [
    { title: '별똥별 이야기 ①', goal: G[0], story: '창밖에서 떨어진 작은 별똥별이 단짝이 됐어요.' },
    { title: '별똥별 이야기 ②', goal: G[1], story: '찬란한 별빛으로, 혹은 깊은 어둠으로 빛나요.' },
    { title: '별똥별 이야기 ③', goal: G[2], story: branchStory({
      star: '밤하늘의 성좌신으로! 길 잃은 이를 인도해요. 🌟',
      dark: '모든 걸 삼키는 공허신으로… 🌌',
    }, '우주를 품은 존재로 거듭났어요!') },
  ]),
  bg: lineQuest('bg', [
    { title: '애벌레의 꿈 ①', goal: G[0], story: '꼬물꼬물 애벌레가 잎사귀를 갉아먹어요.' },
    { title: '애벌레의 꿈 ②', goal: G[1], story: '아름다운 나비로, 강인한 딱정벌레로 변태해요.' },
    { title: '애벌레의 꿈 ③', goal: G[2], story: branchStory({
      fly: '꽃의 여왕으로! 우아하게 날갯짓해요. 🌸',
      beetle: '단단한 갑충왕으로! 누구도 못 뚫어요. 👑',
    }, '곤충의 정점에 섰어요!') },
  ]),
  fd: lineQuest('fd', [
    { title: '맛있는 모험 ①', goal: G[0], story: '말랑한 반죽이 오븐 향기에 부풀어 올라요.' },
    { title: '맛있는 모험 ②', goal: G[1], story: '달콤한 디저트로, 매콤한 불맛으로 익어가요.' },
    { title: '맛있는 모험 ③', goal: G[2], story: branchStory({
      sweet: '모두를 행복하게 하는 슈가신으로! 🍭',
      spicy: '혀를 마비시키는 매운맛군주로! 👹',
    }, '전설의 맛이 완성됐어요!') },
  ]),
  // 합성체 전용 스토리
  fuse: lineQuest('fuse', [
    { title: '합성의 비밀 ①', goal: G[0], story: '두 영혼이 하나로… 합성체의 심장이 두근거려요.' },
    { title: '합성의 비밀 ②', goal: G[1], story: '몸 안에서 두 힘이 부딪쳐요. 제어할 수 있을까?' },
    { title: '합성의 비밀 ③', goal: G[2], story: branchStory({
      light: '성광합성체 — 빛의 수호자로 완전히 각성했어요! 🌟',
      dark: '암흑합성체 — 어둠의 군주로 군림해요! 🌑',
      steel: '강철합성체 — 불멸의 강철 요새가 되었어요! 🛡️',
      chaos: '혼돈합성체 — 그 누구도 예측 못 할 존재로! 🌀',
    }, '합성체의 진가가 드러났어요!') },
  ]),
}

export function lineQuestsFor(lineId: string): Quest[] {
  return LINE_QUESTS[lineId] ?? []
}
