// 진화 트리 + 분류 체계 (레벨 × 타입 × 원소 속성, 분기 진화)

/** 6대 디자인 타입(대분류) */
export type Family =
  | '생물형'
  | '인간형'
  | '기계형'
  | '신성·악마형'
  | '사물·인공물형'
  | '혼합·이형형'

export const FAMILIES: Family[] = [
  '생물형',
  '인간형',
  '기계형',
  '신성·악마형',
  '사물·인공물형',
  '혼합·이형형',
]

/** 진화 단계명 (tier 0=유년기 … 5=초월체) */
export const TIER_NAMES = ['유년기', '성장기', '성숙기', '완전체', '궁극체', '초월체']
export function tierName(tier: number): string {
  return TIER_NAMES[tier] ?? '성장기'
}

/** 하나의 형태 (진화 트리의 노드) */
export interface Form {
  id: string
  name: string
  /** 진화 단계 0~4 */
  tier: number
  /** 소속 계통(트리) 루트 id */
  line: string
  family: Family
  /** 세부 타입 (파충류형, 천사형 등) */
  type: string
  emoji: string
  aura: string
  tint?: string
  /** 진화 가능한 다음 형태 id들 (분기) */
  next: string[]
  /** 진화 조건 */
  requires?:
    | 'evostone'
    | 'allHigh'
    | 'statHunger'
    | 'statMood'
    | 'statClean'
    | 'statEnergy'
    // 게임 시계 조건 (특정 시간대·계절에만 진화)
    | 'night'
    | 'day'
    | 'seasonSpring'
    | 'seasonSummer'
    | 'seasonAutumn'
    | 'seasonWinter'
    // 행동 누적 조건 (evolution-conditions.ts 키 참조)
    | `cond:${string}`
  /** 히든(각성 전용) 형태 */
  hidden?: boolean
  /** 히든 형태의 짧은 설화 */
  lore?: string
}

/** 공용 유년기: 기존 진화 티어와 분리된 초기 생명체 풀 */
export interface BabyForm {
  id: string
  name: string
  family: Family
  emoji: string
  aura: string
  /** 유년기에서 분화 가능한 기존 성장기(line root) id 목록 */
  starters: string[]
  /** 아트 제작용 핵심 실루엣 */
  motif: string
}

export const BABY_FORMS: BabyForm[] = [
  {
    id: 'baby_sprout_blob',
    name: '푸루',
    family: '생물형',
    emoji: '🌱',
    aura: '#84cc16',
    starters: ['liz', 'sd', 'deer', 'wom', 'quo'],
    motif: '둥근 초록 젤리 몸, 작은 새싹, 큰 눈',
  },
  {
    id: 'baby_leaf_pip',
    name: '리바',
    family: '생물형',
    emoji: '🍃',
    aura: '#22c55e',
    starters: ['fl', 'dog', 'cat', 'rab', 'cap'],
    motif: '콩알 몸, 잎 귀, 짧은 꼬리',
  },
  {
    id: 'baby_moss_mochi',
    name: '모스카',
    family: '생물형',
    emoji: '🌿',
    aura: '#65a30d',
    starters: ['bear', 'red', 'hog', 'bas', 'cnt'],
    motif: '말랑한 떡 몸, 이끼 점무늬, 조그만 발',
  },
  {
    id: 'baby_dew_drop',
    name: '듀린',
    family: '생물형',
    emoji: '💧',
    aura: '#38bdf8',
    starters: ['aq', 'ott', 'axo', 'shm', 'man'],
    motif: '물방울 몸, 투명한 볼, 꼬마 지느러미',
  },
  {
    id: 'baby_bubble_pip',
    name: '부보',
    family: '생물형',
    emoji: '🫧',
    aura: '#67e8f9',
    starters: ['tur', 'pen', 'orc', 'wsh', 'mola'],
    motif: '둥근 거품 몸, 작은 꼬리 지느러미, 반짝 눈',
  },
  {
    id: 'baby_shell_drop',
    name: '쉘라',
    family: '사물·인공물형',
    emoji: '🐚',
    aura: '#0ea5e9',
    starters: ['krk', 'mer', 'hyd', 'spn'],
    motif: '조개껍질 모자, 물방울 몸, 진주 포인트',
  },
  {
    id: 'baby_ember_pip',
    name: '엠비',
    family: '생물형',
    emoji: '🔥',
    aura: '#fb923c',
    starters: ['bd', 'fox', 'phx', 'gmh'],
    motif: '주황 콩알 몸, 작은 불꽃 머리, 따뜻한 볼',
  },
  {
    id: 'baby_candle_blob',
    name: '루칸',
    family: '사물·인공물형',
    emoji: '🕯️',
    aura: '#f97316',
    starters: ['fd', 'hat', 'lad', 'wpk'],
    motif: '촛농처럼 둥근 몸, 짧은 심지 불꽃',
  },
  {
    id: 'baby_warm_coal',
    name: '코르',
    family: '혼합·이형형',
    emoji: '🟠',
    aura: '#dc2626',
    starters: ['dr', 'wyv', 'gol', 'min'],
    motif: '검은 숯방울 몸, 빨간 균열, 작은 불씨 눈',
  },
  {
    id: 'baby_breeze_puff',
    name: '브리오',
    family: '생물형',
    emoji: '💨',
    aura: '#5eead4',
    starters: ['bg', 'dfl', 'grf'],
    motif: '솜털 몸, 휘어진 바람꼬리, 가벼운 표정',
  },
  {
    id: 'baby_feather_pip',
    name: '페로',
    family: '생물형',
    emoji: '🪶',
    aura: '#2dd4bf',
    starters: ['prt', 'hpy', 'peg'],
    motif: '작은 새알 몸, 깃털 귀, 점 같은 날개',
  },
  {
    id: 'baby_cloud_blob',
    name: '누보',
    family: '신성·악마형',
    emoji: '☁️',
    aura: '#a7f3d0',
    starters: ['cha', 'fai'],
    motif: '구름처럼 둥근 몸, 작은 바람 고리',
  },
  {
    id: 'baby_pebble_core',
    name: '페블',
    family: '사물·인공물형',
    emoji: '🪨',
    aura: '#a16207',
    starters: ['mt', 'bear', 'tur', 'gol'],
    motif: '조약돌 몸, 둥근 코어 눈, 짧은 돌발',
  },
  {
    id: 'baby_gear_pip',
    name: '기론',
    family: '기계형',
    emoji: '⚙️',
    aura: '#94a3b8',
    starters: ['rb', 'hog', 'wpk'],
    motif: '작은 금속 코어, 톱니 귀, 주황 렌즈 눈',
  },
  {
    id: 'baby_metal_mochi',
    name: '메토',
    family: '기계형',
    emoji: '🔩',
    aura: '#64748b',
    starters: ['kn', 'dl', 'min', 'cnt'],
    motif: '말랑한 금속 몸, 나사 점, 둥근 헬멧',
  },
  {
    id: 'baby_spark_pip',
    name: '스텔',
    family: '신성·악마형',
    emoji: '✨',
    aura: '#fcd34d',
    starters: ['st', 'quo', 'mola', 'prt'],
    motif: '작은 별콩 몸, 반짝 꼬리, 빛나는 눈',
  },
  {
    id: 'baby_halo_blob',
    name: '헤일',
    family: '신성·악마형',
    emoji: '😇',
    aura: '#fde68a',
    starters: ['gh', 'fl', 'peg', 'grf'],
    motif: '하얀 말랑 몸, 작은 후광, 몽글 날개싹',
  },
  {
    id: 'baby_moon_pip',
    name: '루나',
    family: '신성·악마형',
    emoji: '🌙',
    aura: '#fef3c7',
    starters: ['rab', 'fox', 'fai', 'mer'],
    motif: '달조각 귀, 크림색 몸, 조용한 눈',
  },
  {
    id: 'baby_shade_blob',
    name: '셰도',
    family: '신성·악마형',
    emoji: '🌑',
    aura: '#7c3aed',
    starters: ['un', 'gh', 'cat', 'orc'],
    motif: '검보라 젤리 몸, 흐릿한 꼬리, 노란 눈',
  },
  {
    id: 'baby_horn_pip',
    name: '호른',
    family: '신성·악마형',
    emoji: '😈',
    aura: '#a78bfa',
    starters: ['cer', 'bas', 'gmh', 'krk'],
    motif: '둥근 몸, 작은 뿔 두 개, 장난스런 눈',
  },
  {
    id: 'baby_spook_drop',
    name: '스푸',
    family: '신성·악마형',
    emoji: '👻',
    aura: '#818cf8',
    starters: ['gh', 'un', 'hpy'],
    motif: '흰 유령방울 몸, 작은 꼬리연기, 까만 눈',
  },
  {
    id: 'baby_sweet_mochi',
    name: '슈가',
    family: '사물·인공물형',
    emoji: '🍡',
    aura: '#f9a8d4',
    starters: ['fd', 'hat'],
    motif: '찹쌀떡 몸, 작은 토핑, 동그란 볼',
  },
  {
    id: 'baby_button_dollop',
    name: '버튼',
    family: '사물·인공물형',
    emoji: '🧸',
    aura: '#d6a77a',
    starters: ['dl', 'kn'],
    motif: '천조각 몸, 단추 눈, 실밥 꼬리',
  },
  {
    id: 'baby_prism_pip',
    name: '프리즘',
    family: '혼합·이형형',
    emoji: '🌈',
    aura: '#f0abfc',
    starters: ['sl', 'cha', 'fai'],
    motif: '투명한 콩알 몸, 무지개 코어, 작은 반짝임',
  },
  {
    id: 'baby_bug_grub',
    name: '버그리',
    family: '생물형',
    emoji: '🐛',
    aura: '#a3e635',
    starters: ['mts', 'stb', 'bee', 'sco', 'ffl'],
    motif: '연둣빛 분절 세포 덩어리, 더듬이 싹, 곤충 계열의 작은 힌트',
  },
  {
    id: 'baby_raptor_chick',
    name: '매초',
    family: '생물형',
    emoji: '🐣',
    aura: '#7dd3fc',
    starters: ['owl', 'eag', 'pea', 'flc'],
    motif: '하얀 솜털 세포, 귀깃 싹과 작은 부리 점, 조류 계열의 작은 힌트',
  },
  {
    id: 'baby_longleg_plume',
    name: '룽피',
    family: '생물형',
    emoji: '🪶',
    aura: '#67e8f9',
    starters: ['fla', 'ost', 'crn'],
    motif: '하늘색 물방울 세포, 깃털 싹과 실 같은 발 점, 장각 조류의 작은 힌트',
  },
  {
    id: 'baby_dino_horn',
    name: '다이노',
    family: '생물형',
    emoji: '🦖',
    aura: '#f59e0b',
    starters: ['trx', 'rap', 'tri', 'stg', 'cro'],
    motif: '알껍질 캡슐 몸, 작은 뿔 싹과 이빨 점, 공룡 계열의 작은 힌트',
  },
  {
    id: 'baby_dino_gentle',
    name: '브라비',
    family: '생물형',
    emoji: '🦕',
    aura: '#a8a29e',
    starters: ['bra', 'pte', 'mos', 'snk'],
    motif: '고대 물방울 세포, 지느러미 싹과 나선 무늬, 고룡 계열의 작은 힌트',
  },
  {
    id: 'baby_deepsea_blob',
    name: '부블',
    family: '생물형',
    emoji: '🫧',
    aura: '#38bdf8',
    starters: ['oct', 'jly', 'puf', 'dol', 'meg'],
    motif: '푸른 거품 젤리 세포, 방울 돌기와 짧은 촉수 싹, 심해 계열의 작은 힌트',
  },
  {
    id: 'baby_canine_pup',
    name: '늑푸',
    family: '생물형',
    emoji: '🐺',
    aura: '#84cc16',
    starters: ['wlf', 'wlv', 'fen', 'lyn'],
    motif: '회녹색 털씨앗 세포, 귀 싹과 꼬리 솜 점, 견족 계열의 작은 힌트',
  },
  {
    id: 'baby_bigcat_cub',
    name: '냥라',
    family: '생물형',
    emoji: '🐾',
    aura: '#fbbf24',
    starters: ['fl', 'jag', 'sbr', 'hyn', 'leo'],
    motif: '황금 점박이 젤리 세포, 송곳니 점과 둥근 발 싹, 대형 야수의 작은 힌트',
  },
  {
    id: 'baby_tusk_tot',
    name: '텅코',
    family: '생물형',
    emoji: '🐘',
    aura: '#a8a29e',
    starters: ['ele', 'rhi', 'hip', 'mam'],
    motif: '회색 조약돌 알세포, 엄니 싹과 무거운 타원 실루엣, 대형 초식 계열의 작은 힌트',
  },
  {
    id: 'baby_tall_calf',
    name: '롱카',
    family: '생물형',
    emoji: '🦒',
    aura: '#a3e635',
    starters: ['gir', 'cam', 'kan'],
    motif: '배 모양 초록 세포, 작은 뿔 점과 씨앗 무늬, 장신 초식 계열의 작은 힌트',
  },
  {
    id: 'baby_rodent_fuzz',
    name: '뽀찌',
    family: '생물형',
    emoji: '🐹',
    aura: '#fcd34d',
    starters: ['ham', 'sqr', 'chl', 'mee'],
    motif: '노란 볼주머니 세포, 견과 코어와 작은 손 싹, 설치류 계열의 작은 힌트',
  },
  {
    id: 'baby_armor_curl',
    name: '아뭉',
    family: '생물형',
    emoji: '🛡️',
    aura: '#94a3b8',
    starters: ['arm', 'pang', 'bvr', 'chs'],
    motif: '둥글게 말린 껍질 세포, 비늘판 틈 사이 얼굴, 방어형 계열의 작은 힌트',
  },
  {
    id: 'baby_ape_tot',
    name: '우키',
    family: '생물형',
    emoji: '🐒',
    aura: '#a16207',
    starters: ['gor', 'mon', 'slo', 'plt'],
    motif: '갈색 털씨앗 세포, 긴 팔 싹과 배 점, 영장류 계열의 작은 힌트',
  },
]

type Def = Omit<Form, 'line'>
function line(lineId: string, defs: Def[]): Form[] {
  return defs.map((d) => ({ ...d, line: lineId }))
}

export const FORMS: Form[] = [
  // 계통 1: 도마뱀 (불/물/바람 3갈래 + 특수 합체)
  ...line('liz', [
    { id: 'liz', name: '리자', tier: 0, family: '생물형', type: '파충류형', emoji: '🦎', aura: '#84cc16', next: ['liz_fire1', 'liz_aqua1', 'liz_wind1'] },
    { id: 'liz_fire1', name: '라비', tier: 1, family: '생물형', type: '파충류형', emoji: '🦎', aura: '#fb923c', tint: 'rgba(251,146,60,0.12)', next: ['liz_fire2'], requires: 'statMood' },
    { id: 'liz_fire2', name: '블레오', tier: 2, family: '생물형', type: '용형', emoji: '🐉', aura: '#f97316', tint: 'rgba(249,115,22,0.16)', next: ['liz_fire3', 'liz_chaos3'] },
    { id: 'liz_fire3', name: '아그니', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '🔥', aura: '#ef4444', tint: 'rgba(239,68,68,0.18)', next: [] },
    { id: 'liz_aqua1', name: '루아', tier: 1, family: '생물형', type: '수생형', emoji: '🦎', aura: '#22d3ee', tint: 'rgba(34,211,238,0.12)', next: ['liz_aqua2'], requires: 'statClean' },
    { id: 'liz_aqua2', name: '네라', tier: 2, family: '생물형', type: '수생형', emoji: '🌊', aura: '#38bdf8', tint: 'rgba(56,189,248,0.16)', next: ['liz_aqua3'] },
    { id: 'liz_aqua3', name: '세이렌', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🐉', aura: '#0ea5e9', tint: 'rgba(14,165,233,0.18)', next: [] },
    { id: 'liz_wind1', name: '피오', tier: 1, family: '생물형', type: '파충류형', emoji: '🦎', aura: '#5eead4', tint: 'rgba(94,234,212,0.12)', next: ['liz_wind2'] },
    { id: 'liz_wind2', name: '실피', tier: 2, family: '생물형', type: '용형', emoji: '🐲', aura: '#2dd4bf', tint: 'rgba(45,212,191,0.16)', next: ['liz_wind3', 'liz_chaos3'] },
    { id: 'liz_wind3', name: '아이로', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌀', aura: '#14b8a6', tint: 'rgba(20,184,166,0.18)', next: [] },
    { id: 'liz_chaos3', name: '카오라', tier: 3, family: '혼합·이형형', type: '키메라형', emoji: '🦖', aura: '#f0abfc', tint: 'rgba(240,171,252,0.2)', next: [], requires: 'evostone' },
  ]),

  // 계통 2: 솜뭉치 (야수/천사)
  ...line('fl', [
    { id: 'fl', name: '모케', tier: 0, family: '생물형', type: '포유류형', emoji: '🐾', aura: '#f9a8d4', next: ['fl_beast1', 'fl_holy1'] },
    { id: 'fl_beast1', name: '이코', tier: 1, family: '생물형', type: '야수형', emoji: '🐺', aura: '#a16207', next: ['fl_beast2'] },
    { id: 'fl_beast2', name: '가페노', tier: 2, family: '생물형', type: '야수형', emoji: '🦁', aura: '#f59e0b', tint: 'rgba(245,158,11,0.14)', next: ['fl_beast3', 'fl_beast_god'] },
    { id: 'fl_beast3', name: '포하키', tier: 3, family: '생물형', type: '야수형', emoji: '👑', aura: '#fbbf24', tint: 'rgba(251,191,36,0.18)', next: [] },
    { id: 'fl_beast_god', name: '데라루', tier: 3, family: '혼합·이형형', type: '환수형', emoji: '🦄', aura: '#fcd34d', tint: 'rgba(252,211,77,0.2)', next: [], requires: 'allHigh' },
    { id: 'fl_holy1', name: '피메', tier: 1, family: '신성·악마형', type: '천사형', emoji: '🪽', aura: '#fde68a', next: ['fl_holy2'] },
    { id: 'fl_holy2', name: '키가케', tier: 2, family: '신성·악마형', type: '천사형', emoji: '👼', aura: '#fef3c7', tint: 'rgba(253,230,138,0.16)', next: ['fl_holy3'] },
    { id: 'fl_holy3', name: '케두다', tier: 3, family: '신성·악마형', type: '천사형', emoji: '😇', aura: '#fcd34d', tint: 'rgba(252,211,77,0.2)', next: [] },
  ]),

  // 계통 3: 씨앗 (나무/독)
  ...line('sd', [
    { id: 'sd', name: '누사', tier: 0, family: '생물형', type: '식물형', emoji: '🌱', aura: '#84cc16', next: ['sd_tree1', 'sd_poison1'] },
    { id: 'sd_tree1', name: '유티', tier: 1, family: '생물형', type: '식물형', emoji: '🍃', aura: '#4ade80', next: ['sd_tree2'] },
    { id: 'sd_tree2', name: '오무유', tier: 2, family: '생물형', type: '식물형', emoji: '🌳', aura: '#22c55e', tint: 'rgba(34,197,94,0.14)', next: ['sd_tree3'] },
    { id: 'sd_tree3', name: '유카디', tier: 3, family: '신성·악마형', type: '성수형', emoji: '🌲', aura: '#16a34a', tint: 'rgba(22,163,74,0.18)', next: [] },
    { id: 'sd_poison1', name: '두네', tier: 1, family: '생물형', type: '식물형', emoji: '🌺', aura: '#e879f9', next: ['sd_poison2'] },
    { id: 'sd_poison2', name: '네두타', tier: 2, family: '생물형', type: '식물형', emoji: '☘️', aura: '#a3e635', tint: 'rgba(163,230,53,0.16)', next: ['sd_poison3'] },
    { id: 'sd_poison3', name: '쿠히파', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '☠️', aura: '#65a30d', tint: 'rgba(101,163,13,0.18)', next: [] },
  ]),

  // 계통 4: 깡통 (로봇/사이보그) — 레어 시작
  ...line('rb', [
    { id: 'rb', name: '루피', tier: 0, family: '기계형', type: '로봇형', emoji: '🤖', aura: '#94a3b8', next: ['rb_mech1', 'rb_cyborg1'] },
    { id: 'rb_mech1', name: '게다', tier: 1, family: '기계형', type: '로봇형', emoji: '⚙️', aura: '#cbd5e1', next: ['rb_mech2'] },
    { id: 'rb_mech2', name: '유루디', tier: 2, family: '기계형', type: '거대로봇형', emoji: '🦾', aura: '#64748b', tint: 'rgba(100,116,139,0.16)', next: ['rb_mech3'] },
    { id: 'rb_mech3', name: '게파니', tier: 3, family: '기계형', type: '순수기계형', emoji: '🛡️', aura: '#e2e8f0', tint: 'rgba(226,232,240,0.18)', next: [] },
    { id: 'rb_cyborg1', name: '메구', tier: 1, family: '기계형', type: '사이보그형', emoji: '🦿', aura: '#fb7185', next: ['rb_cyborg2'] },
    { id: 'rb_cyborg2', name: '쿠네파', tier: 2, family: '기계형', type: '병기형', emoji: '💢', aura: '#f43f5e', tint: 'rgba(244,63,94,0.16)', next: ['rb_cyborg3'] },
    { id: 'rb_cyborg3', name: '모네히', tier: 3, family: '기계형', type: '병기형', emoji: '🚀', aura: '#e11d48', tint: 'rgba(225,29,72,0.18)', next: [] },
  ]),

  // 계통 5: 도깨비불 (천사/악마) — 에픽 시작
  ...line('gh', [
    { id: 'gh', name: '메노', tier: 0, family: '신성·악마형', type: '정령형', emoji: '👻', aura: '#818cf8', tint: 'rgba(129,140,248,0.14)', next: ['gh_angel1', 'gh_demon1'] },
    { id: 'gh_angel1', name: '부세', tier: 1, family: '신성·악마형', type: '천사형', emoji: '✨', aura: '#fde68a', next: ['gh_angel2'] },
    { id: 'gh_angel2', name: '로시투', tier: 2, family: '신성·악마형', type: '천사형', emoji: '👼', aura: '#fef3c7', tint: 'rgba(253,230,138,0.16)', next: ['gh_angel3'] },
    { id: 'gh_angel3', name: '루바루', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🕊️', aura: '#fcd34d', tint: 'rgba(252,211,77,0.2)', next: [] },
    { id: 'gh_demon1', name: '테코', tier: 1, family: '신성·악마형', type: '악마형', emoji: '😈', aura: '#a78bfa', next: ['gh_demon2'] },
    { id: 'gh_demon2', name: '키주케', tier: 2, family: '신성·악마형', type: '타천사형', emoji: '🦇', aura: '#7c3aed', tint: 'rgba(124,58,237,0.16)', next: ['gh_demon3'] },
    { id: 'gh_demon3', name: '자후테', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '👹', aura: '#6d28d9', tint: 'rgba(109,40,217,0.2)', next: [] },
  ]),

  // 계통 6: 인형 (꼭두각시/기사) — 레어 시작
  ...line('dl', [
    { id: 'dl', name: '페푸', tier: 0, family: '사물·인공물형', type: '인형형', emoji: '🧸', aura: '#d6a77a', next: ['dl_puppet1', 'dl_knight1'] },
    { id: 'dl_puppet1', name: '메시', tier: 1, family: '사물·인공물형', type: '인형형', emoji: '🎎', aura: '#c084fc', next: ['dl_puppet2'] },
    { id: 'dl_puppet2', name: '기헤아', tier: 2, family: '사물·인공물형', type: '인형형', emoji: '🪅', aura: '#a855f7', tint: 'rgba(168,85,247,0.16)', next: ['dl_puppet3'] },
    { id: 'dl_puppet3', name: '하조베', tier: 3, family: '인간형', type: '마법사형', emoji: '🎭', aura: '#9333ea', tint: 'rgba(147,51,234,0.18)', next: [] },
    { id: 'dl_knight1', name: '로이', tier: 1, family: '사물·인공물형', type: '인형형', emoji: '🪖', aura: '#a16207', next: ['dl_knight2'] },
    { id: 'dl_knight2', name: '유노디', tier: 2, family: '인간형', type: '기사형', emoji: '⚔️', aura: '#94a3b8', tint: 'rgba(148,163,184,0.16)', next: ['dl_knight3'] },
    { id: 'dl_knight3', name: '게루니', tier: 3, family: '인간형', type: '기사형', emoji: '🛡️', aura: '#fcd34d', tint: 'rgba(252,211,77,0.18)', next: [] },
  ]),

  // 계통 7: 말랑이 (키메라/무지개)
  ...line('sl', [
    { id: 'sl', name: '바메', tier: 0, family: '생물형', type: '슬라임형', emoji: '🫧', aura: '#4ade80', next: ['sl_chi1', 'sl_rb1'] },
    { id: 'sl_chi1', name: '타포', tier: 1, family: '혼합·이형형', type: '합성형', emoji: '🟣', aura: '#c084fc', next: ['sl_chi2'] },
    { id: 'sl_chi2', name: '아제조', tier: 2, family: '혼합·이형형', type: '키메라형', emoji: '🧬', aura: '#a855f7', tint: 'rgba(168,85,247,0.16)', next: ['sl_chi3'] },
    { id: 'sl_chi3', name: '리보바', tier: 3, family: '혼합·이형형', type: '돌연변이형', emoji: '🌀', aura: '#7c3aed', tint: 'rgba(124,58,237,0.18)', next: [] },
    { id: 'sl_rb1', name: '케파', tier: 1, family: '혼합·이형형', type: '이형형', emoji: '🌈', aura: '#f0abfc', next: ['sl_rb2'] },
    { id: 'sl_rb2', name: '유메디', tier: 2, family: '혼합·이형형', type: '이형형', emoji: '💠', aura: '#67e8f9', tint: 'rgba(103,232,249,0.16)', next: ['sl_rb3'] },
    { id: 'sl_rb3', name: '네티타', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌈', aura: '#f0abfc', tint: 'rgba(240,171,252,0.2)', next: [] },
  ]),

  // 계통 8: 병아리 (불새/서리새)
  ...line('bd', [
    { id: 'bd', name: '후조', tier: 0, family: '생물형', type: '조류형', emoji: '🐤', aura: '#facc15', next: ['bd_fire1', 'bd_ice1'] },
    { id: 'bd_fire1', name: '리파', tier: 1, family: '생물형', type: '조류형', emoji: '🔥', aura: '#fb923c', next: ['bd_fire2'] },
    { id: 'bd_fire2', name: '메유하', tier: 2, family: '생물형', type: '조류형', emoji: '🦃', aura: '#f97316', tint: 'rgba(249,115,22,0.16)', next: ['bd_fire3'] },
    { id: 'bd_fire3', name: '조미부', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🔥', aura: '#fb7185', tint: 'rgba(251,113,133,0.2)', next: [] },
    { id: 'bd_ice1', name: '기토', tier: 1, family: '생물형', type: '조류형', emoji: '❄️', aura: '#67e8f9', next: ['bd_ice2'] },
    { id: 'bd_ice2', name: '에모쿠', tier: 2, family: '생물형', type: '조류형', emoji: '🕊️', aura: '#38bdf8', tint: 'rgba(56,189,248,0.16)', next: ['bd_ice3'] },
    { id: 'bd_ice3', name: '부게호', tier: 3, family: '생물형', type: '조류형', emoji: '🦢', aura: '#0ea5e9', tint: 'rgba(14,165,233,0.18)', next: [] },
  ]),

  // 계통 9: 올챙이 (개구리/물고기)
  ...line('aq', [
    { id: 'aq', name: '라코', tier: 0, family: '생물형', type: '수생형', emoji: '🐸', aura: '#4ade80', next: ['aq_frog1', 'aq_fish1'] },
    { id: 'aq_frog1', name: '투카', tier: 1, family: '생물형', type: '양서류형', emoji: '🐸', aura: '#22c55e', next: ['aq_frog2'] },
    { id: 'aq_frog2', name: '페무포', tier: 2, family: '생물형', type: '양서류형', emoji: '🐸', aura: '#16a34a', tint: 'rgba(22,163,74,0.16)', next: ['aq_frog3'] },
    { id: 'aq_frog3', name: '미게카', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌧️', aura: '#15803d', tint: 'rgba(21,128,61,0.18)', next: [] },
    { id: 'aq_fish1', name: '네포', tier: 1, family: '생물형', type: '수생형', emoji: '🐟', aura: '#38bdf8', next: ['aq_fish2'] },
    { id: 'aq_fish2', name: '게카니', tier: 2, family: '생물형', type: '수생형', emoji: '🦈', aura: '#0ea5e9', tint: 'rgba(14,165,233,0.16)', next: ['aq_fish3'] },
    { id: 'aq_fish3', name: '다오헤', tier: 3, family: '생물형', type: '수생형', emoji: '🐋', aura: '#0369a1', tint: 'rgba(3,105,161,0.2)', next: [] },
  ]),

  // 계통 10: 애벌레 (나비/딱정벌레)
  ...line('bg', [
    { id: 'bg', name: '티테', tier: 0, family: '생물형', type: '곤충형', emoji: '🐛', aura: '#a3e635', next: ['bg_fly1', 'bg_beetle1'] },
    { id: 'bg_fly1', name: '피쿠', tier: 1, family: '생물형', type: '곤충형', emoji: '🦋', aura: '#67e8f9', next: ['bg_fly2'] },
    { id: 'bg_fly2', name: '고쿠세', tier: 2, family: '생물형', type: '곤충형', emoji: '🦋', aura: '#f0abfc', tint: 'rgba(240,171,252,0.16)', next: ['bg_fly3'] },
    { id: 'bg_fly3', name: '보이마', tier: 3, family: '신성·악마형', type: '천사형', emoji: '🌸', aura: '#ec4899', tint: 'rgba(236,72,153,0.18)', next: [] },
    { id: 'bg_beetle1', name: '소데', tier: 1, family: '생물형', type: '곤충형', emoji: '🪲', aura: '#a16207', next: ['bg_beetle2'] },
    { id: 'bg_beetle2', name: '주제시', tier: 2, family: '생물형', type: '곤충형', emoji: '🐞', aura: '#92400e', tint: 'rgba(146,64,14,0.16)', next: ['bg_beetle3'] },
    { id: 'bg_beetle3', name: '보리마', tier: 3, family: '생물형', type: '곤충형', emoji: '👑', aura: '#78350f', tint: 'rgba(120,53,15,0.18)', next: [] },
  ]),

  // 계통 11: 반죽이 (디저트/매운맛)
  ...line('fd', [
    { id: 'fd', name: '쿠제', tier: 0, family: '사물·인공물형', type: '음식형', emoji: '🍡', aura: '#fde68a', next: ['fd_sweet1', 'fd_spicy1'] },
    { id: 'fd_sweet1', name: '무노', tier: 1, family: '사물·인공물형', type: '음식형', emoji: '🧁', aura: '#f9a8d4', next: ['fd_sweet2'] },
    { id: 'fd_sweet2', name: '기보아', tier: 2, family: '사물·인공물형', type: '음식형', emoji: '🍰', aura: '#f472b6', tint: 'rgba(244,114,182,0.16)', next: ['fd_sweet3'] },
    { id: 'fd_sweet3', name: '레비도', tier: 3, family: '사물·인공물형', type: '음식형', emoji: '🍭', aura: '#ec4899', tint: 'rgba(236,72,153,0.18)', next: [] },
    { id: 'fd_spicy1', name: '키노', tier: 1, family: '사물·인공물형', type: '음식형', emoji: '🌶️', aura: '#ef4444', next: ['fd_spicy2'] },
    { id: 'fd_spicy2', name: '미데카', tier: 2, family: '사물·인공물형', type: '음식형', emoji: '🔥', aura: '#dc2626', tint: 'rgba(220,38,38,0.16)', next: ['fd_spicy3'] },
    { id: 'fd_spicy3', name: '페니포', tier: 3, family: '사물·인공물형', type: '음식형', emoji: '👹', aura: '#b91c1c', tint: 'rgba(185,28,28,0.18)', next: [] },
  ]),

  // 계통 12: 견습생 (전사/마법사) — 레어 시작, 인간형
  ...line('kn', [
    { id: 'kn', name: '후카', tier: 0, family: '인간형', type: '수행자형', emoji: '🧒', aura: '#cbd5e1', next: ['kn_war1', 'kn_mage1'] },
    { id: 'kn_war1', name: '라푸', tier: 1, family: '인간형', type: '전사형', emoji: '⚔️', aura: '#94a3b8', next: ['kn_war2'] },
    { id: 'kn_war2', name: '레히도', tier: 2, family: '인간형', type: '기사형', emoji: '🛡️', aura: '#64748b', tint: 'rgba(100,116,139,0.16)', next: ['kn_war3'] },
    { id: 'kn_war3', name: '부데호', tier: 3, family: '인간형', type: '기사형', emoji: '🗡️', aura: '#fcd34d', tint: 'rgba(252,211,77,0.18)', next: [] },
    { id: 'kn_mage1', name: '니레', tier: 1, family: '인간형', type: '마법사형', emoji: '🪄', aura: '#c084fc', next: ['kn_mage2'] },
    { id: 'kn_mage2', name: '자디테', tier: 2, family: '인간형', type: '마법사형', emoji: '🧙', aura: '#a855f7', tint: 'rgba(168,85,247,0.16)', next: ['kn_mage3'] },
    { id: 'kn_mage3', name: '레쿠도', tier: 3, family: '인간형', type: '현자형', emoji: '🔮', aura: '#9333ea', tint: 'rgba(147,51,234,0.2)', next: [] },
  ]),

  // 계통 13: 새끼용 (화룡/빙룡) — 레어 시작
  ...line('dr', [
    { id: 'dr', name: '모주', tier: 0, family: '생물형', type: '용형', emoji: '🐲', aura: '#c084fc', next: ['dr_fire1', 'dr_ice1'] },
    { id: 'dr_fire1', name: '페보', tier: 1, family: '생물형', type: '용형', emoji: '🔥', aura: '#fb923c', next: ['dr_fire2'], requires: 'statEnergy' },
    { id: 'dr_fire2', name: '세두메', tier: 2, family: '생물형', type: '용형', emoji: '🐉', aura: '#f97316', tint: 'rgba(249,115,22,0.16)', next: ['dr_fire3'] },
    { id: 'dr_fire3', name: '사네리', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '🌋', aura: '#dc2626', tint: 'rgba(220,38,38,0.2)', next: [] },
    { id: 'dr_ice1', name: '자세', tier: 1, family: '생물형', type: '용형', emoji: '❄️', aura: '#67e8f9', next: ['dr_ice2'] },
    { id: 'dr_ice2', name: '토사페', tier: 2, family: '생물형', type: '용형', emoji: '🐉', aura: '#38bdf8', tint: 'rgba(56,189,248,0.16)', next: ['dr_ice3'] },
    { id: 'dr_ice3', name: '라도게', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🧊', aura: '#0ea5e9', tint: 'rgba(14,165,233,0.2)', next: [] },
  ]),

  // 계통 14: 꼬마미라 (좀비/뱀파이어)
  ...line('un', [
    { id: 'un', name: '푸키', tier: 0, family: '신성·악마형', type: '언데드형', emoji: '🧟', aura: '#a3a3a3', next: ['un_zombie1', 'un_vamp1'] },
    { id: 'un_zombie1', name: '기무', tier: 1, family: '신성·악마형', type: '언데드형', emoji: '🧟', aura: '#84cc16', next: ['un_zombie2'] },
    { id: 'un_zombie2', name: '부피호', tier: 2, family: '신성·악마형', type: '언데드형', emoji: '💀', aura: '#65a30d', tint: 'rgba(101,163,13,0.16)', next: ['un_zombie3'] },
    { id: 'un_zombie3', name: '로레투', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '☠️', aura: '#4d7c0f', tint: 'rgba(77,124,15,0.18)', next: [] },
    { id: 'un_vamp1', name: '파헤', tier: 1, family: '신성·악마형', type: '악마형', emoji: '🦇', aura: '#a78bfa', next: ['un_vamp2'] },
    { id: 'un_vamp2', name: '미모카', tier: 2, family: '인간형', type: '악마형', emoji: '🧛', aura: '#7c3aed', tint: 'rgba(124,58,237,0.16)', next: ['un_vamp3'] },
    { id: 'un_vamp3', name: '유하디', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '🩸', aura: '#9f1239', tint: 'rgba(159,18,57,0.2)', next: [] },
  ]),

  // 계통 15: 광석이 (보석/골렘)
  ...line('mt', [
    { id: 'mt', name: '푸레', tier: 0, family: '사물·인공물형', type: '광물형', emoji: '🪨', aura: '#a8a29e', next: ['mt_gem1', 'mt_golem1'] },
    { id: 'mt_gem1', name: '주키', tier: 1, family: '사물·인공물형', type: '광물형', emoji: '💎', aura: '#67e8f9', next: ['mt_gem2'] },
    { id: 'mt_gem2', name: '코주제', tier: 2, family: '사물·인공물형', type: '광물형', emoji: '💍', aura: '#22d3ee', tint: 'rgba(34,211,238,0.16)', next: ['mt_gem3'] },
    { id: 'mt_gem3', name: '데키루', tier: 3, family: '혼합·이형형', type: '이형형', emoji: '🔆', aura: '#f0abfc', tint: 'rgba(240,171,252,0.18)', next: [] },
    { id: 'mt_golem1', name: '나로', tier: 1, family: '사물·인공물형', type: '광물형', emoji: '🗿', aura: '#78716c', next: ['mt_golem2'] },
    { id: 'mt_golem2', name: '로바투', tier: 2, family: '생물형', type: '거인형', emoji: '🏔️', aura: '#57534e', tint: 'rgba(87,83,78,0.16)', next: ['mt_golem3'] },
    { id: 'mt_golem3', name: '오타유', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌍', aura: '#16a34a', tint: 'rgba(22,163,74,0.2)', next: [] },
  ]),

  // 계통 16: 별똥별 (별/어둠) — 에픽 시작
  ...line('st', [
    { id: 'st', name: '티주', tier: 0, family: '신성·악마형', type: '천체형', emoji: '💫', aura: '#fcd34d', tint: 'rgba(252,211,77,0.14)', next: ['st_star1', 'st_dark1'] },
    { id: 'st_star1', name: '바미', tier: 1, family: '신성·악마형', type: '천체형', emoji: '⭐', aura: '#fde68a', next: ['st_star2'] },
    { id: 'st_star2', name: '헤비가', tier: 2, family: '신성·악마형', type: '천체형', emoji: '☄️', aura: '#fbbf24', tint: 'rgba(251,191,36,0.16)', next: ['st_star3'] },
    { id: 'st_star3', name: '리두바', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌟', aura: '#f59e0b', tint: 'rgba(245,158,11,0.2)', next: [] },
    { id: 'st_dark1', name: '네무', tier: 1, family: '신성·악마형', type: '천체형', emoji: '🌑', aura: '#818cf8', next: ['st_dark2'] },
    { id: 'st_dark2', name: '소메자', tier: 2, family: '혼합·이형형', type: '이형형', emoji: '🕳️', aura: '#6366f1', tint: 'rgba(99,102,241,0.16)', next: ['st_dark3'] },
    { id: 'st_dark3', name: '토미페', tier: 3, family: '혼합·이형형', type: '돌연변이형', emoji: '🌌', aura: '#4f46e5', tint: 'rgba(79,70,229,0.2)', next: [] },
  ]),

  // 계통 17: 강아지 (충견/불개)
  ...line('dog', [
    { id: 'dog', name: '두다', tier: 0, family: '생물형', type: '포유류형', emoji: '🐶', aura: '#d6a77a', next: ['dog_w1', 'dog_f1'] },
    { id: 'dog_w1', name: '제이', tier: 1, family: '생물형', type: '야수형', emoji: '🐕', aura: '#cbb18a', next: ['dog_w2'] },
    { id: 'dog_w2', name: '두보에', tier: 2, family: '생물형', type: '야수형', emoji: '🐕‍🦺', aura: '#a16207', tint: 'rgba(161,98,7,0.16)', next: ['dog_w3'] },
    { id: 'dog_w3', name: '자시테', tier: 3, family: '생물형', type: '야수형', emoji: '🐺', aura: '#78716c', tint: 'rgba(120,113,108,0.18)', next: [] },
    { id: 'dog_f1', name: '제후', tier: 1, family: '생물형', type: '야수형', emoji: '🔥', aura: '#fb923c', next: ['dog_f2'] },
    { id: 'dog_f2', name: '조케부', tier: 2, family: '생물형', type: '야수형', emoji: '🐕', aura: '#f97316', tint: 'rgba(249,115,22,0.16)', next: ['dog_f3'] },
    { id: 'dog_f3', name: '포카키', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🐕', aura: '#fcd34d', tint: 'rgba(252,211,77,0.2)', next: [] },
  ]),

  // 계통 18: 고양이 (호랑이/그림자)
  ...line('cat', [
    { id: 'cat', name: '부페', tier: 0, family: '생물형', type: '포유류형', emoji: '🐱', aura: '#fbbf24', next: ['cat_t1', 'cat_n1'] },
    { id: 'cat_t1', name: '디구', tier: 1, family: '생물형', type: '야수형', emoji: '🐈', aura: '#f59e0b', next: ['cat_t2'] },
    { id: 'cat_t2', name: '마로기', tier: 2, family: '생물형', type: '야수형', emoji: '🐯', aura: '#ea9a0b', tint: 'rgba(234,154,11,0.16)', next: ['cat_t3'] },
    { id: 'cat_t3', name: '레자도', tier: 3, family: '생물형', type: '야수형', emoji: '👑', aura: '#fbbf24', tint: 'rgba(251,191,36,0.18)', next: [] },
    { id: 'cat_n1', name: '카보', tier: 1, family: '생물형', type: '야수형', emoji: '🐈‍⬛', aura: '#6b7280', next: ['cat_n2'] },
    { id: 'cat_n2', name: '베피코', tier: 2, family: '신성·악마형', type: '악마형', emoji: '🐈‍⬛', aura: '#7c3aed', tint: 'rgba(124,58,237,0.16)', next: ['cat_n3'] },
    { id: 'cat_n3', name: '보니마', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '🧙', aura: '#6d28d9', tint: 'rgba(109,40,217,0.2)', next: [] },
  ]),

  // 계통 19: 토끼 (달토끼/뿔토끼)
  ...line('rab', [
    { id: 'rab', name: '포두', tier: 0, family: '생물형', type: '포유류형', emoji: '🐰', aura: '#f9a8d4', next: ['rab_m1', 'rab_h1'] },
    { id: 'rab_m1', name: '가투', tier: 1, family: '생물형', type: '포유류형', emoji: '🐇', aura: '#e5e7eb', next: ['rab_m2'] },
    { id: 'rab_m2', name: '테구미', tier: 2, family: '신성·악마형', type: '천체형', emoji: '🌙', aura: '#fcd34d', tint: 'rgba(252,211,77,0.16)', next: ['rab_m3'] },
    { id: 'rab_m3', name: '코바제', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌝', aura: '#fde68a', tint: 'rgba(253,230,138,0.2)', next: [] },
    { id: 'rab_h1', name: '파니', tier: 1, family: '생물형', type: '포유류형', emoji: '🐇', aura: '#a16207', next: ['rab_h2'] },
    { id: 'rab_h2', name: '기구아', tier: 2, family: '생물형', type: '야수형', emoji: '🐇', aura: '#92400e', tint: 'rgba(146,64,14,0.16)', next: ['rab_h3'] },
    { id: 'rab_h3', name: '세나메', tier: 3, family: '생물형', type: '야수형', emoji: '👑', aura: '#78350f', tint: 'rgba(120,53,15,0.18)', next: [] },
  ]),

  // 계통 20: 곰 (산곰/얼음곰)
  ...line('bear', [
    { id: 'bear', name: '비푸', tier: 0, family: '생물형', type: '포유류형', emoji: '🐻', aura: '#a16207', next: ['bear_p1', 'bear_i1'] },
    { id: 'bear_p1', name: '후보', tier: 1, family: '생물형', type: '야수형', emoji: '🐻', aura: '#92400e', next: ['bear_p2'] },
    { id: 'bear_p2', name: '루가루', tier: 2, family: '생물형', type: '야수형', emoji: '🐻', aura: '#78350f', tint: 'rgba(120,53,15,0.16)', next: ['bear_p3'] },
    { id: 'bear_p3', name: '케구다', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🐻', aura: '#16a34a', tint: 'rgba(22,163,74,0.2)', next: [] },
    { id: 'bear_i1', name: '다티', tier: 1, family: '생물형', type: '야수형', emoji: '❄️', aura: '#67e8f9', next: ['bear_i2'] },
    { id: 'bear_i2', name: '오니유', tier: 2, family: '생물형', type: '야수형', emoji: '🧊', aura: '#38bdf8', tint: 'rgba(56,189,248,0.16)', next: ['bear_i3'] },
    { id: 'bear_i3', name: '헤쿠가', tier: 3, family: '신성·악마형', type: '신인형', emoji: '⛄', aura: '#0ea5e9', tint: 'rgba(14,165,233,0.18)', next: [] },
  ]),

  // 계통 21: 여우 (불여우/구미호)
  ...line('fox', [
    { id: 'fox', name: '베무', tier: 0, family: '생물형', type: '포유류형', emoji: '🦊', aura: '#fb923c', next: ['fox_f1', 'fox_n1'] },
    { id: 'fox_f1', name: '무가', tier: 1, family: '생물형', type: '야수형', emoji: '🔥', aura: '#f97316', next: ['fox_f2'] },
    { id: 'fox_f2', name: '조페부', tier: 2, family: '생물형', type: '야수형', emoji: '🦊', aura: '#ea580c', tint: 'rgba(234,88,12,0.16)', next: ['fox_f3'] },
    { id: 'fox_f3', name: '포유키', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🦊', aura: '#fcd34d', tint: 'rgba(252,211,77,0.2)', next: [] },
    { id: 'fox_n1', name: '누미', tier: 1, family: '신성·악마형', type: '악마형', emoji: '🦊', aura: '#a78bfa', next: ['fox_n2'] },
    { id: 'fox_n2', name: '히사오', tier: 2, family: '신성·악마형', type: '악마형', emoji: '🦊', aura: '#7c3aed', tint: 'rgba(124,58,237,0.16)', next: ['fox_n3'] },
    { id: 'fox_n3', name: '시호무', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '🦊', aura: '#6d28d9', tint: 'rgba(109,40,217,0.2)', next: [] },
  ]),

  // 계통 22: 펭귄 (빙판/바다)
  ...line('pen', [
    { id: 'pen', name: '미투', tier: 0, family: '생물형', type: '조류형', emoji: '🐧', aura: '#38bdf8', next: ['pen_e1', 'pen_s1'] },
    { id: 'pen_e1', name: '바소', tier: 1, family: '생물형', type: '조류형', emoji: '🐧', aura: '#0ea5e9', next: ['pen_e2'] },
    { id: 'pen_e2', name: '무키로', tier: 2, family: '생물형', type: '조류형', emoji: '❄️', aura: '#67e8f9', tint: 'rgba(103,232,249,0.16)', next: ['pen_e3'], requires: 'seasonWinter' },
    { id: 'pen_e3', name: '소루자', tier: 3, family: '생물형', type: '수생형', emoji: '🧊', aura: '#0369a1', tint: 'rgba(3,105,161,0.18)', next: [] },
    { id: 'pen_s1', name: '카네', tier: 1, family: '생물형', type: '수생형', emoji: '🌊', aura: '#38bdf8', next: ['pen_s2'] },
    { id: 'pen_s2', name: '에키쿠', tier: 2, family: '생물형', type: '수생형', emoji: '🐧', aura: '#0ea5e9', tint: 'rgba(14,165,233,0.16)', next: ['pen_s3'] },
    { id: 'pen_s3', name: '게노니', tier: 3, family: '생물형', type: '수생형', emoji: '🐋', aura: '#0369a1', tint: 'rgba(3,105,161,0.2)', next: [] },
  ]),

  // 계통 23: 거북 (바다거북/돌거북)
  ...line('tur', [
    { id: 'tur', name: '토세', tier: 0, family: '생물형', type: '수생형', emoji: '🐢', aura: '#22c55e', next: ['tur_s1', 'tur_l1'] },
    { id: 'tur_s1', name: '쿠시', tier: 1, family: '생물형', type: '수생형', emoji: '🐢', aura: '#38bdf8', next: ['tur_s2'] },
    { id: 'tur_s2', name: '케티다', tier: 2, family: '생물형', type: '수생형', emoji: '🐢', aura: '#0ea5e9', tint: 'rgba(14,165,233,0.16)', next: ['tur_s3'] },
    { id: 'tur_s3', name: '바토피', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🐢', aura: '#0369a1', tint: 'rgba(3,105,161,0.18)', next: [] },
    { id: 'tur_l1', name: '노마', tier: 1, family: '사물·인공물형', type: '광물형', emoji: '🪨', aura: '#a8a29e', next: ['tur_l2'] },
    { id: 'tur_l2', name: '에라쿠', tier: 2, family: '생물형', type: '거인형', emoji: '🗿', aura: '#78716c', tint: 'rgba(120,113,108,0.16)', next: ['tur_l3'] },
    { id: 'tur_l3', name: '아루조', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🐢', aura: '#16a34a', tint: 'rgba(22,163,74,0.2)', next: [] },
  ]),

  // 계통 24: 사슴 (숲사슴/순록)
  ...line('deer', [
    { id: 'deer', name: '비후', tier: 0, family: '생물형', type: '포유류형', emoji: '🦌', aura: '#a16207', next: ['deer_w1', 'deer_s1'] },
    { id: 'deer_w1', name: '게유', tier: 1, family: '생물형', type: '포유류형', emoji: '🌿', aura: '#22c55e', next: ['deer_w2'] },
    { id: 'deer_w2', name: '투고레', tier: 2, family: '생물형', type: '식물형', emoji: '🦌', aura: '#16a34a', tint: 'rgba(22,163,74,0.16)', next: ['deer_w3'] },
    { id: 'deer_w3', name: '하루하', tier: 3, family: '신성·악마형', type: '성수형', emoji: '🌳', aura: '#15803d', tint: 'rgba(21,128,61,0.2)', next: [] },
    { id: 'deer_s1', name: '세바', tier: 1, family: '생물형', type: '포유류형', emoji: '🦌', aura: '#cbb18a', next: ['deer_s2'] },
    { id: 'deer_s2', name: '테아미', tier: 2, family: '생물형', type: '야수형', emoji: '❄️', aura: '#67e8f9', tint: 'rgba(103,232,249,0.16)', next: ['deer_s3'] },
    { id: 'deer_s3', name: '노타소', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🦌', aura: '#22d3ee', tint: 'rgba(34,211,238,0.18)', next: [] },
  ]),

  // 계통 25: 카피바라 (온천/초원)
  ...line('cap', [
    { id: 'cap', name: '네부', tier: 0, family: '생물형', type: '포유류형', emoji: '🦫', aura: '#a16207', next: ['cap_w1', 'cap_g1'] },
    { id: 'cap_w1', name: '키자', tier: 1, family: '생물형', type: '수생형', emoji: '♨️', aura: '#38bdf8', next: ['cap_w2'] },
    { id: 'cap_w2', name: '시케무', tier: 2, family: '생물형', type: '수생형', emoji: '🦫', aura: '#0ea5e9', tint: 'rgba(14,165,233,0.16)', next: ['cap_w3'] },
    { id: 'cap_w3', name: '루포루', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌊', aura: '#0369a1', tint: 'rgba(3,105,161,0.18)', next: [] },
    { id: 'cap_g1', name: '누테', tier: 1, family: '생물형', type: '포유류형', emoji: '🦫', aura: '#84cc16', next: ['cap_g2'] },
    { id: 'cap_g2', name: '주토시', tier: 2, family: '생물형', type: '식물형', emoji: '🌿', aura: '#22c55e', tint: 'rgba(34,197,94,0.16)', next: ['cap_g3'] },
    { id: 'cap_g3', name: '루디루', tier: 3, family: '신성·악마형', type: '성수형', emoji: '🌳', aura: '#16a34a', tint: 'rgba(22,163,74,0.2)', next: [] },
  ]),

  // 계통 26: 쿼카 (햇살/들판)
  ...line('quo', [
    { id: 'quo', name: '티보', tier: 0, family: '생물형', type: '포유류형', emoji: '🐹', aura: '#fbbf24', next: ['quo_l1', 'quo_g1'] },
    { id: 'quo_l1', name: '마에', tier: 1, family: '생물형', type: '포유류형', emoji: '☀️', aura: '#fcd34d', next: ['quo_l2'] },
    { id: 'quo_l2', name: '바제피', tier: 2, family: '신성·악마형', type: '천사형', emoji: '😊', aura: '#fde68a', tint: 'rgba(253,230,138,0.16)', next: ['quo_l3'] },
    { id: 'quo_l3', name: '미오카', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌟', aura: '#f59e0b', tint: 'rgba(245,158,11,0.2)', next: [] },
    { id: 'quo_g1', name: '타키', tier: 1, family: '생물형', type: '포유류형', emoji: '🐹', aura: '#84cc16', next: ['quo_g2'] },
    { id: 'quo_g2', name: '파페라', tier: 2, family: '생물형', type: '식물형', emoji: '🌿', aura: '#22c55e', tint: 'rgba(34,197,94,0.16)', next: ['quo_g3'] },
    { id: 'quo_g3', name: '타피모', tier: 3, family: '생물형', type: '식물형', emoji: '🍀', aura: '#16a34a', tint: 'rgba(22,163,74,0.18)', next: [] },
  ]),

  // 계통 27: 레서판다 (불꽃/단풍)
  ...line('red', [
    { id: 'red', name: '티누', tier: 0, family: '생물형', type: '포유류형', emoji: '🐼', aura: '#fb923c', next: ['red_f1', 'red_t1'] },
    { id: 'red_f1', name: '구모', tier: 1, family: '생물형', type: '야수형', emoji: '🔥', aura: '#f97316', next: ['red_f2'] },
    { id: 'red_f2', name: '마푸기', tier: 2, family: '생물형', type: '야수형', emoji: '🐼', aura: '#ea580c', tint: 'rgba(234,88,12,0.16)', next: ['red_f3'] },
    { id: 'red_f3', name: '투리레', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🔥', aura: '#dc2626', tint: 'rgba(220,38,38,0.2)', next: [] },
    { id: 'red_t1', name: '나베', tier: 1, family: '생물형', type: '포유류형', emoji: '🍁', aura: '#b45309', next: ['red_t2'] },
    { id: 'red_t2', name: '바노피', tier: 2, family: '생물형', type: '식물형', emoji: '🌿', aura: '#16a34a', tint: 'rgba(22,163,74,0.16)', next: ['red_t3'] },
    { id: 'red_t3', name: '파호라', tier: 3, family: '생물형', type: '식물형', emoji: '🌳', aura: '#15803d', tint: 'rgba(21,128,61,0.2)', next: [] },
  ]),

  // 계통 28: 수달 (강/바다)
  ...line('ott', [
    { id: 'ott', name: '티자', tier: 0, family: '생물형', type: '수생형', emoji: '🦦', aura: '#38bdf8', next: ['ott_r1', 'ott_s1'] },
    { id: 'ott_r1', name: '가조', tier: 1, family: '생물형', type: '수생형', emoji: '🦦', aura: '#0ea5e9', next: ['ott_r2'] },
    { id: 'ott_r2', name: '세아메', tier: 2, family: '생물형', type: '수생형', emoji: '🌊', aura: '#0284c7', tint: 'rgba(2,132,199,0.16)', next: ['ott_r3'] },
    { id: 'ott_r3', name: '가케노', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌊', aura: '#0369a1', tint: 'rgba(3,105,161,0.18)', next: [] },
    { id: 'ott_s1', name: '디제', tier: 1, family: '생물형', type: '수생형', emoji: '🦦', aura: '#22d3ee', next: ['ott_s2'] },
    { id: 'ott_s2', name: '헤푸가', tier: 2, family: '생물형', type: '수생형', emoji: '🪸', aura: '#06b6d4', tint: 'rgba(6,182,212,0.16)', next: ['ott_s3'] },
    { id: 'ott_s3', name: '호디보', tier: 3, family: '생물형', type: '수생형', emoji: '🐋', aura: '#0369a1', tint: 'rgba(3,105,161,0.2)', next: [] },
  ]),

  // 계통 29: 고슴도치 (철갑/불가시)
  ...line('hog', [
    { id: 'hog', name: '라피', tier: 0, family: '생물형', type: '포유류형', emoji: '🦔', aura: '#a16207', next: ['hog_m1', 'hog_f1'] },
    { id: 'hog_m1', name: '조카', tier: 1, family: '생물형', type: '포유류형', emoji: '🦔', aura: '#94a3b8', next: ['hog_m2'] },
    { id: 'hog_m2', name: '고히세', tier: 2, family: '기계형', type: '병기형', emoji: '⚙️', aura: '#64748b', tint: 'rgba(100,116,139,0.16)', next: ['hog_m3'] },
    { id: 'hog_m3', name: '무데로', tier: 3, family: '기계형', type: '순수기계형', emoji: '🛡️', aura: '#475569', tint: 'rgba(71,85,105,0.18)', next: [] },
    { id: 'hog_f1', name: '마리', tier: 1, family: '생물형', type: '야수형', emoji: '🔥', aura: '#fb923c', next: ['hog_f2'] },
    { id: 'hog_f2', name: '메토하', tier: 2, family: '생물형', type: '야수형', emoji: '🦔', aura: '#f97316', tint: 'rgba(249,115,22,0.16)', next: ['hog_f3'] },
    { id: 'hog_f3', name: '루리루', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🔥', aura: '#dc2626', tint: 'rgba(220,38,38,0.2)', next: [] },
  ]),

  // 계통 30: 카멜레온 (무지개/그림자)
  ...line('cha', [
    { id: 'cha', name: '소미', tier: 0, family: '생물형', type: '파충류형', emoji: '🦎', aura: '#22c55e', next: ['cha_r1', 'cha_d1'] },
    { id: 'cha_r1', name: '니토', tier: 1, family: '혼합·이형형', type: '이형형', emoji: '🌈', aura: '#f0abfc', next: ['cha_r2'] },
    { id: 'cha_r2', name: '다누헤', tier: 2, family: '혼합·이형형', type: '이형형', emoji: '💠', aura: '#67e8f9', tint: 'rgba(103,232,249,0.16)', next: ['cha_r3'] },
    { id: 'cha_r3', name: '모테히', tier: 3, family: '혼합·이형형', type: '이형형', emoji: '🌈', aura: '#e879f9', tint: 'rgba(232,121,249,0.2)', next: [] },
    { id: 'cha_d1', name: '부마', tier: 1, family: '신성·악마형', type: '악마형', emoji: '🦎', aura: '#a78bfa', next: ['cha_d2'] },
    { id: 'cha_d2', name: '타게모', tier: 2, family: '신성·악마형', type: '악마형', emoji: '🌑', aura: '#7c3aed', tint: 'rgba(124,58,237,0.16)', next: ['cha_d3'] },
    { id: 'cha_d3', name: '제무고', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '👤', aura: '#6d28d9', tint: 'rgba(109,40,217,0.2)', next: [] },
  ]),

  // 계통 31: 아홀로틀 (분홍/황금)
  ...line('axo', [
    { id: 'axo', name: '코유', tier: 0, family: '생물형', type: '양서류형', emoji: '🦎', aura: '#22d3ee', next: ['axo_p1', 'axo_g1'] },
    { id: 'axo_p1', name: '모루', tier: 1, family: '생물형', type: '양서류형', emoji: '🩷', aura: '#38bdf8', next: ['axo_p2'] },
    { id: 'axo_p2', name: '미투카', tier: 2, family: '생물형', type: '수생형', emoji: '🪸', aura: '#06b6d4', tint: 'rgba(6,182,212,0.16)', next: ['axo_p3'] },
    { id: 'axo_p3', name: '도나주', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌊', aura: '#0369a1', tint: 'rgba(3,105,161,0.2)', next: [] },
    { id: 'axo_g1', name: '부하', tier: 1, family: '생물형', type: '양서류형', emoji: '✨', aura: '#fcd34d', next: ['axo_g2'] },
    { id: 'axo_g2', name: '데오루', tier: 2, family: '신성·악마형', type: '천사형', emoji: '🦎', aura: '#fde68a', tint: 'rgba(253,230,138,0.16)', next: ['axo_g3'] },
    { id: 'axo_g3', name: '네소타', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌟', aura: '#f59e0b', tint: 'rgba(245,158,11,0.2)', next: [] },
  ]),

  // 계통 32: 해마 (산호/용)
  ...line('shm', [
    { id: 'shm', name: '바디', tier: 0, family: '생물형', type: '수생형', emoji: '🌊', aura: '#22d3ee', next: ['shm_c1', 'shm_d1'] },
    { id: 'shm_c1', name: '코피', tier: 1, family: '생물형', type: '수생형', emoji: '🪸', aura: '#06b6d4', next: ['shm_c2'] },
    { id: 'shm_c2', name: '모자히', tier: 2, family: '생물형', type: '수생형', emoji: '🌊', aura: '#0ea5e9', tint: 'rgba(14,165,233,0.16)', next: ['shm_c3'] },
    { id: 'shm_c3', name: '니가네', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🧜', aura: '#0369a1', tint: 'rgba(3,105,161,0.18)', next: [] },
    { id: 'shm_d1', name: '세누', tier: 1, family: '생물형', type: '수생형', emoji: '🐉', aura: '#0ea5e9', next: ['shm_d2'] },
    { id: 'shm_d2', name: '시다무', tier: 2, family: '생물형', type: '용형', emoji: '🐉', aura: '#0284c7', tint: 'rgba(2,132,199,0.16)', next: ['shm_d3'] },
    { id: 'shm_d3', name: '쿠테파', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌊', aura: '#0369a1', tint: 'rgba(3,105,161,0.2)', next: [] },
  ]),

  // 계통 33: 만타가오리 (심해/독)
  ...line('man', [
    { id: 'man', name: '쿠티', tier: 0, family: '생물형', type: '수생형', emoji: '🐟', aura: '#38bdf8', next: ['man_m1', 'man_d1'] },
    { id: 'man_m1', name: '하두', tier: 1, family: '생물형', type: '수생형', emoji: '🌊', aura: '#0ea5e9', next: ['man_m2'] },
    { id: 'man_m2', name: '테소미', tier: 2, family: '생물형', type: '수생형', emoji: '🐋', aura: '#0284c7', tint: 'rgba(2,132,199,0.16)', next: ['man_m3'] },
    { id: 'man_m3', name: '게하니', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌊', aura: '#0369a1', tint: 'rgba(3,105,161,0.2)', next: [] },
    { id: 'man_d1', name: '히가', tier: 1, family: '생물형', type: '수생형', emoji: '🦈', aura: '#a3e635', next: ['man_d2'] },
    { id: 'man_d2', name: '부라호', tier: 2, family: '신성·악마형', type: '악마형', emoji: '☠️', aura: '#65a30d', tint: 'rgba(101,163,13,0.16)', next: ['man_d3'] },
    { id: 'man_d3', name: '디포두', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '🌑', aura: '#4d7c0f', tint: 'rgba(77,124,15,0.2)', next: [] },
  ]),

  // 계통 34: 사마귀 (낫/숲)
  ...line('mts', [
    { id: 'mts', name: '코테', tier: 0, family: '생물형', type: '곤충형', emoji: '🦗', aura: '#a3e635', next: ['mts_b1', 'mts_g1'] },
    { id: 'mts_b1', name: '두게', tier: 1, family: '생물형', type: '곤충형', emoji: '🦗', aura: '#84cc16', next: ['mts_b2'] },
    { id: 'mts_b2', name: '사쿠리', tier: 2, family: '생물형', type: '곤충형', emoji: '⚔️', aura: '#65a30d', tint: 'rgba(101,163,13,0.16)', next: ['mts_b3'] },
    { id: 'mts_b3', name: '코시제', tier: 3, family: '인간형', type: '전사형', emoji: '🗡️', aura: '#4d7c0f', tint: 'rgba(77,124,15,0.2)', next: [] },
    { id: 'mts_g1', name: '페루', tier: 1, family: '생물형', type: '곤충형', emoji: '🌿', aura: '#22c55e', next: ['mts_g2'] },
    { id: 'mts_g2', name: '무라로', tier: 2, family: '생물형', type: '곤충형', emoji: '🌸', aura: '#ec4899', tint: 'rgba(236,72,153,0.16)', next: ['mts_g3'] },
    { id: 'mts_g3', name: '바메피', tier: 3, family: '생물형', type: '곤충형', emoji: '🍃', aura: '#16a34a', tint: 'rgba(22,163,74,0.18)', next: [] },
  ]),

  // 계통 35: 사슴벌레 (강철뿔/숲)
  ...line('stb', [
    { id: 'stb', name: '포하', tier: 0, family: '생물형', type: '곤충형', emoji: '🪲', aura: '#a16207', next: ['stb_m1', 'stb_g1'] },
    { id: 'stb_m1', name: '히라', tier: 1, family: '생물형', type: '곤충형', emoji: '🪲', aura: '#78350f', next: ['stb_m2'] },
    { id: 'stb_m2', name: '코디제', tier: 2, family: '기계형', type: '병기형', emoji: '⚙️', aura: '#64748b', tint: 'rgba(100,116,139,0.16)', next: ['stb_m3'] },
    { id: 'stb_m3', name: '하미베', tier: 3, family: '기계형', type: '순수기계형', emoji: '🛡️', aura: '#475569', tint: 'rgba(71,85,105,0.18)', next: [] },
    { id: 'stb_g1', name: '도투', tier: 1, family: '생물형', type: '곤충형', emoji: '🌿', aura: '#22c55e', next: ['stb_g2'] },
    { id: 'stb_g2', name: '호가보', tier: 2, family: '생물형', type: '곤충형', emoji: '🌳', aura: '#16a34a', tint: 'rgba(22,163,74,0.16)', next: ['stb_g3'] },
    { id: 'stb_g3', name: '카비토', tier: 3, family: '생물형', type: '곤충형', emoji: '👑', aura: '#15803d', tint: 'rgba(21,128,61,0.2)', next: [] },
  ]),

  // 계통 36: 공작 (무지개/빛)
  ...line('pea', [
    { id: 'pea', name: '소시', tier: 0, family: '생물형', type: '조류형', emoji: '🦚', aura: '#22d3ee', next: ['pea_r1', 'pea_l1'] },
    { id: 'pea_r1', name: '주헤', tier: 1, family: '생물형', type: '조류형', emoji: '🌈', aura: '#f0abfc', next: ['pea_r2'] },
    { id: 'pea_r2', name: '카테토', tier: 2, family: '혼합·이형형', type: '이형형', emoji: '💠', aura: '#67e8f9', tint: 'rgba(103,232,249,0.16)', next: ['pea_r3'] },
    { id: 'pea_r3', name: '세소메', tier: 3, family: '혼합·이형형', type: '이형형', emoji: '🦚', aura: '#e879f9', tint: 'rgba(232,121,249,0.2)', next: [] },
    { id: 'pea_l1', name: '티세', tier: 1, family: '생물형', type: '조류형', emoji: '☀️', aura: '#fcd34d', next: ['pea_l2'] },
    { id: 'pea_l2', name: '오푸히', tier: 2, family: '신성·악마형', type: '천사형', emoji: '🦚', aura: '#fde68a', tint: 'rgba(253,230,138,0.16)', next: ['pea_l3'] },
    { id: 'pea_l3', name: '파미라', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌞', aura: '#f59e0b', tint: 'rgba(245,158,11,0.2)', next: [] },
  ]),

  // 계통 37: 올빼미 (현자/밤)
  ...line('owl', [
    { id: 'owl', name: '쿠호', tier: 0, family: '생물형', type: '조류형', emoji: '🦉', aura: '#a16207', next: ['owl_w1', 'owl_n1'] },
    { id: 'owl_w1', name: '푸바', tier: 1, family: '생물형', type: '조류형', emoji: '🦉', aura: '#fcd34d', next: ['owl_w2'] },
    { id: 'owl_w2', name: '가미노', tier: 2, family: '신성·악마형', type: '천사형', emoji: '🦉', aura: '#fde68a', tint: 'rgba(253,230,138,0.16)', next: ['owl_w3'] },
    { id: 'owl_w3', name: '테나미', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🔮', aura: '#f59e0b', tint: 'rgba(245,158,11,0.2)', next: [] },
    { id: 'owl_n1', name: '베카', tier: 1, family: '신성·악마형', type: '악마형', emoji: '🌑', aura: '#818cf8', next: ['owl_n2'], requires: 'night' },
    { id: 'owl_n2', name: '하기베', tier: 2, family: '신성·악마형', type: '악마형', emoji: '🦉', aura: '#7c3aed', tint: 'rgba(124,58,237,0.16)', next: ['owl_n3'] },
    { id: 'owl_n3', name: '데모루', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '👁️', aura: '#6d28d9', tint: 'rgba(109,40,217,0.2)', next: [] },
  ]),

  // 계통 38: 미어캣 (사막/햇살)
  ...line('mee', [
    { id: 'mee', name: '마푸', tier: 0, family: '생물형', type: '포유류형', emoji: '🦫', aura: '#d6a77a', next: ['mee_s1', 'mee_l1'] },
    { id: 'mee_s1', name: '조리', tier: 1, family: '생물형', type: '포유류형', emoji: '🏜️', aura: '#c8923f', next: ['mee_s2'] },
    { id: 'mee_s2', name: '마테기', tier: 2, family: '생물형', type: '야수형', emoji: '🦫', aura: '#b45309', tint: 'rgba(180,83,9,0.16)', next: ['mee_s3'] },
    { id: 'mee_s3', name: '니포네', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🏜️', aura: '#92400e', tint: 'rgba(146,64,14,0.18)', next: [] },
    { id: 'mee_l1', name: '포라', tier: 1, family: '생물형', type: '포유류형', emoji: '☀️', aura: '#fcd34d', next: ['mee_l2'] },
    { id: 'mee_l2', name: '루고사', tier: 2, family: '신성·악마형', type: '천사형', emoji: '🦫', aura: '#fde68a', tint: 'rgba(253,230,138,0.16)', next: ['mee_l3'] },
    { id: 'mee_l3', name: '가기노', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌞', aura: '#f59e0b', tint: 'rgba(245,158,11,0.2)', next: [] },
  ]),

  // 계통 39: 천산갑 (철갑/어둠)
  ...line('pang', [
    { id: 'pang', name: '푸조', tier: 0, family: '생물형', type: '포유류형', emoji: '🦔', aura: '#a16207', next: ['pang_m1', 'pang_d1'] },
    { id: 'pang_m1', name: '페타', tier: 1, family: '생물형', type: '포유류형', emoji: '🦔', aura: '#94a3b8', next: ['pang_m2'] },
    { id: 'pang_m2', name: '도티주', tier: 2, family: '기계형', type: '거대로봇형', emoji: '🦾', aura: '#64748b', tint: 'rgba(100,116,139,0.16)', next: ['pang_m3'] },
    { id: 'pang_m3', name: '세마메', tier: 3, family: '기계형', type: '순수기계형', emoji: '🛡️', aura: '#475569', tint: 'rgba(71,85,105,0.2)', next: [] },
    { id: 'pang_d1', name: '피호', tier: 1, family: '신성·악마형', type: '악마형', emoji: '🌑', aura: '#a78bfa', next: ['pang_d2'] },
    { id: 'pang_d2', name: '베투코', tier: 2, family: '신성·악마형', type: '악마형', emoji: '🦇', aura: '#7c3aed', tint: 'rgba(124,58,237,0.16)', next: ['pang_d3'] },
    { id: 'pang_d3', name: '도헤주', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '🐉', aura: '#6d28d9', tint: 'rgba(109,40,217,0.2)', next: [] },
  ]),

  // 계통 40: 코끼리 (분수/대지)
  ...line('ele', [
    { id: 'ele', name: '비헤', tier: 0, family: '생물형', type: '포유류형', emoji: '🐘', aura: '#94a3b8', next: ['ele_w1', 'ele_e1'] },
    { id: 'ele_w1', name: '로페', tier: 1, family: '생물형', type: '포유류형', emoji: '💦', aura: '#38bdf8', next: ['ele_w2'] },
    { id: 'ele_w2', name: '디코두', tier: 2, family: '생물형', type: '거인형', emoji: '🐘', aura: '#0ea5e9', tint: 'rgba(14,165,233,0.16)', next: ['ele_w3'] },
    { id: 'ele_w3', name: '기소아', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌊', aura: '#0369a1', tint: 'rgba(3,105,161,0.2)', next: [] },
    { id: 'ele_e1', name: '헤피', tier: 1, family: '생물형', type: '포유류형', emoji: '🐘', aura: '#a8a29e', next: ['ele_e2'] },
    { id: 'ele_e2', name: '쿠비파', tier: 2, family: '생물형', type: '거인형', emoji: '🏔️', aura: '#78716c', tint: 'rgba(120,113,108,0.16)', next: ['ele_e3'] },
    { id: 'ele_e3', name: '조다부', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌍', aura: '#57534e', tint: 'rgba(87,83,78,0.2)', next: [] },
  ]),

  // 계통 41: 기린 (햇살/숲)
  ...line('gir', [
    { id: 'gir', name: '리투', tier: 0, family: '생물형', type: '포유류형', emoji: '🦒', aura: '#fbbf24', next: ['gir_l1', 'gir_t1'] },
    { id: 'gir_l1', name: '소니', tier: 1, family: '생물형', type: '포유류형', emoji: '☀️', aura: '#fcd34d', next: ['gir_l2'] },
    { id: 'gir_l2', name: '페타포', tier: 2, family: '생물형', type: '식물형', emoji: '🦒', aura: '#22c55e', tint: 'rgba(34,197,94,0.16)', next: ['gir_l3'] },
    { id: 'gir_l3', name: '노이소', tier: 3, family: '신성·악마형', type: '성수형', emoji: '🌿', aura: '#16a34a', tint: 'rgba(22,163,74,0.18)', next: [] },
    { id: 'gir_t1', name: '메로', tier: 1, family: '생물형', type: '식물형', emoji: '🌿', aura: '#4ade80', next: ['gir_t2'] },
    { id: 'gir_t2', name: '페이포', tier: 2, family: '생물형', type: '식물형', emoji: '🌳', aura: '#16a34a', tint: 'rgba(22,163,74,0.16)', next: ['gir_t3'] },
    { id: 'gir_t3', name: '세보메', tier: 3, family: '신성·악마형', type: '성수형', emoji: '🌳', aura: '#15803d', tint: 'rgba(21,128,61,0.2)', next: [] },
  ]),

  // 계통 42: 코뿔소 (강철/화염)
  ...line('rhi', [
    { id: 'rhi', name: '마무', tier: 0, family: '생물형', type: '포유류형', emoji: '🦏', aura: '#94a3b8', next: ['rhi_m1', 'rhi_f1'] },
    { id: 'rhi_m1', name: '이데', tier: 1, family: '생물형', type: '야수형', emoji: '🦏', aura: '#64748b', next: ['rhi_m2'] },
    { id: 'rhi_m2', name: '타데모', tier: 2, family: '기계형', type: '병기형', emoji: '🦾', aura: '#475569', tint: 'rgba(71,85,105,0.16)', next: ['rhi_m3'] },
    { id: 'rhi_m3', name: '피사데', tier: 3, family: '기계형', type: '순수기계형', emoji: '🛡️', aura: '#334155', tint: 'rgba(51,65,85,0.2)', next: [] },
    { id: 'rhi_f1', name: '데아', tier: 1, family: '생물형', type: '야수형', emoji: '🔥', aura: '#fb923c', next: ['rhi_f2'] },
    { id: 'rhi_f2', name: '유토디', tier: 2, family: '생물형', type: '야수형', emoji: '🦏', aura: '#ea580c', tint: 'rgba(234,88,12,0.16)', next: ['rhi_f3'] },
    { id: 'rhi_f3', name: '헤히가', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌋', aura: '#dc2626', tint: 'rgba(220,38,38,0.18)', next: [] },
  ]),

  // 계통 43: 하마 (물/어둠)
  ...line('hip', [
    { id: 'hip', name: '티라', tier: 0, family: '생물형', type: '포유류형', emoji: '🦛', aura: '#a78bfa', next: ['hip_w1', 'hip_d1'] },
    { id: 'hip_w1', name: '디케', tier: 1, family: '생물형', type: '수생형', emoji: '🦛', aura: '#38bdf8', next: ['hip_w2'] },
    { id: 'hip_w2', name: '호후보', tier: 2, family: '생물형', type: '수생형', emoji: '🌊', aura: '#0ea5e9', tint: 'rgba(14,165,233,0.16)', next: ['hip_w3'] },
    { id: 'hip_w3', name: '제타고', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌊', aura: '#0369a1', tint: 'rgba(3,105,161,0.18)', next: [] },
    { id: 'hip_d1', name: '에타', tier: 1, family: '신성·악마형', type: '악마형', emoji: '🌑', aura: '#a78bfa', next: ['hip_d2'] },
    { id: 'hip_d2', name: '니후네', tier: 2, family: '신성·악마형', type: '악마형', emoji: '🦛', aura: '#7c3aed', tint: 'rgba(124,58,237,0.16)', next: ['hip_d3'] },
    { id: 'hip_d3', name: '루시루', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '👹', aura: '#6d28d9', tint: 'rgba(109,40,217,0.2)', next: [] },
  ]),

  // 계통 44: 낙타 (사막/햇살)
  ...line('cam', [
    { id: 'cam', name: '토유', tier: 0, family: '생물형', type: '포유류형', emoji: '🐫', aura: '#c8923f', next: ['cam_s1', 'cam_l1'] },
    { id: 'cam_s1', name: '네다', tier: 1, family: '생물형', type: '포유류형', emoji: '🏜️', aura: '#b45309', next: ['cam_s2'] },
    { id: 'cam_s2', name: '카쿠토', tier: 2, family: '생물형', type: '야수형', emoji: '🐫', aura: '#92400e', tint: 'rgba(146,64,14,0.16)', next: ['cam_s3'] },
    { id: 'cam_s3', name: '다피헤', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🏜️', aura: '#78350f', tint: 'rgba(120,53,15,0.18)', next: [] },
    { id: 'cam_l1', name: '데사', tier: 1, family: '생물형', type: '포유류형', emoji: '☀️', aura: '#fcd34d', next: ['cam_l2'] },
    { id: 'cam_l2', name: '카네토', tier: 2, family: '생물형', type: '포유류형', emoji: '🐫', aura: '#fbbf24', tint: 'rgba(251,191,36,0.16)', next: ['cam_l3'] },
    { id: 'cam_l3', name: '베라코', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌞', aura: '#f59e0b', tint: 'rgba(245,158,11,0.2)', next: [] },
  ]),

  // 계통 45: 캥거루 (불꽃권투/초원)
  ...line('kan', [
    { id: 'kan', name: '나푸', tier: 0, family: '생물형', type: '포유류형', emoji: '🦘', aura: '#a16207', next: ['kan_f1', 'kan_g1'] },
    { id: 'kan_f1', name: '주유', tier: 1, family: '생물형', type: '야수형', emoji: '🔥', aura: '#fb923c', next: ['kan_f2'] },
    { id: 'kan_f2', name: '제이고', tier: 2, family: '인간형', type: '전사형', emoji: '🥊', aura: '#ea580c', tint: 'rgba(234,88,12,0.16)', next: ['kan_f3'] },
    { id: 'kan_f3', name: '사에리', tier: 3, family: '인간형', type: '전사형', emoji: '🥊', aura: '#dc2626', tint: 'rgba(220,38,38,0.2)', next: [] },
    { id: 'kan_g1', name: '쿠조', tier: 1, family: '생물형', type: '포유류형', emoji: '🌿', aura: '#22c55e', next: ['kan_g2'] },
    { id: 'kan_g2', name: '포제키', tier: 2, family: '생물형', type: '야수형', emoji: '🦘', aura: '#16a34a', tint: 'rgba(22,163,74,0.16)', next: ['kan_g3'] },
    { id: 'kan_g3', name: '유제디', tier: 3, family: '생물형', type: '야수형', emoji: '🍃', aura: '#15803d', tint: 'rgba(21,128,61,0.18)', next: [] },
  ]),

  // 계통 46: 고릴라 (강철/빛)
  ...line('gor', [
    { id: 'gor', name: '푸이', tier: 0, family: '생물형', type: '포유류형', emoji: '🦍', aura: '#64748b', next: ['gor_m1', 'gor_l1'] },
    { id: 'gor_m1', name: '누파', tier: 1, family: '생물형', type: '야수형', emoji: '🦍', aura: '#475569', next: ['gor_m2'] },
    { id: 'gor_m2', name: '토부페', tier: 2, family: '기계형', type: '거대로봇형', emoji: '🦾', aura: '#334155', tint: 'rgba(51,65,85,0.16)', next: ['gor_m3'] },
    { id: 'gor_m3', name: '유파디', tier: 3, family: '기계형', type: '순수기계형', emoji: '🛡️', aura: '#1e293b', tint: 'rgba(30,41,59,0.2)', next: [] },
    { id: 'gor_l1', name: '케이', tier: 1, family: '생물형', type: '야수형', emoji: '✨', aura: '#fcd34d', next: ['gor_l2'] },
    { id: 'gor_l2', name: '메루하', tier: 2, family: '신성·악마형', type: '천사형', emoji: '🦍', aura: '#fde68a', tint: 'rgba(253,230,138,0.16)', next: ['gor_l3'] },
    { id: 'gor_l3', name: '루코루', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌟', aura: '#f59e0b', tint: 'rgba(245,158,11,0.2)', next: [] },
  ]),

  // 계통 47: 원숭이 (불/바람)
  ...line('mon', [
    { id: 'mon', name: '소케', tier: 0, family: '생물형', type: '포유류형', emoji: '🐒', aura: '#a16207', next: ['mon_f1', 'mon_w1'] },
    { id: 'mon_f1', name: '테기', tier: 1, family: '생물형', type: '야수형', emoji: '🔥', aura: '#fb923c', next: ['mon_f2'] },
    { id: 'mon_f2', name: '키후케', tier: 2, family: '생물형', type: '야수형', emoji: '🐒', aura: '#ea580c', tint: 'rgba(234,88,12,0.16)', next: ['mon_f3'] },
    { id: 'mon_f3', name: '도아주', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🔥', aura: '#dc2626', tint: 'rgba(220,38,38,0.2)', next: [] },
    { id: 'mon_w1', name: '유자', tier: 1, family: '생물형', type: '야수형', emoji: '🌪️', aura: '#5eead4', next: ['mon_w2'] },
    { id: 'mon_w2', name: '타누모', tier: 2, family: '생물형', type: '야수형', emoji: '🐒', aura: '#2dd4bf', tint: 'rgba(45,212,191,0.16)', next: ['mon_w3'] },
    { id: 'mon_w3', name: '마쿠기', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌀', aura: '#14b8a6', tint: 'rgba(20,184,166,0.18)', next: [] },
  ]),

  // 계통 48: 나무늘보 (숲/어둠)
  ...line('slo', [
    { id: 'slo', name: '소메', tier: 0, family: '생물형', type: '포유류형', emoji: '🦥', aura: '#a16207', next: ['slo_t1', 'slo_d1'] },
    { id: 'slo_t1', name: '다고', tier: 1, family: '생물형', type: '식물형', emoji: '🌿', aura: '#4ade80', next: ['slo_t2'] },
    { id: 'slo_t2', name: '로디투', tier: 2, family: '생물형', type: '식물형', emoji: '🦥', aura: '#16a34a', tint: 'rgba(22,163,74,0.16)', next: ['slo_t3'] },
    { id: 'slo_t3', name: '주카시', tier: 3, family: '신성·악마형', type: '성수형', emoji: '🌳', aura: '#15803d', tint: 'rgba(21,128,61,0.2)', next: [] },
    { id: 'slo_d1', name: '시페', tier: 1, family: '생물형', type: '포유류형', emoji: '😴', aura: '#a78bfa', next: ['slo_d2'] },
    { id: 'slo_d2', name: '키코케', tier: 2, family: '신성·악마형', type: '악마형', emoji: '🦥', aura: '#7c3aed', tint: 'rgba(124,58,237,0.16)', next: ['slo_d3'] },
    { id: 'slo_d3', name: '제니고', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '🌑', aura: '#6d28d9', tint: 'rgba(109,40,217,0.18)', next: [] },
  ]),

  // 계통 49: 돌고래 (바다/빛)
  ...line('dol', [
    { id: 'dol', name: '누비', tier: 0, family: '생물형', type: '수생형', emoji: '🐬', aura: '#38bdf8', next: ['dol_w1', 'dol_l1'] },
    { id: 'dol_w1', name: '자디', tier: 1, family: '생물형', type: '수생형', emoji: '🐬', aura: '#0ea5e9', next: ['dol_w2'] },
    { id: 'dol_w2', name: '기두아', tier: 2, family: '생물형', type: '수생형', emoji: '🌊', aura: '#0284c7', tint: 'rgba(2,132,199,0.16)', next: ['dol_w3'] },
    { id: 'dol_w3', name: '노무소', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌊', aura: '#0369a1', tint: 'rgba(3,105,161,0.2)', next: [] },
    { id: 'dol_l1', name: '베후', tier: 1, family: '생물형', type: '수생형', emoji: '✨', aura: '#fde68a', next: ['dol_l2'] },
    { id: 'dol_l2', name: '게토니', tier: 2, family: '혼합·이형형', type: '이형형', emoji: '🐬', aura: '#67e8f9', tint: 'rgba(103,232,249,0.16)', next: ['dol_l3'] },
    { id: 'dol_l3', name: '라고게', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌟', aura: '#fcd34d', tint: 'rgba(252,211,77,0.18)', next: [] },
  ]),

  // 계통 50: 문어 (대왕/먹물)
  ...line('oct', [
    { id: 'oct', name: '비코', tier: 0, family: '생물형', type: '수생형', emoji: '🐙', aura: '#38bdf8', next: ['oct_w1', 'oct_d1'] },
    { id: 'oct_w1', name: '아쿠', tier: 1, family: '생물형', type: '수생형', emoji: '🐙', aura: '#0ea5e9', next: ['oct_w2'] },
    { id: 'oct_w2', name: '두나에', tier: 2, family: '생물형', type: '수생형', emoji: '🐙', aura: '#0284c7', tint: 'rgba(2,132,199,0.16)', next: ['oct_w3'] },
    { id: 'oct_w3', name: '노세소', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🐙', aura: '#0369a1', tint: 'rgba(3,105,161,0.2)', next: [] },
    { id: 'oct_d1', name: '후데', tier: 1, family: '생물형', type: '수생형', emoji: '🌑', aura: '#7c3aed', next: ['oct_d2'] },
    { id: 'oct_d2', name: '라리게', tier: 2, family: '신성·악마형', type: '악마형', emoji: '🐙', aura: '#6d28d9', tint: 'rgba(109,40,217,0.16)', next: ['oct_d3'] },
    { id: 'oct_d3', name: '케보다', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '👹', aura: '#5b21b6', tint: 'rgba(91,33,182,0.18)', next: [] },
  ]),

  // 계통 51: 악어 (늪/화염)
  ...line('cro', [
    { id: 'cro', name: '루마', tier: 0, family: '생물형', type: '파충류형', emoji: '🐊', aura: '#65a30d', next: ['cro_w1', 'cro_f1'] },
    { id: 'cro_w1', name: '리게', tier: 1, family: '생물형', type: '수생형', emoji: '🐊', aura: '#0ea5e9', next: ['cro_w2'] },
    { id: 'cro_w2', name: '오리유', tier: 2, family: '생물형', type: '수생형', emoji: '🐊', aura: '#0284c7', tint: 'rgba(2,132,199,0.16)', next: ['cro_w3'] },
    { id: 'cro_w3', name: '자주테', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '🐊', aura: '#0369a1', tint: 'rgba(3,105,161,0.2)', next: [] },
    { id: 'cro_f1', name: '모기', tier: 1, family: '생물형', type: '파충류형', emoji: '🔥', aura: '#fb923c', next: ['cro_f2'] },
    { id: 'cro_f2', name: '하호베', tier: 2, family: '생물형', type: '용형', emoji: '🐊', aura: '#ea580c', tint: 'rgba(234,88,12,0.16)', next: ['cro_f3'] },
    { id: 'cro_f3', name: '루세사', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '🌋', aura: '#dc2626', tint: 'rgba(220,38,38,0.18)', next: [] },
  ]),

  // 계통 52: 뱀 (독사/불뱀)
  ...line('snk', [
    { id: 'snk', name: '라노', tier: 0, family: '생물형', type: '파충류형', emoji: '🐍', aura: '#84cc16', next: ['snk_p1', 'snk_f1'] },
    { id: 'snk_p1', name: '시두', tier: 1, family: '생물형', type: '파충류형', emoji: '🐍', aura: '#a3e635', next: ['snk_p2'] },
    { id: 'snk_p2', name: '주메시', tier: 2, family: '생물형', type: '파충류형', emoji: '🐍', aura: '#65a30d', tint: 'rgba(101,163,13,0.16)', next: ['snk_p3'] },
    { id: 'snk_p3', name: '히라오', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '☠️', aura: '#4d7c0f', tint: 'rgba(77,124,15,0.2)', next: [] },
    { id: 'snk_f1', name: '푸케', tier: 1, family: '생물형', type: '파충류형', emoji: '🔥', aura: '#fb923c', next: ['snk_f2'] },
    { id: 'snk_f2', name: '코가제', tier: 2, family: '생물형', type: '용형', emoji: '🐍', aura: '#ea580c', tint: 'rgba(234,88,12,0.16)', next: ['snk_f3'] },
    { id: 'snk_f3', name: '카푸토', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🐉', aura: '#dc2626', tint: 'rgba(220,38,38,0.18)', next: [] },
  ]),

  // 계통 53: 독수리 (폭풍/빛)
  ...line('eag', [
    { id: 'eag', name: '미나', tier: 0, family: '생물형', type: '조류형', emoji: '🦅', aura: '#a16207', next: ['eag_w1', 'eag_l1'] },
    { id: 'eag_w1', name: '호제', tier: 1, family: '생물형', type: '조류형', emoji: '🌪️', aura: '#5eead4', next: ['eag_w2'] },
    { id: 'eag_w2', name: '루도사', tier: 2, family: '생물형', type: '조류형', emoji: '⚡', aura: '#2dd4bf', tint: 'rgba(45,212,191,0.16)', next: ['eag_w3'] },
    { id: 'eag_w3', name: '가부노', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌀', aura: '#14b8a6', tint: 'rgba(20,184,166,0.2)', next: [] },
    { id: 'eag_l1', name: '보히', tier: 1, family: '생물형', type: '조류형', emoji: '✨', aura: '#fcd34d', next: ['eag_l2'] },
    { id: 'eag_l2', name: '모에히', tier: 2, family: '신성·악마형', type: '천사형', emoji: '🦅', aura: '#fde68a', tint: 'rgba(253,230,138,0.16)', next: ['eag_l3'] },
    { id: 'eag_l3', name: '오세유', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌟', aura: '#f59e0b', tint: 'rgba(245,158,11,0.2)', next: [] },
  ]),

  // 계통 54: 플라밍고 (햇살/호수)
  ...line('fla', [
    { id: 'fla', name: '푸니', tier: 0, family: '생물형', type: '조류형', emoji: '🦩', aura: '#f9a8d4', next: ['fla_l1', 'fla_w1'] },
    { id: 'fla_l1', name: '다노', tier: 1, family: '생물형', type: '조류형', emoji: '☀️', aura: '#fcd34d', next: ['fla_l2'] },
    { id: 'fla_l2', name: '레푸도', tier: 2, family: '신성·악마형', type: '천사형', emoji: '🦩', aura: '#fb7185', tint: 'rgba(251,113,133,0.16)', next: ['fla_l3'] },
    { id: 'fla_l3', name: '고푸세', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌅', aura: '#f59e0b', tint: 'rgba(245,158,11,0.2)', next: [] },
    { id: 'fla_w1', name: '자호', tier: 1, family: '생물형', type: '수생형', emoji: '🌊', aura: '#38bdf8', next: ['fla_w2'] },
    { id: 'fla_w2', name: '네구타', tier: 2, family: '생물형', type: '수생형', emoji: '🦩', aura: '#0ea5e9', tint: 'rgba(14,165,233,0.16)', next: ['fla_w3'] },
    { id: 'fla_w3', name: '타투모', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌊', aura: '#0369a1', tint: 'rgba(3,105,161,0.18)', next: [] },
  ]),

  // 계통 55: 타조 (사막/질풍)
  ...line('ost', [
    { id: 'ost', name: '두베', tier: 0, family: '생물형', type: '조류형', emoji: '🦃', aura: '#c8923f', next: ['ost_s1', 'ost_w1'] },
    { id: 'ost_s1', name: '케소', tier: 1, family: '생물형', type: '조류형', emoji: '🏜️', aura: '#b45309', next: ['ost_s2'] },
    { id: 'ost_s2', name: '에피쿠', tier: 2, family: '생물형', type: '야수형', emoji: '🦃', aura: '#92400e', tint: 'rgba(146,64,14,0.16)', next: ['ost_s3'] },
    { id: 'ost_s3', name: '카에토', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🏜️', aura: '#78350f', tint: 'rgba(120,53,15,0.18)', next: [] },
    { id: 'ost_w1', name: '조에', tier: 1, family: '생물형', type: '조류형', emoji: '🌪️', aura: '#5eead4', next: ['ost_w2'] },
    { id: 'ost_w2', name: '두유디', tier: 2, family: '생물형', type: '야수형', emoji: '🦃', aura: '#2dd4bf', tint: 'rgba(45,212,191,0.16)', next: ['ost_w3'] },
    { id: 'ost_w3', name: '시사무', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌀', aura: '#14b8a6', tint: 'rgba(20,184,166,0.2)', next: [] },
  ]),

  // 계통 56: 꿀벌 (꽃/독침)
  ...line('bee', [
    { id: 'bee', name: '라누', tier: 0, family: '생물형', type: '곤충형', emoji: '🐝', aura: '#facc15', next: ['bee_g1', 'bee_d1'] },
    { id: 'bee_g1', name: '타유', tier: 1, family: '생물형', type: '곤충형', emoji: '🌸', aura: '#f472b6', next: ['bee_g2'] },
    { id: 'bee_g2', name: '세구메', tier: 2, family: '생물형', type: '곤충형', emoji: '🐝', aura: '#ec4899', tint: 'rgba(236,72,153,0.16)', next: ['bee_g3'] },
    { id: 'bee_g3', name: '도마주', tier: 3, family: '신성·악마형', type: '천사형', emoji: '👑', aura: '#db2777', tint: 'rgba(219,39,119,0.2)', next: [] },
    { id: 'bee_d1', name: '디누', tier: 1, family: '생물형', type: '곤충형', emoji: '⚡', aura: '#a3e635', next: ['bee_d2'] },
    { id: 'bee_d2', name: '무피로', tier: 2, family: '생물형', type: '곤충형', emoji: '🐝', aura: '#65a30d', tint: 'rgba(101,163,13,0.16)', next: ['bee_d3'] },
    { id: 'bee_d3', name: '노니소', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '☠️', aura: '#4d7c0f', tint: 'rgba(77,124,15,0.18)', next: [] },
  ]),

  // 계통 57: 전갈 (독/강철)
  ...line('sco', [
    { id: 'sco', name: '포유', tier: 0, family: '생물형', type: '곤충형', emoji: '🦂', aura: '#a16207', next: ['sco_p1', 'sco_m1'] },
    { id: 'sco_p1', name: '아도', tier: 1, family: '생물형', type: '곤충형', emoji: '🦂', aura: '#a3e635', next: ['sco_p2'] },
    { id: 'sco_p2', name: '다모헤', tier: 2, family: '신성·악마형', type: '악마형', emoji: '☠️', aura: '#65a30d', tint: 'rgba(101,163,13,0.16)', next: ['sco_p3'] },
    { id: 'sco_p3', name: '라이게', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '🦂', aura: '#4d7c0f', tint: 'rgba(77,124,15,0.2)', next: [] },
    { id: 'sco_m1', name: '코사', tier: 1, family: '생물형', type: '곤충형', emoji: '⚙️', aura: '#64748b', next: ['sco_m2'] },
    { id: 'sco_m2', name: '마네기', tier: 2, family: '기계형', type: '병기형', emoji: '🦂', aura: '#475569', tint: 'rgba(71,85,105,0.16)', next: ['sco_m3'] },
    { id: 'sco_m3', name: '바유피', tier: 3, family: '기계형', type: '순수기계형', emoji: '🛡️', aura: '#334155', tint: 'rgba(51,65,85,0.18)', next: [] },
  ]),

  // 계통 58: 오리너구리 (물/전기)
  ...line('plt', [
    { id: 'plt', name: '페자', tier: 0, family: '생물형', type: '포유류형', emoji: '🦫', aura: '#38bdf8', next: ['plt_w1', 'plt_e1'] },
    { id: 'plt_w1', name: '로후', tier: 1, family: '생물형', type: '수생형', emoji: '🦫', aura: '#0ea5e9', next: ['plt_w2'] },
    { id: 'plt_w2', name: '세티메', tier: 2, family: '생물형', type: '수생형', emoji: '🌊', aura: '#0284c7', tint: 'rgba(2,132,199,0.16)', next: ['plt_w3'] },
    { id: 'plt_w3', name: '두소에', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌊', aura: '#0369a1', tint: 'rgba(3,105,161,0.2)', next: [] },
    { id: 'plt_e1', name: '유고', tier: 1, family: '생물형', type: '포유류형', emoji: '⚡', aura: '#facc15', next: ['plt_e2'] },
    { id: 'plt_e2', name: '투이레', tier: 2, family: '생물형', type: '야수형', emoji: '⚡', aura: '#eab308', tint: 'rgba(234,179,8,0.16)', next: ['plt_e3'] },
    { id: 'plt_e3', name: '루이사', tier: 3, family: '신성·악마형', type: '신인형', emoji: '⚡', aura: '#ca8a04', tint: 'rgba(202,138,4,0.2)', next: [] },
  ]),

  // 계통 59: 아르마딜로 (강철/어둠)
  ...line('arm', [
    { id: 'arm', name: '나조', tier: 0, family: '생물형', type: '포유류형', emoji: '🦔', aura: '#a16207', next: ['arm_m1', 'arm_d1'] },
    { id: 'arm_m1', name: '모네', tier: 1, family: '생물형', type: '포유류형', emoji: '🦔', aura: '#94a3b8', next: ['arm_m2'] },
    { id: 'arm_m2', name: '자포테', tier: 2, family: '기계형', type: '병기형', emoji: '⚙️', aura: '#64748b', tint: 'rgba(100,116,139,0.16)', next: ['arm_m3'] },
    { id: 'arm_m3', name: '사로리', tier: 3, family: '기계형', type: '순수기계형', emoji: '🛡️', aura: '#475569', tint: 'rgba(71,85,105,0.18)', next: [] },
    { id: 'arm_d1', name: '데토', tier: 1, family: '신성·악마형', type: '악마형', emoji: '🌑', aura: '#a78bfa', next: ['arm_d2'] },
    { id: 'arm_d2', name: '니바네', tier: 2, family: '신성·악마형', type: '악마형', emoji: '🦔', aura: '#7c3aed', tint: 'rgba(124,58,237,0.16)', next: ['arm_d3'] },
    { id: 'arm_d3', name: '오베유', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '🛡️', aura: '#6d28d9', tint: 'rgba(109,40,217,0.2)', next: [] },
  ]),

  // 계통 60: 치타 (질풍/태양)
  ...line('chs', [
    { id: 'chs', name: '비자', tier: 0, family: '생물형', type: '포유류형', emoji: '🐆', aura: '#fbbf24', next: ['chs_w1', 'chs_l1'] },
    { id: 'chs_w1', name: '보키', tier: 1, family: '생물형', type: '야수형', emoji: '🌪️', aura: '#5eead4', next: ['chs_w2'] },
    { id: 'chs_w2', name: '피다데', tier: 2, family: '생물형', type: '야수형', emoji: '🐆', aura: '#2dd4bf', tint: 'rgba(45,212,191,0.16)', next: ['chs_w3'] },
    { id: 'chs_w3', name: '테두미', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌀', aura: '#14b8a6', tint: 'rgba(20,184,166,0.2)', next: [] },
    { id: 'chs_l1', name: '유레', tier: 1, family: '생물형', type: '야수형', emoji: '✨', aura: '#fcd34d', next: ['chs_l2'] },
    { id: 'chs_l2', name: '미누카', tier: 2, family: '생물형', type: '야수형', emoji: '🐆', aura: '#fbbf24', tint: 'rgba(251,191,36,0.16)', next: ['chs_l3'] },
    { id: 'chs_l3', name: '보베마', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌞', aura: '#f59e0b', tint: 'rgba(245,158,11,0.18)', next: [] },
  ]),

  // 계통 61: 하이에나 (어둠/화염)
  ...line('hyn', [
    { id: 'hyn', name: '베보', tier: 0, family: '생물형', type: '포유류형', emoji: '🐺', aura: '#a16207', next: ['hyn_d1', 'hyn_f1'] },
    { id: 'hyn_d1', name: '히도', tier: 1, family: '신성·악마형', type: '악마형', emoji: '🌑', aura: '#a78bfa', next: ['hyn_d2'] },
    { id: 'hyn_d2', name: '리구바', tier: 2, family: '신성·악마형', type: '악마형', emoji: '🐺', aura: '#7c3aed', tint: 'rgba(124,58,237,0.16)', next: ['hyn_d3'] },
    { id: 'hyn_d3', name: '포루키', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '👹', aura: '#6d28d9', tint: 'rgba(109,40,217,0.2)', next: [] },
    { id: 'hyn_f1', name: '고메', tier: 1, family: '생물형', type: '야수형', emoji: '🔥', aura: '#fb923c', next: ['hyn_f2'] },
    { id: 'hyn_f2', name: '루리사', tier: 2, family: '생물형', type: '야수형', emoji: '🐺', aura: '#ea580c', tint: 'rgba(234,88,12,0.16)', next: ['hyn_f3'] },
    { id: 'hyn_f3', name: '디레두', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌋', aura: '#dc2626', tint: 'rgba(220,38,38,0.18)', next: [] },
  ]),

  // 계통 62: 비버 (물/통나무)
  ...line('bvr', [
    { id: 'bvr', name: '소부', tier: 0, family: '생물형', type: '포유류형', emoji: '🦫', aura: '#a16207', next: ['bvr_w1', 'bvr_t1'] },
    { id: 'bvr_w1', name: '히부', tier: 1, family: '생물형', type: '수생형', emoji: '🦫', aura: '#38bdf8', next: ['bvr_w2'] },
    { id: 'bvr_w2', name: '베키코', tier: 2, family: '생물형', type: '수생형', emoji: '🌊', aura: '#0ea5e9', tint: 'rgba(14,165,233,0.16)', next: ['bvr_w3'] },
    { id: 'bvr_w3', name: '라무게', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌊', aura: '#0369a1', tint: 'rgba(3,105,161,0.18)', next: [] },
    { id: 'bvr_t1', name: '주다', tier: 1, family: '생물형', type: '식물형', emoji: '🪵', aura: '#84cc16', next: ['bvr_t2'] },
    { id: 'bvr_t2', name: '두마에', tier: 2, family: '생물형', type: '식물형', emoji: '🌳', aura: '#16a34a', tint: 'rgba(22,163,74,0.16)', next: ['bvr_t3'] },
    { id: 'bvr_t3', name: '조사부', tier: 3, family: '신성·악마형', type: '성수형', emoji: '🌲', aura: '#15803d', tint: 'rgba(21,128,61,0.2)', next: [] },
  ]),

  // 계통 63: 두루미 (선학/바람)
  ...line('crn', [
    { id: 'crn', name: '메루', tier: 0, family: '생물형', type: '조류형', emoji: '🦢', aura: '#e5e7eb', next: ['crn_l1', 'crn_w1'] },
    { id: 'crn_l1', name: '나투', tier: 1, family: '생물형', type: '조류형', emoji: '✨', aura: '#fde68a', next: ['crn_l2'] },
    { id: 'crn_l2', name: '부키호', tier: 2, family: '신성·악마형', type: '천사형', emoji: '🕊️', aura: '#fcd34d', tint: 'rgba(252,211,77,0.16)', next: ['crn_l3'] },
    { id: 'crn_l3', name: '리소바', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌟', aura: '#f59e0b', tint: 'rgba(245,158,11,0.2)', next: [] },
    { id: 'crn_w1', name: '자오', tier: 1, family: '생물형', type: '조류형', emoji: '🌪️', aura: '#5eead4', next: ['crn_w2'] },
    { id: 'crn_w2', name: '호주보', tier: 2, family: '생물형', type: '조류형', emoji: '🦢', aura: '#2dd4bf', tint: 'rgba(45,212,191,0.16)', next: ['crn_w3'] },
    { id: 'crn_w3', name: '제리고', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌀', aura: '#14b8a6', tint: 'rgba(20,184,166,0.18)', next: [] },
  ]),

  // 계통 64: 해파리 (바다/발광)
  ...line('jly', [
    { id: 'jly', name: '리주', tier: 0, family: '생물형', type: '수생형', emoji: '🪼', aura: '#38bdf8', next: ['jly_w1', 'jly_l1'] },
    { id: 'jly_w1', name: '토나', tier: 1, family: '생물형', type: '수생형', emoji: '🪼', aura: '#0ea5e9', next: ['jly_w2'] },
    { id: 'jly_w2', name: '사테리', tier: 2, family: '생물형', type: '수생형', emoji: '🌊', aura: '#0284c7', tint: 'rgba(2,132,199,0.16)', next: ['jly_w3'] },
    { id: 'jly_w3', name: '토기페', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌊', aura: '#0369a1', tint: 'rgba(3,105,161,0.18)', next: [] },
    { id: 'jly_l1', name: '데히', tier: 1, family: '생물형', type: '수생형', emoji: '✨', aura: '#67e8f9', next: ['jly_l2'] },
    { id: 'jly_l2', name: '주파시', tier: 2, family: '혼합·이형형', type: '이형형', emoji: '🪼', aura: '#a5f3fc', tint: 'rgba(165,243,252,0.16)', next: ['jly_l3'] },
    { id: 'jly_l3', name: '게유니', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌟', aura: '#fcd34d', tint: 'rgba(252,211,77,0.2)', next: [] },
  ]),

  // 계통 65: 복어 (독/가시물)
  ...line('puf', [
    { id: 'puf', name: '나도', tier: 0, family: '생물형', type: '수생형', emoji: '🐡', aura: '#facc15', next: ['puf_p1', 'puf_w1'] },
    { id: 'puf_p1', name: '사도', tier: 1, family: '생물형', type: '수생형', emoji: '🐡', aura: '#a3e635', next: ['puf_p2'] },
    { id: 'puf_p2', name: '파기라', tier: 2, family: '신성·악마형', type: '악마형', emoji: '☠️', aura: '#65a30d', tint: 'rgba(101,163,13,0.16)', next: ['puf_p3'] },
    { id: 'puf_p3', name: '디베유', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '🐡', aura: '#4d7c0f', tint: 'rgba(77,124,15,0.2)', next: [] },
    { id: 'puf_w1', name: '포부', tier: 1, family: '생물형', type: '수생형', emoji: '🌊', aura: '#38bdf8', next: ['puf_w2'] },
    { id: 'puf_w2', name: '주유시', tier: 2, family: '생물형', type: '수생형', emoji: '🐡', aura: '#0ea5e9', tint: 'rgba(14,165,233,0.16)', next: ['puf_w3'] },
    { id: 'puf_w3', name: '파조라', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌊', aura: '#0369a1', tint: 'rgba(3,105,161,0.18)', next: [] },
  ]),

  // 계통 66: 반딧불이 (빛/풀)
  ...line('ffl', [
    { id: 'ffl', name: '소베', tier: 0, family: '생물형', type: '곤충형', emoji: '✨', aura: '#a3e635', next: ['ffl_l1', 'ffl_g1'] },
    { id: 'ffl_l1', name: '코아', tier: 1, family: '생물형', type: '곤충형', emoji: '💡', aura: '#fde68a', next: ['ffl_l2'] },
    { id: 'ffl_l2', name: '헤로가', tier: 2, family: '신성·악마형', type: '천사형', emoji: '✨', aura: '#fcd34d', tint: 'rgba(252,211,77,0.16)', next: ['ffl_l3'] },
    { id: 'ffl_l3', name: '쿠로파', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌟', aura: '#f59e0b', tint: 'rgba(245,158,11,0.2)', next: [] },
    { id: 'ffl_g1', name: '카주', tier: 1, family: '생물형', type: '곤충형', emoji: '🌿', aura: '#84cc16', next: ['ffl_g2'] },
    { id: 'ffl_g2', name: '베누코', tier: 2, family: '생물형', type: '곤충형', emoji: '🍃', aura: '#22c55e', tint: 'rgba(34,197,94,0.16)', next: ['ffl_g3'] },
    { id: 'ffl_g3', name: '모푸히', tier: 3, family: '신성·악마형', type: '성수형', emoji: '🌳', aura: '#16a34a', tint: 'rgba(22,163,74,0.18)', next: [] },
  ]),

  // 계통 67: 표범 (그림자/정글)
  ...line('leo', [
    { id: 'leo', name: '두나', tier: 0, family: '생물형', type: '포유류형', emoji: '🐆', aura: '#fbbf24', next: ['leo_s1', 'leo_g1'] },
    { id: 'leo_s1', name: '하리', tier: 1, family: '신성·악마형', type: '악마형', emoji: '🌑', aura: '#a78bfa', next: ['leo_s2'] },
    { id: 'leo_s2', name: '디가두', tier: 2, family: '신성·악마형', type: '악마형', emoji: '🐆', aura: '#7c3aed', tint: 'rgba(124,58,237,0.16)', next: ['leo_s3'] },
    { id: 'leo_s3', name: '마에기', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '👤', aura: '#6d28d9', tint: 'rgba(109,40,217,0.2)', next: [] },
    { id: 'leo_g1', name: '도하', tier: 1, family: '생물형', type: '야수형', emoji: '🌿', aura: '#22c55e', next: ['leo_g2'] },
    { id: 'leo_g2', name: '카히토', tier: 2, family: '생물형', type: '야수형', emoji: '🐆', aura: '#16a34a', tint: 'rgba(22,163,74,0.16)', next: ['leo_g3'] },
    { id: 'leo_g3', name: '투도레', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🍃', aura: '#15803d', tint: 'rgba(21,128,61,0.18)', next: [] },
  ]),

  // 계통 68: 재규어 (물/화염)
  ...line('jag', [
    { id: 'jag', name: '비마', tier: 0, family: '생물형', type: '포유류형', emoji: '🐆', aura: '#a16207', next: ['jag_w1', 'jag_f1'] },
    { id: 'jag_w1', name: '헤자', tier: 1, family: '생물형', type: '야수형', emoji: '🌊', aura: '#38bdf8', next: ['jag_w2'] },
    { id: 'jag_w2', name: '두티에', tier: 2, family: '생물형', type: '야수형', emoji: '🐆', aura: '#0ea5e9', tint: 'rgba(14,165,233,0.16)', next: ['jag_w3'] },
    { id: 'jag_w3', name: '테보미', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌊', aura: '#0369a1', tint: 'rgba(3,105,161,0.18)', next: [] },
    { id: 'jag_f1', name: '호베', tier: 1, family: '생물형', type: '야수형', emoji: '🔥', aura: '#fb923c', next: ['jag_f2'] },
    { id: 'jag_f2', name: '무게로', tier: 2, family: '생물형', type: '야수형', emoji: '🐆', aura: '#ea580c', tint: 'rgba(234,88,12,0.16)', next: ['jag_f3'] },
    { id: 'jag_f3', name: '루레루', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌋', aura: '#dc2626', tint: 'rgba(220,38,38,0.2)', next: [] },
  ]),

  // 계통 69: 스라소니 (서리/바람)
  ...line('lyn', [
    { id: 'lyn', name: '쿠보', tier: 0, family: '생물형', type: '포유류형', emoji: '🐱', aura: '#cbb18a', next: ['lyn_i1', 'lyn_w1'] },
    { id: 'lyn_i1', name: '토가', tier: 1, family: '생물형', type: '야수형', emoji: '❄️', aura: '#67e8f9', next: ['lyn_i2'] },
    { id: 'lyn_i2', name: '하부베', tier: 2, family: '생물형', type: '야수형', emoji: '🐱', aura: '#38bdf8', tint: 'rgba(56,189,248,0.16)', next: ['lyn_i3'] },
    { id: 'lyn_i3', name: '보무마', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🧊', aura: '#0ea5e9', tint: 'rgba(14,165,233,0.18)', next: [] },
    { id: 'lyn_w1', name: '루히', tier: 1, family: '생물형', type: '야수형', emoji: '🌪️', aura: '#5eead4', next: ['lyn_w2'] },
    { id: 'lyn_w2', name: '메마메', tier: 2, family: '생물형', type: '야수형', emoji: '🐱', aura: '#2dd4bf', tint: 'rgba(45,212,191,0.16)', next: ['lyn_w3'] },
    { id: 'lyn_w3', name: '노리소', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌀', aura: '#14b8a6', tint: 'rgba(20,184,166,0.2)', next: [] },
  ]),

  // 계통 70: 늑대 (빛/어둠)
  ...line('wlf', [
    { id: 'wlf', name: '티오', tier: 0, family: '생물형', type: '포유류형', emoji: '🐺', aura: '#94a3b8', next: ['wlf_l1', 'wlf_d1'] },
    { id: 'wlf_l1', name: '사메', tier: 1, family: '생물형', type: '야수형', emoji: '✨', aura: '#fde68a', next: ['wlf_l2'] },
    { id: 'wlf_l2', name: '주하시', tier: 2, family: '생물형', type: '야수형', emoji: '🐺', aura: '#fcd34d', tint: 'rgba(252,211,77,0.16)', next: ['wlf_l3'] },
    { id: 'wlf_l3', name: '히다오', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌝', aura: '#f59e0b', tint: 'rgba(245,158,11,0.2)', next: [] },
    { id: 'wlf_d1', name: '비사', tier: 1, family: '신성·악마형', type: '악마형', emoji: '🌑', aura: '#a78bfa', next: ['wlf_d2'] },
    { id: 'wlf_d2', name: '데피루', tier: 2, family: '신성·악마형', type: '악마형', emoji: '🐺', aura: '#7c3aed', tint: 'rgba(124,58,237,0.16)', next: ['wlf_d3'] },
    { id: 'wlf_d3', name: '테마미', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '👹', aura: '#6d28d9', tint: 'rgba(109,40,217,0.2)', next: [] },
  ]),

  // 계통 71: 울버린 (강철/화염)
  ...line('wlv', [
    { id: 'wlv', name: '미모', tier: 0, family: '생물형', type: '포유류형', emoji: '🦡', aura: '#a16207', next: ['wlv_m1', 'wlv_f1'] },
    { id: 'wlv_m1', name: '네키', tier: 1, family: '생물형', type: '야수형', emoji: '🦾', aura: '#64748b', next: ['wlv_m2'] },
    { id: 'wlv_m2', name: '제후고', tier: 2, family: '기계형', type: '병기형', emoji: '🦡', aura: '#475569', tint: 'rgba(71,85,105,0.16)', next: ['wlv_m3'] },
    { id: 'wlv_m3', name: '토다페', tier: 3, family: '기계형', type: '순수기계형', emoji: '🛡️', aura: '#334155', tint: 'rgba(51,65,85,0.2)', next: [] },
    { id: 'wlv_f1', name: '파코', tier: 1, family: '생물형', type: '야수형', emoji: '🔥', aura: '#fb923c', next: ['wlv_f2'] },
    { id: 'wlv_f2', name: '코후제', tier: 2, family: '생물형', type: '야수형', emoji: '🦡', aura: '#ea580c', tint: 'rgba(234,88,12,0.16)', next: ['wlv_f3'] },
    { id: 'wlv_f3', name: '파부라', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌋', aura: '#dc2626', tint: 'rgba(220,38,38,0.18)', next: [] },
  ]),

  // 계통 72: 매 (질풍/빛)
  ...line('flc', [
    { id: 'flc', name: '메니', tier: 0, family: '생물형', type: '조류형', emoji: '🦅', aura: '#a16207', next: ['flc_w1', 'flc_l1'] },
    { id: 'flc_w1', name: '노푸', tier: 1, family: '생물형', type: '조류형', emoji: '🌪️', aura: '#5eead4', next: ['flc_w2'] },
    { id: 'flc_w2', name: '보세마', tier: 2, family: '생물형', type: '조류형', emoji: '🦅', aura: '#2dd4bf', tint: 'rgba(45,212,191,0.16)', next: ['flc_w3'] },
    { id: 'flc_w3', name: '키바케', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌀', aura: '#14b8a6', tint: 'rgba(20,184,166,0.2)', next: [] },
    { id: 'flc_l1', name: '호다', tier: 1, family: '생물형', type: '조류형', emoji: '✨', aura: '#fde68a', next: ['flc_l2'] },
    { id: 'flc_l2', name: '시루시', tier: 2, family: '신성·악마형', type: '천사형', emoji: '🦅', aura: '#fcd34d', tint: 'rgba(252,211,77,0.16)', next: ['flc_l3'] },
    { id: 'flc_l3', name: '키포케', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌞', aura: '#f59e0b', tint: 'rgba(245,158,11,0.18)', next: [] },
  ]),

  // 계통 73: 햄스터 (볼주머니/햇살) — 귀여움
  ...line('ham', [
    { id: 'ham', name: '라제', tier: 0, family: '생물형', type: '포유류형', emoji: '🐹', aura: '#fbbf24', next: ['ham_g1', 'ham_l1'] },
    { id: 'ham_g1', name: '파비', tier: 1, family: '생물형', type: '포유류형', emoji: '🌰', aura: '#84cc16', next: ['ham_g2'] },
    { id: 'ham_g2', name: '바헤바', tier: 2, family: '생물형', type: '식물형', emoji: '🐹', aura: '#22c55e', tint: 'rgba(34,197,94,0.16)', next: ['ham_g3'] },
    { id: 'ham_g3', name: '모쿠히', tier: 3, family: '신성·악마형', type: '성수형', emoji: '🌿', aura: '#16a34a', tint: 'rgba(22,163,74,0.18)', next: [] },
    { id: 'ham_l1', name: '도시', tier: 1, family: '생물형', type: '포유류형', emoji: '☀️', aura: '#fcd34d', next: ['ham_l2'] },
    { id: 'ham_l2', name: '페리포', tier: 2, family: '신성·악마형', type: '천사형', emoji: '🐹', aura: '#fde68a', tint: 'rgba(253,230,138,0.16)', next: ['ham_l3'] },
    { id: 'ham_l3', name: '투타레', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌟', aura: '#f59e0b', tint: 'rgba(245,158,11,0.2)', next: [] },
  ]),

  // 계통 74: 다람쥐 (숲/불꽃) — 귀여움
  ...line('sqr', [
    { id: 'sqr', name: '페소', tier: 0, family: '생물형', type: '포유류형', emoji: '🐿️', aura: '#a16207', next: ['sqr_t1', 'sqr_f1'] },
    { id: 'sqr_t1', name: '비고', tier: 1, family: '생물형', type: '식물형', emoji: '🌿', aura: '#4ade80', next: ['sqr_t2'] },
    { id: 'sqr_t2', name: '메노하', tier: 2, family: '생물형', type: '식물형', emoji: '🐿️', aura: '#16a34a', tint: 'rgba(22,163,74,0.16)', next: ['sqr_t3'] },
    { id: 'sqr_t3', name: '루니사', tier: 3, family: '신성·악마형', type: '성수형', emoji: '🌳', aura: '#15803d', tint: 'rgba(21,128,61,0.18)', next: [] },
    { id: 'sqr_f1', name: '에주', tier: 1, family: '생물형', type: '야수형', emoji: '🔥', aura: '#fb923c', next: ['sqr_f2'] },
    { id: 'sqr_f2', name: '자코테', tier: 2, family: '생물형', type: '야수형', emoji: '🐿️', aura: '#ea580c', tint: 'rgba(234,88,12,0.16)', next: ['sqr_f3'] },
    { id: 'sqr_f3', name: '주노시', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌋', aura: '#dc2626', tint: 'rgba(220,38,38,0.2)', next: [] },
  ]),

  // 계통 75: 친칠라 (얼음/솜털빛) — 귀여움
  ...line('chl', [
    { id: 'chl', name: '토리', tier: 0, family: '생물형', type: '포유류형', emoji: '🐭', aura: '#e5e7eb', next: ['chl_i1', 'chl_l1'] },
    { id: 'chl_i1', name: '미헤', tier: 1, family: '생물형', type: '포유류형', emoji: '❄️', aura: '#67e8f9', next: ['chl_i2'] },
    { id: 'chl_i2', name: '아메조', tier: 2, family: '생물형', type: '야수형', emoji: '🐭', aura: '#38bdf8', tint: 'rgba(56,189,248,0.16)', next: ['chl_i3'] },
    { id: 'chl_i3', name: '케소다', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🧊', aura: '#0ea5e9', tint: 'rgba(14,165,233,0.18)', next: [] },
    { id: 'chl_l1', name: '티푸', tier: 1, family: '생물형', type: '포유류형', emoji: '✨', aura: '#fde68a', next: ['chl_l2'] },
    { id: 'chl_l2', name: '하토하', tier: 2, family: '신성·악마형', type: '천사형', emoji: '☁️', aura: '#fcd34d', tint: 'rgba(252,211,77,0.16)', next: ['chl_l3'] },
    { id: 'chl_l3', name: '시페무', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌟', aura: '#f59e0b', tint: 'rgba(245,158,11,0.2)', next: [] },
  ]),

  // 계통 76: 페넥여우 (사막/별빛) — 귀여움
  ...line('fen', [
    { id: 'fen', name: '메도', tier: 0, family: '생물형', type: '포유류형', emoji: '🦊', aura: '#fcd34d', next: ['fen_s1', 'fen_l1'] },
    { id: 'fen_s1', name: '구이', tier: 1, family: '생물형', type: '포유류형', emoji: '🏜️', aura: '#c8923f', next: ['fen_s2'] },
    { id: 'fen_s2', name: '시조무', tier: 2, family: '생물형', type: '야수형', emoji: '🦊', aura: '#b45309', tint: 'rgba(180,83,9,0.16)', next: ['fen_s3'] },
    { id: 'fen_s3', name: '유조디', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🏜️', aura: '#92400e', tint: 'rgba(146,64,14,0.2)', next: [] },
    { id: 'fen_l1', name: '고디', tier: 1, family: '생물형', type: '포유류형', emoji: '⭐', aura: '#fde68a', next: ['fen_l2'] },
    { id: 'fen_l2', name: '에디쿠', tier: 2, family: '신성·악마형', type: '천체형', emoji: '🦊', aura: '#fcd34d', tint: 'rgba(252,211,77,0.16)', next: ['fen_l3'] },
    { id: 'fen_l3', name: '로가투', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌟', aura: '#f59e0b', tint: 'rgba(245,158,11,0.2)', next: [] },
  ]),

  // 계통 77: 티라노 (화염/어둠) — 공룡
  ...line('trx', [
    { id: 'trx', name: '피노', tier: 0, family: '생물형', type: '공룡형', emoji: '🦖', aura: '#65a30d', next: ['trx_f1', 'trx_d1'] },
    { id: 'trx_f1', name: '기아', tier: 1, family: '생물형', type: '공룡형', emoji: '🔥', aura: '#fb923c', next: ['trx_f2'] },
    { id: 'trx_f2', name: '다키헤', tier: 2, family: '생물형', type: '공룡형', emoji: '🦖', aura: '#ea580c', tint: 'rgba(234,88,12,0.16)', next: ['trx_f3'] },
    { id: 'trx_f3', name: '쿠에파', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '🌋', aura: '#dc2626', tint: 'rgba(220,38,38,0.2)', next: [] },
    { id: 'trx_d1', name: '시모', tier: 1, family: '신성·악마형', type: '공룡형', emoji: '🌑', aura: '#a78bfa', next: ['trx_d2'] },
    { id: 'trx_d2', name: '리헤바', tier: 2, family: '신성·악마형', type: '공룡형', emoji: '🦖', aura: '#7c3aed', tint: 'rgba(124,58,237,0.16)', next: ['trx_d3'] },
    { id: 'trx_d3', name: '히페오', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '👹', aura: '#6d28d9', tint: 'rgba(109,40,217,0.2)', next: [] },
  ]),

  // 계통 78: 트리케라톱스 (바위/숲) — 공룡
  ...line('tri', [
    { id: 'tri', name: '부디', tier: 0, family: '생물형', type: '공룡형', emoji: '🦕', aura: '#a8a29e', next: ['tri_e1', 'tri_g1'] },
    { id: 'tri_e1', name: '구테', tier: 1, family: '생물형', type: '공룡형', emoji: '🪨', aura: '#78716c', next: ['tri_e2'] },
    { id: 'tri_e2', name: '포메키', tier: 2, family: '생물형', type: '거인형', emoji: '🦕', aura: '#57534e', tint: 'rgba(87,83,78,0.16)', next: ['tri_e3'] },
    { id: 'tri_e3', name: '기로기', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌍', aura: '#44403c', tint: 'rgba(68,64,60,0.18)', next: [] },
    { id: 'tri_g1', name: '베모', tier: 1, family: '생물형', type: '공룡형', emoji: '🌿', aura: '#22c55e', next: ['tri_g2'] },
    { id: 'tri_g2', name: '피부데', tier: 2, family: '생물형', type: '거인형', emoji: '🦕', aura: '#16a34a', tint: 'rgba(22,163,74,0.16)', next: ['tri_g3'] },
    { id: 'tri_g3', name: '히케오', tier: 3, family: '신성·악마형', type: '성수형', emoji: '🌳', aura: '#15803d', tint: 'rgba(21,128,61,0.2)', next: [] },
  ]),

  // 계통 79: 프테라노돈 (질풍/햇살) — 공룡
  ...line('pte', [
    { id: 'pte', name: '마미', tier: 0, family: '생물형', type: '공룡형', emoji: '🦅', aura: '#a16207', next: ['pte_w1', 'pte_l1'] },
    { id: 'pte_w1', name: '나시', tier: 1, family: '생물형', type: '공룡형', emoji: '🌪️', aura: '#5eead4', next: ['pte_w2'] },
    { id: 'pte_w2', name: '니코네', tier: 2, family: '생물형', type: '공룡형', emoji: '🦅', aura: '#2dd4bf', tint: 'rgba(45,212,191,0.16)', next: ['pte_w3'] },
    { id: 'pte_w3', name: '피호데', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌀', aura: '#14b8a6', tint: 'rgba(20,184,166,0.2)', next: [] },
    { id: 'pte_l1', name: '헤고', tier: 1, family: '생물형', type: '공룡형', emoji: '☀️', aura: '#fcd34d', next: ['pte_l2'] },
    { id: 'pte_l2', name: '니주네', tier: 2, family: '신성·악마형', type: '천사형', emoji: '🦅', aura: '#fde68a', tint: 'rgba(253,230,138,0.16)', next: ['pte_l3'] },
    { id: 'pte_l3', name: '루베사', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌞', aura: '#f59e0b', tint: 'rgba(245,158,11,0.18)', next: [] },
  ]),

  // 계통 80: 랍토르 (독/질풍) — 공룡
  ...line('rap', [
    { id: 'rap', name: '토하', tier: 0, family: '생물형', type: '공룡형', emoji: '🦖', aura: '#84cc16', next: ['rap_p1', 'rap_w1'] },
    { id: 'rap_p1', name: '시카', tier: 1, family: '생물형', type: '공룡형', emoji: '☠️', aura: '#a3e635', next: ['rap_p2'] },
    { id: 'rap_p2', name: '라니게', tier: 2, family: '신성·악마형', type: '악마형', emoji: '🦖', aura: '#65a30d', tint: 'rgba(101,163,13,0.16)', next: ['rap_p3'] },
    { id: 'rap_p3', name: '테노자', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '☠️', aura: '#4d7c0f', tint: 'rgba(77,124,15,0.18)', next: [] },
    { id: 'rap_w1', name: '라조', tier: 1, family: '생물형', type: '공룡형', emoji: '🌪️', aura: '#5eead4', next: ['rap_w2'] },
    { id: 'rap_w2', name: '게다니', tier: 2, family: '생물형', type: '공룡형', emoji: '🦖', aura: '#2dd4bf', tint: 'rgba(45,212,191,0.16)', next: ['rap_w3'] },
    { id: 'rap_w3', name: '사푸리', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌀', aura: '#14b8a6', tint: 'rgba(20,184,166,0.2)', next: [] },
  ]),

  // 계통 81: 스테고사우루스 (바위/용암) — 공룡
  ...line('stg', [
    { id: 'stg', name: '소쿠', tier: 0, family: '생물형', type: '공룡형', emoji: '🦕', aura: '#a8a29e', next: ['stg_e1', 'stg_f1'] },
    { id: 'stg_e1', name: '비레', tier: 1, family: '생물형', type: '공룡형', emoji: '🪨', aura: '#78716c', next: ['stg_e2'] },
    { id: 'stg_e2', name: '바루피', tier: 2, family: '생물형', type: '거인형', emoji: '🦕', aura: '#57534e', tint: 'rgba(87,83,78,0.16)', next: ['stg_e3'] },
    { id: 'stg_e3', name: '피조데', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌍', aura: '#44403c', tint: 'rgba(68,64,60,0.18)', next: [] },
    { id: 'stg_f1', name: '루포', tier: 1, family: '생물형', type: '공룡형', emoji: '🔥', aura: '#fb923c', next: ['stg_f2'] },
    { id: 'stg_f2', name: '디바두', tier: 2, family: '생물형', type: '공룡형', emoji: '🦕', aura: '#ea580c', tint: 'rgba(234,88,12,0.16)', next: ['stg_f3'] },
    { id: 'stg_f3', name: '타키모', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌋', aura: '#dc2626', tint: 'rgba(220,38,38,0.2)', next: [] },
  ]),

  // 계통 82: 검치호랑이 (빙하/어둠) — 고생물
  ...line('sbr', [
    { id: 'sbr', name: '미루', tier: 0, family: '생물형', type: '포유류형', emoji: '🐯', aura: '#cbb18a', next: ['sbr_i1', 'sbr_d1'] },
    { id: 'sbr_i1', name: '레나', tier: 1, family: '생물형', type: '야수형', emoji: '❄️', aura: '#67e8f9', next: ['sbr_i2'] },
    { id: 'sbr_i2', name: '다투헤', tier: 2, family: '생물형', type: '야수형', emoji: '🐯', aura: '#38bdf8', tint: 'rgba(56,189,248,0.16)', next: ['sbr_i3'] },
    { id: 'sbr_i3', name: '포파키', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🧊', aura: '#0ea5e9', tint: 'rgba(14,165,233,0.2)', next: [] },
    { id: 'sbr_d1', name: '니사', tier: 1, family: '신성·악마형', type: '악마형', emoji: '🌑', aura: '#a78bfa', next: ['sbr_d2'] },
    { id: 'sbr_d2', name: '고비세', tier: 2, family: '신성·악마형', type: '악마형', emoji: '🐯', aura: '#7c3aed', tint: 'rgba(124,58,237,0.16)', next: ['sbr_d3'] },
    { id: 'sbr_d3', name: '유사오', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '👹', aura: '#6d28d9', tint: 'rgba(109,40,217,0.2)', next: [] },
  ]),

  // 계통 83: 맘모스 (빙하/대지) — 고생물
  ...line('mam', [
    { id: 'mam', name: '네티', tier: 0, family: '생물형', type: '포유류형', emoji: '🐘', aura: '#a16207', next: ['mam_i1', 'mam_e1'] },
    { id: 'mam_i1', name: '바게', tier: 1, family: '생물형', type: '포유류형', emoji: '❄️', aura: '#67e8f9', next: ['mam_i2'] },
    { id: 'mam_i2', name: '메아메', tier: 2, family: '생물형', type: '거인형', emoji: '🐘', aura: '#38bdf8', tint: 'rgba(56,189,248,0.16)', next: ['mam_i3'] },
    { id: 'mam_i3', name: '노베소', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🧊', aura: '#0ea5e9', tint: 'rgba(14,165,233,0.2)', next: [] },
    { id: 'mam_e1', name: '포티', tier: 1, family: '생물형', type: '포유류형', emoji: '🪨', aura: '#78716c', next: ['mam_e2'] },
    { id: 'mam_e2', name: '투니레', tier: 2, family: '생물형', type: '거인형', emoji: '🐘', aura: '#57534e', tint: 'rgba(87,83,78,0.16)', next: ['mam_e3'] },
    { id: 'mam_e3', name: '호시보', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌍', aura: '#44403c', tint: 'rgba(68,64,60,0.2)', next: [] },
  ]),

  // 계통 84: 메갈로돈 (심해/폭군) — 고생물 해양
  ...line('meg', [
    { id: 'meg', name: '메코', tier: 0, family: '생물형', type: '수생형', emoji: '🦈', aura: '#38bdf8', next: ['meg_w1', 'meg_d1'] },
    { id: 'meg_w1', name: '게비', tier: 1, family: '생물형', type: '수생형', emoji: '🌊', aura: '#0ea5e9', next: ['meg_w2'] },
    { id: 'meg_w2', name: '네보타', tier: 2, family: '생물형', type: '수생형', emoji: '🦈', aura: '#0284c7', tint: 'rgba(2,132,199,0.16)', next: ['meg_w3'] },
    { id: 'meg_w3', name: '파케라', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌊', aura: '#0369a1', tint: 'rgba(3,105,161,0.2)', next: [] },
    { id: 'meg_d1', name: '레오', tier: 1, family: '신성·악마형', type: '악마형', emoji: '🌑', aura: '#7c3aed', next: ['meg_d2'] },
    { id: 'meg_d2', name: '호레보', tier: 2, family: '신성·악마형', type: '악마형', emoji: '🦈', aura: '#6d28d9', tint: 'rgba(109,40,217,0.16)', next: ['meg_d3'] },
    { id: 'meg_d3', name: '라히게', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '👹', aura: '#5b21b6', tint: 'rgba(91,33,182,0.2)', next: [] },
  ]),

  // 계통 85: 브라키오사우루스 (숲/호수) — 공룡
  ...line('bra', [
    { id: 'bra', name: '미페', tier: 0, family: '생물형', type: '공룡형', emoji: '🦕', aura: '#84cc16', next: ['bra_g1', 'bra_w1'] },
    { id: 'bra_g1', name: '미유', tier: 1, family: '생물형', type: '공룡형', emoji: '🌿', aura: '#4ade80', next: ['bra_g2'] },
    { id: 'bra_g2', name: '히부오', tier: 2, family: '생물형', type: '거인형', emoji: '🦕', aura: '#16a34a', tint: 'rgba(22,163,74,0.16)', next: ['bra_g3'] },
    { id: 'bra_g3', name: '타코네', tier: 3, family: '신성·악마형', type: '성수형', emoji: '🌳', aura: '#15803d', tint: 'rgba(21,128,61,0.2)', next: [] },
    { id: 'bra_w1', name: '두타', tier: 1, family: '생물형', type: '공룡형', emoji: '🌊', aura: '#38bdf8', next: ['bra_w2'] },
    { id: 'bra_w2', name: '키레포', tier: 2, family: '생물형', type: '거인형', emoji: '🦕', aura: '#0ea5e9', tint: 'rgba(14,165,233,0.16)', next: ['bra_w3'] },
    { id: 'bra_w3', name: '모두타', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌊', aura: '#0369a1', tint: 'rgba(3,105,161,0.18)', next: [] },
  ]),

  // 계통 86: 모사사우루스 (심해/암흑) — 해양 공룡
  ...line('mos', [
    { id: 'mos', name: '마디', tier: 0, family: '생물형', type: '공룡형', emoji: '🐊', aura: '#0ea5e9', next: ['mos_w1', 'mos_d1'] },
    { id: 'mos_w1', name: '푸리', tier: 1, family: '생물형', type: '수생형', emoji: '🌊', aura: '#0284c7', next: ['mos_w2'] },
    { id: 'mos_w2', name: '조기부', tier: 2, family: '생물형', type: '수생형', emoji: '🐊', aura: '#0369a1', tint: 'rgba(3,105,161,0.16)', next: ['mos_w3'] },
    { id: 'mos_w3', name: '세쿠세', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌊', aura: '#075985', tint: 'rgba(7,89,133,0.2)', next: [] },
    { id: 'mos_d1', name: '소비', tier: 1, family: '신성·악마형', type: '악마형', emoji: '🌑', aura: '#7c3aed', next: ['mos_d2'] },
    { id: 'mos_d2', name: '에코쿠', tier: 2, family: '신성·악마형', type: '악마형', emoji: '🐊', aura: '#6d28d9', tint: 'rgba(109,40,217,0.16)', next: ['mos_d3'] },
    { id: 'mos_d3', name: '코피제', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '👹', aura: '#5b21b6', tint: 'rgba(91,33,182,0.2)', next: [] },
  ]),

  // 계통 87: 스피노사우루스 (강/화염) — 공룡
  ...line('spn', [
    { id: 'spn', name: '네루', tier: 0, family: '생물형', type: '공룡형', emoji: '🦖', aura: '#0ea5e9', next: ['spn_w1', 'spn_f1'] },
    { id: 'spn_w1', name: '오케', tier: 1, family: '생물형', type: '공룡형', emoji: '🌊', aura: '#0284c7', next: ['spn_w2'] },
    { id: 'spn_w2', name: '마세마', tier: 2, family: '생물형', type: '수생형', emoji: '🦖', aura: '#0369a1', tint: 'rgba(3,105,161,0.16)', next: ['spn_w3'] },
    { id: 'spn_w3', name: '소케노', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌊', aura: '#075985', tint: 'rgba(7,89,133,0.2)', next: [] },
    { id: 'spn_f1', name: '에미', tier: 1, family: '생물형', type: '공룡형', emoji: '🔥', aura: '#fb923c', next: ['spn_f2'] },
    { id: 'spn_f2', name: '마베마', tier: 2, family: '생물형', type: '공룡형', emoji: '🦖', aura: '#ea580c', tint: 'rgba(234,88,12,0.16)', next: ['spn_f3'] },
    { id: 'spn_f3', name: '오쿠히', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '🌋', aura: '#dc2626', tint: 'rgba(220,38,38,0.2)', next: [] },
  ]),

  // 계통 88: 범고래 (대양/어둠) — 해양
  ...line('orc', [
    { id: 'orc', name: '포히', tier: 0, family: '생물형', type: '수생형', emoji: '🐋', aura: '#38bdf8', next: ['orc_w1', 'orc_d1'] },
    { id: 'orc_w1', name: '토쿠', tier: 1, family: '생물형', type: '수생형', emoji: '🌊', aura: '#0ea5e9', next: ['orc_w2'] },
    { id: 'orc_w2', name: '고타세', tier: 2, family: '생물형', type: '수생형', emoji: '🐋', aura: '#0284c7', tint: 'rgba(2,132,199,0.16)', next: ['orc_w3'] },
    { id: 'orc_w3', name: '파피라', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌊', aura: '#0369a1', tint: 'rgba(3,105,161,0.2)', next: [] },
    { id: 'orc_d1', name: '레호', tier: 1, family: '신성·악마형', type: '악마형', emoji: '🌑', aura: '#7c3aed', next: ['orc_d2'] },
    { id: 'orc_d2', name: '제바고', tier: 2, family: '신성·악마형', type: '악마형', emoji: '🐋', aura: '#6d28d9', tint: 'rgba(109,40,217,0.16)', next: ['orc_d3'] },
    { id: 'orc_d3', name: '레자레', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '👹', aura: '#5b21b6', tint: 'rgba(91,33,182,0.2)', next: [] },
  ]),

  // 계통 89: 고래상어 (심해/별빛) — 해양
  ...line('wsh', [
    { id: 'wsh', name: '피자', tier: 0, family: '생물형', type: '수생형', emoji: '🦈', aura: '#38bdf8', next: ['wsh_w1', 'wsh_l1'] },
    { id: 'wsh_w1', name: '피나', tier: 1, family: '생물형', type: '수생형', emoji: '🌊', aura: '#0ea5e9', next: ['wsh_w2'] },
    { id: 'wsh_w2', name: '조유부', tier: 2, family: '생물형', type: '수생형', emoji: '🦈', aura: '#0284c7', tint: 'rgba(2,132,199,0.16)', next: ['wsh_w3'] },
    { id: 'wsh_w3', name: '호누호', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌊', aura: '#0369a1', tint: 'rgba(3,105,161,0.18)', next: [] },
    { id: 'wsh_l1', name: '조두', tier: 1, family: '생물형', type: '수생형', emoji: '⭐', aura: '#fde68a', next: ['wsh_l2'] },
    { id: 'wsh_l2', name: '도히도', tier: 2, family: '신성·악마형', type: '천체형', emoji: '🦈', aura: '#fcd34d', tint: 'rgba(252,211,77,0.16)', next: ['wsh_l3'] },
    { id: 'wsh_l3', name: '무데무', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌟', aura: '#f59e0b', tint: 'rgba(245,158,11,0.2)', next: [] },
  ]),

  // 계통 90: 개복치 (햇살/심해)
  ...line('mola', [
    { id: 'mola', name: '나이', tier: 0, family: '생물형', type: '수생형', emoji: '🐟', aura: '#38bdf8', next: ['mola_l1', 'mola_w1'] },
    { id: 'mola_l1', name: '노디', tier: 1, family: '생물형', type: '수생형', emoji: '☀️', aura: '#fcd34d', next: ['mola_l2'] },
    { id: 'mola_l2', name: '노베가', tier: 2, family: '생물형', type: '수생형', emoji: '🐟', aura: '#fbbf24', tint: 'rgba(251,191,36,0.16)', next: ['mola_l3'] },
    { id: 'mola_l3', name: '메소메', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌞', aura: '#f59e0b', tint: 'rgba(245,158,11,0.18)', next: [] },
    { id: 'mola_w1', name: '마누', tier: 1, family: '생물형', type: '수생형', emoji: '🌊', aura: '#0ea5e9', next: ['mola_w2'] },
    { id: 'mola_w2', name: '쿠헤파', tier: 2, family: '생물형', type: '수생형', emoji: '🐟', aura: '#0284c7', tint: 'rgba(2,132,199,0.16)', next: ['mola_w3'] },
    { id: 'mola_w3', name: '두토디', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌊', aura: '#0369a1', tint: 'rgba(3,105,161,0.2)', next: [] },
  ]),

  // 계통 91: 잠자리 (질풍/빛)
  ...line('dfl', [
    { id: 'dfl', name: '코미', tier: 0, family: '생물형', type: '곤충형', emoji: '🦗', aura: '#5eead4', next: ['dfl_w1', 'dfl_l1'] },
    { id: 'dfl_w1', name: '보무', tier: 1, family: '생물형', type: '곤충형', emoji: '🌪️', aura: '#2dd4bf', next: ['dfl_w2'] },
    { id: 'dfl_w2', name: '게조니', tier: 2, family: '생물형', type: '곤충형', emoji: '⚡', aura: '#14b8a6', tint: 'rgba(20,184,166,0.16)', next: ['dfl_w3'] },
    { id: 'dfl_w3', name: '제포제', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌀', aura: '#0d9488', tint: 'rgba(13,148,136,0.2)', next: [] },
    { id: 'dfl_l1', name: '사쿠', tier: 1, family: '생물형', type: '곤충형', emoji: '✨', aura: '#fde68a', next: ['dfl_l2'] },
    { id: 'dfl_l2', name: '쿠티에', tier: 2, family: '혼합·이형형', type: '이형형', emoji: '💠', aura: '#67e8f9', tint: 'rgba(103,232,249,0.16)', next: ['dfl_l3'] },
    { id: 'dfl_l3', name: '고이고', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌟', aura: '#fcd34d', tint: 'rgba(252,211,77,0.18)', next: [] },
  ]),

  // 계통 92: 무당벌레 (풀/불)
  ...line('lad', [
    { id: 'lad', name: '후도', tier: 0, family: '생물형', type: '곤충형', emoji: '🐞', aura: '#ef4444', next: ['lad_g1', 'lad_f1'] },
    { id: 'lad_g1', name: '오제', tier: 1, family: '생물형', type: '곤충형', emoji: '🌿', aura: '#84cc16', next: ['lad_g2'] },
    { id: 'lad_g2', name: '키주포', tier: 2, family: '생물형', type: '곤충형', emoji: '🌸', aura: '#22c55e', tint: 'rgba(34,197,94,0.16)', next: ['lad_g3'] },
    { id: 'lad_g3', name: '두카디', tier: 3, family: '신성·악마형', type: '천사형', emoji: '🍀', aura: '#16a34a', tint: 'rgba(22,163,74,0.18)', next: [] },
    { id: 'lad_f1', name: '카오', tier: 1, family: '생물형', type: '곤충형', emoji: '🔥', aura: '#fb923c', next: ['lad_f2'] },
    { id: 'lad_f2', name: '조카조', tier: 2, family: '생물형', type: '곤충형', emoji: '🐞', aura: '#ea580c', tint: 'rgba(234,88,12,0.16)', next: ['lad_f3'] },
    { id: 'lad_f3', name: '베사베', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌋', aura: '#dc2626', tint: 'rgba(220,38,38,0.2)', next: [] },
  ]),

  // 계통 93: 딱따구리 (강철부리/화염)
  ...line('wpk', [
    { id: 'wpk', name: '코나', tier: 0, family: '생물형', type: '조류형', emoji: '🐦', aura: '#ef4444', next: ['wpk_m1', 'wpk_f1'] },
    { id: 'wpk_m1', name: '후기', tier: 1, family: '생물형', type: '조류형', emoji: '🔨', aura: '#64748b', next: ['wpk_m2'] },
    { id: 'wpk_m2', name: '투리투', tier: 2, family: '기계형', type: '병기형', emoji: '🐦', aura: '#475569', tint: 'rgba(71,85,105,0.16)', next: ['wpk_m3'] },
    { id: 'wpk_m3', name: '조하조', tier: 3, family: '기계형', type: '순수기계형', emoji: '🛡️', aura: '#334155', tint: 'rgba(51,65,85,0.18)', next: [] },
    { id: 'wpk_f1', name: '후마', tier: 1, family: '생물형', type: '조류형', emoji: '🔥', aura: '#fb923c', next: ['wpk_f2'] },
    { id: 'wpk_f2', name: '타주네', tier: 2, family: '생물형', type: '조류형', emoji: '🐦', aura: '#ea580c', tint: 'rgba(234,88,12,0.16)', next: ['wpk_f3'] },
    { id: 'wpk_f3', name: '사비사', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌋', aura: '#dc2626', tint: 'rgba(220,38,38,0.2)', next: [] },
  ]),

  // 계통 94: 앵무새 (무지개/빛)
  ...line('prt', [
    { id: 'prt', name: '쿠포', tier: 0, family: '생물형', type: '조류형', emoji: '🦜', aura: '#22d3ee', next: ['prt_r1', 'prt_l1'] },
    { id: 'prt_r1', name: '이루', tier: 1, family: '혼합·이형형', type: '이형형', emoji: '🌈', aura: '#f0abfc', next: ['prt_r2'] },
    { id: 'prt_r2', name: '레비레', tier: 2, family: '혼합·이형형', type: '이형형', emoji: '🦜', aura: '#e879f9', tint: 'rgba(232,121,249,0.16)', next: ['prt_r3'] },
    { id: 'prt_r3', name: '루키루', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌈', aura: '#d946ef', tint: 'rgba(217,70,239,0.2)', next: [] },
    { id: 'prt_l1', name: '제가', tier: 1, family: '생물형', type: '조류형', emoji: '✨', aura: '#fde68a', next: ['prt_l2'] },
    { id: 'prt_l2', name: '제후제', tier: 2, family: '신성·악마형', type: '천사형', emoji: '🦜', aura: '#fcd34d', tint: 'rgba(252,211,77,0.16)', next: ['prt_l3'] },
    { id: 'prt_l3', name: '마도마', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌟', aura: '#f59e0b', tint: 'rgba(245,158,11,0.18)', next: [] },
  ]),

  // 계통 95: 웜뱃 (바위/숲) — 귀여움
  ...line('wom', [
    { id: 'wom', name: '티나', tier: 0, family: '생물형', type: '포유류형', emoji: '🐹', aura: '#a16207', next: ['wom_e1', 'wom_g1'] },
    { id: 'wom_e1', name: '투페', tier: 1, family: '생물형', type: '포유류형', emoji: '🪨', aura: '#78716c', next: ['wom_e2'] },
    { id: 'wom_e2', name: '파게라', tier: 2, family: '생물형', type: '거인형', emoji: '🐹', aura: '#57534e', tint: 'rgba(87,83,78,0.16)', next: ['wom_e3'] },
    { id: 'wom_e3', name: '사네사', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌍', aura: '#44403c', tint: 'rgba(68,64,60,0.18)', next: [] },
    { id: 'wom_g1', name: '쿠베', tier: 1, family: '생물형', type: '식물형', emoji: '🌿', aura: '#22c55e', next: ['wom_g2'] },
    { id: 'wom_g2', name: '오테유', tier: 2, family: '생물형', type: '식물형', emoji: '🐹', aura: '#16a34a', tint: 'rgba(22,163,74,0.16)', next: ['wom_g3'] },
    { id: 'wom_g3', name: '카에미', tier: 3, family: '신성·악마형', type: '성수형', emoji: '🌳', aura: '#15803d', tint: 'rgba(21,128,61,0.2)', next: [] },
  ]),

  // 계통 96: 그리핀 (빛/바람) — 신화
  ...line('grf', [
    { id: 'grf', name: '토비', tier: 0, family: '혼합·이형형', type: '환수형', emoji: '🦅', aura: '#fcd34d', next: ['grf_l1', 'grf_w1'] },
    { id: 'grf_l1', name: '노세', tier: 1, family: '혼합·이형형', type: '환수형', emoji: '✨', aura: '#fde68a', next: ['grf_l2'] },
    { id: 'grf_l2', name: '케두키', tier: 2, family: '혼합·이형형', type: '환수형', emoji: '🦅', aura: '#fcd34d', tint: 'rgba(252,211,77,0.16)', next: ['grf_l3'] },
    { id: 'grf_l3', name: '주보주', tier: 3, family: '신성·악마형', type: '천사형', emoji: '🌟', aura: '#f59e0b', tint: 'rgba(245,158,11,0.2)', next: [] },
    { id: 'grf_w1', name: '하에', tier: 1, family: '혼합·이형형', type: '환수형', emoji: '🌪️', aura: '#5eead4', next: ['grf_w2'] },
    { id: 'grf_w2', name: '소미노', tier: 2, family: '혼합·이형형', type: '환수형', emoji: '🦅', aura: '#2dd4bf', tint: 'rgba(45,212,191,0.16)', next: ['grf_w3'] },
    { id: 'grf_w3', name: '쿠보에', tier: 3, family: '신성·악마형', type: '환수형', emoji: '🌀', aura: '#14b8a6', tint: 'rgba(20,184,166,0.2)', next: [] },
  ]),

  // 계통 97: 불사조 (불/빛) — 신화
  ...line('phx', [
    { id: 'phx', name: '바네', tier: 0, family: '혼합·이형형', type: '환수형', emoji: '🐦', aura: '#fb923c', next: ['phx_f1', 'phx_l1'] },
    { id: 'phx_f1', name: '부니', tier: 1, family: '혼합·이형형', type: '환수형', emoji: '🔥', aura: '#fb923c', next: ['phx_f2'] },
    { id: 'phx_f2', name: '리쿠리', tier: 2, family: '혼합·이형형', type: '환수형', emoji: '🦅', aura: '#ea580c', tint: 'rgba(234,88,12,0.16)', next: ['phx_f3'], requires: 'seasonSummer' },
    { id: 'phx_f3', name: '메보메', tier: 3, family: '신성·악마형', type: '환수형', emoji: '🌋', aura: '#dc2626', tint: 'rgba(220,38,38,0.2)', next: [] },
    { id: 'phx_l1', name: '오구', tier: 1, family: '혼합·이형형', type: '환수형', emoji: '✨', aura: '#fde68a', next: ['phx_l2'] },
    { id: 'phx_l2', name: '시유시', tier: 2, family: '혼합·이형형', type: '환수형', emoji: '🦅', aura: '#fcd34d', tint: 'rgba(252,211,77,0.16)', next: ['phx_l3'] },
    { id: 'phx_l3', name: '하제하', tier: 3, family: '신성·악마형', type: '천사형', emoji: '🌟', aura: '#f59e0b', tint: 'rgba(245,158,11,0.2)', next: [] },
  ]),

  // 계통 98: 켈베로스 (불/어둠) — 신화
  ...line('cer', [
    { id: 'cer', name: '푸모', tier: 0, family: '혼합·이형형', type: '마수형', emoji: '🐕', aura: '#7c3aed', next: ['cer_f1', 'cer_d1'] },
    { id: 'cer_f1', name: '테니', tier: 1, family: '혼합·이형형', type: '마수형', emoji: '🔥', aura: '#fb923c', next: ['cer_f2'] },
    { id: 'cer_f2', name: '노푸가', tier: 2, family: '혼합·이형형', type: '마수형', emoji: '🐕', aura: '#ea580c', tint: 'rgba(234,88,12,0.16)', next: ['cer_f3'] },
    { id: 'cer_f3', name: '네노니', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '🌋', aura: '#dc2626', tint: 'rgba(220,38,38,0.2)', next: [] },
    { id: 'cer_d1', name: '제소', tier: 1, family: '신성·악마형', type: '마수형', emoji: '🌑', aura: '#a78bfa', next: ['cer_d2'] },
    { id: 'cer_d2', name: '마도기', tier: 2, family: '신성·악마형', type: '마수형', emoji: '🐕', aura: '#7c3aed', tint: 'rgba(124,58,237,0.16)', next: ['cer_d3'] },
    { id: 'cer_d3', name: '코투제', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '👹', aura: '#6d28d9', tint: 'rgba(109,40,217,0.2)', next: [] },
  ]),

  // 계통 99: 페가수스 (바람/빛) — 신화
  ...line('peg', [
    { id: 'peg', name: '후고', tier: 0, family: '혼합·이형형', type: '환수형', emoji: '🐴', aura: '#5eead4', next: ['peg_w1', 'peg_l1'] },
    { id: 'peg_w1', name: '디아', tier: 1, family: '혼합·이형형', type: '환수형', emoji: '🌪️', aura: '#2dd4bf', next: ['peg_w2'] },
    { id: 'peg_w2', name: '로피로', tier: 2, family: '혼합·이형형', type: '환수형', emoji: '🐴', aura: '#14b8a6', tint: 'rgba(20,184,166,0.16)', next: ['peg_w3'] },
    { id: 'peg_w3', name: '마베기', tier: 3, family: '신성·악마형', type: '환수형', emoji: '🌀', aura: '#0d9488', tint: 'rgba(13,148,136,0.2)', next: [] },
    { id: 'peg_l1', name: '테조', tier: 1, family: '혼합·이형형', type: '환수형', emoji: '✨', aura: '#fde68a', next: ['peg_l2'] },
    { id: 'peg_l2', name: '데오데', tier: 2, family: '혼합·이형형', type: '환수형', emoji: '🐴', aura: '#fcd34d', tint: 'rgba(252,211,77,0.16)', next: ['peg_l3'] },
    { id: 'peg_l3', name: '피부피', tier: 3, family: '신성·악마형', type: '천사형', emoji: '🌟', aura: '#f59e0b', tint: 'rgba(245,158,11,0.2)', next: [] },
  ]),

  // 계통 100: 크라켄 (물/어둠) — 신화
  ...line('krk', [
    { id: 'krk', name: '로데', tier: 0, family: '혼합·이형형', type: '수생형', emoji: '🐙', aura: '#0ea5e9', next: ['krk_w1', 'krk_d1'] },
    { id: 'krk_w1', name: '키테', tier: 1, family: '혼합·이형형', type: '수생형', emoji: '🌊', aura: '#0284c7', next: ['krk_w2'] },
    { id: 'krk_w2', name: '보시보', tier: 2, family: '혼합·이형형', type: '수생형', emoji: '🐙', aura: '#0369a1', tint: 'rgba(3,105,161,0.16)', next: ['krk_w3'] },
    { id: 'krk_w3', name: '토부카', tier: 3, family: '신성·악마형', type: '수생형', emoji: '🌊', aura: '#075985', tint: 'rgba(7,89,133,0.2)', next: [] },
    { id: 'krk_d1', name: '투에', tier: 1, family: '신성·악마형', type: '마수형', emoji: '🌑', aura: '#a78bfa', next: ['krk_d2'] },
    { id: 'krk_d2', name: '카두미', tier: 2, family: '신성·악마형', type: '마수형', emoji: '🐙', aura: '#7c3aed', tint: 'rgba(124,58,237,0.16)', next: ['krk_d3'] },
    { id: 'krk_d3', name: '투고투', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '👹', aura: '#5b21b6', tint: 'rgba(91,33,182,0.2)', next: [] },
  ]),

  // 계통 101: 바실리스크 (독/풀) — 신화
  ...line('bas', [
    { id: 'bas', name: '쿠케', tier: 0, family: '혼합·이형형', type: '마수형', emoji: '🐍', aura: '#84cc16', next: ['bas_p1', 'bas_g1'] },
    { id: 'bas_p1', name: '누소', tier: 1, family: '신성·악마형', type: '마수형', emoji: '☠️', aura: '#a3e635', next: ['bas_p2'] },
    { id: 'bas_p2', name: '고타고', tier: 2, family: '신성·악마형', type: '마수형', emoji: '🐍', aura: '#65a30d', tint: 'rgba(101,163,13,0.16)', next: ['bas_p3'] },
    { id: 'bas_p3', name: '제디고', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '☠️', aura: '#4d7c0f', tint: 'rgba(77,124,15,0.2)', next: [] },
    { id: 'bas_g1', name: '파투', tier: 1, family: '혼합·이형형', type: '마수형', emoji: '🌿', aura: '#4ade80', next: ['bas_g2'] },
    { id: 'bas_g2', name: '자리소', tier: 2, family: '혼합·이형형', type: '마수형', emoji: '🐍', aura: '#16a34a', tint: 'rgba(22,163,74,0.16)', next: ['bas_g3'] },
    { id: 'bas_g3', name: '타후모', tier: 3, family: '신성·악마형', type: '환수형', emoji: '🌳', aura: '#15803d', tint: 'rgba(21,128,61,0.2)', next: [] },
  ]),

  // 계통 102: 미노타우로스 (땅/불) — 신화
  ...line('min', [
    { id: 'min', name: '네카', tier: 0, family: '혼합·이형형', type: '환수형', emoji: '🐂', aura: '#a16207', next: ['min_e1', 'min_f1'] },
    { id: 'min_e1', name: '키부', tier: 1, family: '혼합·이형형', type: '환수형', emoji: '🪨', aura: '#78716c', next: ['min_e2'] },
    { id: 'min_e2', name: '메구메', tier: 2, family: '혼합·이형형', type: '거인형', emoji: '🐂', aura: '#57534e', tint: 'rgba(87,83,78,0.16)', next: ['min_e3'] },
    { id: 'min_e3', name: '미오테', tier: 3, family: '신성·악마형', type: '거인형', emoji: '🌍', aura: '#44403c', tint: 'rgba(68,64,60,0.2)', next: [] },
    { id: 'min_f1', name: '무라', tier: 1, family: '혼합·이형형', type: '환수형', emoji: '🔥', aura: '#fb923c', next: ['min_f2'] },
    { id: 'min_f2', name: '도티도', tier: 2, family: '혼합·이형형', type: '환수형', emoji: '🐂', aura: '#ea580c', tint: 'rgba(234,88,12,0.16)', next: ['min_f3'] },
    { id: 'min_f3', name: '포카페', tier: 3, family: '신성·악마형', type: '환수형', emoji: '🌋', aura: '#dc2626', tint: 'rgba(220,38,38,0.2)', next: [] },
  ]),

  // 계통 103: 켄타우로스 (바람/풀) — 신화
  ...line('cnt', [
    { id: 'cnt', name: '소주', tier: 0, family: '혼합·이형형', type: '환수형', emoji: '🏹', aura: '#5eead4', next: ['cnt_w1', 'cnt_g1'] },
    { id: 'cnt_w1', name: '포후', tier: 1, family: '혼합·이형형', type: '환수형', emoji: '🌪️', aura: '#2dd4bf', next: ['cnt_w2'] },
    { id: 'cnt_w2', name: '페무토', tier: 2, family: '혼합·이형형', type: '환수형', emoji: '🏹', aura: '#14b8a6', tint: 'rgba(20,184,166,0.16)', next: ['cnt_w3'] },
    { id: 'cnt_w3', name: '토피카', tier: 3, family: '신성·악마형', type: '환수형', emoji: '🌀', aura: '#0d9488', tint: 'rgba(13,148,136,0.2)', next: [] },
    { id: 'cnt_g1', name: '아테', tier: 1, family: '혼합·이형형', type: '환수형', emoji: '🌿', aura: '#4ade80', next: ['cnt_g2'] },
    { id: 'cnt_g2', name: '타포네', tier: 2, family: '혼합·이형형', type: '환수형', emoji: '🏹', aura: '#16a34a', tint: 'rgba(22,163,74,0.16)', next: ['cnt_g3'] },
    { id: 'cnt_g3', name: '카소미', tier: 3, family: '신성·악마형', type: '성수형', emoji: '🌳', aura: '#15803d', tint: 'rgba(21,128,61,0.2)', next: [] },
  ]),

  // 계통 104: 하피 (바람/어둠) — 신화
  ...line('hpy', [
    { id: 'hpy', name: '두하', tier: 0, family: '혼합·이형형', type: '환수형', emoji: '🦅', aura: '#5eead4', next: ['hpy_w1', 'hpy_d1'] },
    { id: 'hpy_w1', name: '오키', tier: 1, family: '혼합·이형형', type: '환수형', emoji: '🌪️', aura: '#2dd4bf', next: ['hpy_w2'] },
    { id: 'hpy_w2', name: '보디마', tier: 2, family: '혼합·이형형', type: '환수형', emoji: '🦅', aura: '#14b8a6', tint: 'rgba(20,184,166,0.16)', next: ['hpy_w3'] },
    { id: 'hpy_w3', name: '포하페', tier: 3, family: '신성·악마형', type: '환수형', emoji: '🌀', aura: '#0d9488', tint: 'rgba(13,148,136,0.2)', next: [] },
    { id: 'hpy_d1', name: '아미', tier: 1, family: '신성·악마형', type: '마수형', emoji: '🌑', aura: '#a78bfa', next: ['hpy_d2'] },
    { id: 'hpy_d2', name: '사에사', tier: 2, family: '신성·악마형', type: '마수형', emoji: '🦅', aura: '#7c3aed', tint: 'rgba(124,58,237,0.16)', next: ['hpy_d3'] },
    { id: 'hpy_d3', name: '부기호', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '👹', aura: '#6d28d9', tint: 'rgba(109,40,217,0.2)', next: [] },
  ]),

  // 계통 105: 인어 (물/빛) — 신화
  ...line('mer', [
    { id: 'mer', name: '코메', tier: 0, family: '혼합·이형형', type: '수생형', emoji: '🧜', aura: '#38bdf8', next: ['mer_w1', 'mer_l1'] },
    { id: 'mer_w1', name: '루제', tier: 1, family: '혼합·이형형', type: '수생형', emoji: '🌊', aura: '#0ea5e9', next: ['mer_w2'] },
    { id: 'mer_w2', name: '케유키', tier: 2, family: '혼합·이형형', type: '수생형', emoji: '🧜', aura: '#0284c7', tint: 'rgba(2,132,199,0.16)', next: ['mer_w3'] },
    { id: 'mer_w3', name: '로바로', tier: 3, family: '신성·악마형', type: '수생형', emoji: '🌊', aura: '#0369a1', tint: 'rgba(3,105,161,0.2)', next: [] },
    { id: 'mer_l1', name: '무파', tier: 1, family: '혼합·이형형', type: '수생형', emoji: '✨', aura: '#fde68a', next: ['mer_l2'] },
    { id: 'mer_l2', name: '루라루', tier: 2, family: '혼합·이형형', type: '수생형', emoji: '🧜', aura: '#fcd34d', tint: 'rgba(252,211,77,0.16)', next: ['mer_l3'] },
    { id: 'mer_l3', name: '기쿠기', tier: 3, family: '신성·악마형', type: '천사형', emoji: '🌟', aura: '#f59e0b', tint: 'rgba(245,158,11,0.2)', next: [] },
  ]),

  // 계통 106: 골렘 (땅/불) — 신화
  ...line('gol', [
    { id: 'gol', name: '모테', tier: 0, family: '혼합·이형형', type: '환수형', emoji: '🗿', aura: '#a16207', next: ['gol_e1', 'gol_f1'] },
    { id: 'gol_e1', name: '파시', tier: 1, family: '혼합·이형형', type: '거인형', emoji: '🪨', aura: '#78716c', next: ['gol_e2'] },
    { id: 'gol_e2', name: '소페노', tier: 2, family: '혼합·이형형', type: '거인형', emoji: '🗿', aura: '#57534e', tint: 'rgba(87,83,78,0.16)', next: ['gol_e3'] },
    { id: 'gol_e3', name: '히게오', tier: 3, family: '신성·악마형', type: '거인형', emoji: '🌍', aura: '#44403c', tint: 'rgba(68,64,60,0.2)', next: [] },
    { id: 'gol_f1', name: '코누', tier: 1, family: '혼합·이형형', type: '거인형', emoji: '🔥', aura: '#fb923c', next: ['gol_f2'] },
    { id: 'gol_f2', name: '투이투', tier: 2, family: '혼합·이형형', type: '거인형', emoji: '🗿', aura: '#ea580c', tint: 'rgba(234,88,12,0.16)', next: ['gol_f3'] },
    { id: 'gol_f3', name: '아헤아', tier: 3, family: '신성·악마형', type: '환수형', emoji: '🌋', aura: '#dc2626', tint: 'rgba(220,38,38,0.2)', next: [] },
  ]),

  // 계통 107: 와이번 (불/바람) — 신화
  ...line('wyv', [
    { id: 'wyv', name: '네가', tier: 0, family: '혼합·이형형', type: '용형', emoji: '🐉', aura: '#fb923c', next: ['wyv_f1', 'wyv_w1'] },
    { id: 'wyv_f1', name: '테하', tier: 1, family: '혼합·이형형', type: '용형', emoji: '🔥', aura: '#fb923c', next: ['wyv_f2'] },
    { id: 'wyv_f2', name: '부다부', tier: 2, family: '혼합·이형형', type: '용형', emoji: '🐉', aura: '#ea580c', tint: 'rgba(234,88,12,0.16)', next: ['wyv_f3'] },
    { id: 'wyv_f3', name: '데기데', tier: 3, family: '신성·악마형', type: '용형', emoji: '🌋', aura: '#dc2626', tint: 'rgba(220,38,38,0.2)', next: [] },
    { id: 'wyv_w1', name: '헤모', tier: 1, family: '혼합·이형형', type: '용형', emoji: '🌪️', aura: '#2dd4bf', next: ['wyv_w2'] },
    { id: 'wyv_w2', name: '테토자', tier: 2, family: '혼합·이형형', type: '용형', emoji: '🐉', aura: '#14b8a6', tint: 'rgba(20,184,166,0.16)', next: ['wyv_w3'] },
    { id: 'wyv_w3', name: '도테도', tier: 3, family: '신성·악마형', type: '용형', emoji: '🌀', aura: '#0d9488', tint: 'rgba(13,148,136,0.2)', next: [] },
  ]),

  // 계통 108: 히드라 (물/독) — 신화
  ...line('hyd', [
    { id: 'hyd', name: '포케', tier: 0, family: '혼합·이형형', type: '용형', emoji: '🐉', aura: '#0ea5e9', next: ['hyd_w1', 'hyd_p1'] },
    { id: 'hyd_w1', name: '테푸', tier: 1, family: '혼합·이형형', type: '용형', emoji: '🌊', aura: '#0284c7', next: ['hyd_w2'] },
    { id: 'hyd_w2', name: '니도게', tier: 2, family: '혼합·이형형', type: '용형', emoji: '🐉', aura: '#0369a1', tint: 'rgba(3,105,161,0.16)', next: ['hyd_w3'] },
    { id: 'hyd_w3', name: '카구미', tier: 3, family: '신성·악마형', type: '용형', emoji: '🌊', aura: '#075985', tint: 'rgba(7,89,133,0.2)', next: [] },
    { id: 'hyd_p1', name: '데리', tier: 1, family: '신성·악마형', type: '용형', emoji: '☠️', aura: '#a3e635', next: ['hyd_p2'] },
    { id: 'hyd_p2', name: '쿠소에', tier: 2, family: '신성·악마형', type: '용형', emoji: '🐉', aura: '#65a30d', tint: 'rgba(101,163,13,0.16)', next: ['hyd_p3'] },
    { id: 'hyd_p3', name: '다누케', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '👹', aura: '#4d7c0f', tint: 'rgba(77,124,15,0.2)', next: [] },
  ]),

  // 계통 109: 요정 (풀/빛) — 신화
  ...line('fai', [
    { id: 'fai', name: '두유', tier: 0, family: '혼합·이형형', type: '요정형', emoji: '🧚', aura: '#a3e635', next: ['fai_g1', 'fai_l1'] },
    { id: 'fai_g1', name: '후디', tier: 1, family: '혼합·이형형', type: '요정형', emoji: '🌿', aura: '#4ade80', next: ['fai_g2'] },
    { id: 'fai_g2', name: '오네히', tier: 2, family: '혼합·이형형', type: '요정형', emoji: '🌸', aura: '#22c55e', tint: 'rgba(34,197,94,0.16)', next: ['fai_g3'] },
    { id: 'fai_g3', name: '사로사', tier: 3, family: '신성·악마형', type: '성수형', emoji: '🌳', aura: '#15803d', tint: 'rgba(21,128,61,0.2)', next: [] },
    { id: 'fai_l1', name: '두오', tier: 1, family: '혼합·이형형', type: '요정형', emoji: '✨', aura: '#fde68a', next: ['fai_l2'] },
    { id: 'fai_l2', name: '네노타', tier: 2, family: '혼합·이형형', type: '요정형', emoji: '⭐', aura: '#fcd34d', tint: 'rgba(252,211,77,0.16)', next: ['fai_l3'] },
    { id: 'fai_l3', name: '노쿠가', tier: 3, family: '신성·악마형', type: '천사형', emoji: '🌟', aura: '#f59e0b', tint: 'rgba(245,158,11,0.2)', next: [] },
  ]),

  // 계통 110: 구미호 (불/어둠) — 한국 신화
  ...line('gmh', [
    { id: 'gmh', name: '미소', tier: 0, family: '혼합·이형형', type: '환수형', emoji: '🦊', aura: '#fb7185', next: ['gmh_f1', 'gmh_d1'] },
    { id: 'gmh_f1', name: '포테', tier: 1, family: '혼합·이형형', type: '환수형', emoji: '🔥', aura: '#fb923c', next: ['gmh_f2'] },
    { id: 'gmh_f2', name: '디고두', tier: 2, family: '혼합·이형형', type: '환수형', emoji: '🦊', aura: '#ea580c', tint: 'rgba(234,88,12,0.16)', next: ['gmh_f3'] },
    { id: 'gmh_f3', name: '디고유', tier: 3, family: '신성·악마형', type: '환수형', emoji: '🌋', aura: '#dc2626', tint: 'rgba(220,38,38,0.2)', next: [] },
    { id: 'gmh_d1', name: '페호', tier: 1, family: '신성·악마형', type: '마수형', emoji: '🌑', aura: '#a78bfa', next: ['gmh_d2'] },
    { id: 'gmh_d2', name: '도네도', tier: 2, family: '신성·악마형', type: '마수형', emoji: '🦊', aura: '#7c3aed', tint: 'rgba(124,58,237,0.16)', next: ['gmh_d3'] },
    { id: 'gmh_d3', name: '보레보', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '👹', aura: '#6d28d9', tint: 'rgba(109,40,217,0.2)', next: [] },
  ]),

  // 계통 111: 해태 (불/빛) — 한국 신화
  ...line('hat', [
    { id: 'hat', name: '두마', tier: 0, family: '혼합·이형형', type: '환수형', emoji: '🦁', aura: '#fbbf24', next: ['hat_f1', 'hat_l1'] },
    { id: 'hat_f1', name: '쿠유', tier: 1, family: '혼합·이형형', type: '환수형', emoji: '🔥', aura: '#fb923c', next: ['hat_f2'] },
    { id: 'hat_f2', name: '기에기', tier: 2, family: '혼합·이형형', type: '환수형', emoji: '🦁', aura: '#ea580c', tint: 'rgba(234,88,12,0.16)', next: ['hat_f3'] },
    { id: 'hat_f3', name: '모구타', tier: 3, family: '신성·악마형', type: '성수형', emoji: '🌋', aura: '#dc2626', tint: 'rgba(220,38,38,0.2)', next: [] },
    { id: 'hat_l1', name: '피타', tier: 1, family: '혼합·이형형', type: '환수형', emoji: '✨', aura: '#fde68a', next: ['hat_l2'] },
    { id: 'hat_l2', name: '시파시', tier: 2, family: '혼합·이형형', type: '환수형', emoji: '🦁', aura: '#fcd34d', tint: 'rgba(252,211,77,0.16)', next: ['hat_l3'] },
    { id: 'hat_l3', name: '마세기', tier: 3, family: '신성·악마형', type: '성수형', emoji: '🌟', aura: '#f59e0b', tint: 'rgba(245,158,11,0.2)', next: [] },
  ]),

  // 히든: 사신수
  ...line('div_four', [
    { id: 'hid_azure', name: '청룡', tier: 3, family: '신성·악마형', type: '신수형', emoji: '🐲', aura: '#22c55e', tint: 'rgba(34,197,94,0.2)', next: ['hid_huanglong'], hidden: true, lore: '동방을 수호하는 봄의 청룡. 비와 바람을 다스린다.' },
    { id: 'hid_white', name: '백호', tier: 3, family: '신성·악마형', type: '신수형', emoji: '🐯', aura: '#e5e7eb', tint: 'rgba(229,231,235,0.18)', next: ['hid_huanglong'], hidden: true, lore: '서방을 수호하는 가을의 백호. 무용과 정의의 상징.' },
    { id: 'hid_vermilion', name: '주작', tier: 3, family: '신성·악마형', type: '신수형', emoji: '🦅', aura: '#ef4444', tint: 'rgba(239,68,68,0.2)', next: ['hid_huanglong'], hidden: true, lore: '남방을 수호하는 여름의 주작. 불꽃의 신조.' },
    { id: 'hid_black', name: '현무', tier: 3, family: '신성·악마형', type: '신수형', emoji: '🐢', aura: '#1d4ed8', tint: 'rgba(29,78,216,0.2)', next: ['hid_huanglong'], hidden: true, lore: '북방을 수호하는 겨울의 현무. 장수와 지혜의 수호신.' },
  ]),

  // 히든: 황룡 (사신수 대장, 초궁극체)
  ...line('div_lord', [
    { id: 'hid_huanglong', name: '황룡', tier: 4, family: '신성·악마형', type: '신수형', emoji: '🐉', aura: '#fbbf24', tint: 'rgba(251,191,36,0.25)', next: [], hidden: true, lore: '중앙을 다스리며 사신수를 거느리는 황제룡. 만물의 중심.' },
  ]),

  // 히든: 사흉수
  ...line('div_fiend', [
    { id: 'hid_hundun', name: '혼돈', tier: 3, family: '혼합·이형형', type: '흉수형', emoji: '🌀', aura: '#6d28d9', tint: 'rgba(109,40,217,0.22)', next: [], hidden: true, lore: '얼굴 없는 혼돈의 짐승. 선악을 구별하지 못한다.' },
    { id: 'hid_taotie', name: '도철', tier: 3, family: '혼합·이형형', type: '흉수형', emoji: '👹', aura: '#b91c1c', tint: 'rgba(185,28,28,0.22)', next: [], hidden: true, lore: '끝없는 식욕의 흉수. 무엇이든 집어삼킨다.' },
    { id: 'hid_qiongqi', name: '궁기', tier: 3, family: '혼합·이형형', type: '흉수형', emoji: '🦁', aura: '#9333ea', tint: 'rgba(147,51,234,0.22)', next: [], hidden: true, lore: '날개 달린 호랑이. 악을 부추기고 선을 해친다.' },
    { id: 'hid_taowu', name: '도올', tier: 3, family: '혼합·이형형', type: '흉수형', emoji: '🐗', aura: '#7c2d12', tint: 'rgba(124,45,18,0.22)', next: [], hidden: true, lore: '고집불통의 흉수. 누구도 굴복시킬 수 없다.' },
  ]),

  // 히든: 4대천사
  ...line('div_angel', [
    { id: 'hid_michael', name: '미카엘', tier: 3, family: '신성·악마형', type: '대천사형', emoji: '⚔️', aura: '#fcd34d', tint: 'rgba(252,211,77,0.2)', next: [], hidden: true, lore: '천군을 이끄는 대천사. 정의의 불검을 휘두른다.' },
    { id: 'hid_gabriel', name: '가브리엘', tier: 3, family: '신성·악마형', type: '대천사형', emoji: '🎺', aura: '#fef3c7', tint: 'rgba(254,243,199,0.2)', next: [], hidden: true, lore: '신의 전령. 그 나팔 소리가 세상에 울려퍼진다.' },
    { id: 'hid_raphael', name: '라파엘', tier: 3, family: '신성·악마형', type: '대천사형', emoji: '💚', aura: '#86efac', tint: 'rgba(134,239,172,0.2)', next: [], hidden: true, lore: '치유의 대천사. 모든 상처를 어루만진다.' },
    { id: 'hid_uriel', name: '우리엘', tier: 3, family: '신성·악마형', type: '대천사형', emoji: '🔥', aura: '#fdba74', tint: 'rgba(253,186,116,0.2)', next: [], hidden: true, lore: '지혜의 불꽃을 든 대천사. 진리를 비춘다.' },
  ]),

  // 히든: 7대 죄악마
  ...line('div_sin', [
    { id: 'hid_pride', name: '루시퍼', tier: 3, family: '신성·악마형', type: '마신형', emoji: '👑', aura: '#c084fc', tint: 'rgba(192,132,252,0.2)', next: [], hidden: true, lore: '가장 빛났던, 그러나 가장 오만했던 타락한 빛.' },
    { id: 'hid_greed', name: '마몬', tier: 3, family: '신성·악마형', type: '마신형', emoji: '💰', aura: '#fbbf24', tint: 'rgba(251,191,36,0.2)', next: [], hidden: true, lore: '끝없는 부를 갈망하는 황금의 악마.' },
    { id: 'hid_lust', name: '아스모', tier: 3, family: '신성·악마형', type: '마신형', emoji: '💋', aura: '#fb7185', tint: 'rgba(251,113,133,0.2)', next: [], hidden: true, lore: '채울 수 없는 욕망을 다스리는 악마.' },
    { id: 'hid_envy', name: '레비아탄', tier: 3, family: '신성·악마형', type: '마신형', emoji: '🐍', aura: '#22d3ee', tint: 'rgba(34,211,238,0.2)', next: [], hidden: true, lore: '바다의 거대한 뱀. 모든 것을 시기한다.' },
    { id: 'hid_sloth', name: '벨페고르', tier: 3, family: '신성·악마형', type: '마신형', emoji: '😴', aura: '#a3a3a3', tint: 'rgba(163,163,163,0.2)', next: [], hidden: true, lore: '게으름을 퍼뜨리는 나태의 군주.' },
    { id: 'hid_wrath', name: '사탄', tier: 3, family: '신성·악마형', type: '마신형', emoji: '😡', aura: '#ef4444', tint: 'rgba(239,68,68,0.22)', next: [], hidden: true, lore: '타오르는 분노로 군림하는 대적자.' },
    { id: 'hid_gluttony', name: '베엘제붑', tier: 3, family: '신성·악마형', type: '마신형', emoji: '🪰', aura: '#65a30d', tint: 'rgba(101,163,13,0.2)', next: [], hidden: true, lore: '파리들의 왕. 모든 것을 게걸스레 삼킨다.' },
  ]),

  // 히든: 12지신
  ...line('div_zodiac', [
    { id: 'hid_rat', name: '쥐신', tier: 3, family: '신성·악마형', type: '수호형', emoji: '🐀', aura: '#94a3b8', next: [], hidden: true },
    { id: 'hid_ox', name: '소신', tier: 3, family: '신성·악마형', type: '수호형', emoji: '🐂', aura: '#a16207', next: [], hidden: true },
    { id: 'hid_tiger', name: '호랑이신', tier: 3, family: '신성·악마형', type: '수호형', emoji: '🐅', aura: '#f59e0b', next: [], hidden: true },
    { id: 'hid_rabbit', name: '토끼신', tier: 3, family: '신성·악마형', type: '수호형', emoji: '🐇', aura: '#f9a8d4', next: [], hidden: true },
    { id: 'hid_dragon', name: '용신', tier: 3, family: '신성·악마형', type: '수호형', emoji: '🐉', aura: '#22c55e', next: [], hidden: true },
    { id: 'hid_snake', name: '뱀신', tier: 3, family: '신성·악마형', type: '수호형', emoji: '🐍', aura: '#84cc16', next: [], hidden: true },
    { id: 'hid_horse', name: '말신', tier: 3, family: '신성·악마형', type: '수호형', emoji: '🐎', aura: '#b45309', next: [], hidden: true },
    { id: 'hid_goat', name: '양신', tier: 3, family: '신성·악마형', type: '수호형', emoji: '🐐', aura: '#e5e7eb', next: [], hidden: true },
    { id: 'hid_monkey', name: '원숭이신', tier: 3, family: '신성·악마형', type: '수호형', emoji: '🐒', aura: '#a16207', next: [], hidden: true },
    { id: 'hid_rooster', name: '닭신', tier: 3, family: '신성·악마형', type: '수호형', emoji: '🐓', aura: '#ef4444', next: [], hidden: true },
    { id: 'hid_dog', name: '개신', tier: 3, family: '신성·악마형', type: '수호형', emoji: '🐕', aura: '#d6a77a', next: [], hidden: true },
    { id: 'hid_pig', name: '돼지신', tier: 3, family: '신성·악마형', type: '수호형', emoji: '🐖', aura: '#f9a8d4', next: [], hidden: true },
  ]),

  // 합체 전용 형태 (가챠로 안 나옴, 합체 진화 결과)
  ...line('fuse', [
    { id: 'fuse_light', name: '테소자', tier: 3, family: '신성·악마형', type: '신인형', emoji: '🌟', aura: '#fde68a', tint: 'rgba(253,230,138,0.2)', next: [] },
    { id: 'fuse_dark', name: '레도레', tier: 3, family: '신성·악마형', type: '마왕형', emoji: '🌑', aura: '#7c3aed', tint: 'rgba(124,58,237,0.2)', next: [] },
    { id: 'fuse_steel', name: '니타네', tier: 3, family: '기계형', type: '순수기계형', emoji: '🛡️', aura: '#94a3b8', tint: 'rgba(148,163,184,0.2)', next: [] },
    { id: 'fuse_chaos', name: '조제부', tier: 3, family: '혼합·이형형', type: '키메라형', emoji: '🌀', aura: '#f0abfc', tint: 'rgba(240,171,252,0.2)', next: [] },
  ]),
]


// ── 유년기 정식 편입 (디지몬식: 적은 유년기 → 여러 성장기로 분화) ──
// 기존 폼 tier를 +1 밀어 자리를 만들고(성장기=1 … 궁극체=4),
// 유년기(24종)를 tier 0로 넣는다. next = 그 유년기가 분화하는 성장기(line root)들.
for (const f of FORMS) f.tier += 1
for (const b of BABY_FORMS) {
  FORMS.push({
    id: b.id,
    name: b.name,
    tier: 0,
    line: b.id,
    family: b.family,
    type: '유년기',
   
    emoji: b.emoji,
    aura: b.aura,
    next: [...b.starters],
  })
}

const FORM_MAP: Record<string, Form> = Object.fromEntries(
  FORMS.map((f) => [f.id, f]),
)

export function formById(id: string): Form {
  return FORM_MAP[id] ?? FORMS[0]
}

/** 다음 진화 후보들 */
export function nextForms(id: string): Form[] {
  return formById(id).next.map(formById)
}

/** 한 계통의 모든 형태 */
export function lineForms(lineId: string): Form[] {
  return FORMS.filter((f) => f.line === lineId)
}

const BABY_FORM_MAP: Record<string, BabyForm> = Object.fromEntries(
  BABY_FORMS.map((f) => [f.id, f]),
)

export function babyFormById(id: string): BabyForm {
  return BABY_FORM_MAP[id] ?? BABY_FORMS[0]
}

/** 특정 성장기 line으로 분화 가능한 유년기 후보 */
export function babyFormsForStarter(lineId: string): BabyForm[] {
  return BABY_FORMS.filter((f) => f.starters.includes(lineId))
}

/** 시작 형태 목록 = 유년기(tier 0) */
export const STARTERS = FORMS.filter((f) => f.tier === 0)

/** 성장기 계통 루트(도감 트리용). 각 line의 최하위(구 스타터, 이제 tier 1) */
export const GROWTH_ROOTS = FORMS.filter((f) => f.tier === 1 && f.id === f.line)

/** 히든(각성 전용) 형태 전체 */
export const HIDDEN_FORMS = FORMS.filter((f) => f.hidden)

/** 합체 전용 형태 (합성 진화 결과 — 도감 별도 섹션) */
export const FUSION_FORMS = lineForms('fuse')

/** 각성 세트 (히든 컨셉별) */
export const FOUR_SYMBOLS = lineForms('div_four')
export const ZODIAC = lineForms('div_zodiac')
export const ARCHANGELS = lineForms('div_angel')
export const SINS = lineForms('div_sin')
export const FIENDS = lineForms('div_fiend')
/** 사신수 대장 (초궁극체) */
export const HUANGLONG = formById('hid_huanglong')

/** 시작 형태(유년기) 균등 랜덤 뽑기 */
export function rollStarter(): Form {
  return STARTERS[Math.floor(Math.random() * STARTERS.length)]
}

/** id로부터 안정적인 시작 형태 (구버전 펫 마이그레이션용) */
export function starterFromId(id: string): Form {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return STARTERS[h % STARTERS.length]
}

/**
 * 두 형태를 합쳤을 때 나오는 합체 형태 — 두 펫의 진화 단계 합으로 결정.
 * 많이 키운 조합일수록 신성한 형태 (합 7~8=테소자, 5~6=레도레, 3~4=니타네, 0~2=조제부)
 */
export function fusionResult(a: Form, b: Form): Form {
  const sum = a.tier + b.tier
  if (sum >= 7) return formById('fuse_light')
  if (sum >= 5) return formById('fuse_dark')
  if (sum >= 3) return formById('fuse_steel')
  return formById('fuse_chaos')
}
