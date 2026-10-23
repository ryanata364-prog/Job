'use client';
import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LucideIcon, Home, Briefcase, Users, FileText,
  MessageCircle, Settings, Bookmark, Calendar,
  BarChart3, Building,
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import { getMe, logout } from '@/lib/auth';
import type { User } from '@/lib/types';

type Role = 'seeker' | 'recruiter' | 'admin';

interface DashboardLayoutProps {
  children: ReactNode;
  role: Role;
}

const navItems: Record<Role, Array<{ label: string; href: string; icon: LucideIcon }>> = {
  seeker: [
    { label: 'Dashboard',        href: '/dashboard/seeker', icon: Home },
    { label: 'My Applications',  href: '/applications',     icon: FileText },
    { label: 'Saved Jobs',       href: '/saved-jobs',       icon: Bookmark },
    { label: 'Interviews',       href: '/interviews',       icon: Calendar },
    { label: 'Messages',         href: '/messages',         icon: MessageCircle },
    { label: 'My Resume',        href: '/resume',           icon: Briefcase },
    { label: 'Profile',          href: '/profile',          icon: Users },
    { label: 'Settings',         href: '/settings',         icon: Settings },
  ],
  recruiter: [
    { label: 'Dashboard',        href: '/dashboard/recruiter', icon: Home },
    { label: 'Post a Job',       href: '/post-job',            icon: Briefcase },
    { label: 'Applications',     href: '/applications',        icon: FileText },
    { label: 'Interviews',       href: '/interviews',          icon: Calendar },
    { label: 'Messages',         href: '/messages',            icon: MessageCircle },
    { label: 'Analytics',        href: '/dashboard/recruiter', icon: BarChart3 },
    { label: 'Company Profile',  href: '/profile',             icon: Building },
    { label: 'Settings',         href: '/settings',            icon: Settings },
  ],
  admin: [
    { label: 'Dashboard',        href: '/dashboard/admin', icon: Home },
    { label: 'Users',            href: '/dashboard/admin', icon: Users },
    { label: 'Companies',        href: '/companies',       icon: Building },
    { label: 'Jobs',             href: '/jobs',            icon: Briefcase },
    { label: 'Applications',     href: '/applications',    icon: FileText },
    { label: 'Settings',         href: '/settings',        icon: Settings },
  ],
};

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(currentUser => {
        if (!currentUser) {
          // Not logged in → go to login
          router.replace('/login');
          return;
        }

        if (currentUser.status === 'Suspended') {
          // Suspended account → log out and redirect
          void logout().finally(() => router.replace('/login?suspended=1'));
          return;
        }

        if (currentUser.status === 'Pending') {
          // Recruiter pending approval
          void logout().finally(() => router.replace('/login?pending=1'));
          return;
        }

        if (currentUser.role !== role) {
          // Role changed → log out and redirect to login
          void logout().finally(() => router.replace('/login'));
          return;
        }

        setUser(currentUser);
      })
      .catch(() => router.replace('/login'))
      .finally(() => setLoading(false));
  }, [role, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        items={navItems[role]}
        role={role}
        userName={user.name}
        userTitle={user.title}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
