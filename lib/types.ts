export type UserRole = 'seeker' | 'recruiter' | 'admin';
export type AppStatus = 'Applied' | 'Under Review' | 'Shortlisted' | 'Interview' | 'Interview Scheduled' | 'Interviewed' | 'Accepted' | 'Rejected';
export type JobStatus = 'Draft' | 'Active' | 'Paused' | 'Closed';
export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Freelance';
export type WorkplaceType = 'On-site' | 'Remote' | 'Hybrid';
export type InterviewStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
export type UserStatus = 'Pending' | 'Active' | 'Suspended';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  approvalStatus: ApprovalStatus;
  rejectionReason: string;
  avatar: string;
  location: string;
  title: string;
  about: string;
  skills: string[];
  resumeUrl?: string;
  registeredAt: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
  location: string;
  size: string;
  website: string;
  description: string;
  benefits: string[];
  jobCount: number;
  founded: string;
  recruiterId?: string;
}

export interface Job {
  id: string;
  title: string;
  companyId: string;
  company: string;
  companyLogo: string;
  location: string;
  salary: string;
  type: JobType;
  workplaceType: WorkplaceType;
  experience: string;
  category: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  qualifications: string[];
  benefits: string[];
  skills: string[];
  vacancies: number;
  deadline: string;
  postedAt: string;
  status: JobStatus;
  views: number;
  applications: number;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  companyLogo: string;
  seekerId: string;
  seekerName: string;
  seekerEmail: string;
  seekerResumeUrl?: string;
  appliedAt: string;
  updatedAt: string;
  status: AppStatus;
  coverLetter: string;
  portfolioUrl: string;
  linkedinUrl: string;
}

export interface Interview {
  id: string;
  applicationId: string;
  candidateName: string;
  candidateAvatar: string;
  jobTitle: string;
  date: string;
  time: string;
  type: 'Video' | 'Phone' | 'In-person';
  meetingLink: string;
  notes: string;
  status: InterviewStatus;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'application' | 'interview' | 'job' | 'system';
  read: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  participantTitle: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}
