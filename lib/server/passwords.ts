import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString('hex')}`;
}

export async function verifyPassword(password: string, storedValue: string): Promise<boolean> {
  const [salt, storedHash] = storedValue.split(':');
  if (!salt || !storedHash) return false;

  const actualHash = (await scrypt(password, salt, 64)) as Buffer;
  const expectedHash = Buffer.from(storedHash, 'hex');
  return expectedHash.length === actualHash.length && timingSafeEqual(expectedHash, actualHash);
}
