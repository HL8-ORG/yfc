import { TRIGRAMS, type TrigramId } from '~/lib/trigrams'
import { TrigramFigure } from './HexFigure'

/** 八卦选择器：一行八枚卦符按钮 */
export function TrigramPicker({
  value,
  onChange,
  title,
}: {
  value: TrigramId | null
  onChange: (id: TrigramId) => void
  title: string
}) {
  return (
    <div className="flex-1">
      <div className="mb-2 text-sm font-semibold tracking-widest text-ink-soft">{title}</div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {TRIGRAMS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border px-2 py-3 transition-all ${
              value === t.id
                ? 'border-cinnabar bg-cinnabar-mist shadow-ink'
                : 'border-ink/15 bg-paper-card hover:border-cinnabar/50 hover:bg-paper-deep/60'
            }`}
            onClick={() => onChange(t.id)}
            title={`${t.name}为${t.nature} · ${t.virtueDesc}`}
          >
            <TrigramFigure lines={[...t.lines]} />
            <span className={`text-sm font-bold ${value === t.id ? 'text-cinnabar' : 'text-ink'}`}>
              {t.name}
            </span>
            <span className="text-xs text-ink-faint">{t.nature}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
