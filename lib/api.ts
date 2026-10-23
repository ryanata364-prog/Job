import type { Application, Company, Interview, Job, User } from '@/lib/types';

const BASE = '/api';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers();
  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE}${path}`, {
    method: options.method ?? 'GET',
    credentials: 'same-origin',
    headers,
    body: options.body === undefined
      ? undefined
      : options.body instanceof FormData
        ? options.body
        : JSON.stringify(options.body),
  });

  if (!response.ok) {
    throw await response.json().catch(() => ({ detail: response.statusText }));
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export type AuthUser = User;

export function register(data: Pick<User, 'name' | 'email' | 'phone' | 'role'> & { password: string }) {
  return request<User>('/auth/register', { method: 'POST', body: data });
}

export function login(email: string, password: string) {
  return request<User>('/auth/login', { method: 'POST', body: { email, password } });
}

export function logout() {
  return request<{ ok: boolean }>('/auth/logout', { method: 'POST' });
}

export function getMe() {
  return request<User>('/auth/me');
}

export function updateMe(data: Partial<User>) {
  return request<User>('/auth/me', { method: 'PATCH', body: data });
}

export type JobFilters = {
  search?: string;
  category?: string;
  workplaceType?: string;
  type?: string;
  location?: string;
  title?: string;
  companyId?: string;
  status?: string;
};

export function getJobs(filters: JobFilters = {}) {
  const parameters = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) parameters.set(key, value);
  }
  const query = parameters.toString();
  return request<Job[]>(`/jobs${query ? `?${query}` : ''}`);
}

export function getJob(id: string) {
  return request<Job>(`/jobs/${id}`);
}

export function createJob(data: Partial<Job>) {
  return request<Job>('/jobs', { method: 'POST', body: data });
}

export function updateJob(id: string, data: Partial<Job>) {
  return request<Job>(`/jobs/${id}`, { method: 'PATCH', body: data });
}

export function deleteJob(id: string) {
  return request<void>(`/jobs/${id}`, { method: 'DELETE' });
}

export function getCompanies(search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return request<Company[]>(`/companies${query}`);
}

export function updateCompany(id: string, data: Partial<Company>) {
  return request<Company>(`/companies/${id}`, { method: 'PATCH', body: data });
}

export function getCompany(id: string) {
  return request<Company>(`/companies/${id}`);
}

export function getApplications(jobId?: string) {
  return request<Application[]>(`/applications${jobId ? `?job=${encodeURIComponent(jobId)}` : ''}`);
}

export function applyToJob(data: Pick<Application, 'jobId' | 'coverLetter' | 'portfolioUrl' | 'linkedinUrl'>) {
  return request<Application>('/applications', {
    method: 'POST',
    body: {
      job: data.jobId,
      coverLetter: data.coverLetter,
      portfolioUrl: data.portfolioUrl,
      linkedinUrl: data.linkedinUrl,
    },
  });
}

export function updateApplicationStatus(id: string, status: Application['status']) {
  return request<Application>(`/applications/${id}`, { method: 'PATCH', body: { status } });
}

export function deleteApplication(id: string) {
  return request<void>(`/applications/${id}`, { method: 'DELETE' });
}

export function getUsers(role?: User['role']) {
  const query = role ? `?role=${encodeURIComponent(role)}` : '';
  return request<User[]>(`/users${query}`);
}

export function updateUser(id: string, data: Partial<User>) {
  return request<User>(`/users/${id}`, { method: 'PATCH', body: data });
}

export function getInterviews() {
  return request<Interview[]>('/interviews');
}

export function createInterview(data: Omit<Interview, 'id' | 'candidateName' | 'candidateAvatar' | 'jobTitle'>) {
  return request<Interview>('/interviews', {
    method: 'POST',
    body: data,
  });
}

export function updateInterview(id: string, data: Partial<Pick<Interview, 'date' | 'time' | 'type' | 'meetingLink' | 'notes' | 'status'>>) {
  return request<Interview>(`/interviews/${id}`, { method: 'PATCH', body: data });
}

export function uploadResume(file: File) {
  const body = new FormData();
  body.set('resume', file);
  return request<User>('/auth/me', { method: 'PATCH', body });
}
