'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  Bookmark, MapPin, DollarSign, Briefcase,
  Trash2, ArrowRight, Clock,
} from 'lucide-react';
import { mockJobs } from '@/lib/mockData';
import Navbar from '@/components/layout/Navbar';
import StatusBadge from '@/components/ui/StatusBadge';

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState(mockJobs.slice(0, 5));
  const [removing, setRemoving] = useState<string | null>(null);

  const handleRemove = (id: string) => {
    setRemoving(id);
    setTimeout(() => {
      setSavedJobs(prev => prev.filter(j => j.id !== id));
      setRemoving(null);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
            </div>
            <p className="text-gray-500 text-sm ml-13">
              {savedJobs.length} saved position{savedJobs.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link href="/jobs"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            Browse More Jobs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Empty state */}
        {savedJobs.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No saved jobs yet</h3>
            <p className="text-gray-400 text-sm mb-6">Jobs you bookmark will appear here.</p>
            <Link href="/jobs"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
              Browse Jobs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Job cards */}
        <div className="space-y-4">
          {savedJobs.map(job => (
            <div
              key={job.id}
              className={`bg-white rounded-2xl border border-gray-200 p-5 shadow-sm
                hover:shadow-md hover:border-blue-200 transition-all duration-300
                ${removing === job.id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
            >
              <div className="flex items-start gap-4">

                {/* Logo */}
                <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                  {job.companyLogo?.startsWith('/') || job.companyLogo?.startsWith('http')
                    ? <img src={job.companyLogo} alt={job.company} className="w-full h-full object-cover rounded-xl" />
                    : job.companyLogo}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/jobs/${job.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                        {job.title}
                      </Link>
                      <p className="text-sm text-gray-500 mt-0.5">{job.company}</p>
                    </div>

                    {/* Saved badge */}
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full flex-shrink-0">
                      <Bookmark className="w-3 h-3 fill-blue-600" /> Saved
                    </span>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <StatusBadge status={job.type} />
                    <StatusBadge status={job.workplaceType} />
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-gray-400" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-gray-400" /> {job.salary}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-gray-400" /> {job.experience}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-gray-400" /> Posted {job.postedAt}
                    </span>
                  </div>

                  {/* Skills */}
                  {job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.skills.slice(0, 4).map(skill => (
                        <span key={skill}
                          className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 4 && (
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-400 text-xs rounded-lg">
                          +{job.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
                    <Link href={`/jobs/${job.id}`}
                      className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                      View Details
                    </Link>
                    <Link href={`/jobs/${job.id}?apply=true`}
                      className="flex items-center gap-2 px-5 py-2 border border-blue-600 text-blue-600 text-sm font-semibold rounded-xl hover:bg-blue-50 transition-colors">
                      Apply Now
                    </Link>
                    <button
                      onClick={() => handleRemove(job.id)}
                      className="ml-auto flex items-center gap-2 px-4 py-2 border border-red-200 text-red-500 text-sm font-medium rounded-xl hover:bg-red-50 hover:border-red-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer count */}
        {savedJobs.length > 0 && (
          <p className="text-center text-sm text-gray-400 mt-8">
            Showing {savedJobs.length} saved job{savedJobs.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
