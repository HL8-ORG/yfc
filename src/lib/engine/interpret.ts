import { TRIGRAM_BY_ID, type Trigram, type TrigramId } from '../trigrams'

/**
 * 易方策规则引擎 —— 把「核心公式」形式化：
 *   阴阳为基，八卦为用，上下组合，万物乃成。
 *   上卦＝外部环境 / 天时 / 结果 / 未来
 *   下卦＝内部条件 / 地利 / 原因 / 初始
 * 分析维度：① 上下卦性 ② 气交（泰否逻辑）③ 五行生克 ④ 爻位当否
 *
 * 纯函数、零依赖，客户端与服务端皆可运行；
 * 刻意不查经文——公式推演独立成立，「揭晓卦名」是另一回事。
 */

export type Tone = 'good' | 'bad' | 'neutral'

export interface ReportSection {
  title: string
  tone: Tone
  lines: string[]
}

export interface Verdict {
  /** 通达 / 平顺 / 有阻 / 困顿 */
  label: string
  tone: Tone
  text: string
}

export interface Interpretation {
  upper: Trigram
  lower: Trigram
  sections: ReportSection[]
  verdict: Verdict
}

/** 五行相生：木→火→土→金→水→木 */
const GENERATES: Record<string, string> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }
/** 五行相克：木克土，土克水，水克火，火克金，金克木 */
const OVERCOMES: Record<string, string> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' }

const fiveRelation = (a: string, b: string): 'same' | 'generates' | 'overcomes' => {
  if (a === b) return 'same'
  if (GENERATES[a] === b) return 'generates'
  return 'overcomes'
}

/** 全卦六爻（自下而上），由上下八卦爻拼成 */
export function fullLines(upper: Trigram, lower: Trigram): (0 | 1)[] {
  return [...lower.lines, ...upper.lines]
}

/** 当位：阳爻居一三五（初、三、五），阴爻居二四上 */
export function positionalAnalysis(lines: (0 | 1)[]): { correct: number; detail: string } {
  const names = ['初', '二', '三', '四', '五', '上']
  const hits: string[] = []
  let correct = 0
  lines.forEach((v, i) => {
    const odd = (i + 1) % 2 === 1 // 初三五为奇数位
    const ok = odd ? v === 1 : v === 0
    if (ok) {
      correct++
      hits.push(names[i])
    }
  })
  return { correct, detail: hits.map((h) => `${h}位`).join('、') }
}

export function interpret(upperId: TrigramId, lowerId: TrigramId): Interpretation {
  const upper = TRIGRAM_BY_ID[upperId]
  const lower = TRIGRAM_BY_ID[lowerId]
  const sections: ReportSection[] = []

  // ① 上下定位 —— 公式的骨架
  sections.push({
    title: '一 · 上下定位',
    tone: 'neutral',
    lines: [
      `下卦「${lower.name}·${lower.nature}」为内在条件：${lower.image}。卦德「${lower.virtue}」——${lower.virtueDesc}。它代表我方、起点、因地与初始动机。`,
      `上卦「${upper.name}·${upper.nature}」为外部环境：${upper.image}。卦德「${upper.virtue}」——${upper.virtueDesc}。它代表天时、对方、结果与未来走向。`,
    ],
  })

  // ② 气交分析 —— 泰否逻辑：阳气升、阴气降，能否相遇
  let qiScore = 0
  if (lower.qi === 'up' && upper.qi === 'down') {
    qiScore = 2
    sections.push({
      title: '二 · 气交分析 —— 天地交而万物通',
      tone: 'good',
      lines: [
        `下卦${lower.name}（${lower.qiDesc}），上卦${upper.name}（${upper.qiDesc}）：内气上行、外气下沉，恰好相遇于中。`,
        `这正是「泰」的结构——「天地交而万物通也，上下交而其志同也」。内外的能量能充分交流，上下沟通顺畅，是通达之象。`,
      ],
    })
  } else if (lower.qi === 'down' && upper.qi === 'up') {
    qiScore = -2
    sections.push({
      title: '二 · 气交分析 —— 天地不交而万物不通',
      tone: 'bad',
      lines: [
        `下卦${lower.name}（${lower.qiDesc}），上卦${upper.name}（${upper.qiDesc}）：内气下沉、外气上行，背道而驰，各自离去。`,
        `这正是「否」的结构——天地之气各走各路，无法交流沟通。局面闭塞，此时宜「俭德辟难」，收敛才华、避免争功，先打通沟通再谈进取。`,
      ],
    })
  } else {
    sections.push({
      title: '二 · 气交分析 —— 同气而行',
      tone: 'neutral',
      lines: [
        `下卦${lower.name}与上卦${upper.name}气机同向（皆${lower.qi === 'up' ? '上行' : '下行'}），没有迎面相遇之「交」，也没有背道而驰之「隔」。`,
        `同气相求，方向一致，利弊取决于双方卦德能否配合：同心可成势，同质也可能互不相让，需要参看生克与各卦卦德。`,
      ],
    })
  }

  // ③ 五行生克 —— 上下卦的助益与制约
  let wxScore = 0
  const rel = fiveRelation(upper.element, lower.element) // 上卦对下卦的作用
  if (rel === 'same') {
    wxScore = 1
    sections.push({
      title: '三 · 五行生克 —— 比和',
      tone: 'good',
      lines: [
        `上卦${upper.name}属${upper.element}，下卦${lower.name}属${lower.element}，两者同气，五行比和。`,
        `内外属性一致，环境与自身同频，协作无内耗之象。气力同心，宜借势而为；但同质也意味着缺乏互补与制衡，警惕一荣俱荣、一损俱损。`,
      ],
    })
  } else if (rel === 'generates') {
    wxScore = 2
    sections.push({
      title: '三 · 五行生克 —— 外生内',
      tone: 'good',
      lines: [
        `上卦${upper.name}属${upper.element}，${upper.element}生${lower.element}，外部环境在滋养、生助下卦${lower.name}所代表的内在条件。`,
        `外部资源、贵人、时机在向我方输送能量：得势得助，宜承接外力、乘势推进，是「益」的方向。`,
      ],
    })
  } else if (rel === 'overcomes') {
    wxScore = -2
    sections.push({
      title: '三 · 五行生克 —— 外克内',
      tone: 'bad',
      lines: [
        `上卦${upper.name}属${upper.element}，${upper.element}克${lower.element}，外部环境在制约、压制下卦${lower.name}所代表的内在条件。`,
        `环境施压，硬碰硬必受其伤。此时宜学「蹇」卦之道：不要硬着头皮往山上爬，退守平地、寻求贵人、等待时机，以智取胜，不以力敌。`,
      ],
    })
  } else {
    // 下生上：内奉外
    sections.push({
      title: '三 · 五行生克 —— 内生外',
      tone: 'neutral',
      lines: [
        `下卦${lower.name}属${lower.element}，${lower.element}生${upper.element}，内在能量在源源不断地输出给外部环境。`,
        `我方在付出、奉献、成就外部局面（类似「损」卦之象）：付出能有成果，但也在消耗自身。要量力而行，滋养有道，防止入不敷出。`,
      ],
    })
  }

  // ④ 爻位当否 —— 结构本身的稳固度
  const lines6 = fullLines(upper, lower)
  const pos = positionalAnalysis(lines6)
  const posScore = Math.round((pos.correct / 6) * 2 * 10) / 10 - 1 // -1 ~ +1
  const posLines = [
    `六爻之中，${pos.correct} 爻当位${pos.correct > 0 ? `（${pos.detail}）` : ''}。阳爻居初、三、五位，阴爻居二、四、上位，谓之「当位」——如同人才用在了合适的岗位。`,
  ]
  if (pos.correct === 6) {
    posLines.push('六爻全部当位！这是六十四卦中极其罕见的全当位结构（既济卦），各安其分、各尽其责，秩序井然。但要注意：完美也是盛极的顶点，《易经》的下一卦往往就是转折。')
  } else if (pos.correct <= 2) {
    posLines.push('当位之爻太少，结构中多有错位：人或事放错了位置。此时的功课是「调整位分」——把对的人放回对的位置，比埋头努力更重要。')
  } else {
    posLines.push('当位与失位并存，结构基本合理。守好当位之爻所代表的本分，对失位之处保持警觉即可。')
  }
  sections.push({
    title: '四 · 爻位当否',
    tone: posScore > 0.2 ? 'good' : posScore < -0.2 ? 'bad' : 'neutral',
    lines: posLines,
  })

  // ⑤ 综合判词
  const score = Math.round((qiScore + wxScore + posScore) * 10) / 10
  let verdict: Verdict
  if (score >= 2) {
    verdict = {
      label: '通达之象',
      tone: 'good',
      text: `内外气${qiScore > 0 ? '交' : '顺'}、五行相得（合${score.toFixed(1)}分），局面整体畅通。此时宜进取：把握「交」与「生」的通道，主动沟通、乘势而上。切记：顺境中的风险在于过度，盛极而衰，《易经》永远是好消息里的清醒剂。`,
    }
  } else if (score >= 0) {
    verdict = {
      label: '平顺之象',
      tone: 'neutral',
      text: `利弊相抵（合${score.toFixed(1)}分），大势平稳而暗流各半。策略是「守正待机」：稳住当位的基本盘，在气交与生克的通道上做增量，不冒进、不退缩，静待结构变化带来的机会。`,
    }
  } else if (score >= -2) {
    verdict = {
      label: '有阻之象',
      tone: 'bad',
      text: `阻力略占上风（合${score.toFixed(1)}分）。此卦在提醒你：直路走不通，绕行才是正途。参考「蹇」卦——利西南，不利东北：避开高山硬地，退到平坦处休整，寻求有智慧、有能力者（「利见大人」）相助，比独自硬扛更有胜算。`,
    }
  } else {
    verdict = {
      label: '困顿之象',
      tone: 'bad',
      text: `内外交困（合${score.toFixed(1)}分），气势不通、生克皆逆。此时最忌折腾：学「否」卦「俭德辟难」，收敛锋芒、保存实力，把目标降到最小可行的一步。记住「否极泰来」——闭塞的尽头就是通达，活下来，等风来。`,
    }
  }

  return { upper, lower, sections, verdict }
}

export const FORMULA = '万物 ＝ 上卦 ＋ 下卦'
export const FORMULA_MOTTO = '阴阳为基，八卦为用，上下组合，万物乃成'
