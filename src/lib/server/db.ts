import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import seedData from '../data/hexagrams.json'
import type { Hexagram, YaoLine } from '../types'
import { inTransaction, openSqlite, type SqliteDb } from './sqlite'

/**
 * SQLite 数据层。
 * 运行时自适应：Bun → bun:sqlite，Node → node:sqlite（见 ./sqlite.ts）。
 * 首次访问自动建表并从 hexagrams.json 播种；重播种用 `bun run seed`。
 */

const DB_DIR = join(process.cwd(), 'data')
const DB_PATH = join(DB_DIR, 'yifangce.db')

let dbPromise: Promise<SqliteDb> | null = null

async function getDb(): Promise<SqliteDb> {
  if (!dbPromise) {
    dbPromise = (async () => {
      mkdirSync(DB_DIR, { recursive: true })
      const db = await openSqlite(DB_PATH)
      db.exec('PRAGMA journal_mode = WAL')
      initSchema(db)
      const c = db.prepare('SELECT COUNT(*) AS c FROM hexagrams').get() as { c: number }
      if (c.c === 0) seed(db)
      return db
    })()
  }
  return dbPromise
}

function initSchema(d: SqliteDb) {
  d.exec(`
    CREATE TABLE IF NOT EXISTS hexagrams (
      id        INTEGER PRIMARY KEY,
      name      TEXT NOT NULL,
      full_name TEXT NOT NULL,
      upper     TEXT NOT NULL,
      lower     TEXT NOT NULL,
      guaci     TEXT NOT NULL,
      daxiang   TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS yaos (
      hex_id INTEGER NOT NULL REFERENCES hexagrams(id) ON DELETE CASCADE,
      ord    INTEGER NOT NULL,
      pos    TEXT NOT NULL,
      text   TEXT NOT NULL,
      xiang  TEXT NOT NULL,
      PRIMARY KEY (hex_id, ord)
    );
    CREATE INDEX IF NOT EXISTS idx_hex_trigrams ON hexagrams (upper, lower);
  `)
}

export async function seed(d: SqliteDb) {
  const insertHex = d.prepare(
    'INSERT OR REPLACE INTO hexagrams (id, name, full_name, upper, lower, guaci, daxiang) VALUES (?, ?, ?, ?, ?, ?, ?)',
  )
  const insertYao = d.prepare(
    'INSERT OR REPLACE INTO yaos (hex_id, ord, pos, text, xiang) VALUES (?, ?, ?, ?, ?)',
  )
  await inTransaction(d, () => {
    for (const h of seedData as Hexagram[]) {
      insertHex.run(h.id, h.name, h.fullName, h.upper, h.lower, h.guaci, h.daxiang)
      h.yaos.forEach((y: YaoLine, i: number) =>
        insertYao.run(h.id, i + 1, y.pos, y.text, y.xiang),
      )
    }
  })
}

interface HexRow {
  id: number
  name: string
  full_name: string
  upper: string
  lower: string
  guaci: string
  daxiang: string
}

function toHexagram(row: HexRow, yaos: YaoLine[]): Hexagram {
  return {
    id: row.id,
    name: row.name,
    fullName: row.full_name,
    upper: row.upper as Hexagram['upper'],
    lower: row.lower as Hexagram['lower'],
    guaci: row.guaci,
    daxiang: row.daxiang,
    yaos,
  }
}

function withYaos(row: HexRow | undefined, db: SqliteDb): Hexagram | null {
  if (!row) return null
  const yaos = db
    .prepare('SELECT pos, text, xiang FROM yaos WHERE hex_id = ? ORDER BY ord')
    .all(row.id) as unknown as YaoLine[]
  return toHexagram(row, yaos)
}

/** 全典列表（轻量列，不含爻辞） */
export async function listHexagrams(): Promise<Hexagram[]> {
  const db = await getDb()
  const rows = db
    .prepare('SELECT id, name, full_name, upper, lower, guaci, daxiang FROM hexagrams ORDER BY id')
    .all() as unknown as HexRow[]
  return rows.map((r) => toHexagram(r, []))
}

export async function getHexagramById(id: number): Promise<Hexagram | null> {
  const db = await getDb()
  const row = db
    .prepare('SELECT id, name, full_name, upper, lower, guaci, daxiang FROM hexagrams WHERE id = ?')
    .get(id) as unknown as HexRow | undefined
  return withYaos(row, db)
}

export async function getHexagramByTrigrams(upper: string, lower: string): Promise<Hexagram | null> {
  const db = await getDb()
  const row = db
    .prepare(
      'SELECT id, name, full_name, upper, lower, guaci, daxiang FROM hexagrams WHERE upper = ? AND lower = ?',
    )
    .get(upper, lower) as unknown as HexRow | undefined
  return withYaos(row, db)
}
