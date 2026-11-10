import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

export default defineConfig({
  server: {
    // 固定端口：6464（六十四卦），被占用时直接报错而非漂移
    port: 6464,
    strictPort: true,
  },
  preview: {
    port: 6464,
    strictPort: true,
  },
  resolve: {
    tsconfigPaths: true,
  },
  ssr: {
    // bun:sqlite 由运行时自适应适配层动态加载（Bun 生产 / Node 开发），勿打包
    external: ['bun:sqlite'],
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      srcDirectory: 'src',
    }),
    viteReact(),
    nitro(),
  ],
})
