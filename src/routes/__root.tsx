/// <reference types="vite/client" />
import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import * as React from 'react'
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import { NotFound } from '~/components/NotFound'
import appCss from '~/styles/app.css?url'
import { seo } from '~/utils/seo'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      ...seo({
        title: '易方策',
        description:
          '不背六十四卦，只学一个公式：阴阳为基，八卦为用，上下组合，万物乃成。推演器 · 八卦学堂 · 起卦 · 全典。',
      }),
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
})

const NAV = [
  { to: '/', label: '推演' },
  { to: '/learn', label: '学堂' },
  { to: '/cast', label: '起卦' },
  { to: '/codex', label: '全典' },
] as const

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <header className="flex flex-col items-center gap-3 py-6 sm:flex-row sm:justify-between">
            <Link to="/" className="flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-widest text-cinnabar">易方策</span>
              <span className="text-sm tracking-[0.3em] text-ink-faint">万物＝上卦＋下卦</span>
            </Link>
            <nav className="flex gap-1 text-base">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  activeProps={{ className: 'bg-ink text-paper' }}
                  activeOptions={{ exact: n.to === '/' }}
                  className="rounded-md px-3 py-1.5 tracking-widest text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </header>
          <main>{children}</main>
          <footer className="mt-16 border-t border-ink/10 pt-4 text-center text-xs tracking-wider text-ink-faint">
            易方策 v0.1 · 开发者 Abel-数字牧民 · 经文数据取自公有领域《周易》通行本 · 判词由规则引擎离线生成
          </footer>
        </div>
        {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
        <Scripts />
      </body>
    </html>
  )
}
