import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server/supabaseAdmin';
import type { Company } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const search = (request.nextUrl.searchParams.get('search') ?? '').toLowerCase();

  let query = supabaseAdmin
    .from('companies')
    .select('*, jobs(id, status)');

  if (search) {
    query = query.or(`name.ilike.%${search}%,industry.ilike.%${search}%,location.ilike.%${search}%`);
  }

  const { data, error } = await query.order('name');

  if (error) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }

  const companies: Company[] = (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const jobRows = Array.isArray(r.jobs) ? (r.jobs as Array<{ status: string }>) : [];
    return {
      id:          String(r.id ?? ''),
      name:        String(r.name ?? ''),
      logo:        String(r.logo ?? '🏢'),
      industry:    String(r.industry ?? ''),
      location:    String(r.location ?? ''),
      size:        String(r.size ?? ''),
      website:     String(r.website ?? ''),
      description: String(r.description ?? ''),
      benefits:    Array.isArray(r.benefits) ? (r.benefits as string[]) : [],
      founded:     String(r.founded ?? ''),
      jobCount:    jobRows.filter(j => j.status === 'Active').length,
    };
  });

  return NextResponse.json(companies);
}
