'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, ChevronDown, LogOut, Menu, X, LayoutDashboard, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getMe, logout } from '@/lib/auth';
import type { User as AppUser } from '@/lib/types';

export default function Navbar() {
  const router        = useRouter();
  const pathname      = usePathname();
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser]                 = useState<AppUser | null>(null);
  const [loading, setLoading]           = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  // ── Load user on mount + listen to Supabase auth changes ────────
  useEffect(() => {
    // Initial load
    getMe()
      .then(u => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

    // Subscribe to auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const u = await getMe().catch(() => null);
          setUser(u);
        }
        if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Close user menu when clicking outside ───────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Close mobile menu on route change ───────────────────────────
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // ── Redirect from login/register if already logged in ───────────
  useEffect(() => {
    if (!loading && user && (pathname === '/login' || pathname === '/register')) {
      router.replace(`/dashboard/${user.role}`);
    }
  }, [loading, user, pathname, router]);

  const dashboardPath = user ? `/dashboard/${user.role}` : '/login';

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setMobileOpen(false);
    await logout().catch(() => undefined);
    setUser(null);
    router.push('/');
    router.refresh();
  };

  const initials = user?.name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-sm font-bold text-white">H</span>
            </div>
            <span className="text-xl font-bold text-gray-900">HireFlow</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/" className="font-medium text-gray-600 transition-colors hover:text-blue-600">
              Home
            </Link>
            <Link href="/jobs" className="font-medium text-gray-600 transition-colors hover:text-blue-600">
              Find Jobs
            </Link>
            <Link href="/companies" className="font-medium text-gray-600 transition-colors hover:text-blue-600">
              Companies
            </Link>
          </div>

          {/* Desktop right side */}
          <div className="hidden items-center gap-3 md:flex">

            {/* Loading skeleton */}
            {loading && (
              <div className="flex items-center gap-3">
                <div className="h-8 w-16 animate-pulse rounded-lg bg-gray-100" />
                <div className="h-8 w-20 animate-pulse rounded-lg bg-gray-100" />
              </div>
            )}

            {/* Logged OUT */}
            {!loading && !user && (
              <>
                <Link href="/login"
                  className="rounded-lg px-4 py-2 font-medium text-blue-600 transition-colors hover:bg-blue-50">
                  Login
                </Link>
                <Link href="/register"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700">
                  Register
                </Link>
              </>
            )}

            {/* Logged IN */}
            {!loading && user && (
              <>
                {/* Post a Job — recruiter / admin only */}
                {(user.role === 'recruiter' || user.role === 'admin') && (
                  <Link href="/post-job"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50">
                    Post a Job
                  </Link>
                )}

                {/* Dashboard link */}
                <Link href={dashboardPath}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-blue-600">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>

                {/* Applications bell */}
                <Link href="/applications" aria-label="My applications"
                  className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-blue-600">
                  <Bell className="h-5 w-5" />
                </Link>

                {/* Avatar + dropdown */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setUserMenuOpen(o => !o)}
                    className="flex items-center gap-2 rounded-lg p-2 transition-colors hover:bg-gray-100"
                    aria-label="User menu"
                    aria-expanded={userMenuOpen}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      <span className="text-sm font-semibold text-blue-600">{initials}</span>
                    </div>
                    <span className="max-w-28 truncate text-sm font-medium text-gray-700">{user.name}</span>
                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                      {/* User info */}
                      <div className="px-4 py-2.5 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                      </div>

                      <Link href={dashboardPath} onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <LayoutDashboard className="h-4 w-4 text-gray-400" /> My Dashboard
                      </Link>
                      <Link href="/profile" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <User className="h-4 w-4 text-gray-400" /> My Profile
                      </Link>
                      <Link href="/applications" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Bell className="h-4 w-4 text-gray-400" /> My Applications
                      </Link>

                      <hr className="my-1 border-gray-100" />

                      <button onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="p-2 md:hidden" aria-label="Toggle menu"
            onClick={() => setMobileOpen(o => !o)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="space-y-1 border-t border-gray-200 bg-white px-4 py-4 md:hidden">
          <Link href="/" className="block rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-50">
            Home
          </Link>
          <Link href="/jobs" className="block rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-50">
            Find Jobs
          </Link>
          <Link href="/companies" className="block rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-50">
            Companies
          </Link>

          {/* Logged IN mobile */}
          {!loading && user && (
            <>
              <hr className="my-2 border-gray-100" />
              <div className="px-3 py-2">
                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
              <Link href={dashboardPath}
                className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-50">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <Link href="/profile"
                className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-50">
                <User className="h-4 w-4" /> My Profile
              </Link>
              <Link href="/applications"
                className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-50">
                <Bell className="h-4 w-4" /> My Applications
              </Link>
              {(user.role === 'recruiter' || user.role === 'admin') && (
                <Link href="/post-job"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-50">
                  Post a Job
                </Link>
              )}
              <hr className="my-2 border-gray-100" />
              <button onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 font-medium text-red-600 hover:bg-red-50">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </>
          )}

          {/* Logged OUT mobile */}
          {!loading && !user && (
            <div className="flex gap-3 pt-3">
              <Link href="/login"
                className="flex-1 rounded-lg border border-blue-600 px-4 py-2 text-center font-medium text-blue-600">
                Login
              </Link>
              <Link href="/register"
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-center font-medium text-white">
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
