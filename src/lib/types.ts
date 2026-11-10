import type { TrigramId } from './trigrams'

export interface YaoLine {
  /** 爻位名：初九 / 六二 / 上六 / 用九 / 用六 */
  pos: string
  /** 爻辞 */
  text: string
  /** 小象传 */
  xiang: string
}

export interface Hexagram {
  /** 卦序 1-64 */
  id: number
  /** 卦名 */
  name: string
  /** 全名，如「地天泰」 */
  fullName: string
  /** 卦辞 */
  guaci: string
  /** 大象传 */
  daxiang: string
  /** 六爻（乾多「用九」，坤多「用六」） */
  yaos: YaoLine[]
  upper: TrigramId
  lower: TrigramId
  /** 白话讲卦（目前覆盖已精讲的卦，其余为 null） */
  lecture?: Lecture | null
}

/** 白话讲卦：整理自视频讲稿（docs/drafts/draft2.md） */
export interface Lecture {
  /** 主题句 */
  theme: string
  /** 卦象与卦辞的白话讲解段落 */
  overview: string[]
  /** 逐爻白话：键为爻序（1-6；7＝用九/用六） */
  yaoNotes: Record<string, string>
  /** 收尾落地 */
  takeaway: string
}

/** 爻位名：由位置（1-6，自下而上）与阴阳（0/1）得「初九」「六二」等 */
export function yaoPosName(pos: number, yang: 0 | 1): string {
  const ord = ['初', '二', '三', '四', '五', '上'][pos - 1]
  const yinYang = yang ? '九' : '六'
  return pos === 1 || pos === 6 ? `${ord}${yinYang}` : `${yinYang}${ord}`
}
