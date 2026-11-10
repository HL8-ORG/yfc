/**
 * 重播种脚本：删除并重建 data/yifangce.db
 * 运行：bun run seed
 */
import { Database } from 'bun:sqlite'
import { rmSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import seedData from '../src/lib/data/hexagrams.json'
import type { Hexagram, YaoLine } from '../src/lib/types'

const DB_DIR = join(process.cwd(), 'data')
const DB_PATH = join(DB_DIR, 'yifangce.db')

mkdirSync(DB_DIR, { recursive: true })
rmSync(DB_PATH, { force: true })
rmSync(`${DB_PATH}-wal`, { force: true })
rmSync(`${DB_PATH}-shm`, { force: true })

const db = new Database(DB_PATH)
db.exec('PRAGMA journal_mode = WAL')
db.exec(`
  CREATE TABLE hexagrams (
    id INTEGER PRIMARY KEY, name TEXT NOT NULL, full_name TEXT NOT NULL,
    upper TEXT NOT NULL, lower TEXT NOT NULL, guaci TEXT NOT NULL, daxiang TEXT NOT NULL
  );
  CREATE TABLE yaos (
    hex_id INTEGER NOT NULL REFERENCES hexagrams(id) ON DELETE CASCADE,
    ord INTEGER NOT NULL, pos TEXT NOT NULL, text TEXT NOT NULL, xiang TEXT NOT NULL,
    PRIMARY KEY (hex_id, ord)
  );
  CREATE INDEX idx_hex_trigrams ON hexagrams (upper, lower);
`)

const insertHex = db.prepare(
  'INSERT INTO hexagrams (id, name, full_name, upper, lower, guaci, daxiang) VALUES (?, ?, ?, ?, ?, ?, ?)',
)
const insertYao = db.prepare(
  'INSERT INTO yaos (hex_id, ord, pos, text, xiang) VALUES (?, ?, ?, ?, ?)',
)

const tx = db.transaction(() => {
  for (const h of seedData as Hexagram[]) {
    insertHex.run(h.id, h.name, h.fullName, h.upper, h.lower, h.guaci, h.daxiang)
    h.yaos.forEach((y: YaoLine, i: number) => insertYao.run(h.id, i + 1, y.pos, y.text, y.xiang))
  }
})
tx()

const cnt = db.prepare('SELECT COUNT(*) AS c FROM hexagrams').get() as { c: number }
const ycnt = db.prepare('SELECT COUNT(*) AS c FROM yaos').get() as { c: number }
console.log(`已重建 ${DB_PATH}：${cnt.c} 卦，${ycnt.c} 条爻辞`)
db.close()
