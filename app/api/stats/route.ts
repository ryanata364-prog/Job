
import { NextResponse } from 'next/server';
import { readDatabase } from '@/lib/server/database';
import { buildDashboardStats } from '@/lib/dashboardStats';

export async function GET() {
  try {
    const database = await readDatabase();

    const stats = buildDashboardStats({
      companies: database.companies,
      jobs: database.jobs,
      users: database.users,
      applications: database.applications,
    });

    return NextResponse.json({
      active_jobs: stats.activeJobs,
      companies: stats.companies,
      job_seekers: stats.jobSeekers,
      hires_made: stats.hiresMade,
    });
  } catch (error) {
    console.error('GET /api/stats failed:', error);

    return NextResponse.json(
      { error: 'Failed to load dashboard statistics.' },
      { status: 500 }
    );
  }
}
