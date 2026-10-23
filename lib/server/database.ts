import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { mockApplications, mockCompanies, mockInterviews, mockJobs, mockUsers } from '@/lib/mockData';
import type { Application, Company, Interview, Job, User } from '@/lib/types';
import { hashPassword } from './passwords';

export type StoredUser = User & { passwordHash: string };

export type Session = {
  token: string;
  userId: string;
  expiresAt: string;
};

export type Database = {
  users: StoredUser[];
  companies: Company[];
  jobs: Job[];
  applications: Application[];
  interviews: Interview[];
  sessions: Session[];
};

const dataDirectory = path.join(process.cwd(), 'data');
const databaseFile = path.join(dataDirectory, 'hireflow.json');
let writeQueue: Promise<void> = Promise.resolve();

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

async function createSeedDatabase(): Promise<Database> {
  const passwordHash = await hashPassword('Password123!');

  return {
    users: mockUsers.map((user) => ({ ...clone(user), passwordHash })),
    companies: clone(mockCompanies),
    jobs: clone(mockJobs),
    applications: clone(mockApplications),
    interviews: clone(mockInterviews),
    sessions: [],
  };
}

async function ensureDatabase(): Promise<Database> {
  try {
    const database = JSON.parse(await readFile(databaseFile, 'utf8')) as Database;
    if (!Array.isArray(database.interviews)) {
      database.interviews = clone(mockInterviews);
      await writeFile(databaseFile, JSON.stringify(database, null, 2), 'utf8');
    }
    return database;
  } catch (error: unknown) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== 'ENOENT') throw error;

    const database = await createSeedDatabase();
    await mkdir(dataDirectory, { recursive: true });
    await writeFile(databaseFile, JSON.stringify(database, null, 2), 'utf8');
    return database;
  }
}

export async function readDatabase(): Promise<Database> {
  return ensureDatabase();
}

export async function updateDatabase<T>(change: (database: Database) => T | Promise<T>): Promise<T> {
  const operation = writeQueue.then(async () => {
    const database = await ensureDatabase();
    const result = await change(database);
    await mkdir(dataDirectory, { recursive: true });
    await writeFile(databaseFile, JSON.stringify(database, null, 2), 'utf8');
    return result;
  });

  writeQueue = operation.then(() => undefined, () => undefined);
  return operation;
}

export function createId(prefix: string): string {
  return `${prefix}_${randomUUID()}`;
}

export function toPublicUser(user: StoredUser): User {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

export function withCompanyJobCounts(database: Database): Company[] {
  return database.companies.map((company) => ({
    ...company,
    jobCount: database.jobs.filter((job) => job.companyId === company.id && job.status === 'Active').length,
  }));
}
