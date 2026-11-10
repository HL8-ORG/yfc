import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { HexFigure } from '~/components/HexFigure'
import {
  castByCoins,
  castByNumbers,
  movingPosNames,
  tossCoins,
  type CastStructure,
  type YaoValue,
} from '~/lib/engine/casting'
import { interpret } from '~/lib/engine/interpret'
import { TRIGRAM_BY_ID } from '~/lib/trigrams'
import type { Hexagram, YaoLine } from '~/lib/types'
import { resolveCast } from '~/lib/server/hexagrams'

export const Route = createFileRoute('/cast')({
  component: CastPage,
})

interface CastView {
  struct: CastStructure
  original: Hexagram | null
  changed: Hexagram | null
  movingTexts: (YaoLine & { posIndex: number })[]
}

const VALUE_LABEL: Record<YaoValue, string> = {
  6: '老阴 ✕',
  7: '少阳 ·',
  8: '少阴 ··',
  9: '老阳 ○',
}

function CastPage() {
  const [mode, setMode] = useState<'numbers' | 'coins'>('numbers')
  const [nums, setNums] = useState({ a: '', b: '', c: '' })
  const [tosses, setTosses] = useState<{ coins: ('背' | '字')[]; value: YaoValue }[]>([])
  const [tossing, setTossing] = useState(false)
  const [view, setView] = useState<CastView | null>(null)
  const [error, setError] = useState('')

  const finish = async (struct: CastStructure | string) => {
    if (typeof struct === 'string') {
      setError(struct)
      setView(null)
      return
    }
    setError('')
    try {
      const res = await resolveCast({ data: struct })
      setView({ struct, ...res })
    } catch {
      setError('解析失败，请重试')
    }
  }

  const submitNumbers = () => {
    const { a, b, c } = nums
    finish(castByNumbers(Number(a), Number(b), Number(c)))
  }

  const tossOnce = () => {
    if (tosses.length >= 6 || tossing) return
    setTossing(true)
    const t = tossCoins()
    // 短暂延迟模拟掷钱节奏
    setTimeout(async () => {
      const next = [...tosses, t]
      setTosses(next)
      setTossing(false)
      if (next.length === 6) {
        await finish(castByCoins(next))
      }
    }, 260)
  }

  const resetCoins = () => {
    setTosses([])
    setView(null)
    setError('')
  }

  const randomNumbers = () => {
    const r = () => 1 + Math.floor(Math.random() * 300)
    setNums({ a: String(r()), b: String(r()), c: String(r()) })
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-2xl bg-paper-card px-6 py-8 text-center shadow-ink">
        <h2 className="text-xl font-bold tracking-widest text-ink">起卦</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-ink-soft">
          心中默念所问之事，再以数字或摇钱起卦。得本卦与变卦，动爻之辞即为所占之应。
        </p>
      </section>

      <div className="mx-auto flex gap-2">
        {(
          [
            ['numbers', '数字起卦'],
            ['coins', '摇钱起卦'],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`cursor-pointer rounded-full px-5 py-2 text-sm font-bold tracking-widest transition-colors ${
              mode === m ? 'bg-cinnabar text-paper' : 'bg-paper-deep text-ink-soft hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'numbers' && (
        <section className="mx-auto flex w-full max-w-xl flex-col gap-4 rounded-2xl bg-paper-card p-6 shadow-ink">
          <p className="text-xs leading-6 text-ink-faint">
            梅花易数：随便想三个数（可随心报出）。第一数定下卦，第二数定上卦，三数之和定动爻。
          </p>
          <div className="flex items-end justify-center gap-3">
            {(['a', 'b', 'c'] as const).map((k, i) => (
              <label key={k} className="flex flex-col items-center gap-1">
                <span className="text-xs text-ink-faint">
                  {['下卦数', '上卦数', '动爻数'][i]}
                </span>
                <input
                  type="number"
                  min={1}
                  value={nums[k]}
                  onChange={(e) => setNums({ ...nums, [k]: e.target.value })}
                  className="w-24 rounded-lg border border-ink/20 bg-paper px-3 py-2 text-center text-lg font-bold text-ink focus:border-cinnabar focus:outline-none"
                />
              </label>
            ))}
          </div>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={randomNumbers}
              className="cursor-pointer rounded-full border border-ink/20 px-4 py-2 text-sm tracking-widest text-ink-soft hover:border-cinnabar hover:text-cinnabar"
            >
              随机三数
            </button>
            <button
              type="button"
              onClick={submitNumbers}
              disabled={![nums.a, nums.b, nums.c].every((n) => Number(n) > 0)}
              className="cursor-pointer rounded-full bg-cinnabar px-6 py-2 text-sm font-bold tracking-widest text-paper transition-colors hover:bg-cinnabar-deep disabled:opacity-50"
            >
              起 卦
            </button>
          </div>
        </section>
      )}

      {mode === 'coins' && (
        <section className="mx-auto flex w-full max-w-xl flex-col gap-5 rounded-2xl bg-paper-card p-6 shadow-ink">
          <p className="text-xs leading-6 text-ink-faint">
            六爻金钱课：每摇一次掷三枚铜钱——一背为单（少阳）、二背为拆（少阴）、三背为重（老阳·动）、三字为交（老阴·动）。自下而上共摇六次。
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from({ length: 6 }).map((_, i) => {
              const t = tosses[i]
              return (
                <div
                  key={i}
                  className={`flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-xl border text-xs ${
                    t ? 'border-ink/20 bg-paper' : 'border-dashed border-ink/15 text-ink-faint'
                  }`}
                >
                  {t ? (
                    <>
                      <span className="text-base font-bold tracking-widest text-ink">
                        {t.coins.join(' ')}
                      </span>
                      <span
                        className={
                          t.value === 6 || t.value === 9 ? 'text-cinnabar' : 'text-ink-soft'
                        }
                      >
                        {VALUE_LABEL[t.value]}
                      </span>
                    </>
                  ) : (
                    <span>第{i + 1}爻</span>
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={resetCoins}
              className="cursor-pointer rounded-full border border-ink/20 px-4 py-2 text-sm tracking-widest text-ink-soft hover:border-cinnabar hover:text-cinnabar"
            >
              重 来
            </button>
            <button
              type="button"
              onClick={tossOnce}
              disabled={tosses.length >= 6 || tossing}
              className="cursor-pointer rounded-full bg-cinnabar px-6 py-2 text-sm font-bold tracking-widest text-paper transition-colors hover:bg-cinnabar-deep disabled:opacity-50"
            >
              {tosses.length === 0
                ? '摇 第一爻'
                : tosses.length < 6
                  ? `摇 第${tosses.length + 1}爻`
                  : '卦成'}
            </button>
          </div>
        </section>
      )}

      {error && (
        <div className="mx-auto max-w-xl rounded-xl bg-cinnabar-mist px-4 py-3 text-center text-sm text-cinnabar-deep">
          {error}
        </div>
      )}

      {view && (
        <CastResult view={view} />
      )}
    </div>
  )
}

function CastResult({ view }: { view: CastView }) {
  const { struct, original, changed, movingTexts } = view
  const origInterp = interpret(struct.upper, struct.lower)
  const changedInterp =
    changed && changed.id !== original?.id ? interpret(struct.changedUpper, struct.changedLower) : null
  const movingNames = movingPosNames(struct)

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-6 rounded-2xl bg-paper-card p-6 shadow-card sm:grid-cols-[1fr_auto_1fr]">
        <div className="flex flex-col items-center gap-3">
          <HexFigure lines={struct.lines} moving={struct.moving} size="md" />
          <div className="text-center">
            <div className="text-xs tracking-widest text-ink-faint">本卦</div>
            <div className="text-lg font-black text-ink">
              {original ? `第${original.id}卦 · ${original.name}` : '…'}
            </div>
            <div className="text-sm text-ink-soft">{original?.fullName ?? ''}</div>
          </div>
        </div>
        <div className="flex items-center justify-center text-2xl text-cinnabar">→</div>
        <div className="flex flex-col items-center gap-3">
          <HexFigure lines={struct.changedLines} size="md" />
          <div className="text-center">
            <div className="text-xs tracking-widest text-ink-faint">
              {changed && changed.id !== original?.id ? '变卦' : '（无动爻，卦静）'}
            </div>
            {changed && changed.id !== original?.id && (
              <>
                <div className="text-lg font-black text-cinnabar">
                  第{changed.id}卦 · {changed.name}
                </div>
                <div className="text-sm text-ink-soft">{changed.fullName}</div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl bg-paper-card p-6 shadow-ink">
        <h3 className="text-sm font-bold tracking-[0.3em] text-cinnabar">动爻之辞</h3>
        {movingTexts.length === 0 ? (
          <p className="text-sm leading-7 text-ink-soft">
            六爻皆静，以本卦卦辞断之：「{original?.guaci}」
          </p>
        ) : (
          movingTexts.map((m, i) => (
            <div key={i} className="rounded-xl bg-cinnabar-mist/50 p-4">
              <b className="text-cinnabar-deep">{m.pos}</b>
              <p className="mt-1 text-[15px] leading-7 text-ink">{m.text}</p>
              {m.xiang && <p className="mt-1 text-xs leading-6 text-ink-soft">象曰：{m.xiang}</p>}
              {original?.lecture?.yaoNotes?.[String(m.posIndex)] && (
                <p className="mt-2 rounded-lg bg-paper-card px-3 py-1.5 text-[13px] leading-6 text-ink-soft">
                  <b className="text-jade">白话</b> · {original.lecture.yaoNotes[String(m.posIndex)]}
                </p>
              )}
            </div>
          ))
        )}
        {original?.lecture && (
          <p className="text-sm leading-7 text-ink-soft">
            <b className="text-cinnabar">本卦主旨</b> · {original.lecture.theme}
          </p>
        )}
        {original && (
          <div className="border-t border-ink/10 pt-3 text-sm leading-7">
            <b className="text-ink">本卦卦辞：</b>
            <span className="text-ink-soft">{original.guaci}</span>
            <br />
            <b className="text-ink">大象：</b>
            <span className="text-ink-soft">{original.daxiang}</span>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-2xl bg-paper-card p-6 shadow-ink">
        <h3 className="text-sm font-bold tracking-[0.3em] text-cinnabar">
          公式推演 · 本卦（{TRIGRAM_BY_ID[struct.lower].name}下 + {TRIGRAM_BY_ID[struct.upper].name}上）
          {movingNames.length > 0 && <span className="text-ink-faint"> 动于{movingNames.join('、')}</span>}
        </h3>
        <div
          className={`rounded-xl p-4 text-sm leading-7 ${
            origInterp.verdict.tone === 'good'
              ? 'bg-jade-mist/60 text-jade'
              : origInterp.verdict.tone === 'bad'
                ? 'bg-cinnabar-mist/60 text-cinnabar-deep'
                : 'bg-paper-deep text-ink-soft'
          }`}
        >
          <b>【{origInterp.verdict.label}】</b>
          {origInterp.verdict.text}
        </div>
        {changedInterp && (
          <div className="rounded-xl bg-paper-deep/70 p-4 text-sm leading-7 text-ink-soft">
            <b>变卦走向【{changedInterp.verdict.label}】</b>
            {changedInterp.verdict.text}
          </div>
        )}
        <details className="text-sm text-ink-soft">
          <summary className="cursor-pointer tracking-widest">展开完整推演报告</summary>
          <div className="mt-3 flex flex-col gap-3">
            {origInterp.sections.map((s) => (
              <div key={s.title}>
                <b className="text-ink">{s.title}</b>
                {s.lines.map((l, i) => (
                  <p key={i} className="leading-7">
                    {l}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </details>
      </section>
    </div>
  )
}
