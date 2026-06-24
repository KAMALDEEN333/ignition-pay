import { copyFileSync, mkdirSync, readdirSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const databaseUrl = requireEnv('DATABASE_URL');
const backupDir = path.resolve(process.env.DATABASE_BACKUP_DIR ?? './backups/database');
const archiveDir = process.env.DATABASE_BACKUP_ARCHIVE_DIR
  ? path.resolve(process.env.DATABASE_BACKUP_ARCHIVE_DIR)
  : undefined;
const retentionDays = Number.parseInt(process.env.DATABASE_BACKUP_RETENTION_DAYS ?? '14', 10);
const prefix = process.env.DATABASE_BACKUP_PREFIX ?? 'ignition-pay';
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(backupDir, `${prefix}-${timestamp}.dump`);
const metadataFile = `${backupFile}.json`;

if (!Number.isFinite(retentionDays) || retentionDays < 1) {
  throw new Error('DATABASE_BACKUP_RETENTION_DAYS must be a positive integer');
}

mkdirSync(backupDir, { recursive: true });
if (archiveDir) {
  mkdirSync(archiveDir, { recursive: true });
}

run('pg_dump', [
  '--format=custom',
  '--compress=9',
  '--no-owner',
  '--no-privileges',
  '--file',
  backupFile,
  databaseUrl,
]);

const metadata = {
  createdAt: new Date().toISOString(),
  fileName: path.basename(backupFile),
  format: 'pg_dump custom',
  source: redactDatabaseUrl(databaseUrl),
  retentionDays,
};

writeFileSync(metadataFile, `${JSON.stringify(metadata, null, 2)}\n`);

if (archiveDir) {
  copyFileSync(backupFile, path.join(archiveDir, path.basename(backupFile)));
  copyFileSync(metadataFile, path.join(archiveDir, path.basename(metadataFile)));
}

pruneOldBackups(backupDir, retentionDays, prefix);
if (archiveDir) {
  pruneOldBackups(archiveDir, retentionDays, prefix);
}

console.log(`Database backup written to ${backupFile}`);

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function run(command, args) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.status !== 0) {
    const details = result.stderr || result.stdout || `${command} failed`;
    throw new Error(details.trim());
  }
}

function pruneOldBackups(directory, days, filePrefix) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  for (const fileName of readdirSync(directory)) {
    if (!fileName.startsWith(filePrefix) || !fileName.match(/\.dump(\.json)?$/)) {
      continue;
    }

    const filePath = path.join(directory, fileName);
    if (statSync(filePath).mtimeMs < cutoff) {
      unlinkSync(filePath);
    }
  }
}

function redactDatabaseUrl(value) {
  try {
    const url = new URL(value);
    if (url.username) {
      url.username = '***';
    }
    if (url.password) {
      url.password = '***';
    }
    return url.toString();
  } catch {
    return '<redacted>';
  }
}
