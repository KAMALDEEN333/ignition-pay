import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const backupFile = requireEnv('BACKUP_FILE');

if (!existsSync(backupFile)) {
  throw new Error(`Backup file not found: ${backupFile}`);
}

run('pg_restore', ['--list', path.resolve(backupFile)]);

console.log(`Database backup is readable: ${backupFile}`);

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
