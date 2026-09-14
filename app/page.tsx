'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ArrowRight, Star, Users, Briefcase, TrendingUp, CheckCircle, ChevronRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { mockJobs, mockCompanies, jobCategories, testimonials } from '@/lib/mockData';

export default function HomePage() {
  const router = useRouter();
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  const handleSearch = () => {
    router.push(`/jobs?title=${searchTitle}&location=${searchLocation}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm mb-6">
            <TrendingUp className="w-4 h-4" />
            <span>Over 10,000+ jobs available</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Find Your Dream Job.<br />Build Your Future.
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Connect with top companies and discover opportunities that match your skills and ambitions.
          </p>

          <div className="bg-white rounded-2xl p-3 flex flex-col md:flex-row gap-3 max-w-3xl mx-auto shadow-xl">
            <div className="flex items-center gap-3 flex-1 px-3">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input value={searchTitle} onChange={e => setSearchTitle(e.target.value)}
                placeholder="Job title, keywords, or company"
                className="flex-1 outline-none text-gray-900 placeholder-gray-400 text-sm"
                onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            </div>
            <div className="hidden md:block w-px bg-gray-200" />
            <div className="flex items-center gap-3 flex-1 px-3">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input value={searchLocation} onChange={e => setSearchLocation(e.target.value)}
                placeholder="City, state, or remote"
                className="flex-1 outline-none text-gray-900 placeholder-gray-400 text-sm"
                onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            </div>
            <button onClick={handleSearch}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap">
              Search Jobs
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-6 text-sm text-blue-200">
            <span>Popular:</span>
            {['React Developer', 'UX Designer', 'Data Scientist', 'Product Manager'].map(t => (
              <button key={t} onClick={() => { setSearchTitle(t); router.push(`/jobs?title=${t}`); }}
                className="hover:text-white transition-colors underline underline-offset-2">{t}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '50K+', label: 'Active Jobs' },
            { value: '10K+', label: 'Companies' },
            { value: '2M+', label: 'Job Seekers' },
            { value: '500K+', label: 'Hires Made' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-3xl font-bold text-blue-600 mb-1">{s.value}</div>
              <div className="text-gray-500 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Jobs</h2>
              <p className="text-gray-500 mt-1">Hand-picked opportunities from top companies</p>
            </div>
            <Link href="/jobs" className="flex items-center gap-1 text-blue-600 font-medium hover:gap-2 transition-all">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {mockJobs.slice(0, 6).map(job => (
              <div key={job.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">{job.companyLogo}</div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/jobs/${job.id}`} className="font-semibold text-gray-900 hover:text-blue-600 block truncate">{job.title}</Link>
                    <div className="text-sm text-gray-500">{job.company}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium">{job.type}</span>
                  <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md font-medium">{job.workplaceType}</span>
                </div>
                <div className="text-sm text-gray-500 mb-3">📍 {job.location} · 💰 {job.salary}</div>
                <div className="flex gap-2">
                  <Link href={`/jobs/${job.id}`} className="flex-1 text-center py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">View Details</Link>
                  <Link href={`/jobs/${job.id}?apply=true`} className="flex-1 text-center py-2 border border-blue-600 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors">Apply</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Popular Job Categories</h2>
            <p className="text-gray-500 mt-2">Explore opportunities across different industries</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {jobCategories.map(cat => (
              <Link key={cat.name} href={`/jobs?category=${cat.name}`}
                className="bg-white border border-gray-200 rounded-xl p-5 text-center hover:border-blue-300 hover:shadow-md transition-all group">
                <div className="text-3xl mb-3">{cat.icon}</div>
                <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{cat.name}</div>
                <div className="text-sm text-gray-500 mt-1">{cat.count} jobs</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Companies */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Companies</h2>
              <p className="text-gray-500 mt-1">Top employers actively hiring</p>
            </div>
            <Link href="/companies" className="flex items-center gap-1 text-blue-600 font-medium hover:gap-2 transition-all">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {mockCompanies.map(company => (
              <Link key={company.id} href={`/companies/${company.id}`}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-3xl">{company.logo}</div>
                  <div>
                    <div className="font-semibold text-gray-900">{company.name}</div>
                    <div className="text-sm text-gray-500">{company.industry}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-500 mb-3">📍 {company.location} · 👥 {company.size}</div>
                <div className="text-sm text-gray-600 line-clamp-2 mb-3">{company.description}</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-600">{company.jobCount} open positions</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="text-gray-500 mt-2">Get hired in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: '👤', title: 'Create Your Profile', desc: 'Sign up and build your professional profile with your skills, experience, and resume.' },
              { step: '02', icon: '🔍', title: 'Find & Apply', desc: 'Search thousands of jobs, filter by your preferences, and apply with one click.' },
              { step: '03', icon: '🎉', title: 'Get Hired', desc: 'Track your applications, attend interviews, and land your dream job.' },
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">{item.icon}</div>
                <div className="text-blue-600 font-bold text-sm mb-2">STEP {item.step}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">What People Say</h2>
            <p className="text-gray-500 mt-2">Success stories from our community</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-600 mb-4 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full bg-gray-200" />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-gray-500 text-xs">{t.title} · {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Take the Next Step?</h2>
          <p className="text-blue-100 mb-8 text-lg">Join millions of professionals who found their dream jobs through HireFlow.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors">
              Get Started Free
            </Link>
            <Link href="/jobs" className="px-8 py-3 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors">
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="text-white font-bold text-lg">HireFlow</span>
            </div>
            <p className="text-sm">The modern job recruitment platform connecting talent with opportunity.</p>
          </div>
          {[
            { title: 'For Job Seekers', links: ['Find Jobs', 'Companies', 'Resume Builder', 'Career Advice'] },
            { title: 'For Employers', links: ['Post a Job', 'Find Candidates', 'Pricing', 'Recruiter Tools'] },
            { title: 'Company', links: ['About Us', 'Blog', 'Careers', 'Contact'] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-white font-semibold mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(l => <li key={l}><a href="#" className="text-sm hover:text-white transition-colors">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          © 2025 HireFlow. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
