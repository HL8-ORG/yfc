import { TRIGRAM_BY_NUM, trigramByLines, type TrigramId } from '../trigrams'
import { yaoPosName } from '../types'

/**
 * 起卦引擎 —— 两种传统起法（纯计算，不查经文；经文由服务端 SQLite 解析）
 * ① 数字起卦（梅花易数）：三个数字定下卦、上卦、动爻
 * ② 摇钱起卦（六爻金钱课）：六次掷三枚铜钱，得本卦与变卦
 */

/** 一爻的四种态：6 老阴（变）、7 少阳、8 少阴、9 老阳（变） */
export type YaoValue = 6 | 7 | 8 | 9

/** 摇一次三枚铜钱：每枚 背=3、字=2，合计 6-9 */
export function tossCoins(): { coins: ('背' | '字')[]; value: YaoValue } {
  const coins = Array.from({ length: 3 }, () => (Math.random() < 0.5 ? '背' : '字'))
  const sum = coins.reduce<number>((s, c) => s + (c === '背' ? 3 : 2), 0)
  return { coins, value: sum as YaoValue }
}

/** 起卦的纯计算结果：卦的「结构」，不含经文 */
export interface CastStructure {
  /** 六爻数值（自下而上，6/9 为动爻） */
  values: YaoValue[]
  /** 静态六爻（自下而上，1 阳 0 阴）——本卦 */
  lines: (0 | 1)[]
  /** 变卦六爻（动爻翻转）——无动爻时同 lines */
  changedLines: (0 | 1)[]
  /** 本卦上、下八卦 id */
  upper: TrigramId
  lower: TrigramId
  /** 变卦上、下八卦 id（无动爻时同本卦） */
  changedUpper: TrigramId
  changedLower: TrigramId
  /** 动爻位置（1-6，自下而上） */
  moving: number[]
}

export function buildStructure(values: YaoValue[]): CastStructure | string {
  if (values.length !== 6) return '需要六爻'
  const lines = values.map((v) => (v === 7 || v === 9 ? 1 : 0)) as (0 | 1)[]
  const lowerT = trigramByLines(lines.slice(0, 3))
  const upperT = trigramByLines(lines.slice(3, 6))
  if (!lowerT || !upperT) return '无法识别卦象'
  const moving = values.map((v, i) => (v === 6 || v === 9 ? i + 1 : 0)).filter(Boolean)
  const changedLines = lines.map((v, i) => (moving.includes(i + 1) ? ((1 - v) as 0 | 1) : v))
  const changedLower = trigramByLines(changedLines.slice(0, 3)) ?? lowerT
  const changedUpper = trigramByLines(changedLines.slice(3, 6)) ?? upperT
  return {
    values,
    lines,
    changedLines,
    lower: lowerT.id,
    upper: upperT.id,
    changedLower: changedLower.id,
    changedUpper: changedUpper.id,
    moving,
  }
}

/** 数字起卦：a 定下卦、b 定上卦（皆取先天八卦数，除 8 余 0 作 8），a+b+c 定动爻（除 6 余 0 作 6） */
export function castByNumbers(a: number, b: number, c: number): CastStructure | string {
  if (![a, b, c].every((n) => Number.isFinite(n) && n > 0)) return '请输入三个正整数'
  const lowerT = TRIGRAM_BY_NUM[a % 8 === 0 ? 8 : a % 8]
  const upperT = TRIGRAM_BY_NUM[b % 8 === 0 ? 8 : b % 8]
  const movingPos = (a + b + c) % 6 === 0 ? 6 : (a + b + c) % 6
  const values = [...lowerT.lines, ...upperT.lines].map((v, i) => {
    const yang = v === 1
    // 动爻处：阳→老阳9、阴→老阴6；静爻：阳→少阳7、阴→少阴8
    return (yang ? (i + 1 === movingPos ? 9 : 7) : i + 1 === movingPos ? 6 : 8) as YaoValue
  })
  return buildStructure(values)
}

/** 摇钱起卦：六次掷钱的结果（自下而上） */
export function castByCoins(tosses: { coins: ('背' | '字')[]; value: YaoValue }[]): CastStructure | string {
  if (tosses.length !== 6) return '需要掷满六次'
  return buildStructure(tosses.map((t) => t.value))
}

/** 动爻位名（初九/六五……），供展示 */
export function movingPosNames(struct: CastStructure): string[] {
  return struct.moving.map((m) => yaoPosName(m, struct.lines[m - 1]))
}
