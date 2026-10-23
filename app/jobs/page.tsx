'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, MapPin, X } from 'lucide-react';
import { jobCategories } from '@/lib/mockData';
import { supabase } from '@/lib/supabase';
import { Job, JobType, WorkplaceType } from '@/lib/types';
import JobCard from '@/components/jobs/JobCard';
import Pagination from '@/components/ui/Pagination';
import Navbar from '@/components/layout/Navbar';

function JobsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const titleParam = searchParams.get('title') || '';
  const locationParam = searchParams.get('location') || '';
  const categoryParam = searchParams.get('category') || '';

  const [searchTitle, setSearchTitle] = useState(titleParam);
  const [searchLocation, setSearchLocation] = useState(locationParam);
  const [selectedType, setSelectedType] = useState<JobType | ''>('');
  const [selectedWorkplace, setSelectedWorkplace] = useState<WorkplaceType | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const itemsPerPage = 9;

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('jobs_with_company')
        .select('*')
        .eq('status', 'Active')
        .order('posted_at', { ascending: false });
      if (error) { setLoadError('Jobs could not be loaded. Please refresh the page.'); }
      else {
        const mapped: Job[] = (data ?? []).map((j: Record<string, unknown>) => ({
          id:              String(j.id),
          title:           String(j.title ?? ''),
          companyId:       String(j.company_id ?? ''),
          company:         String(j.company ?? ''),
          companyLogo:     String(j.company_logo ?? '🏢'),
          location:        String(j.location ?? ''),
          salary:          String(j.salary ?? ''),
          type:            String(j.type ?? 'Full-time') as Job['type'],
          workplaceType:   String(j.workplace_type ?? 'On-site') as Job['workplaceType'],
          experience:      String(j.experience ?? ''),
          category:        String(j.category ?? ''),
          description:     String(j.description ?? ''),
          responsibilities: (j.responsibilities as string[]) ?? [],
          requirements:    (j.requirements as string[]) ?? [],
          qualifications:  (j.qualifications as string[]) ?? [],
          benefits:        (j.benefits as string[]) ?? [],
          skills:          (j.skills as string[]) ?? [],
          vacancies:       Number(j.vacancies ?? 1),
          deadline:        String(j.deadline ?? ''),
          postedAt:        String(j.posted_at ?? ''),
          status:          String(j.status ?? 'Active') as Job['status'],
          views:           Number(j.views ?? 0),
          applications:    Number(j.application_count ?? 0),
        }));
        setJobs(mapped);
      }
      setLoading(false);
    };
    void load();
  }, []);

  useEffect(() => {
    setSearchTitle(titleParam);
    setSearchLocation(locationParam);
    setCurrentPage(1);
  }, [titleParam, locationParam, categoryParam]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTitle, searchLocation, categoryParam, selectedType, selectedWorkplace]);

  const filteredJobs = useMemo(() => {
    let filtered = jobs.filter(j => j.status === 'Active');
    if (searchTitle) filtered = filtered.filter(j =>
      j.title.toLowerCase().includes(searchTitle.toLowerCase()) ||
      j.company.toLowerCase().includes(searchTitle.toLowerCase()) ||
      j.skills.some(s => s.toLowerCase().includes(searchTitle.toLowerCase()))
    );
    if (searchLocation) filtered = filtered.filter(j =>
      j.location.toLowerCase().includes(searchLocation.toLowerCase())
    );
    if (categoryParam) filtered = filtered.filter(j => j.category === categoryParam);
    if (selectedType) filtered = filtered.filter(j => j.type === selectedType);
    if (selectedWorkplace) filtered = filtered.filter(j => j.workplaceType === selectedWorkplace);
    return filtered;
  }, [jobs, searchTitle, searchLocation, categoryParam, selectedType, selectedWorkplace]);

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSearch = () => {
    setCurrentPage(1);
    router.push(`/jobs?title=${searchTitle}&location=${searchLocation}${categoryParam ? `&category=${categoryParam}` : ''}`);
  };

  const clearFilters = () => {
    setSearchTitle('');
    setSearchLocation('');
    setSelectedType('');
    setSelectedWorkplace('');
    router.push('/jobs');
  };

  const hasActiveFilters = searchTitle || searchLocation || categoryParam || selectedType || selectedWorkplace;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-gradient-to-b from-brand/5 to-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="flex items-center gap-3 flex-1 px-4 bg-white border border-gray-200 rounded-xl">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input value={searchTitle} onChange={e => setSearchTitle(e.target.value)}
                placeholder="Job title, keywords, or company"
                className="flex-1 outline-none py-3 text-gray-900 placeholder-gray-400 text-sm"
                onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            </div>
            <div className="flex items-center gap-3 flex-1 px-4 bg-white border border-gray-200 rounded-xl">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input value={searchLocation} onChange={e => setSearchLocation(e.target.value)}
                placeholder="City, state, or remote"
                className="flex-1 outline-none py-3 text-gray-900 placeholder-gray-400 text-sm"
                onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            </div>
            <button onClick={handleSearch}
              className="px-6 py-3 bg-brand text-white font-semibold rounded-xl hover:bg-brand-dark transition-colors">
              Search
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <select value={selectedType} onChange={e => setSelectedType(e.target.value as JobType)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand">
              <option value="">Job Type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Freelance">Freelance</option>
            </select>
            <select value={selectedWorkplace} onChange={e => setSelectedWorkplace(e.target.value as WorkplaceType)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand">
              <option value="">Workplace</option>
              <option value="On-site">On-site</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
            </select>
            {hasActiveFilters && (
              <button onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-brand transition-colors text-sm flex items-center gap-1">
                <X className="w-4 h-4" /> Clear Filters
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {filteredJobs.length} Jobs Found
            </h1>
            <div className="flex gap-2">
              {jobCategories.slice(0, 5).map(cat => (
                <button key={cat.name} onClick={() => router.push(`/jobs?category=${cat.name}`)}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-brand hover:bg-brand/5 rounded-lg transition-colors">
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {loadError && <p className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{loadError}</p>}
          {loading && <p className="py-12 text-center text-gray-500">Loading jobs…</p>}

          {!loading && paginatedJobs.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No jobs found matching your search.</p>
              <button onClick={clearFilters}
                className="mt-4 px-6 py-2 text-brand font-medium hover:bg-brand/5 rounded-lg transition-colors">
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedJobs.map(job => <JobCard key={job.id} job={job} />)}
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default function JobsPage() {
  return <Suspense fallback={<div className="min-h-screen bg-white py-20 text-center text-gray-500">Loading jobs…</div>}><JobsPageContent /></Suspense>;
}
