import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { TrigramFigure } from '~/components/HexFigure'
import { DERIVATION, TRIGRAMS, type Trigram } from '~/lib/trigrams'

export const Route = createFileRoute('/learn')({
  component: LearnPage,
})

function LearnPage() {
  const [active, setActive] = useState<Trigram | null>(null)
  const [step, setStep] = useState(3) // 默认展示最后一层：八卦

  const current = DERIVATION[step]

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-2xl bg-paper-card px-6 py-8 text-center shadow-ink">
        <h2 className="text-xl font-bold tracking-widest text-ink">
          不背六十四卦，只识八个「基本粒子」
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-ink-soft">
          六十四卦不是六十四个孤立符号，而是八个基本卦两两相叠的排列组合——八八六十四。
          像化学的元素周期表，像英语的 26 个字母。
        </p>
      </section>

      <section className="rounded-2xl bg-paper-card p-6 shadow-ink">
        <h3 className="mb-4 text-sm font-bold tracking-[0.3em] text-cinnabar">公式是怎么「长」出来的</h3>
        <div className="mb-4 flex flex-wrap gap-2">
          {DERIVATION.map((d, i) => (
            <button
              key={d.title}
              type="button"
              onClick={() => setStep(i)}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-sm tracking-widest transition-colors ${
                i === step
                  ? 'bg-ink text-paper'
                  : 'bg-paper-deep text-ink-soft hover:text-ink'
              }`}
            >
              {d.title}
            </button>
          ))}
        </div>
        <p className="mb-4 text-sm text-ink-soft">{current.subtitle}</p>
        <div className="flex flex-wrap gap-3">
          {current.items.map((it) => (
            <div
              key={it.name}
              className="flex min-w-32 flex-1 flex-col items-center gap-2 rounded-xl border border-ink/10 px-3 py-4"
            >
              {it.lines.length > 0 ? (
                <TrigramFigure lines={[...it.lines]} />
              ) : (
                <div className="flex h-8 items-center text-2xl text-cinnabar">☯</div>
              )}
              <b className="text-sm text-ink">{it.name}</b>
              <span className="text-center text-xs leading-5 text-ink-faint">{it.desc}</span>
            </div>
          ))}
        </div>
        {step < DERIVATION.length - 1 && (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="mt-4 cursor-pointer text-sm font-bold tracking-widest text-cinnabar hover:text-cinnabar-deep"
          >
            再加一爻 → {DERIVATION[step + 1].title}
          </button>
        )}
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {TRIGRAMS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t)}
            className={`flex cursor-pointer flex-col items-center gap-3 rounded-2xl p-5 shadow-ink transition-all ${
              active?.id === t.id
                ? 'bg-cinnabar-mist ring-2 ring-cinnabar'
                : 'bg-paper-card hover:bg-paper-deep/70'
            }`}
          >
            <TrigramFigure lines={[...t.lines]} className="w-16" />
            <div className="text-lg font-black text-ink">
              {t.name} <span className="text-sm font-normal text-ink-faint">为{t.nature}</span>
            </div>
            <div className="text-center text-xs leading-5 text-ink-soft">
              卦德 · <b className="text-cinnabar">{t.virtue}</b> —— {t.virtueDesc}
            </div>
          </button>
        ))}
      </section>

      {active && (
        <section className="rounded-2xl bg-paper-card p-6 shadow-card">
          <header className="mb-3 flex items-center justify-between">
            <h3 className="text-xl font-black tracking-widest text-ink">
              {active.name} · {active.nature}
            </h3>
            <button
              type="button"
              onClick={() => setActive(null)}
              className="cursor-pointer text-xs tracking-widest text-ink-faint hover:text-ink"
            >
              收起 ✕
            </button>
          </header>
          <p className="mb-4 text-[15px] leading-7 text-ink">{active.image}。</p>
          <div className="mb-4 flex flex-wrap gap-2 text-xs text-ink-soft">
            {[
              ['卦德', `${active.virtue}（${active.virtueDesc}）`],
              ['五行', active.element],
              ['家人', active.family],
              ['身体', active.body],
              ['动物', active.animal],
              ['后天方位', active.direction],
              ['时令', active.season],
            ].map(([k, v]) => (
              <span key={k} className="rounded-full bg-paper-deep px-3 py-1">
                {k} <b className="text-ink">{v}</b>
              </span>
            ))}
          </div>
          <p className="text-[15px] leading-7 text-ink">
            <b>性格：</b>
            {active.character}。
          </p>
          <p className="mt-2 text-[15px] leading-7 text-jade">{active.wisdom}</p>
          <p className="mt-2 text-xs leading-6 text-ink-faint">
            气机：{active.qiDesc}——「{active.qi === 'up' ? '升' : '降'}」，这是气交分析（泰/否）的判断依据。
          </p>
        </section>
      )}
    </div>
  )
}
