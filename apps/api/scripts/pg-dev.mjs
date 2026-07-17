// Local development Postgres via embedded-postgres (no system install).
// Starts a portable Postgres on port 5433 with database "gxo".
// DATABASE_URL: postgresql://postgres:postgres@localhost:5433/gxo
import EmbeddedPostgres from 'embedded-postgres';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(__dirname, '..', '.pgdata');

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: 'postgres',
  password: 'postgres',
  port: 5433,
  persistent: true,
});

const firstRun = !existsSync(dataDir);

try {
  if (firstRun) {
    console.log('[pg-dev] initialising cluster…');
    await pg.initialise();
  }
  await pg.start();
  console.log('[pg-dev] Postgres started on port 5433');
  try {
    await pg.createDatabase('gxo');
    console.log('[pg-dev] created database "gxo"');
  } catch {
    console.log('[pg-dev] database "gxo" already exists');
  }
  console.log('[pg-dev] ready: postgresql://postgres:postgres@localhost:5433/gxo');
} catch (e) {
  console.error('[pg-dev] failed:', e.message);
  process.exit(1);
}

// Keep alive
process.stdin.resume();
const shutdown = async () => { try { await pg.stop(); } catch {} process.exit(0); };
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
