import { createServerFn } from '@tanstack/react-start'
import { getHexagramById, getHexagramByTrigrams, listHexagrams } from './db'
import type { Hexagram, YaoLine } from '../types'

/** 全典列表（轻量，不含爻辞） */
export const fetchHexagramList = createServerFn({ method: 'GET' })
  .validator(() => undefined)
  .handler(async () => listHexagrams())

/** 按卦序取全卦（含卦辞、大象、六爻） */
export const fetchHexagram = createServerFn({ method: 'GET' })
  .validator((d: { id: number }) => d)
  .handler(async ({ data }) => getHexagramById(data.id))

/** 揭晓身份：由上、下八卦定卦——推演器的「查经文」入口 */
export const resolveIdentity = createServerFn({ method: 'GET' })
  .validator((d: { upper: string; lower: string }) => d)
  .handler(async ({ data }) => getHexagramByTrigrams(data.upper, data.lower))

/** 起卦结果解析：本卦、变卦与动爻爻辞一次取齐 */
export const resolveCast = createServerFn({ method: 'GET' })
  .validator(
    (d: {
      upper: string
      lower: string
      changedUpper: string
      changedLower: string
      moving: number[]
    }) => d,
  )
  .handler(async ({ data }) => {
    const original = await getHexagramByTrigrams(data.upper, data.lower)
    const changed =
      data.changedUpper === data.upper && data.changedLower === data.lower
        ? null
        : await getHexagramByTrigrams(data.changedUpper, data.changedLower)
    const movingTexts: (YaoLine & { posIndex: number })[] = data.moving.map((m) => {
      const y = original?.yaos[m - 1]
      return y
        ? { ...y, posIndex: m }
        : { pos: `第${m}爻`, text: '（此爻无系辞）', xiang: '', posIndex: m }
    })
    return { original, changed, movingTexts } satisfies {
      original: Hexagram | null
      changed: Hexagram | null
      movingTexts: (YaoLine & { posIndex: number })[]
    }
  })
