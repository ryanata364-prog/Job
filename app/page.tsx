'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ArrowRight, TrendingUp, ChevronRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

import { getCompanies, getJobs } from '@/lib/api';
import type { Company, Job } from '@/lib/types';

type HomeStats = {
  activeJobs: number;
  companies: number;
  jobSeekers: number;
  hiresMade: number;
};

const content = {
  hero: {
    badge: 'Over 10,000+ jobs available',
    title: 'Find Your Dream Job.\nBuild Your Future.',
    subtitle: 'Connect with top companies and discover opportunities that match your skills and ambitions.',
    searchPlaceholder: 'Job title, keywords, or company',
    locationPlaceholder: 'City, state, or remote',
    searchButton: 'Search Jobs',
    popular: 'Popular:',
    popularTags: ['React Developer', 'UX Designer', 'Data Scientist', 'Product Manager'],
  },
  stats: [
    { label: 'Active Jobs' },
    { label: 'Companies' },
    { label: 'Job Seekers' },
    { label: 'Hires Made' },
  ],
  featuredJobs: {
    title: 'Featured Jobs',
    subtitle: 'Hand-picked opportunities from top companies',
    viewAll: 'View all',
  },
  categories: {
    title: 'Popular Job Categories',
    subtitle: 'Explore opportunities across different industries',
  },
  companies: {
    title: 'Featured Companies',
    subtitle: 'Top employers actively hiring',
    viewAll: 'View all',
  },
  howItWorks: {
    title: 'How It Works',
    subtitle: 'Get hired in 3 simple steps',
    steps: [
      { step: '01', icon: '👤', title: 'Create Your Profile', desc: 'Sign up and build your professional profile with your skills, experience, and resume.' },
      { step: '02', icon: '🔍', title: 'Find & Apply', desc: 'Search thousands of jobs, filter by your preferences, and apply with one click.' },
      { step: '03', icon: '🎉', title: 'Get Hired', desc: 'Track your applications, attend interviews, and land your dream job.' },
    ],
  },
  testimonials: {
    title: 'What People Say',
    subtitle: 'Success stories from our community',
  },
  cta: {
    title: 'Ready to Take the Next Step?',
    subtitle: 'Join millions of professionals who found their dream jobs through HireFlow.',
    getStarted: 'Get Started Free',
    browseJobs: 'Browse Jobs',
  },
  footer: {
    description: 'The modern job recruitment platform connecting talent with opportunity.',
    copyright: '© 2025 HireFlow. All rights reserved.',
    columns: [
      { title: 'For Job Seekers', links: ['Find Jobs', 'Companies', 'Resume Builder', 'Career Advice'] },
      { title: 'For Employers', links: ['Post a Job', 'Find Candidates', 'Pricing', 'Recruiter Tools'] },
      { title: 'Company', links: ['About Us', 'Blog', 'Careers', 'Contact'] },
    ],
  },
};

const backgroundImage = '/rr.png';

export default function HomePage() {
  const router = useRouter();
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState<HomeStats>({
    activeJobs: 0,
    companies: 0,
    jobSeekers: 0,
    hiresMade: 0,
  });

  useEffect(() => {
    getJobs().then((loadedJobs) => {
      setJobs(loadedJobs);
      setStats((current) => ({ ...current, activeJobs: loadedJobs.filter((job) => job.status === 'Active').length }));
    }).catch(() => undefined);

    getCompanies().then((loadedCompanies) => {
      setCompanies(loadedCompanies);
      setStats((current) => ({ ...current, companies: loadedCompanies.length }));
    }).catch(() => undefined);

    fetch('/api/stats')
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!data) return;
        setStats({
          activeJobs: Number(data.active_jobs ?? 0),
          companies: Number(data.companies ?? 0),
          jobSeekers: Number(data.job_seekers ?? 0),
          hiresMade: Number(data.hires_made ?? 0),
        });
      })
      .catch(() => undefined);
  }, []);

  const handleSearch = () => {
    router.push(`/jobs?title=${searchTitle}&location=${searchLocation}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section
        className="relative bg-cover bg-center bg-no-repeat text-white py-20 px-4 min-h-[75vh]"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-6xl mx-auto h-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm mb-6">
                <TrendingUp className="w-4 h-4" />
                <span>{content.hero.badge}</span>
              </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight whitespace-pre-line text-shadow-lg">
            {content.hero.title}
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-lg text-shadow-md">
            {content.hero.subtitle}
          </p>

              <div className="bg-white rounded-2xl p-3 flex flex-col md:flex-row gap-3 max-w-2xl shadow-xl mb-6">
                <div className="flex items-center gap-3 flex-1 px-3">
                  <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <input value={searchTitle} onChange={e => setSearchTitle(e.target.value)}
                    placeholder={content.hero.searchPlaceholder}
                    className="flex-1 outline-none text-gray-900 placeholder-gray-400 text-sm"
                    onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                </div>
                <div className="hidden md:block w-px bg-gray-200" />
                <div className="flex items-center gap-3 flex-1 px-3">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <input value={searchLocation} onChange={e => setSearchLocation(e.target.value)}
                    placeholder={content.hero.locationPlaceholder}
                    className="flex-1 outline-none text-gray-900 placeholder-gray-400 text-sm"
                    onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                </div>
                <button onClick={handleSearch}
                  className="px-8 py-3 bg-brand text-white font-semibold rounded-xl hover:bg-brand-dark transition-colors whitespace-nowrap">
                  {content.hero.searchButton}
                </button>
              </div>

              <div className="flex flex-wrap gap-3 mt-6 text-sm text-blue-200">
                <span>{content.hero.popular}</span>
                {content.hero.popularTags.map(t => (
                  <button key={t} onClick={() => { setSearchTitle(t); router.push(`/jobs?title=${t}`); }}
                    className="hover:text-white transition-colors underline underline-offset-2">{t}</button>
                ))}
              </div>
            </div>

            <div className="hidden md:flex items-center justify-center" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: 'Active Jobs', value: stats.activeJobs },
            { label: 'Companies', value: stats.companies },
            { label: 'Job Seekers', value: stats.jobSeekers },
            { label: 'Hires Made', value: stats.hiresMade },
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
              <h2 className="text-3xl font-bold text-gray-900">{content.featuredJobs.title}</h2>
              <p className="text-gray-500 mt-1">{content.featuredJobs.subtitle}</p>
            </div>
            <Link href="/jobs" className="flex items-center gap-1 text-blue-600 font-medium hover:gap-2 transition-all">
              {content.featuredJobs.viewAll} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.slice(0, 6).map(job => (
              <div key={job.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl overflow-hidden flex-shrink-0">
                    {job.companyLogo?.startsWith('/') || job.companyLogo?.startsWith('http')
                      ? <img src={job.companyLogo} alt={job.company} className="w-full h-full object-cover" />
                      : job.companyLogo}
                  </div>
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

      {/* Featured Companies */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{content.companies.title}</h2>
              <p className="text-gray-500 mt-1">{content.companies.subtitle}</p>
            </div>
            <Link href="/companies" className="flex items-center gap-1 text-blue-600 font-medium hover:gap-2 transition-all">
              {content.companies.viewAll} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {companies.slice(0, 6).map(company => (
              <Link key={company.id} href={`/companies/${company.id}`}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-3xl overflow-hidden flex-shrink-0">
                    {company.logo?.startsWith('/') || company.logo?.startsWith('http')
                      ? <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                      : company.logo}
                  </div>
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
            <h2 className="text-3xl font-bold text-gray-900">{content.howItWorks.title}</h2>
            <p className="text-gray-500 mt-2">{content.howItWorks.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.howItWorks.steps.map(item => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">{item.icon}</div>
                <div className="text-brand font-bold text-sm mb-2">STEP {item.step}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-brand to-brand-dark text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">{content.cta.title}</h2>
          <p className="text-blue-100 mb-8 text-lg">{content.cta.subtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="px-8 py-3 bg-white text-brand font-semibold rounded-xl hover:bg-blue-50 transition-colors">
              {content.cta.getStarted}
            </Link>
            <Link href="/jobs" className="px-8 py-3 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors">
              {content.cta.browseJobs}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
