'use client';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { mockCompanies } from '@/lib/mockData';

export default function CompaniesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Companies</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockCompanies.map(c => (
            <Link key={c.id} href={`/jobs?title=${encodeURIComponent(c.name)}`} className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-2">
                <img src={c.logo} alt={c.name} className="w-10 h-10 rounded-lg object-cover" />
                <div>
                  <h2 className="font-semibold text-gray-900">{c.name}</h2>
                  <p className="text-sm text-gray-500">{c.industry} · {c.location}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{c.description}</p>
              <p className="text-xs text-gray-400">{c.jobCount} open jobs</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
