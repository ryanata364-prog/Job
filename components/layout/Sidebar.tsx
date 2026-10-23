'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { LucideIcon, Menu, X, LogOut } from 'lucide-react';
import { logout } from '@/lib/auth';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

interface SidebarProps {
  items: NavItem[];
  role: 'seeker' | 'recruiter' | 'admin';
  userName?: string;
  userTitle?: string;
}

const roleColors = { seeker: 'bg-brand', recruiter: 'bg-brand-dark', admin: 'bg-gray-800' };

function SidebarContent({ items, role, userName, userTitle, bgColor, onLogout }: {
  items: NavItem[];
  role: 'seeker' | 'recruiter' | 'admin';
  userName: string;
  userTitle?: string;
  bgColor: string;
  onLogout: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className={`flex flex-col h-full ${bgColor}`}>
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <span className="text-white font-bold text-lg">HireFlow</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">{userName[0]}</span>
          </div>
          <div>
            <div className="text-white font-medium text-sm">{userName}</div>
            <div className="text-white/60 text-xs capitalize">{role}</div>
            {userTitle && <div className="text-white/60 text-xs">{userTitle}</div>}
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {items.map((item, i) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link key={`${item.href}-${i}`} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${active ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
              onClick={() => {}}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
              {item.badge ? (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{item.badge}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ items, role, userName = 'User', userTitle = '' }: SidebarProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const bgColor = roleColors[role];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setMobileOpen(!mobileOpen)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg text-white ${bgColor} shadow-lg`}>
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />}

      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed left-0 top-0 h-full w-64 z-40 transform transition-transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent items={items} role={role} userName={userName} userTitle={userTitle} bgColor={bgColor} onLogout={handleLogout} />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-64 flex-shrink-0 h-screen sticky top-0">
        <div className="w-full"><SidebarContent items={items} role={role} userName={userName} userTitle={userTitle} bgColor={bgColor} onLogout={handleLogout} /></div>
      </div>
    </>
  );
}
