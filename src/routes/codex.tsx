import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { HexFigure } from '~/components/HexFigure'
import { interpret } from '~/lib/engine/interpret'
import { TRIGRAM_BY_ID } from '~/lib/trigrams'
import type { Hexagram } from '~/lib/types'
import { fetchHexagram, fetchHexagramList } from '~/lib/server/hexagrams'

export const Route = createFileRoute('/codex')({
  validateSearch: (s: Record<string, unknown>) => ({
    id: typeof s.id === 'number' ? s.id : undefined,
  }),
  loaderDeps: ({ search: { id } }) => ({ id }),
  loader: async ({ deps }) => ({
    list: (await fetchHexagramList()) as Hexagram[],
    detail: deps.id ? ((await fetchHexagram({ data: { id: deps.id } })) as Hexagram | null) : null,
  }),
  component: CodexPage,
})

function hexLines(h: Pick<Hexagram, 'upper' | 'lower'>): (0 | 1)[] {
  return [...TRIGRAM_BY_ID[h.lower].lines, ...TRIGRAM_BY_ID[h.upper].lines]
}

function CodexPage() {
  const { list, detail } = Route.useLoaderData()
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const kw = q.trim()
    if (!kw) return list
    return list.filter((h) =>
      [h.name, h.fullName, h.guaci, TRIGRAM_BY_ID[h.upper].name, TRIGRAM_BY_ID[h.lower].name]
        .join(' ')
        .includes(kw),
    )
  }, [list, q])

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl bg-paper-card px-6 py-6 shadow-ink">
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <h2 className="text-xl font-bold tracking-widest text-ink">六十四卦全典</h2>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜卦名、卦辞、上下卦（如：泰 / 水火 / 乾）"
            className="w-full rounded-full border border-ink/20 bg-paper px-4 py-2 text-sm text-ink focus:border-cinnabar focus:outline-none sm:w-96"
          />
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          共 {filtered.length} 卦 · 点击任意卦查看卦辞、爻辞与公式推演 · 数据存于 SQLite
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((h) => (
          <Link
            key={h.id}
            to="/codex"
            search={{ id: h.id }}
            className={`flex items-center gap-4 rounded-2xl p-4 shadow-ink transition-all ${
              detail?.id === h.id ? 'bg-cinnabar-mist ring-2 ring-cinnabar' : 'bg-paper-card hover:bg-paper-deep/70'
            }`}
          >
            <HexFigure lines={hexLines(h)} size="sm" />
            <div className="min-w-0">
              <div className="text-base font-black text-ink">
                {h.id}. {h.name}
              </div>
              <div className="text-xs text-ink-faint">{h.fullName}</div>
              <div className="mt-1 truncate text-xs text-ink-soft">{h.guaci}</div>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-ink/20 py-12 text-center tracking-widest text-ink-faint">
            没有匹配的卦
          </div>
        )}
      </section>

      {detail && (
        <section className="grid gap-6 rounded-2xl bg-paper-card p-6 shadow-card lg:grid-cols-[280px_1fr]">
          <div className="flex flex-col items-center gap-4">
            <HexFigure lines={hexLines(detail)} size="lg" />
            <div className="text-center">
              <div className="text-xl font-black text-ink">
                第{detail.id}卦 · {detail.name}
              </div>
              <div className="text-sm tracking-widest text-ink-faint">{detail.fullName}</div>
              <div className="mt-1 text-xs text-ink-soft">
                下{TRIGRAM_BY_ID[detail.lower].name}({TRIGRAM_BY_ID[detail.lower].nature}) ＋
                上{TRIGRAM_BY_ID[detail.upper].name}({TRIGRAM_BY_ID[detail.upper].nature})
              </div>
            </div>
            <Link
              to="/"
              className="rounded-full bg-ink px-4 py-1.5 text-xs tracking-widest text-paper hover:bg-cinnabar"
            >
              去推演器拆解此卦 →
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <div className="mb-1 text-xs font-bold tracking-widest text-cinnabar">卦辞</div>
              <p className="text-[15px] leading-7 text-ink">{detail.guaci}</p>
            </div>
            <div>
              <div className="mb-1 text-xs font-bold tracking-widest text-cinnabar">大象传</div>
              <p className="text-[15px] leading-7 text-ink-soft">{detail.daxiang}</p>
            </div>
            <div>
              <div className="mb-1 text-xs font-bold tracking-widest text-cinnabar">六爻</div>
              <div className="flex flex-col divide-y divide-ink/5">
                {detail.yaos.map((y, i) => (
                  <div key={y.pos} className="py-2.5">
                    <div className="flex items-baseline gap-3">
                      <b className="w-12 shrink-0 text-cinnabar-deep">{y.pos}</b>
                      <span className="text-[15px] leading-7 text-ink">{y.text}</span>
                    </div>
                    {y.xiang && (
                      <p className="ml-14 mt-0.5 text-xs leading-6 text-ink-faint">
                        象曰：{y.xiang}
                      </p>
                    )}
                    {detail.lecture?.yaoNotes?.[String(i + 1)] && (
                      <p className="ml-14 mt-1 rounded-lg bg-jade-mist/50 px-3 py-1.5 text-[13px] leading-6 text-ink-soft">
                        <b className="text-jade">白话</b> · {detail.lecture.yaoNotes[String(i + 1)]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-paper-deep/60 p-4 text-sm leading-7 text-ink-soft">
              <b className="text-ink">公式速断：</b>
              {interpret(detail.upper, detail.lower).verdict.text}
            </div>
            {detail.lecture && (
              <div className="rounded-2xl border border-cinnabar/25 bg-paper-deep/40 p-5">
                <div className="mb-2 flex items-baseline justify-between">
                  <div className="text-sm font-bold tracking-[0.3em] text-cinnabar">讲卦 · 白话</div>
                  <span className="text-xs text-ink-faint">整理自视频讲稿</span>
                </div>
                <p className="mb-3 text-base font-bold leading-7 text-ink">{detail.lecture.theme}</p>
                {detail.lecture.overview.map((p, i) => (
                  <p key={i} className="text-[15px] leading-7 text-ink">
                    {p}
                  </p>
                ))}
                <p className="mt-3 rounded-xl bg-cinnabar-mist/60 p-3 text-[15px] leading-7 text-ink">
                  {detail.lecture.takeaway}
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
