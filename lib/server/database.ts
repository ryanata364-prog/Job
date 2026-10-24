
import { randomUUID } from 'node:crypto';
import { supabaseAdmin } from '@/lib/server/supabaseAdmin';
import type {
  Application,
  Company,
  Interview,
  Job,
  User,
} from '@/lib/types';

export type StoredUser = User & {
  passwordHash: string;
};

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

type DatabaseKey =
  | 'users'
  | 'companies'
  | 'jobs'
  | 'applications'
  | 'interviews'
  | 'sessions';

const DATABASE_KEY: DatabaseKey[] = [
  'users',
  'companies',
  'jobs',
  'applications',
  'interviews',
  'sessions',
];

function emptyDatabase(): Database {
  return {
    users: [],
    companies: [],
    jobs: [],
    applications: [],
    interviews: [],
    sessions: [],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

async function readStoredDatabase(): Promise<Database> {
  const { data, error } = await supabaseAdmin
    .from('app_database')
    .select('key, data')
    .in('key', DATABASE_KEY);

  if (error) {
    throw new Error(`Unable to read application database: ${error.message}`);
  }

  const database = emptyDatabase();

  for (const row of data ?? []) {
    if (!isRecord(row) || typeof row.key !== 'string') {
      continue;
    }

    const key = row.key as DatabaseKey;

    if (
      DATABASE_KEY.includes(key) &&
      Array.isArray(row.data)
    ) {
      database[key] = row.data as never;
    }
  }

  return database;
}

export async function readDatabase(): Promise<Database> {
  return readStoredDatabase();
}

export async function updateDatabase<T>(
  change: (database: Database) => T | Promise<T>,
): Promise<T> {
  // Read the current state and apply the requested change.
  const database = await readStoredDatabase();
  const result = await change(database);

  // Persist every collection to Supabase.
  const rows = DATABASE_KEY.map((key) => ({
    key,
    data: database[key],
  }));

  const { error } = await supabaseAdmin
    .from('app_database')
    .upsert(rows, { onConflict: 'key' });

  if (error) {
    throw new Error(`Unable to save application database: ${error.message}`);
  }

  return result;
}

export function createId(prefix: string): string {
  return `${prefix}_${randomUUID()}`;
}

export function toPublicUser(user: StoredUser): User {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

export function withCompanyJobCounts(
  database: Database,
): Company[] {
  return database.companies.map((company) => ({
    ...company,
    jobCount: database.jobs.filter(
      (job) =>
        job.companyId === company.id &&
        job.status === 'Active',
    ).length,
  }));
}
