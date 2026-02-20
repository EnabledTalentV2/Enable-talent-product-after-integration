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
- `GOOGLE_PLACES_API_KEY` (required for location autocomplete; server-side only)

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

  (login)/                              # Login route group
    login-talent/page.tsx               # Talent login with vector background
    login-employer/page.tsx             # Employer login with vector background
    forgot-password/page.tsx            # Password recovery flow

  (sign-up)/                            # Signup route group
    signup/page.tsx                     # Talent initial signup form
    signup/manual-resume-fill/page.tsx  # Manual profile data entry (multi-step form)
    signup/resume-upload/page.tsx       # Resume upload + parsing
    signup/accessability-needs/page.tsx # Accessibility accommodation preferences
    signup/oauth-complete/page.tsx      # OAuth flow completion
    signup-employer/page.tsx            # Employer signup form
    signup-employer/email-verification/page.tsx
    signup-employer/organisation-info/page.tsx
    signup-employer/oauth-complete/page.tsx

  (employer)/                           # Employer routes
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

  (user-dashboard)/                     # Talent dashboard routes
    dashboard/
      layout.tsx                        # Talent dashboard layout
      page.tsx                          # Dashboard home
      home/page.tsx                     # Dashboard home section
      my-jobs/page.tsx                  # Applied jobs with tracking
      companies/page.tsx                # Browse companies
      profile/page.tsx                  # View profile
      profile-update/page.tsx           # Update profile
      career-coach/page.tsx             # AI career guidance
      career-coach/start/page.tsx       # Career coach start

  accessibility/page.tsx                # Accessibility features and info
  account/setup-required/page.tsx       # Account setup required page

  api/
    auth/                               # Auth proxy routes
      clerk-sync/route.ts               # Sync Clerk user -> Django user
      debug-token/route.ts              # Dev-only: issue Clerk JWT
      users/me/route.ts                 # Proxy to backend user profile
      add-feedback/route.ts             # Feedback submission

    candidates/                         # Candidate data endpoints
      route.ts                          # All candidates
      [slug]/route.ts                   # Single candidate profile
      prompt/route.ts                   # AI prompt generation
      career-coach/route.ts             # Career coaching AI
      profiles/route.ts                 # Candidate profiles CRUD
      profiles/[slug]/route.ts          # Individual profile update
      profiles/[slug]/full/route.ts     # Full profile fetch
      profiles/[slug]/parse-resume/route.ts
      profiles/[slug]/parsing-status/route.ts
      profiles/[slug]/verify-profile/route.ts

      # Profile data CRUD endpoints (auto-generated from modular structure)
      education/route.ts                # Education CRUD
      education/[id]/route.ts           # Individual education entry
      certifications/route.ts           # Certifications CRUD
      certifications/[id]/route.ts      # Individual certification entry
      skills/route.ts                   # Skills CRUD
      skills/[id]/route.ts              # Individual skill entry
      languages/route.ts                # Languages CRUD
      work-experience/route.ts          # Work experience CRUD
      work-experience/[id]/route.ts     # Individual work experience entry
      projects/route.ts                 # Projects CRUD
      projects/[id]/route.ts            # Individual project entry
      achievements/route.ts             # Achievements CRUD
      achievements/[id]/route.ts        # Individual achievement entry

      job-invites/route.ts              # Job invitation management
      job-invites/respond/route.ts      # Respond to job invites
      notes/route.ts                    # Candidate notes

    candidate/
      applications/route.ts             # Talent's job applications

    jobs/                               # Job endpoints
      route.ts                          # All jobs
      browse/route.ts                   # Browse jobs with filtering
      [id]/route.ts                     # Single job
      [id]/apply/route.ts               # Apply to job
      [id]/applications/route.ts        # Job applications
      [id]/applications/[applicationId]/decision/route.ts  # Accept/reject
      [id]/rank-candidates/route.ts     # AI candidate ranking
      [id]/ranking-data/route.ts        # Ranking results

    organization/                       # Organization management
      jobs/[jobId]/invite/route.ts      # Job invitation management
      selected-candidates/route.ts      # Track selected candidates
      test/candidate-insight/[candidateId]/route.ts # Candidate insights

    organizations/                      # Organization endpoints
      route.ts                          # All organizations
      [id]/route.ts                     # Single organization

    agent/
      search/route.ts                   # AI-powered candidate search

    places/
      autocomplete/route.ts             # Google Places autocomplete proxy

    user/
      me/route.ts                       # Current user session

components/                             # Modular, organized components
  a11y/                                 # Accessibility components
    ConfirmDialog.tsx                   # ARIA-compliant confirmation dialog
    (other a11y utilities)

  login/                                # Login-specific components
    talent/                             # Talent login components
    employer/                           # Employer login components

  signup/                               # Signup-specific components
    Header.tsx                          # Signup page header
    Navbar.tsx                          # Signup navbar
    Sidebar.tsx                         # Signup sidebar/stepper with status tracking

    accessibility/                      # Accessibility step components
    talent/                             # Talent signup step components
    employer/                           # Employer signup step components

    forms/                              # Multi-step form components
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

  employer/                             # Employer dashboard components
    NavBarEmployerSignUp.tsx            # Signup navbar
    ai/                                 # AI search components
    candidates/                         # Candidate list + detail components
    dashboard/                          # Dashboard widgets and panels
    portal/                             # Employer portal components

  ui/                                   # Shared UI components
    (buttons, cards, modals, etc.)

  DashBoardNavbar.tsx                   # Talent dashboard navbar
  DashboardSubnav.tsx                   # Talent subnav
  DashboardProfilePrompt.tsx            # Profile completion prompt
  EngagementTrendChart.tsx              # Analytics chart
  BackendValidationBanner.tsx           # Backend data validation banner
  Toast.tsx                             # Toast notifications

lib/                                    # Organized utilities and stores
  api-config.ts                         # Backend API endpoints + helpers
  api-client.ts                         # Frontend API client
  candidateProfile.ts                   # Candidate profile utilities
  candidateProfileUtils.ts              # Profile data transformation + validation
  profileCompletion.ts                  # Profile progress tracking
  backendDataValidator.ts               # Backend data validation utilities
  notifications.ts                      # Notification helpers

  constants/                            # Application constants

  helpers/                              # Helper functions

  hooks/                                # React hooks
    useManualResumeFill.ts              # Multi-step form hook with validation
    useFetchCandidateProfile.ts         # Profile fetching hook
    useOAuthComplete.ts                 # OAuth completion hook
    (auth, query, mutation hooks)

  providers/                            # React context providers

  schemas/                              # Zod/validation schemas

  services/                             # API service abstractions

  testing/                              # Testing utilities

  transformers/                         # Data transformation utilities

  types/                                # Shared TypeScript types
    user.ts                             # User data types
    (domain types)

  utils/                                # General utilities

  stores/                               # Zustand stores
    userDataStore.ts                    # Talent profile state + localStorage
    employerDataStore.ts                # Employer profile state
    talentAppliedJobsStore.ts           # Applied jobs state
    employerJobsStore.ts                # Employer jobs state
    (other stores)

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

## Recent Fixes & Improvements

### Date Format Validation for Manual Resume Fill (Feb 2026)

Fixed an issue where users could enter invalid date formats in the manual profile builder (Work Experience, Projects, Certifications, Achievements) that would fail silently until the final submission step, creating a confusing user experience.

**What was fixed:**
- ✅ Users now see validation errors **immediately on the correct step** (not on Step 10)
- ✅ Clear, user-friendly error messages (e.g., "Please enter a valid Start Date (e.g. 2024-03-15)")
- ✅ Support for multiple date input formats from resume parsing (MM/YYYY, YYYY/MM, YYYY, month names, etc.)
- ✅ Invalid dates are caught before reaching the backend API

**Supported date formats (automatically converted to YYYY-MM-DD):**
- `2024-03-15` (YYYY-MM-DD) — already correct
- `2024-03` (YYYY-MM) → `2024-03-01`
- `03/2024` (MM/YYYY) → `2024-03-01`
- `2024/03` (YYYY/MM) → `2024-03-01`
- `03-2024` (MM-YYYY) → `2024-03-01`
- `2024` (year only) → `2024-01-01`
- `Aug 2021`, `August 2021`, `aug-2021`, `aug/2021` (month names) → `2021-08-01`

**Files modified:**
- `lib/candidateProfileUtils.ts` — Enhanced `toDateValue()` with support for 5 additional date formats
- `lib/hooks/useManualResumeFill.ts` — Added format validation in `validateStep()` for work experience, projects, certifications, and achievements
- `components/signup/forms/Certification.tsx` — Changed certification date inputs to `type="month"` for consistency and to prevent invalid text input

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

**Last Updated:** February 17, 2026
