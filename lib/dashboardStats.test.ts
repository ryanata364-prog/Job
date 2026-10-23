import test from 'node:test';
import assert from 'node:assert/strict';

import { buildDashboardStats } from './dashboardStats.ts';

test('returns zeros when there are no records', () => {
  const stats = buildDashboardStats({
    companies: [],
    jobs: [],
    users: [],
    applications: [],
  });

  assert.deepEqual(stats, {
    activeJobs: 0,
    companies: 0,
    jobSeekers: 0,
    hiresMade: 0,
  });
});

test('counts live database totals from real records', () => {
  const stats = buildDashboardStats({
    companies: [{ id: 'c1' }, { id: 'c2' }, { id: 'c3' }],
    jobs: [
      { id: 'j1', status: 'Active' },
      { id: 'j2', status: 'Draft' },
      { id: 'j3', status: 'Active' },
      { id: 'j4', status: 'Closed' },
    ],
    users: [
      { id: 'u1', role: 'seeker' },
      { id: 'u2', role: 'recruiter' },
      { id: 'u3', role: 'seeker' },
    ],
    applications: [
      { id: 'a1', status: 'Accepted' },
      { id: 'a2', status: 'Under Review' },
      { id: 'a3', status: 'Accepted' },
    ],
  });

  assert.deepEqual(stats, {
    activeJobs: 2,
    companies: 3,
    jobSeekers: 2,
    hiresMade: 2,
  });
});
