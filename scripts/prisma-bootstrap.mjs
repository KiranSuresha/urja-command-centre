import 'dotenv/config'

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { DatabaseSync } from 'node:sqlite'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl?.startsWith('file:')) {
  throw new Error(`Expected a SQLite file DATABASE_URL, received: ${databaseUrl ?? 'undefined'}`)
}

const relativePath = databaseUrl.slice('file:'.length)
const databasePath = path.resolve(process.cwd(), relativePath)
const database = new DatabaseSync(databasePath)

try {
  const tableCheck = database
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'User'")
    .get()

  if (tableCheck) {
    console.log('SQLite schema already exists, skipping bootstrap.')
    process.exit(0)
  }

  const migrationPath = path.join(
    process.cwd(),
    'prisma',
    'migrations',
    '20260324143719_init',
    'migration.sql'
  )

  const sql = fs.readFileSync(migrationPath, 'utf8')
  database.exec(sql)
  console.log('SQLite schema bootstrapped from migration.sql.')
} finally {
  database.close()
}
