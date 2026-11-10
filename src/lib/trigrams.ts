export type TrigramId = 'qian' | 'dui' | 'li' | 'zhen' | 'xun' | 'kan' | 'gen' | 'kun'

/** 气机方向：升＝阳气上行，降＝阴气下行（气交分析的基础） */
export type QiDirection = 'up' | 'down'

export interface Trigram {
  id: TrigramId
  /** 卦名，如「乾」 */
  name: string
  /** 自然取象，如「天」 */
  nature: string
  /** 三爻，自下而上，1＝阳爻，0＝阴爻 */
  lines: [0 | 1, 0 | 1, 0 | 1]
  /** 先天八卦数（梅花易数起卦用）：乾一兑二离三震四巽五坎六艮七坤八 */
  xiantianNum: number
  /** 五行 */
  element: '金' | '木' | '水' | '火' | '土'
  /** 卦德（《说卦》：乾健也，坤顺也……） */
  virtue: string
  virtueDesc: string
  /** 气机方向 */
  qi: QiDirection
  qiDesc: string
  /** 家人角色 */
  family: string
  /** 身体部位（说卦：乾为首……） */
  body: string
  /** 动物（说卦：乾为马……） */
  animal: string
  /** 后天方位 */
  direction: string
  /** 季节时令 */
  season: string
  /** 意象一句话 */
  image: string
  /** 性格 */
  character: string
  /** 给人的启示 */
  wisdom: string
}

export const TRIGRAMS: Trigram[] = [
  {
    id: 'qian',
    name: '乾',
    nature: '天',
    lines: [1, 1, 1],
    xiantianNum: 1,
    element: '金',
    virtue: '健',
    virtueDesc: '刚健不息，自强不已',
    qi: 'up',
    qiDesc: '天气轻清，阳气上行',
    family: '父',
    body: '首',
    animal: '马',
    direction: '西北',
    season: '秋冬之交',
    image: '浩瀚苍天，刚健运行，永不停歇',
    character: '开创、进取、果决，是天生的开拓者，停不下来的「永动机」',
    wisdom: '天行健，君子以自强不息。主创造，宜主动出击。',
  },
  {
    id: 'kun',
    name: '坤',
    nature: '地',
    lines: [0, 0, 0],
    xiantianNum: 8,
    element: '土',
    virtue: '顺',
    virtueDesc: '厚德载物，柔顺包容',
    qi: 'down',
    qiDesc: '地气重浊，阴气下沉',
    family: '母',
    body: '腹',
    animal: '牛',
    direction: '西南',
    season: '长夏',
    image: '厚实大地，承载万物，默默滋养',
    character: '包容、忍耐、配合，甘居人后，以柔克刚',
    wisdom: '地势坤，君子以厚德载物。主承载，宜静待时机。',
  },
  {
    id: 'zhen',
    name: '震',
    nature: '雷',
    lines: [1, 0, 0],
    xiantianNum: 4,
    element: '木',
    virtue: '动',
    virtueDesc: '雷厉风行，奋起而动',
    qi: 'up',
    qiDesc: '阳气在下，奋起上冲',
    family: '长男',
    body: '足',
    animal: '龙',
    direction: '东',
    season: '春',
    image: '春雷乍响，万物惊醒，阳气破土而出',
    character: '行动力强，雷厉风行，但易冲动鲁莽',
    wisdom: '沉闷的局面下，需要破局的勇气和行动。',
  },
  {
    id: 'xun',
    name: '巽',
    nature: '风',
    lines: [0, 1, 1],
    xiantianNum: 5,
    element: '木',
    virtue: '入',
    virtueDesc: '随风入夜，无孔不入',
    qi: 'down',
    qiDesc: '风气渗透，下行无孔不入',
    family: '长女',
    body: '股',
    animal: '鸡',
    direction: '东南',
    season: '春夏之交',
    image: '和风拂面，看似温柔，却吹遍每个角落',
    character: '谦逊温和，善于沟通、渗透与深入',
    wisdom: '以柔和的方式达成目标，润物细无声。',
  },
  {
    id: 'kan',
    name: '坎',
    nature: '水',
    lines: [1, 0, 1],
    xiantianNum: 6,
    element: '水',
    virtue: '陷',
    virtueDesc: '水润而下，行险不失',
    qi: 'down',
    qiDesc: '水性润下，流于低处',
    family: '中男',
    body: '耳',
    animal: '豕',
    direction: '北',
    season: '冬',
    image: '滔滔大水，外柔内刚，深处暗藏险陷',
    character: '深沉多谋，坚韧不拔，但风险与考验常伴',
    wisdom: '人生路上布满陷阱，谨慎运用智慧，方能渡过难关。',
  },
  {
    id: 'li',
    name: '离',
    nature: '火',
    lines: [0, 1, 0],
    xiantianNum: 3,
    element: '火',
    virtue: '丽',
    virtueDesc: '附着光明，文明之象',
    qi: 'up',
    qiDesc: '火性炎上，光热升腾',
    family: '中女',
    body: '目',
    animal: '雉',
    direction: '南',
    season: '夏',
    image: '熊熊火焰，外部明亮，核心虚空',
    character: '热情明理，才华外露，但易虚华不实',
    wisdom: '像太阳依附天空普照万物，传播文明与智慧。',
  },
  {
    id: 'gen',
    name: '艮',
    nature: '山',
    lines: [0, 0, 1],
    xiantianNum: 7,
    element: '土',
    virtue: '止',
    virtueDesc: '稳重如山，知止而后安',
    qi: 'down',
    qiDesc: '阳气至顶而止，静定不动',
    family: '少男',
    body: '手',
    animal: '狗',
    direction: '东北',
    season: '冬春之交',
    image: '巍峨高山，巍然屹立，停止不动',
    character: '沉稳笃实，但有时固执保守',
    wisdom: '知止的智慧：在适当的时候停下来，才能看得更清、走得更远。',
  },
  {
    id: 'dui',
    name: '兑',
    nature: '泽',
    lines: [1, 1, 0],
    xiantianNum: 2,
    element: '金',
    virtue: '悦',
    virtueDesc: '泽润而悦，口舌生欢',
    qi: 'down',
    qiDesc: '泽气下沉，润泽低处',
    family: '少女',
    body: '口',
    animal: '羊',
    direction: '西',
    season: '秋',
    image: '开口的湖泊，如一张微笑的嘴',
    character: '乐观健谈，善于言辞，给周围带来快乐',
    wisdom: '与朋友讲习交流，是人生一大乐事。',
  },
]

/** 先天数 → 卦（梅花易数起卦映射） */
export const TRIGRAM_BY_NUM: Record<number, Trigram> = Object.fromEntries(
  TRIGRAMS.map((t) => [t.xiantianNum, t]),
) as Record<number, Trigram>

export const TRIGRAM_BY_ID: Record<TrigramId, Trigram> = Object.fromEntries(
  TRIGRAMS.map((t) => [t.id, t]),
) as Record<TrigramId, Trigram>

/** 爻序（自下而上，如 '100'）→ 八卦 id，起卦反查用 */
const TRIGRAM_BY_LINES: Record<string, TrigramId> = {
  '111': 'qian',
  '110': 'dui',
  '101': 'li',
  '100': 'zhen',
  '011': 'xun',
  '010': 'kan',
  '001': 'gen',
  '000': 'kun',
}

export function trigramByLines(lines: (0 | 1)[]): Trigram | undefined {
  const id = TRIGRAM_BY_LINES[lines.join('')]
  return id ? TRIGRAM_BY_ID[id] : undefined
}

/** 两仪 → 四象 → 八卦 的推导链（学堂视图用） */
export interface DerivationStep {
  title: string
  subtitle: string
  items: { name: string; desc: string; lines: (0 | 1)[] }[]
}

export const DERIVATION: DerivationStep[] = [
  {
    title: '太极',
    subtitle: '易有太极——宇宙混沌未分、阴阳未判的原始状态',
    items: [{ name: '太极', desc: '一生二之前的那个「一」', lines: [] }],
  },
  {
    title: '两仪',
    subtitle: '太极一动，分出阴与阳——构成世界的二进制编码',
    items: [
      { name: '阳 —', desc: '天、光明、运动、刚健、创造', lines: [1] },
      { name: '阴 - -', desc: '地、黑暗、静止、柔顺、包容', lines: [0] },
    ],
  },
  {
    title: '四象',
    subtitle: '阴阳再叠一层，世界的四季轮廓浮现',
    items: [
      { name: '太阳', desc: '两阳相叠 · 夏，阳气最盛', lines: [1, 1] },
      { name: '少阴', desc: '阳上加阴 · 秋，阴气初生', lines: [1, 0] },
      { name: '少阳', desc: '阴上加阳 · 春，阳气初生', lines: [0, 1] },
      { name: '太阴', desc: '两阴相叠 · 冬，阴气最盛', lines: [0, 0] },
    ],
  },
  {
    title: '八卦',
    subtitle: '四象再各加一阴一阳，宇宙八种根本力量诞生',
    items: TRIGRAMS.map((t) => ({
      name: `${t.name} · ${t.nature}`,
      desc: t.virtueDesc,
      lines: [...t.lines],
    })),
  },
]
