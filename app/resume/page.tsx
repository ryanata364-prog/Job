'use client';
import { useEffect, useState } from 'react';
import { Save, FileText, Plus, Trash2, Download, Upload } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { getMe, uploadResume } from '@/lib/api';

export default function ResumePage() {
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeName, setResumeName] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState('');
  const [resumeSaved, setResumeSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resume, setResume] = useState({
    summary: 'Passionate Frontend Developer with 3+ years of experience building scalable web applications.',
    experience: [
      { id: 1, title: 'Senior Frontend Developer', company: 'TechCorp Inc.', duration: '2022 - Present', desc: 'Building responsive web applications using React and Next.js.' },
      { id: 2, title: 'Frontend Developer', company: 'StartupIO', duration: '2020 - 2022', desc: 'Developed user interfaces for SaaS platform.' },
    ],
    education: [
      { id: 1, title: 'Bachelor of Computer Science', institution: 'UC Berkeley', duration: '2016 - 2020' },
    ],
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Node.js', 'GraphQL', 'Figma'],
  });

  useEffect(() => {
    getMe()
      .then((user) => {
        setResumeUrl(user.resumeUrl ?? '');
        setResumeName(user.resumeUrl?.split('/').pop() ?? '');
      })
      .catch(() => setResumeError('Sign in to upload and manage your resume.'));
  }, []);

  const handleResumeUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResumeError('');
    setResumeSaved(false);
    if (!resumeFile) {
      setResumeError('Choose a PDF, DOC, or DOCX file to upload.');
      return;
    }
    if (resumeFile.size > 5 * 1024 * 1024) {
      setResumeError('Resume files must be 5 MB or smaller.');
      return;
    }
    setUploading(true);
    try {
      const user = await uploadResume(resumeFile);
      setResumeUrl(user.resumeUrl ?? '');
      setResumeName(resumeFile.name);
      setResumeFile(null);
      setResumeSaved(true);
    } catch (error: unknown) {
      const apiError = error as { resume?: string[]; detail?: string };
      setResumeError(apiError.resume?.[0] ?? apiError.detail ?? 'The resume could not be uploaded.');
    } finally {
      setUploading(false);
    }
  };

  const addExperience = () => {
    setResume({
      ...resume,
      experience: [...resume.experience, { id: Date.now(), title: '', company: '', duration: '', desc: '' }],
    });
  };

  const removeExperience = (id: number) => {
    setResume({ ...resume, experience: resume.experience.filter(e => e.id !== id) });
  };

  const updateExperience = (id: number, field: string, value: string) => {
    setResume({
      ...resume,
      experience: resume.experience.map(e => e.id === id ? { ...e, [field]: value } : e),
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Resume Builder</h1>
            <div className="flex gap-3">
              <button onClick={() => alert('Resume downloaded!')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" /> Download PDF
              </button>
              <button onClick={() => alert('Resume saved!')}
                className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-xl hover:bg-brand-dark transition-colors">
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          </div>

          <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-900"><Upload className="h-5 w-5" /> Upload your resume</h2>
            <p className="mb-4 text-sm text-gray-500">Upload a PDF, DOC, or DOCX file, up to 5 MB. Recruiters can access this file from your applicant profile.</p>
            {resumeError && <p role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{resumeError}</p>}
            {resumeSaved && <p role="status" className="mb-3 rounded-lg bg-green-50 p-3 text-sm text-green-700">Resume uploaded successfully.</p>}
            {resumeUrl && (
              <p className="mb-4 text-sm text-gray-600">
                Current resume: <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-brand underline">{resumeName || 'View uploaded resume'}</a>
              </p>
            )}
            <form onSubmit={(event) => void handleResumeUpload(event)} className="flex flex-wrap items-center gap-3">
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)}
                className="min-w-0 flex-1 rounded-lg border border-gray-200 p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2"
              />
              <button type="submit" disabled={uploading} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60">
                {uploading ? 'Uploading…' : 'Upload'}
              </button>
            </form>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Professional Summary
                </h2>
                <textarea value={resume.summary} onChange={e => setResume({ ...resume, summary: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-brand resize-none text-sm" />
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Experience</h2>
                  <button onClick={addExperience}
                    className="flex items-center gap-1 px-3 py-1.5 bg-brand text-white text-sm rounded-lg hover:bg-brand-dark transition-colors">
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
                <div className="space-y-4">
                  {resume.experience.map(exp => (
                    <div key={exp.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input value={exp.title} onChange={e => updateExperience(exp.id, 'title', e.target.value)}
                          placeholder="Job Title"
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand" />
                        <input value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)}
                          placeholder="Company"
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand" />
                        <input value={exp.duration} onChange={e => updateExperience(exp.id, 'duration', e.target.value)}
                          placeholder="Duration"
                          className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand" />
                      </div>
                      <textarea value={exp.desc} onChange={e => updateExperience(exp.id, 'desc', e.target.value)}
                        placeholder="Description..."
                        className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand resize-none h-20" />
                      <button onClick={() => removeExperience(exp.id)}
                        className="mt-2 text-red-500 hover:text-red-700 text-xs flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Education</h2>
                <div className="space-y-3">
                  {resume.education.map(edu => (
                    <div key={edu.id} className="border border-gray-200 rounded-xl p-3">
                      <input value={edu.title} onChange={e => setResume({ ...resume, education: resume.education.map(x => x.id === edu.id ? { ...x, title: e.target.value } : x) })}
                        placeholder="Degree"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand mb-2" />
                      <input value={edu.institution} onChange={e => setResume({ ...resume, education: resume.education.map(x => x.id === edu.id ? { ...x, institution: e.target.value } : x) })}
                        placeholder="Institution"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand mb-2" />
                      <input value={edu.duration} onChange={e => setResume({ ...resume, education: resume.education.map(x => x.id === edu.id ? { ...x, duration: e.target.value } : x) })}
                        placeholder="Duration"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6 sticky top-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2 mb-6">
                  {resume.skills.map((skill, i) => (
                    <span key={skill} className="px-3 py-1 bg-brand/5 text-brand text-sm rounded-lg flex items-center gap-1">
                      {skill}
                      <button onClick={() => setResume({ ...resume, skills: resume.skills.filter(s => s !== skill) })}
                        className="hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
                <input onKeyDown={e => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    setResume({ ...resume, skills: [...resume.skills, e.currentTarget.value] });
                    e.currentTarget.value = '';
                  }
                }}
                  placeholder="Add a skill and press Enter"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-brand" />

                <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Preview</h3>
                  <p className="text-sm text-gray-500 mb-2">{resume.summary}</p>
                  <div className="text-xs text-gray-400">+{resume.experience.length} experiences · +{resume.skills.length} skills</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
