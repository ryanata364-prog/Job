'use client';
import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { getMe, updateMe } from '@/lib/api';

interface ProfileFormData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  about: string;
}

export default function ProfilePage() {
  const [form, setForm] = useState<ProfileFormData>({
    fullName: '', email: '', phone: '', location: '', title: '', about: '',
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    getMe()
      .then(user => {
        setForm({ fullName: user.name, email: user.email, phone: user.phone, location: user.location, title: user.title, about: user.about });
        setSkills(user.skills ?? []);
      })
      .catch(() => setMessage('Please sign in to manage your profile.'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSave = async () => {
    setMessage('');
    try {
      await updateMe({ name: form.fullName, email: form.email, phone: form.phone, location: form.location, title: form.title, about: form.about, skills });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error: unknown) {
      const apiError = error as { detail?: string; email?: string };
      setMessage(apiError.email ?? apiError.detail ?? 'Profile could not be saved.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <button onClick={handleSave}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                saved
                  ? 'bg-green-600 text-white'
                  : 'bg-brand text-white hover:bg-brand-dark'
              }`}>
              <Save className="w-4 h-4" />
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>

          {message && <p className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{message}</p>}

          {loading ? <p className="py-16 text-center text-gray-500">Loading profile…</p> : <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-4xl">
                👤
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{form.fullName}</h2>
                <p className="text-gray-500">{form.title}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input value={form.fullName} onChange={e => handleChange('fullName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-brand text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-brand text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input value={form.phone} onChange={e => handleChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-brand text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input value={form.location} onChange={e => handleChange('location', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-brand text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input value={form.title} onChange={e => handleChange('title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-brand text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">About Me</label>
                <textarea value={form.about} onChange={e => handleChange('about', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-brand text-sm resize-none" />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <button key={skill} type="button" onClick={() => setSkills(current => current.filter(item => item !== skill))}
                    className="px-3 py-1 bg-brand/5 text-brand text-sm rounded-lg hover:bg-red-50 hover:text-red-700">
                    {skill} <span aria-label={`Remove ${skill}`}>×</span>
                  </button>
                ))}
              </div>
              <form onSubmit={event => {
                event.preventDefault();
                const skill = newSkill.trim();
                if (skill && !skills.some(item => item.toLowerCase() === skill.toLowerCase())) {
                  setSkills(current => [...current, skill]);
                }
                setNewSkill('');
              }} className="mt-3 flex gap-2">
                <input value={newSkill} onChange={event => setNewSkill(event.target.value)} placeholder="Add a skill"
                  className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand" />
                <button type="submit" className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-50">Add</button>
              </form>
            </div>
          </div>}
        </div>
      </section>
    </div>
  );
}
