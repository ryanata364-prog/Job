import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/server/auth';
import { readDatabase, updateDatabase, withCompanyJobCounts } from '@/lib/server/database';
import type { Company } from '@/lib/types';

export const runtime = 'nodejs';

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const { id } = await context.params;
  const database = await readDatabase();
  const company = withCompanyJobCounts(database).find((item) => item.id === id);
  if (!company) return NextResponse.json({ detail: 'Company not found.' }, { status: 404 });
  return NextResponse.json(company);
}

export async function PATCH(request: Request, context: Context) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'recruiter' && user.role !== 'admin')) {
    return NextResponse.json({ detail: 'Only recruiters can edit companies.' }, { status: 403 });
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as Partial<Company>;
  const allowedFields: Array<keyof Company> = [
    'name', 'logo', 'industry', 'location', 'size', 'website', 'description', 'benefits', 'founded',
  ];
  const result = await updateDatabase((database) => {
    const company = database.companies.find((item) => item.id === id);
    if (!company) return null;
    for (const field of allowedFields) {
      if (body[field] !== undefined) Object.assign(company, { [field]: body[field] });
    }
    return withCompanyJobCounts(database).find((item) => item.id === id) ?? null;
  });

  if (!result) return NextResponse.json({ detail: 'Company not found.' }, { status: 404 });
  return NextResponse.json(result);
}
