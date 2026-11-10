# 易方策

> 阴阳为基，八卦为用，上下组合，万物乃成。

## 功能

| 模块 | 路由 | 说明 |
| --- | --- | --- |
| 卦象推演器 | `/` | 任选上、下八卦，规则引擎即时生成四维推演报告（上下定位 / 气交泰否 / 五行生克 / 爻位当否）；「先推演，后揭晓」对照经文 |
| 八卦学堂 | `/learn` | 太极→两仪→四象→八卦的推导演示；八个基本卦的卦德、五行、方位、家人、身体全息卡片 |
| 起卦 | `/cast` | 数字起卦（梅花易数）与摇钱起卦（六爻金钱课），本卦→变卦、动爻爻辞、公式判词 |
| 六十四卦全典 | `/codex` | 卦辞、爻辞、大象传、小象传全文检索（数据存于 SQLite），SSR 直出 |

## 技术栈

React 19 · TanStack Start（文件路由 + Server Functions）· Vite 8 · Tailwind CSS 4 · Bun · SQLite

### 双运行时的 SQLite 策略

TanStack Start 的开发管线（vite dev）在本机跑在 Node 上，生产输出跑在 Bun 上，
两个运行时各有一个「内置 SQLite」，互不兼容：

- 生产（Bun）→ `bun:sqlite`
- 开发（Node ≥ 22.5）→ `node:sqlite`

`src/lib/server/sqlite.ts` 做了运行时自适应的薄适配层，全栈零第三方 SQLite 依赖。
（注意：Bun 1.3.x 尚未实现 `node:sqlite`；`bun --bun vite dev` 在当前版本组合下无法正常响应，故 dev 走 Node。）

## 快速开始

```bash
bun install          # 安装依赖
bun run seed         # （可选）重建 data/yifangce.db，首次运行会自动播种
bun run dev          # 开发：http://localhost:6464（固定端口，占用即报错）
bun run build        # 生产构建（vite build + tsc 类型检查）
bun run start        # 生产运行（Bun + bun:sqlite，端口 6464）
```

## 数据来源与校验

- 经文（卦辞、爻辞、大象传、小象传）取自公有领域《周易》通行本，
  自 [sunls2/zhouyi](https://github.com/sunls2/zhouyi) 提取古文部分，仅采用两千余年前的原典，
  未收录其现代解卦内容。
- 六十四卦的卦名、全名与「上卦＋下卦」结构逐一交叉校验；
  乾/坤补齐「用九」「用六」；修正了数据源的「干母之蛊→乾母之蛊」笔误；
  繁简转换对「乾坤」之「乾」做了保护（避免误转为「干」）。
- 推演器的判词由 `src/lib/engine/interpret.ts` 离线规则引擎生成（气交 ±2 ＋ 生克 −2~+2 ＋ 当位 −1~+1），
  与经文数据完全解耦——这正是「公式推演」与「查经对照」可分离的产品立意。
- 「讲卦 · 白话」（主题句、卦象卦辞讲解、逐爻白话、收尾落地）整理自频道视频讲稿
  （`docs/drafts/draft2.md`，私有），目前覆盖乾、坤、屯、蒙、需、讼、师、比八卦，存于
  `src/lib/data/lectures.json` 并播种进 SQLite，其余卦留空自动隐藏。

## 目录导览

```
docs/specs/vision.md        # 技术栈选型
docs/drafts/draft1.md       # 产品理念的源头视频稿
src/lib/trigrams.ts         # 八卦全息数据 + 两仪四象推导链
src/lib/engine/interpret.ts # 规则引擎（纯函数，前后端通用）
src/lib/engine/casting.ts   # 起卦算法（纯计算，不查经文）
src/lib/server/             # SQLite 适配层 + Server Functions
src/routes/                 # 四个页面（文件路由）
scripts/seed.ts             # 数据库重建脚本（bun:sqlite）
```

## 开发者

**Abel-数字牧民**
