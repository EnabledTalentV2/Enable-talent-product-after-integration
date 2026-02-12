# Enabled Talent - Inclusive Job Platform

A modern, accessible job platform designed to empower talents and connect them with disability-inclusive employers. Enabled Talent provides an intuitive interface for job seekers to build profiles, upload resumes, and discover opportunities, while employers can post jobs and find top talent using AI-powered search and ranking.

## Mission

To bridge the employment gap for persons with disabilities by providing an accessible, user-friendly platform that connects skilled individuals with disability-inclusive employers and meaningful job opportunities.

## Key Highlights

- **AI-Powered Matching**: Intelligent candidate search and ranking to connect the right talent with the right opportunities
- **Accessibility First**: Built with WCAG compliance, screen reader support, and keyboard navigation throughout
- **Smart Resume Parsing**: Automated resume parsing with manual entry fallback for flexible profile creation
- **Career Coaching**: AI-driven career guidance to help job seekers navigate their professional journey
- **Modern Tech Stack**: Built with Next.js 16, React 19, TypeScript, and TanStack Query for optimal performance
- **Seamless Integration**: Clerk authentication + Django backend integration via Bearer tokens

## Key Features

For Talents:

- Authentication via Clerk (email/password, OTP, OAuth)
- Multi-step profile builder covering basic info, education, work experience, skills, projects, certifications, and preferences
- Resume upload and parsing pipeline (Supabase storage + backend parsing) with manual resume entry fallback
- Job discovery, browsing, and application tracking with status updates
- Company browsing and exploration
- AI-powered career coach for personalized career guidance and recommendations
- Dashboard sections for profile completion, job applications, and career development

For Employers:

- Employer authentication via Clerk (email/password, OTP, OAuth) with organization info step
- Job posting, editing, and listing management stored per employer
- AI-powered candidate search and intelligent ranking based on job requirements
- Application management with accept/reject decision workflow
- Candidate management per job with detailed profile review
- Company profile view and edit
- Analytics widgets and engagement trends

Platform & Experience:

- Role-based routing and auth-aware redirects (`proxy.ts`)
- Next.js route handlers proxy to the Django backend and attach `Authorization: Bearer <Clerk JWT template token>`
- Glassmorphism UI with vector backgrounds on auth flows
- Responsive, accessible layout with semantic HTML and ARIA labels

## Tech Stack

### Frontend
- Next.js 16.1.6 (React 19.2.1, App Router)
- TypeScript 5
- Tailwind CSS v4 with PostCSS
- Zustand (state management + localStorage persistence)
- TanStack Query (React Query) for data fetching and caching
- Clerk (`@clerk/nextjs`) for authentication + session management
- Chart.js and react-chartjs-2 for analytics visualization
- React Markdown for rich text rendering
- Lucide React icons
- Zod for schema validation
- Jose (JWT decoding; used for safe local/debug inspection of Clerk JWT claims)

### Development
- ESLint 9 with Next.js config
- TypeScript strict mode

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation & Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd product
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

Create `.env.local` and set:

- `BACKEND_URL` (Django backend base URL)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (Clerk publishable key)
- `CLERK_SECRET_KEY` (Clerk secret key)
- `CLERK_JWT_TEMPLATE` (JWT template name used for backend calls; commonly `api`)
- `NEXT_PUBLIC_SUPABASE_URL` (optional; resume uploads)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_RESUME_BUCKET` (default: `resumes`)

If Supabase is not configured, resume upload will warn and users can continue with manual entry.

Note: The backend expects a **Clerk JWT template token** (so claims like `aud` are present). Configure the matching JWT template in the Clerk dashboard (commonly named `api`) and set `CLERK_JWT_TEMPLATE=api`.

4. Run the development server:

```bash
npm run dev
```

5. Open your browser:
   Navigate to [http://localhost:3000](http://localhost:3000)

The application will automatically reload as you make changes.

### Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
app/                                    # Next.js App Router
  layout.tsx                            # Root layout wrapper
  page.tsx                              # Landing/home page
  globals.css                           # Global styles

  (login)/
    login-talent/page.tsx               # Talent login with vector background
    login-employer/page.tsx             # Employer login with vector background

  (sign-up)/
    signup/page.tsx                     # Talent signup form
    signup/manual-resume-fill/page.tsx  # Manual profile data entry
    signup/resume-upload/page.tsx       # Resume upload + parsing
    signup-employer/page.tsx            # Employer signup form
    signup-employer/email-verification/page.tsx
    signup-employer/organisation-info/page.tsx

  (employer)/
    employer/page.tsx                   # Employer landing
    employer/dashboard/
      layout.tsx                        # Employer dashboard layout
      page.tsx                          # Employer dashboard home
      post-jobs/page.tsx                # Job posting form
      listed-jobs/page.tsx              # Posted jobs list
      edit-job/[jobId]/page.tsx         # Job editing
      ai-search/page.tsx                # AI-powered candidate search
      candidates/page.tsx               # All candidates overview
      candidates/[jobId]/page.tsx       # Candidate management per job
      candidates/profile/[slug]/page.tsx # Individual candidate profile view
      company-profile/page.tsx          # Company info
      company-profile-edit/page.tsx     # Edit company info

  (user-dashboard)/
    dashboard/
      layout.tsx                        # Talent dashboard layout
      page.tsx                          # Dashboard home
      home/page.tsx                     # Dashboard home section
      my-jobs/page.tsx                  # Applied jobs
      companies/page.tsx                # Browse companies
      profile/page.tsx                  # View profile
      profile-update/page.tsx           # Update profile
      career-coach/page.tsx             # AI career guidance
      career-coach/start/page.tsx       # Career coach start

  accessibility/page.tsx                # Accessibility features and info

  api/
    auth/                               # Auth proxy routes
      clerk-sync/route.ts               # Sync Clerk user -> Django user (required before onboarding continues)
      debug-token/route.ts              # Dev-only: issue a Clerk JWT for manual backend testing
      users/me/route.ts                 # Proxy to backend `/api/auth/users/me/`
      add-feedback/route.ts

    candidates/                         # Candidate endpoints
      route.ts                          # All candidates
      [slug]/route.ts                   # Single candidate
      prompt/route.ts                   # AI prompt generation
      career-coach/route.ts             # Career coaching AI
      profiles/route.ts                 # Candidate profiles
      profiles/[slug]/route.ts
      profiles/[slug]/parse-resume/route.ts
      profiles/[slug]/parsing-status/route.ts
      profiles/[slug]/verify-profile/route.ts

    candidate/
      applications/route.ts             # Talent's job applications

    jobs/                               # Job endpoints
      route.ts                          # All jobs
      browse/route.ts                   # Browse jobs
      [id]/route.ts                     # Single job
      [id]/apply/route.ts               # Apply to job
      [id]/applications/route.ts        # Job applications
      [id]/applications/[applicationId]/decision/route.ts  # Accept/reject
      [id]/rank-candidates/route.ts     # AI candidate ranking
      [id]/ranking-data/route.ts        # Ranking results

    organizations/                      # Organization endpoints
      route.ts
      [id]/route.ts

    agent/
      search/route.ts                   # AI-powered search

    user/
      me/route.ts                       # Current user session

components/                             # Reusable React components
  DashBoardNavbar.tsx                   # Talent dashboard navbar
  DashBaordNavbarEmployer.tsx           # Employer dashboard navbar
  DashboardSubnav.tsx                   # Talent subnav
  DashBoardSubNavEmployer.tsx           # Employer subnav
  DashboardProfilePrompt.tsx            # Profile completion prompt
  EngagementTrendChart.tsx              # Analytics chart
  BackendValidationBanner.tsx           # Backend data validation banner
  Toast.tsx                             # Toast notifications

  employer/
    NavBarEmployerSignUp.tsx            # Signup navbar
    dashboard/                          # Employer dashboard widgets
    candidates/                         # Candidate list + detail components

  signup/
    Header.tsx                          # Signup page header
    Navbar.tsx                          # Signup navbar
    Sidebar.tsx                         # Signup sidebar/stepper
    types.ts                            # TypeScript types for signup
    forms/                              # Form components for signup steps
      BasicInfo.tsx
      Education.tsx
      WorkExperience.tsx
      Skills.tsx
      Certification.tsx
      Projects.tsx
      Achievements.tsx
      Preference.tsx
      OtherDetails.tsx
      ReviewAndAgree.tsx
      InputBlock.tsx
      SimpleText.tsx

lib/                                    # Utility functions and stores
  api-config.ts                         # Backend API endpoints + helpers
  api-client.ts                         # Frontend API client
  backendDataValidator.ts               # Backend data validation utilities
  notifications.ts                      # Notification helpers
  hooks/                                # Auth + profile hooks
  types/                                # Shared types

  userDataStore.ts                      # Zustand store for talent data
  userDataDefaults.ts                   # Default user data
  localUserStore.ts                     # Local storage for users
  talentAppliedJobsStore.ts             # Applied jobs state

  employerDataStore.ts                  # Zustand store for employer data
  employerJobsStore.ts                  # Employer jobs state
  employerJobsTypes.ts                  # Job type definitions
  employerJobsUtils.ts                  # Job utility functions
  profileCompletion.ts                  # Profile progress tracking

public/                                 # Static assets
  logo/                                 # Brand logos
  Vector 4500.svg
  Vector 4500.png
  Placeholder.png
  placeholderLogo.png

proxy.ts                                # Route guard helper
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Create optimized production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Documentation

Additional documentation is available in the project:

- **[Backend API README.md](Backend%20API%20README.md)** - Complete Django backend API documentation with endpoints and examples
- **[docs/API_INTEGRATION_GUIDE.md](docs/API_INTEGRATION_GUIDE.md)** - Guide for integrating with the backend API
- **[docs/IMPLEMENTATION_SUMMARY.md](docs/IMPLEMENTATION_SUMMARY.md)** - Implementation details and architecture decisions
- **[docs/QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md)** - Quick reference for common tasks
- **[docs/BEFORE_AFTER_COMPARISON.md](docs/BEFORE_AFTER_COMPARISON.md)** - Project evolution and changes

## Design Features

### Authentication Pages (Talent & Employer)

- Vector background design with glassmorphism effect
- Gradient styling for talent auth flows (`#F7D877`, `#F2BF4A`, `#E8A426`)
- Blue backdrop for employer auth flows (`#C5D8F5`)
- Semi-opaque card background with backdrop blur
- Responsive layout (two-column desktop, single column mobile)

### Dashboard Pages

- Responsive navigation and subnav components
- Metric widgets and engagement charts
- Card-based layout for dashboard content
- Status indicators for jobs and profiles

### AI-Powered Features

- **Career Coach**: Personalized AI guidance for job seekers with career recommendations
- **Candidate Search**: AI agent-powered search to help employers find the right talent
- **Smart Ranking**: Intelligent candidate ranking based on job requirements and qualifications
- **Profile Analysis**: AI-driven profile suggestions and improvements

## Authentication & Data Management

### Backend Integration

- Django backend integration via `BACKEND_URL` in `lib/api-config.ts`
- Next.js route handlers in `app/api/*` proxy requests to Django and attach a Clerk-issued JWT as a Bearer token
- Server-side code reads the logged-in user via `auth()` from `@clerk/nextjs/server` and issues backend tokens via `getToken({ template })`
- TanStack Query for efficient data fetching, caching, and synchronization

### State Management

- **Zustand stores** for talent profiles, employer profiles, applied jobs, and job listings
- **Local storage persistence** for user data between sessions
- **React Query** for server state management and background updates

### Application Workflow

#### For Talents
1. Sign up via Clerk (email/OTP or OAuth)
2. Complete multi-step profile or upload resume for parsing
3. Browse jobs and companies
4. Apply to positions with one click
5. Track application status in dashboard
6. Get AI-powered career coaching

#### For Employers
1. Sign up via Clerk (email/OTP or OAuth) + organization details
2. Create and manage job postings
3. Use AI search to find candidates
4. Review applications with smart ranking
5. Accept or reject candidates with decision workflow
6. Track engagement and analytics

## Accessibility

Enabled Talent is built with accessibility at its core:

- Semantic HTML structure
- ARIA labels and roles for screen readers
- Keyboard navigation support
- Focus management and visible focus indicators
- Form error handling and validation messages
- Proper heading hierarchy
- Color contrast compliance
- Responsive design for all device sizes

## Contributing

We welcome contributions. Please feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m "Add amazing feature"`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[Add your license information here]

## Support & Contact

For questions, bug reports, or support requests, please contact the Enabled Talent team.

---

Built with care to create inclusive employment opportunities for everyone.

**Last Updated:** February 12, 2026
