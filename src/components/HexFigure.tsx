import type { ReactNode } from 'react'

/**
 * 卦象图：六爻自上而下渲染（数组顺序仍为自下而上）。
 * moving 中的爻位（1-6）以朱砂高亮标记。
 */
export function HexFigure({
  lines,
  moving = [],
  onYaoClick,
  size = 'md',
  label,
}: {
  lines: (0 | 1)[]
  moving?: number[]
  onYaoClick?: (pos: number) => void
  size?: 'sm' | 'md' | 'lg'
  label?: ReactNode
}) {
  const width = size === 'lg' ? 'w-44' : size === 'sm' ? 'w-16' : 'w-28'
  const gap = size === 'lg' ? 'gap-3' : size === 'sm' ? 'gap-1.5' : 'gap-2'
  return (
    <div className="flex flex-col items-center gap-2">
      {label && <div className="flex flex-col items-center gap-0.5">{label}</div>}
      <div className={`flex flex-col ${width} ${gap}`}>
        {[...lines]
          .map((v, i) => ({ v, i }))
          .reverse() // 上爻在最上
          .map(({ v, i }) => {
            const isMoving = moving.includes(i + 1)
            const base = `relative flex w-full items-center justify-between ${
              onYaoClick ? 'cursor-pointer' : 'cursor-default'
            } ${isMoving ? 'yao--moving' : ''} ${v ? 'yao--yang' : 'yao--yin'}`
            return (
              <button
                key={i}
                type="button"
                className={base}
                onClick={onYaoClick ? () => onYaoClick(i + 1) : undefined}
                aria-label={`第${i + 1}爻，${v ? '阳' : '阴'}${isMoving ? '，动爻' : ''}`}
              >
                {v ? (
                  <span className="yao-bar" />
                ) : (
                  <>
                    <span className="yao-bar" />
                    <span className="yao-bar" />
                  </>
                )}
                {isMoving && <span className="yao-dot" />}
              </button>
            )
          })}
      </div>
    </div>
  )
}

/** 三爻小图（八卦选择器/卡片用） */
export function TrigramFigure({ lines, className = '' }: { lines: (0 | 1)[]; className?: string }) {
  return (
    <div className={`flex w-12 flex-col gap-1.5 ${className}`}>
      {[...lines].reverse().map((v, i) =>
        v ? (
          <span key={i} className="block h-[5px] rounded-[1px] bg-ink" />
        ) : (
          <span key={i} className="flex h-[5px] justify-between">
            <i className="block h-full w-[38%] rounded-[1px] bg-ink" />
            <i className="block h-full w-[38%] rounded-[1px] bg-ink" />
          </span>
        ),
      )}
    </div>
  )
}
