'use client';
import { AppStatus, JobStatus, InterviewStatus, UserStatus } from '@/lib/types';

type BadgeVariant = AppStatus | JobStatus | InterviewStatus | UserStatus | string;

const variantStyles: Record<string, string> = {
  'Applied': 'bg-blue-100 text-blue-700',
  'Under Review': 'bg-yellow-100 text-yellow-700',
  'Shortlisted': 'bg-purple-100 text-purple-700',
  'Interview': 'bg-indigo-100 text-indigo-700',
  'Accepted': 'bg-green-100 text-green-700',
  'Rejected': 'bg-red-100 text-red-700',
  'Draft': 'bg-gray-100 text-gray-700',
  'Active': 'bg-green-100 text-green-700',
  'Paused': 'bg-yellow-100 text-yellow-700',
  'Closed': 'bg-red-100 text-red-700',
  'Scheduled': 'bg-blue-100 text-blue-700',
  'Completed': 'bg-green-100 text-green-700',
  'Cancelled': 'bg-red-100 text-red-700',
  'Rescheduled': 'bg-orange-100 text-orange-700',
  'Pending': 'bg-yellow-100 text-yellow-700',
  'Suspended': 'bg-red-100 text-red-700',
  'Full-time': 'bg-blue-100 text-blue-700',
  'Part-time': 'bg-purple-100 text-purple-700',
  'Contract': 'bg-orange-100 text-orange-700',
  'Internship': 'bg-pink-100 text-pink-700',
  'Freelance': 'bg-teal-100 text-teal-700',
  'Remote': 'bg-green-100 text-green-700',
  'Hybrid': 'bg-blue-100 text-blue-700',
  'On-site': 'bg-gray-100 text-gray-700',
};

export default function StatusBadge({ status }: { status: BadgeVariant }) {
  const style = variantStyles[status] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}
