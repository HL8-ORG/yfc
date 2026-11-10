import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { HexFigure, TrigramFigure } from '~/components/HexFigure'
import { TrigramPicker } from '~/components/TrigramPicker'
import { FORMULA, FORMULA_MOTTO, fullLines, interpret } from '~/lib/engine/interpret'
import type { TrigramId } from '~/lib/trigrams'
import { TRIGRAM_BY_ID } from '~/lib/trigrams'
import type { Hexagram } from '~/lib/types'
import { resolveIdentity } from '~/lib/server/hexagrams'

export const Route = createFileRoute('/')({
  component: ForgePage,
})

function ForgePage() {
  const [lower, setLower] = useState<TrigramId | null>(null)
  const [upper, setUpper] = useState<TrigramId | null>(null)
  const [revealed, setRevealed] = useState<Hexagram | null>(null)
  const [revealing, setRevealing] = useState(false)
  const [activeYao, setActiveYao] = useState<number | null>(null)

  const ready = !!upper && !!lower
  const result = useMemo(
    () => (upper && lower ? interpret(upper, lower) : undefined),
    [upper, lower],
  )

  const pick = (side: 'lower' | 'upper') => (id: TrigramId) => {
    ;(side === 'lower' ? setLower : setUpper)(id)
    setRevealed(null)
    setActiveYao(null)
  }

  const reveal = async () => {
    if (!upper || !lower) return
    setRevealing(true)
    try {
      const hex = await resolveIdentity({ data: { upper, lower } })
      setRevealed(hex)
    } finally {
      setRevealing(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-2xl bg-paper-card px-6 py-8 text-center shadow-ink">
        <div className="text-lg font-bold tracking-[0.2em] text-cinnabar sm:text-xl">{FORMULA}</div>
        <p className="mt-2 text-sm tracking-[0.35em] text-ink-soft">{FORMULA_MOTTO}</p>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-ink-soft">
          任选下卦（内在条件）与上卦（外部环境），六十四卦之一即被你亲手「合」了出来——
          先看公式推演，再揭晓它是哪一卦。
        </p>
      </section>

      <section className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <TrigramPicker title="下卦 · 内 / 我 / 初始" value={lower} onChange={pick('lower')} />
        <div className="pt-8 text-2xl font-bold text-cinnabar sm:pt-9">＋</div>
        <TrigramPicker title="上卦 · 外 / 彼 / 未来" value={upper} onChange={pick('upper')} />
      </section>

      {!ready && (
        <div className="rounded-xl border border-dashed border-ink/20 py-16 text-center tracking-widest text-ink-faint">
          在上方各选一卦，开始你的第一次推演
        </div>
      )}

      {ready && result && (
        <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="flex flex-col gap-6 self-start rounded-2xl bg-paper-card p-6 shadow-card">
            <HexFigure
              lines={fullLines(result.upper, result.lower)}
              size="lg"
              onYaoClick={revealed ? setActiveYao : undefined}
              label={
                revealed ? (
                  <>
                    <span className="text-lg font-bold text-ink">
                      第{revealed.id}卦 · {revealed.name}
                    </span>
                    <span className="text-sm tracking-widest text-ink-faint">
                      {revealed.fullName}
                    </span>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={reveal}
                    disabled={revealing}
                    className="cursor-pointer rounded-full bg-cinnabar px-5 py-2 text-sm font-bold tracking-widest text-paper shadow-ink transition-colors hover:bg-cinnabar-deep disabled:opacity-60"
                  >
                    {revealing ? '查经中…' : '? 揭晓本卦身份'}
                  </button>
                )
              }
            />
            <div className="flex items-center justify-center gap-8 border-t border-ink/10 pt-4">
              <figure className="flex flex-col items-center gap-2">
                <TrigramFigure lines={[...TRIGRAM_BY_ID[result.lower.id].lines]} />
                <figcaption className="text-xs text-ink-faint">
                  下 · {result.lower.name}{result.lower.nature} · {result.lower.element}
                </figcaption>
              </figure>
              <figure className="flex flex-col items-center gap-2">
                <TrigramFigure lines={[...TRIGRAM_BY_ID[result.upper.id].lines]} />
                <figcaption className="text-xs text-ink-faint">
                  上 · {result.upper.name}{result.upper.nature} · {result.upper.element}
                </figcaption>
              </figure>
            </div>

            {revealed && (
              <div className="flex flex-col gap-3">
                <div>
                  <div className="mb-1 text-xs font-bold tracking-widest text-cinnabar">卦辞</div>
                  <p className="text-[15px] leading-7 text-ink">{revealed.guaci}</p>
                </div>
                <div>
                  <div className="mb-1 text-xs font-bold tracking-widest text-cinnabar">大象传</div>
                  <p className="text-[15px] leading-7 text-ink-soft">{revealed.daxiang}</p>
                </div>
                {activeYao != null && revealed.yaos[activeYao - 1] && (
                  <div className="rounded-lg bg-cinnabar-mist/60 p-3">
                    <b className="text-sm text-cinnabar-deep">
                      {revealed.yaos[activeYao - 1].pos}
                    </b>
                    <p className="mt-1 text-sm leading-6 text-ink">
                      {revealed.yaos[activeYao - 1].text}
                    </p>
                    <p className="mt-1 text-xs leading-6 text-ink-soft">
                      象曰：{revealed.yaos[activeYao - 1].xiang}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 rounded-2xl bg-paper-card p-5 shadow-card">
              <span
                className={`rounded-md px-3 py-1.5 text-lg font-black tracking-widest ${
                  result.verdict.tone === 'good'
                    ? 'bg-jade-mist text-jade'
                    : result.verdict.tone === 'bad'
                      ? 'bg-cinnabar-mist text-cinnabar-deep'
                      : 'bg-paper-deep text-ink-soft'
                }`}
              >
                {result.verdict.label}
              </span>
              <span className="flex-1 text-sm leading-6 text-ink-soft">{result.verdict.text}</span>
            </div>
            {result.sections.map((s) => (
              <section
                key={s.title}
                className="rounded-2xl bg-paper-card p-5 shadow-ink"
              >
                <h3
                  className={`mb-2 text-sm font-bold tracking-widest ${
                    s.tone === 'good'
                      ? 'text-jade'
                      : s.tone === 'bad'
                        ? 'text-cinnabar-deep'
                        : 'text-ink-soft'
                  }`}
                >
                  {s.title}
                </h3>
                {s.lines.map((l, i) => (
                  <p key={i} className="text-[15px] leading-7 text-ink">
                    {l}
                  </p>
                ))}
              </section>
            ))}
            <p className="px-2 text-xs leading-6 text-ink-faint">
              以上判词由规则引擎离线生成：气交 ±2 ＋ 生克 −2~+2 ＋ 当位 −1~+1，合计分档。
              它是「公式」的骨架推演，不是经文本身——点击左侧「揭晓本卦身份」对照原典。
            </p>
          </div>
        </section>
      )}
    </div>
  )
}
