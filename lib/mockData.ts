import { User, Company, Job, Application, Interview, Notification, Conversation } from './types';

export const mockUsers: User[] = [
  {
    id: 'u1', name: 'Alex Johnson', email: 'alex@example.com', phone: '+1 555-0101',
    role: 'seeker', status: 'Active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    location: 'San Francisco, CA', title: 'Frontend Developer', about: 'Passionate developer with 3 years of experience.',
    skills: ['React', 'TypeScript', 'Node.js', 'Tailwind CSS'], registeredAt: '2024-01-15'
  },
  {
    id: 'u2', name: 'Sarah Miller', email: 'sarah@techcorp.com', phone: '+1 555-0102',
    role: 'recruiter', status: 'Active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    location: 'New York, NY', title: 'Senior Recruiter', about: 'Connecting top talent with great companies.',
    skills: ['Recruiting', 'HR', 'Talent Acquisition'], registeredAt: '2024-01-10'
  },
  {
    id: 'u3', name: 'Admin User', email: 'admin@hireflow.com', phone: '+1 555-0100',
    role: 'admin', status: 'Active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    location: 'Austin, TX', title: 'System Administrator', about: 'Managing the HireFlow platform.',
    skills: ['Administration', 'Management'], registeredAt: '2024-01-01'
  },
  {
    id: 'u4', name: 'James Wilson', email: 'james@example.com', phone: '+1 555-0103',
    role: 'seeker', status: 'Active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    location: 'Chicago, IL', title: 'UX Designer', about: 'Creative designer focused on user experience.',
    skills: ['Figma', 'UI/UX', 'Prototyping', 'Adobe XD'], registeredAt: '2024-02-01'
  },
  {
    id: 'u5', name: 'Emily Chen', email: 'emily@startup.io', phone: '+1 555-0104',
    role: 'recruiter', status: 'Active', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    location: 'Seattle, WA', title: 'HR Manager', about: 'Building great teams at fast-growing startups.',
    skills: ['Recruiting', 'Onboarding', 'Culture'], registeredAt: '2024-01-20'
  },
  {
    id: 'u6', name: 'Michael Brown', email: 'michael@example.com', phone: '+1 555-0105',
    role: 'seeker', status: 'Pending', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    location: 'Boston, MA', title: 'Data Scientist', about: 'ML enthusiast with a passion for data.',
    skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'], registeredAt: '2024-03-01'
  },
];

export const mockCompanies: Company[] = [
  {
    id: 'c1', name: 'TechCorp Inc.', logo: '🏢', industry: 'Technology',
    location: 'San Francisco, CA', size: '1000-5000', website: 'techcorp.com',
    description: 'Leading technology company building the future of software.',
    benefits: ['Health Insurance', 'Remote Work', '401k', 'Stock Options', 'Unlimited PTO'],
    jobCount: 12, founded: '2010'
  },
  {
    id: 'c2', name: 'StartupIO', logo: '🚀', industry: 'SaaS',
    location: 'New York, NY', size: '50-200', website: 'startup.io',
    description: 'Fast-growing SaaS startup disrupting the enterprise market.',
    benefits: ['Equity', 'Flexible Hours', 'Learning Budget', 'Health Insurance'],
    jobCount: 8, founded: '2019'
  },
  {
    id: 'c3', name: 'DesignHub', logo: '🎨', industry: 'Design',
    location: 'Austin, TX', size: '200-500', website: 'designhub.co',
    description: 'Creative agency delivering world-class design solutions.',
    benefits: ['Creative Environment', 'Remote Work', 'Health Insurance', 'Gym Membership'],
    jobCount: 5, founded: '2015'
  },
  {
    id: 'c4', name: 'DataFlow Analytics', logo: '📊', industry: 'Data & Analytics',
    location: 'Seattle, WA', size: '500-1000', website: 'dataflow.ai',
    description: 'Data-driven company helping businesses make smarter decisions.',
    benefits: ['Competitive Salary', 'Remote Work', 'Conference Budget', 'Health Insurance'],
    jobCount: 7, founded: '2016'
  },
  {
    id: 'c5', name: 'CloudBase Systems', logo: '☁️', industry: 'Cloud Computing',
    location: 'Chicago, IL', size: '1000-5000', website: 'cloudbase.io',
    description: 'Enterprise cloud infrastructure for modern businesses.',
    benefits: ['Stock Options', 'Health Insurance', '401k', 'Remote Work'],
    jobCount: 15, founded: '2012'
  },
  {
    id: 'c6', name: 'GreenTech Solutions', logo: '🌱', industry: 'CleanTech',
    location: 'Denver, CO', size: '100-500', website: 'greentech.com',
    description: 'Building sustainable technology for a better planet.',
    benefits: ['Mission-driven', 'Health Insurance', 'Flexible Hours', 'Remote Work'],
    jobCount: 4, founded: '2018'
  },
];

export const mockJobs: Job[] = [
  {
    id: 'j1', title: 'Senior Frontend Developer', companyId: 'c1', company: 'TechCorp Inc.',
    companyLogo: '🏢', location: 'San Francisco, CA', salary: '$120k - $160k',
    type: 'Full-time', workplaceType: 'Hybrid', experience: '5+ years', category: 'Engineering',
    description: 'We are looking for a Senior Frontend Developer to join our growing team. You will be responsible for building and maintaining high-quality web applications.',
    responsibilities: ['Build responsive web applications', 'Collaborate with design team', 'Code reviews', 'Mentor junior developers'],
    requirements: ['5+ years React experience', 'TypeScript proficiency', 'Strong CSS skills'],
    qualifications: ["Bachelor's in CS or related field", 'Portfolio of projects'],
    benefits: ['Health Insurance', 'Remote Work', '401k', 'Stock Options'],
    skills: ['React', 'TypeScript', 'Next.js', 'GraphQL', 'Tailwind CSS'],
    vacancies: 2, deadline: '2025-08-30', postedAt: '2025-07-01', status: 'Active', views: 342, applications: 28
  },
  {
    id: 'j2', title: 'UX/UI Designer', companyId: 'c3', company: 'DesignHub',
    companyLogo: '🎨', location: 'Austin, TX', salary: '$80k - $110k',
    type: 'Full-time', workplaceType: 'Remote', experience: '3+ years', category: 'Design',
    description: 'Join our creative team as a UX/UI Designer. You will create beautiful, intuitive interfaces for our clients.',
    responsibilities: ['Create wireframes and prototypes', 'Conduct user research', 'Design system maintenance', 'Collaborate with developers'],
    requirements: ['3+ years UX/UI experience', 'Figma expertise', 'Portfolio required'],
    qualifications: ["Bachelor's in Design or HCI", 'Strong portfolio'],
    benefits: ['Creative Environment', 'Remote Work', 'Health Insurance'],
    skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research', 'Design Systems'],
    vacancies: 1, deadline: '2025-08-15', postedAt: '2025-07-05', status: 'Active', views: 215, applications: 19
  },
  {
    id: 'j3', title: 'Data Scientist', companyId: 'c4', company: 'DataFlow Analytics',
    companyLogo: '📊', location: 'Seattle, WA', salary: '$130k - $170k',
    type: 'Full-time', workplaceType: 'On-site', experience: '4+ years', category: 'Data Science',
    description: 'We need a talented Data Scientist to help us extract insights from large datasets and build predictive models.',
    responsibilities: ['Build ML models', 'Analyze large datasets', 'Present findings to stakeholders', 'Collaborate with engineering'],
    requirements: ['4+ years data science experience', 'Python & SQL proficiency', 'ML framework experience'],
    qualifications: ["Master's or PhD in Data Science, Statistics, or CS"],
    benefits: ['Competitive Salary', 'Remote Work', 'Conference Budget'],
    skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Spark'],
    vacancies: 1, deadline: '2025-09-01', postedAt: '2025-07-03', status: 'Active', views: 189, applications: 14
  },
  {
    id: 'j4', title: 'Product Manager', companyId: 'c2', company: 'StartupIO',
    companyLogo: '🚀', location: 'New York, NY', salary: '$110k - $145k',
    type: 'Full-time', workplaceType: 'Hybrid', experience: '3+ years', category: 'Product',
    description: 'Lead product strategy and execution for our core SaaS platform.',
    responsibilities: ['Define product roadmap', 'Work with engineering and design', 'Analyze user feedback', 'Drive product launches'],
    requirements: ['3+ years PM experience', 'SaaS background preferred', 'Strong analytical skills'],
    qualifications: ["Bachelor's degree required", 'MBA preferred'],
    benefits: ['Equity', 'Flexible Hours', 'Learning Budget'],
    skills: ['Product Strategy', 'Agile', 'Data Analysis', 'Roadmapping', 'Stakeholder Management'],
    vacancies: 1, deadline: '2025-08-20', postedAt: '2025-07-08', status: 'Active', views: 278, applications: 22
  },
  {
    id: 'j5', title: 'DevOps Engineer', companyId: 'c5', company: 'CloudBase Systems',
    companyLogo: '☁️', location: 'Chicago, IL', salary: '$115k - $150k',
    type: 'Full-time', workplaceType: 'Remote', experience: '4+ years', category: 'Engineering',
    description: 'Build and maintain our cloud infrastructure and CI/CD pipelines.',
    responsibilities: ['Manage cloud infrastructure', 'Build CI/CD pipelines', 'Monitor system performance', 'Incident response'],
    requirements: ['4+ years DevOps experience', 'AWS/GCP/Azure expertise', 'Kubernetes experience'],
    qualifications: ["Bachelor's in CS or related field", 'Cloud certifications preferred'],
    benefits: ['Stock Options', 'Health Insurance', '401k', 'Remote Work'],
    skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD'],
    vacancies: 2, deadline: '2025-09-15', postedAt: '2025-07-10', status: 'Active', views: 156, applications: 11
  },
  {
    id: 'j6', title: 'Backend Developer', companyId: 'c1', company: 'TechCorp Inc.',
    companyLogo: '🏢', location: 'San Francisco, CA', salary: '$110k - $145k',
    type: 'Full-time', workplaceType: 'Hybrid', experience: '3+ years', category: 'Engineering',
    description: 'Build scalable backend services and APIs for our platform.',
    responsibilities: ['Design and build REST APIs', 'Database optimization', 'Microservices architecture', 'Code reviews'],
    requirements: ['3+ years backend experience', 'Node.js or Python', 'Database expertise'],
    qualifications: ["Bachelor's in CS or related field"],
    benefits: ['Health Insurance', 'Remote Work', '401k', 'Stock Options'],
    skills: ['Node.js', 'Python', 'PostgreSQL', 'Redis', 'Docker'],
    vacancies: 3, deadline: '2025-08-25', postedAt: '2025-07-12', status: 'Active', views: 201, applications: 17
  },
  {
    id: 'j7', title: 'Marketing Manager', companyId: 'c2', company: 'StartupIO',
    companyLogo: '🚀', location: 'New York, NY', salary: '$85k - $115k',
    type: 'Full-time', workplaceType: 'Hybrid', experience: '4+ years', category: 'Marketing',
    description: 'Lead our marketing efforts and drive growth for our SaaS platform.',
    responsibilities: ['Develop marketing strategy', 'Manage campaigns', 'Content creation', 'Analytics and reporting'],
    requirements: ['4+ years marketing experience', 'SaaS marketing background', 'Data-driven mindset'],
    qualifications: ["Bachelor's in Marketing or Business"],
    benefits: ['Equity', 'Flexible Hours', 'Learning Budget', 'Health Insurance'],
    skills: ['Digital Marketing', 'SEO', 'Content Marketing', 'Analytics', 'HubSpot'],
    vacancies: 1, deadline: '2025-08-10', postedAt: '2025-07-15', status: 'Active', views: 134, applications: 9
  },
  {
    id: 'j8', title: 'Sustainability Engineer', companyId: 'c6', company: 'GreenTech Solutions',
    companyLogo: '🌱', location: 'Denver, CO', salary: '$90k - $120k',
    type: 'Full-time', workplaceType: 'On-site', experience: '2+ years', category: 'Engineering',
    description: 'Help us build sustainable technology solutions for a greener future.',
    responsibilities: ['Design sustainable systems', 'Energy efficiency analysis', 'Green tech implementation', 'Research and development'],
    requirements: ['2+ years engineering experience', 'Sustainability background', 'Strong analytical skills'],
    qualifications: ["Bachelor's in Engineering or Environmental Science"],
    benefits: ['Mission-driven', 'Health Insurance', 'Flexible Hours'],
    skills: ['Sustainability', 'Systems Engineering', 'Data Analysis', 'Python', 'IoT'],
    vacancies: 2, deadline: '2025-09-30', postedAt: '2025-07-18', status: 'Active', views: 98, applications: 7
  },
];

export const mockApplications: Application[] = [
  {
    id: 'a1', jobId: 'j1', jobTitle: 'Senior Frontend Developer', company: 'TechCorp Inc.',
    companyLogo: '🏢', seekerId: 'u1', seekerName: 'Alex Johnson', seekerEmail: 'alex@example.com',
    appliedAt: '2025-07-05', updatedAt: '2025-07-10', status: 'Shortlisted',
    coverLetter: 'I am excited to apply for this position...', portfolioUrl: 'alexjohnson.dev', linkedinUrl: 'linkedin.com/in/alexjohnson'
  },
  {
    id: 'a2', jobId: 'j4', jobTitle: 'Product Manager', company: 'StartupIO',
    companyLogo: '🚀', seekerId: 'u1', seekerName: 'Alex Johnson', seekerEmail: 'alex@example.com',
    appliedAt: '2025-07-08', updatedAt: '2025-07-12', status: 'Under Review',
    coverLetter: 'I believe my skills align perfectly...', portfolioUrl: 'alexjohnson.dev', linkedinUrl: 'linkedin.com/in/alexjohnson'
  },
  {
    id: 'a3', jobId: 'j2', jobTitle: 'UX/UI Designer', company: 'DesignHub',
    companyLogo: '🎨', seekerId: 'u4', seekerName: 'James Wilson', seekerEmail: 'james@example.com',
    appliedAt: '2025-07-06', updatedAt: '2025-07-14', status: 'Interview',
    coverLetter: 'Design is my passion...', portfolioUrl: 'jameswilson.design', linkedinUrl: 'linkedin.com/in/jameswilson'
  },
  {
    id: 'a4', jobId: 'j3', jobTitle: 'Data Scientist', company: 'DataFlow Analytics',
    companyLogo: '📊', seekerId: 'u6', seekerName: 'Michael Brown', seekerEmail: 'michael@example.com',
    appliedAt: '2025-07-09', updatedAt: '2025-07-09', status: 'Applied',
    coverLetter: 'Data science is my expertise...', portfolioUrl: '', linkedinUrl: 'linkedin.com/in/michaelbrown'
  },
  {
    id: 'a5', jobId: 'j5', jobTitle: 'DevOps Engineer', company: 'CloudBase Systems',
    companyLogo: '☁️', seekerId: 'u1', seekerName: 'Alex Johnson', seekerEmail: 'alex@example.com',
    appliedAt: '2025-07-11', updatedAt: '2025-07-15', status: 'Rejected',
    coverLetter: 'I have extensive DevOps experience...', portfolioUrl: 'alexjohnson.dev', linkedinUrl: 'linkedin.com/in/alexjohnson'
  },
  {
    id: 'a6', jobId: 'j6', jobTitle: 'Backend Developer', company: 'TechCorp Inc.',
    companyLogo: '🏢', seekerId: 'u4', seekerName: 'James Wilson', seekerEmail: 'james@example.com',
    appliedAt: '2025-07-13', updatedAt: '2025-07-16', status: 'Accepted',
    coverLetter: 'I am a strong backend developer...', portfolioUrl: '', linkedinUrl: 'linkedin.com/in/jameswilson'
  },
];

export const mockInterviews: Interview[] = [
  {
    id: 'i1', applicationId: 'a3', candidateName: 'James Wilson',
    candidateAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    jobTitle: 'UX/UI Designer', date: '2025-07-25', time: '10:00 AM',
    type: 'Video', meetingLink: 'meet.google.com/abc-defg-hij',
    notes: 'Review portfolio before interview', status: 'Scheduled'
  },
  {
    id: 'i2', applicationId: 'a1', candidateName: 'Alex Johnson',
    candidateAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    jobTitle: 'Senior Frontend Developer', date: '2025-07-22', time: '2:00 PM',
    type: 'Video', meetingLink: 'zoom.us/j/123456789',
    notes: 'Technical interview - React and TypeScript focus', status: 'Completed'
  },
  {
    id: 'i3', applicationId: 'a4', candidateName: 'Michael Brown',
    candidateAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    jobTitle: 'Data Scientist', date: '2025-07-28', time: '11:00 AM',
    type: 'In-person', meetingLink: '',
    notes: 'Bring portfolio and case studies', status: 'Scheduled'
  },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', userId: 'u1', title: 'Application Shortlisted', message: 'Your application for Senior Frontend Developer at TechCorp Inc. has been shortlisted!', type: 'application', read: false, createdAt: '2025-07-10T10:00:00Z' },
  { id: 'n2', userId: 'u1', title: 'Interview Scheduled', message: 'An interview has been scheduled for your application at TechCorp Inc. on July 22nd at 2:00 PM.', type: 'interview', read: false, createdAt: '2025-07-12T14:30:00Z' },
  { id: 'n3', userId: 'u1', title: 'New Job Match', message: 'A new job matching your profile has been posted: React Developer at StartupIO.', type: 'job', read: true, createdAt: '2025-07-08T09:00:00Z' },
  { id: 'n4', userId: 'u1', title: 'Application Viewed', message: 'A recruiter viewed your application for Product Manager at StartupIO.', type: 'application', read: true, createdAt: '2025-07-09T16:00:00Z' },
  { id: 'n5', userId: 'u2', title: 'New Application', message: 'Alex Johnson applied for Senior Frontend Developer.', type: 'application', read: false, createdAt: '2025-07-05T11:00:00Z' },
  { id: 'n6', userId: 'u2', title: 'New Application', message: 'James Wilson applied for UX/UI Designer.', type: 'application', read: false, createdAt: '2025-07-06T09:30:00Z' },
];

export const mockConversations: Conversation[] = [
  {
    id: 'conv1', participantId: 'u2', participantName: 'Sarah Miller',
    participantAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    participantTitle: 'Senior Recruiter at TechCorp Inc.',
    lastMessage: 'We would love to schedule an interview with you!',
    lastMessageTime: '2025-07-12T14:30:00Z', unreadCount: 2,
    messages: [
      { id: 'm1', senderId: 'u2', senderName: 'Sarah Miller', senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', receiverId: 'u1', content: 'Hi Alex! We reviewed your application and were very impressed.', timestamp: '2025-07-12T14:00:00Z', read: true },
      { id: 'm2', senderId: 'u2', senderName: 'Sarah Miller', senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', receiverId: 'u1', content: 'We would love to schedule an interview with you!', timestamp: '2025-07-12T14:30:00Z', read: false },
    ]
  },
  {
    id: 'conv2', participantId: 'u5', participantName: 'Emily Chen',
    participantAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    participantTitle: 'HR Manager at StartupIO',
    lastMessage: 'Thank you for your interest in the Product Manager role.',
    lastMessageTime: '2025-07-09T10:00:00Z', unreadCount: 0,
    messages: [
      { id: 'm3', senderId: 'u5', senderName: 'Emily Chen', senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily', receiverId: 'u1', content: 'Thank you for your interest in the Product Manager role.', timestamp: '2025-07-09T10:00:00Z', read: true },
    ]
  },
];

export const jobCategories = [
  { name: 'Engineering', count: 245, icon: '💻' },
  { name: 'Design', count: 89, icon: '🎨' },
  { name: 'Marketing', count: 134, icon: '📢' },
  { name: 'Data Science', count: 78, icon: '📊' },
  { name: 'Product', count: 56, icon: '🚀' },
  { name: 'Sales', count: 112, icon: '💼' },
  { name: 'Finance', count: 67, icon: '💰' },
  { name: 'HR', count: 43, icon: '👥' },
];

export const testimonials = [
  { id: 1, name: 'Alex Johnson', title: 'Frontend Developer', company: 'TechCorp Inc.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', text: 'HireFlow helped me land my dream job in just 3 weeks! The platform is intuitive and the job matching is spot on.' },
  { id: 2, name: 'Sarah Miller', title: 'Senior Recruiter', company: 'TechCorp Inc.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', text: 'As a recruiter, HireFlow has transformed how we find talent. The candidate management tools are exceptional.' },
  { id: 3, name: 'James Wilson', title: 'UX Designer', company: 'DesignHub', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James', text: 'The resume builder and application tracking features are game-changers. Highly recommend to any job seeker!' },
];
