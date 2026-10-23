'use client';
import { useState, type ReactNode } from 'react';
import { User, Bell, Shield, Trash2, Globe, Moon, Save } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

interface SettingItemProps {
  icon: ReactNode;
  label: string;
  description: string;
  defaultChecked?: boolean;
}

function SettingItem({ icon, label, description, defaultChecked = false }: SettingItemProps) {
  const [enabled, setEnabled] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-200 last:border-0">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <div className="font-medium text-gray-900">{label}</div>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors">
        <input type="checkbox" checked={enabled} onChange={() => setEnabled(!enabled)} className="sr-only" />
        <span className={`inline-block h-6 w-11 rounded-full transition-colors ${enabled ? 'bg-brand' : 'bg-gray-300'}`}>
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : 'translate-x-1'}`} />
        </span>
      </label>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" /> Account Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Notifications</label>
                  <input type="email" defaultValue="alex@example.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-brand text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input type="password" defaultValue="••••••••"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-brand text-sm" />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <SettingItem
                  icon={<Bell className="w-5 h-5 text-gray-600" />}
                  label="Email notifications"
                  description="Receive notifications via email"
                  defaultChecked={true} />
                <SettingItem
                  icon={<Bell className="w-5 h-5 text-gray-600" />}
                  label="Application updates"
                  description="Get notified on application status changes"
                  defaultChecked={true} />
                <SettingItem
                  icon={<Bell className="w-5 h-5 text-gray-600" />}
                  label="Interview reminders"
                  description="Get reminders before interviews"
                  defaultChecked={true} />
                <SettingItem
                  icon={<Bell className="w-5 h-5 text-gray-600" />}
                  label="New job matches"
                  description="Receive alerts for matching jobs"
                  defaultChecked={false} />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy & Security</h2>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <SettingItem
                  icon={<Shield className="w-5 h-5 text-gray-600" />}
                  label="Profile visibility"
                  description="Make your profile visible to recruiters"
                  defaultChecked={true} />
                <SettingItem
                  icon={<Globe className="w-5 h-5 text-gray-600" />}
                  label="Public job applications"
                  description="Show your application history publicly"
                  defaultChecked={false} />
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button onClick={() => alert('Settings saved!')}
                className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-xl hover:bg-brand-dark transition-colors">
                <Save className="w-4 h-4" /> Save Settings
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
