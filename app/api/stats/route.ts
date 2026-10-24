import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server/supabaseAdmin';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const [jobsRes, companiesRes, seekersRes, hiresRes] = await Promise.all([
      supabaseAdmin.from('jobs').select('id', { count: 'exact', head: true }).eq('status', 'Active'),
      supabaseAdmin.from('companies').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'seeker'),
      supabaseAdmin.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'Accepted'),
    ]);

    return NextResponse.json({
      active_jobs:  jobsRes.count  ?? 0,
      companies:    companiesRes.count ?? 0,
      job_seekers:  seekersRes.count ?? 0,
      hires_made:   hiresRes.count  ?? 0,
    });
  } catch (error) {
    console.error('GET /api/stats failed:', error);
    return NextResponse.json({ error: 'Failed to load statistics.' }, { status: 500 });
  }
}
