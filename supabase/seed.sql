-- ═══════════════════════════════════════════════════════════════════
--  HireFlow – Seed Data Only
--  Run this AFTER schema.sql has been applied successfully.
--  Safe to re-run (on conflict do nothing).
-- ═══════════════════════════════════════════════════════════════════

-- ── Companies ──
insert into public.companies (id, name, logo, industry, location, size, website, description, benefits, founded) values
  ('c0000000-0000-0000-0000-000000000001', 'TechCorp Inc.',       '🏢', 'Technology',      'San Francisco, CA', '1000-5000', 'techcorp.com',  'Leading technology company building the future of software.',         '{"Health Insurance","Remote Work","401k","Stock Options","Unlimited PTO"}', '2010'),
  ('c0000000-0000-0000-0000-000000000002', 'StartupIO',           '🚀', 'SaaS',            'New York, NY',      '50-200',    'startup.io',    'Fast-growing SaaS startup disrupting the enterprise market.',         '{"Equity","Flexible Hours","Learning Budget","Health Insurance"}',         '2019'),
  ('c0000000-0000-0000-0000-000000000003', 'DesignHub',           '🎨', 'Design',          'Austin, TX',        '200-500',   'designhub.co', 'Creative agency delivering world-class design solutions.',           '{"Creative Environment","Remote Work","Health Insurance","Gym Membership"}','2015'),
  ('c0000000-0000-0000-0000-000000000004', 'DataFlow Analytics',  '📊', 'Data & Analytics','Seattle, WA',       '500-1000',  'dataflow.ai',  'Data-driven company helping businesses make smarter decisions.',     '{"Competitive Salary","Remote Work","Conference Budget","Health Insurance"}','2016'),
  ('c0000000-0000-0000-0000-000000000005', 'CloudBase Systems',   '☁️', 'Cloud Computing', 'Chicago, IL',       '1000-5000', 'cloudbase.io', 'Enterprise cloud infrastructure for modern businesses.',             '{"Stock Options","Health Insurance","401k","Remote Work"}',                '2012'),
  ('c0000000-0000-0000-0000-000000000006', 'GreenTech Solutions', '🌱', 'CleanTech',       'Denver, CO',        '100-500',   'greentech.com','Building sustainable technology for a better planet.',              '{"Mission-driven","Health Insurance","Flexible Hours","Remote Work"}',     '2018')
on conflict (id) do nothing;

-- ── Jobs ──
insert into public.jobs (id, company_id, title, location, salary, type, workplace_type, experience, category, description, responsibilities, requirements, qualifications, benefits, skills, vacancies, deadline, status, posted_at) values
  ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001',
   'Senior Frontend Developer', 'San Francisco, CA', '$120k - $160k', 'Full-time', 'Hybrid', '5+ years', 'Engineering',
   'We are looking for a Senior Frontend Developer to join our growing team.',
   '{"Build responsive web applications","Collaborate with design team","Code reviews","Mentor junior developers"}',
   '{"5+ years React experience","TypeScript proficiency","Strong CSS skills"}',
   '{"Bachelor''s in CS or related field","Portfolio of projects"}',
   '{"Health Insurance","Remote Work","401k","Stock Options"}',
   '{"React","TypeScript","Next.js","GraphQL","Tailwind CSS"}',
   2, '2025-08-30', 'Active', '2025-07-01'),

  ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003',
   'UX/UI Designer', 'Austin, TX', '$80k - $110k', 'Full-time', 'Remote', '3+ years', 'Design',
   'Join our creative team as a UX/UI Designer.',
   '{"Create wireframes and prototypes","Conduct user research","Design system maintenance","Collaborate with developers"}',
   '{"3+ years UX/UI experience","Figma expertise","Portfolio required"}',
   '{"Bachelor''s in Design or HCI","Strong portfolio"}',
   '{"Creative Environment","Remote Work","Health Insurance"}',
   '{"Figma","Adobe XD","Prototyping","User Research","Design Systems"}',
   1, '2025-08-15', 'Active', '2025-07-05'),

  ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000004',
   'Data Scientist', 'Seattle, WA', '$130k - $170k', 'Full-time', 'On-site', '4+ years', 'Data Science',
   'We need a talented Data Scientist to help us extract insights from large datasets.',
   '{"Build ML models","Analyze large datasets","Present findings to stakeholders","Collaborate with engineering"}',
   '{"4+ years data science experience","Python & SQL proficiency","ML framework experience"}',
   '{"Master''s or PhD in Data Science, Statistics, or CS"}',
   '{"Competitive Salary","Remote Work","Conference Budget"}',
   '{"Python","Machine Learning","SQL","TensorFlow","Spark"}',
   1, '2025-09-01', 'Active', '2025-07-03'),

  ('b0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002',
   'Product Manager', 'New York, NY', '$110k - $145k', 'Full-time', 'Hybrid', '3+ years', 'Product',
   'Lead product strategy and execution for our core SaaS platform.',
   '{"Define product roadmap","Work with engineering and design","Analyze user feedback","Drive product launches"}',
   '{"3+ years PM experience","SaaS background preferred","Strong analytical skills"}',
   '{"Bachelor''s degree required","MBA preferred"}',
   '{"Equity","Flexible Hours","Learning Budget"}',
   '{"Product Strategy","Agile","Data Analysis","Roadmapping","Stakeholder Management"}',
   1, '2025-08-20', 'Active', '2025-07-08'),

  ('b0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000005',
   'DevOps Engineer', 'Chicago, IL', '$115k - $150k', 'Full-time', 'Remote', '4+ years', 'Engineering',
   'Build and maintain our cloud infrastructure and CI/CD pipelines.',
   '{"Manage cloud infrastructure","Build CI/CD pipelines","Monitor system performance","Incident response"}',
   '{"4+ years DevOps experience","AWS/GCP/Azure expertise","Kubernetes experience"}',
   '{"Bachelor''s in CS or related field","Cloud certifications preferred"}',
   '{"Stock Options","Health Insurance","401k","Remote Work"}',
   '{"AWS","Kubernetes","Docker","Terraform","CI/CD"}',
   2, '2025-09-15', 'Active', '2025-07-10'),

  ('b0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000001',
   'Backend Developer', 'San Francisco, CA', '$110k - $145k', 'Full-time', 'Hybrid', '3+ years', 'Engineering',
   'Build scalable backend services and APIs for our platform.',
   '{"Design and build REST APIs","Database optimization","Microservices architecture","Code reviews"}',
   '{"3+ years backend experience","Node.js or Python","Database expertise"}',
   '{"Bachelor''s in CS or related field"}',
   '{"Health Insurance","Remote Work","401k","Stock Options"}',
   '{"Node.js","Python","PostgreSQL","Redis","Docker"}',
   3, '2025-08-25', 'Active', '2025-07-12'),

  ('b0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000002',
   'Marketing Manager', 'New York, NY', '$85k - $115k', 'Full-time', 'Hybrid', '4+ years', 'Marketing',
   'Lead our marketing efforts and drive growth for our SaaS platform.',
   '{"Develop marketing strategy","Manage campaigns","Content creation","Analytics and reporting"}',
   '{"4+ years marketing experience","SaaS marketing background","Data-driven mindset"}',
   '{"Bachelor''s in Marketing or Business"}',
   '{"Equity","Flexible Hours","Learning Budget","Health Insurance"}',
   '{"Digital Marketing","SEO","Content Marketing","Analytics","HubSpot"}',
   1, '2025-08-10', 'Active', '2025-07-15'),

  ('b0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000006',
   'Sustainability Engineer', 'Denver, CO', '$90k - $120k', 'Full-time', 'On-site', '2+ years', 'Engineering',
   'Help us build sustainable technology solutions for a greener future.',
   '{"Design sustainable systems","Energy efficiency analysis","Green tech implementation","Research and development"}',
   '{"2+ years engineering experience","Sustainability background","Strong analytical skills"}',
   '{"Bachelor''s in Engineering or Environmental Science"}',
   '{"Mission-driven","Health Insurance","Flexible Hours"}',
   '{"Sustainability","Systems Engineering","Data Analysis","Python","IoT"}',
   2, '2025-09-30', 'Active', '2025-07-18')
on conflict (id) do nothing;
