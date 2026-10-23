export type DashboardStatsInput = {
  companies: unknown[];
  jobs: unknown[];
  users: unknown[];
  applications: unknown[];
};

export type DashboardStats = {
  activeJobs: number;
  companies: number;
  jobSeekers: number;
  hiresMade: number;
};

export function buildDashboardStats({
  companies,
  jobs,
  users,
  applications,
}: DashboardStatsInput): DashboardStats {
  return {
    activeJobs: jobs.filter((job) => String((job as { status?: string } | null)?.status ?? '') === 'Active').length,
    companies: companies.length,
    jobSeekers: users.filter((user) => String((user as { role?: string } | null)?.role ?? '') === 'seeker').length,
    hiresMade: applications.filter((application) => String((application as { status?: string } | null)?.status ?? '') === 'Accepted').length,
  };
}
