/**
 * SQLite 适配层：同一套代码，两个运行时各自的「内置 SQLite」。
 *   - Bun（生产，`bun .output/server/index.mjs`）→ bun:sqlite
 *   - Node（开发，vite dev 管线）→ node:sqlite（Node ≥22.5 内置）
 * 零第三方依赖、零原生编译。
 */

export interface Stmt {
  get(...params: unknown[]): unknown
  all(...params: unknown[]): unknown[]
  run(...params: unknown[]): unknown
}

export interface SqliteDb {
  exec(sql: string): void
  prepare(sql: string): Stmt
  close(): void
}

export const isBun = typeof Bun !== 'undefined'

export async function openSqlite(path: string): Promise<SqliteDb> {
  if (isBun) {
    // 拼接 specifier，避免打包器静态解析后在 Node 侧报错
    const spec = 'bun' + ':sqlite'
    const mod = (await import(/* @vite-ignore */ spec)) as {
      Database: new (p: string) => {
        exec(s: string): void
        prepare(s: string): Stmt
        close(): void
      }
    }
    const d = new mod.Database(path)
    return { exec: (s) => d.exec(s), prepare: (s) => d.prepare(s), close: () => d.close() }
  }
  const { DatabaseSync } = await import('node:sqlite')
  const d = new DatabaseSync(path) as unknown as {
    exec(s: string): void
    prepare(s: string): Stmt
    close(): void
  }
  return { exec: (s) => d.exec(s), prepare: (s) => d.prepare(s), close: () => d.close() }
}

/** 手工事务：BEGIN/COMMIT/ROLLBACK，两个运行时通用 */
export function inTransaction<T>(db: SqliteDb, fn: () => T): T {
  db.exec('BEGIN')
  try {
    const r = fn()
    db.exec('COMMIT')
    return r
  } catch (e) {
    db.exec('ROLLBACK')
    throw e
  }
}
