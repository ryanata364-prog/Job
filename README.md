HireFlow is a standalone Next.js demo app that uses local sample data for its authentication and recruitment workflows.

## Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The local Next.js API stores demo changes in `data/hireflow.json`. The initial data is loaded from `lib/mockData.ts`; resume uploads are stored under `public/uploads/resumes/`.

For demo sign-in, use an existing sample account such as `alex@example.com` (job seeker), `sarah@techcorp.com` (recruiter), or `admin@hireflow.com` (admin). The seeded password is `Password123!`.

## Recruitment workflow

- Applicants manage their profile, browse open positions, submit applications, track recruiter status changes, and withdraw applications.
- Recruiters review their applications, update application status, and schedule interviews. Interview times and meeting details are shared with the applicant; marking an interview complete updates the displayed application progress.
- Admins review platform users, update account status, monitor job posts, and access the full applications list.
- Dashboards and workflow pages use the app's local API and demo data; no external API service is required.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
