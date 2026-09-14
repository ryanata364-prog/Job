'use client';
import Link from 'next/link';
import { MapPin, DollarSign, Clock, Bookmark, BookmarkCheck } from 'lucide-react';
import { Job } from '@/lib/types';
import StatusBadge from '@/components/ui/StatusBadge';
import { useState } from 'react';

interface JobCardProps {
  job: Job;
  saved?: boolean;
  onSave?: (id: string) => void;
}

export default function JobCard({ job, saved = false, onSave }: JobCardProps) {
  const [isSaved, setIsSaved] = useState(saved);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSaved(!isSaved);
    onSave?.(job.id);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
            {job.companyLogo}
          </div>
          <div>
            <Link href={`/jobs/${job.id}`} className="font-semibold text-gray-900 hover:text-blue-600 transition-colors group-hover:text-blue-600">
              {job.title}
            </Link>
            <div className="text-sm text-gray-500">{job.company}</div>
          </div>
        </div>
        <button onClick={handleSave} className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
          {isSaved ? <BookmarkCheck className="w-5 h-5 text-blue-600" /> : <Bookmark className="w-5 h-5 text-gray-400" />}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <StatusBadge status={job.type} />
        <StatusBadge status={job.workplaceType} />
      </div>

      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <DollarSign className="w-4 h-4 flex-shrink-0" />
          <span>{job.salary}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>Posted {job.postedAt}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {job.skills.slice(0, 3).map(skill => (
          <span key={skill} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium">{skill}</span>
        ))}
        {job.skills.length > 3 && <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">+{job.skills.length - 3}</span>}
      </div>

      <div className="flex gap-2">
        <Link href={`/jobs/${job.id}`} className="flex-1 text-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          View Details
        </Link>
        <Link href={`/jobs/${job.id}?apply=true`} className="flex-1 text-center px-4 py-2 border border-blue-600 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors">
          Apply Now
        </Link>
      </div>
    </div>
  );
}
