'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Bell, ChevronDown } from 'lucide-react';
import { mockNotifications } from '@/lib/mockData';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const unread = mockNotifications.filter(n => !n.read).length;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="text-xl font-bold text-gray-900">HireFlow</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Home</Link>
            <Link href="/jobs" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Find Jobs</Link>
            <Link href="/companies" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Companies</Link>
            <Link href="#about" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">About</Link>
            <Link href="#contact" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Contact</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">A</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                  <Link href="/dashboard/seeker" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Job Seeker Dashboard</Link>
                  <Link href="/dashboard/recruiter" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Recruiter Dashboard</Link>
                  <Link href="/dashboard/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Admin Dashboard</Link>
                  <hr className="my-1" />
                  <Link href="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Login</Link>
                </div>
              )}
            </div>
            <Link href="/login" className="px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors">Login</Link>
            <Link href="/register" className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">Register</Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-3">
          <Link href="/" className="block text-gray-700 font-medium py-2">Home</Link>
          <Link href="/jobs" className="block text-gray-700 font-medium py-2">Find Jobs</Link>
          <Link href="/companies" className="block text-gray-700 font-medium py-2">Companies</Link>
          <Link href="/dashboard/seeker" className="block text-gray-700 font-medium py-2">Seeker Dashboard</Link>
          <Link href="/dashboard/recruiter" className="block text-gray-700 font-medium py-2">Recruiter Dashboard</Link>
          <Link href="/dashboard/admin" className="block text-gray-700 font-medium py-2">Admin Dashboard</Link>
          <div className="flex gap-3 pt-2">
            <Link href="/login" className="flex-1 text-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg font-medium">Login</Link>
            <Link href="/register" className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">Register</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
