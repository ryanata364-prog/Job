import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, withCompanyJobCounts } from '@/lib/server/database';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const search = (request.nextUrl.searchParams.get('search') ?? '').toLowerCase();
  const database = await readDatabase();
  const companies = withCompanyJobCounts(database).filter((company) => {
    return !search || [company.name, company.industry, company.location].some((value) => value.toLowerCase().includes(search));
  });
  return NextResponse.json(companies);
}
