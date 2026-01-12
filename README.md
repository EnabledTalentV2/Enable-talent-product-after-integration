# Enabled Talent - Inclusive Job Platform

A modern, accessible job platform designed to empower talents and connect them with disability-inclusive employers. Enabled Talent provides an intuitive interface for job seekers to build profiles, upload resumes, and discover opportunities, while employers can post jobs and find top talent.

## Mission1-a1

To bridge the employment gap for persons with disabilities by providing an accessible, user-friendly platform that connects skilled individuals with disability-inclusive employers and meaningful job opportunities.

## Key Features

For Talents:

- User authentication with email verification and CSRF-protected sessions
- Multi-step profile builder covering basic info, education, work experience, skills, projects, certifications, and preferences
- Resume upload and parsing pipeline (Supabase storage + backend parsing) with manual resume entry fallback
- Job discovery, company browsing, and applied job tracking
- Dashboard sections for profile completion and career coach flow

For Employers:

- Employer authentication with email verification and organization info step
- Job posting, editing, and listing management stored per employer
- Candidate management per job with profile review and interview invite flow
- Company profile view and edit
- Analytics widgets and engagement trends

Platform & Experience:

- Role-based routing and auth-aware redirects (`proxy.ts`)
- Next.js route handlers that proxy to the Django backend (cookie + CSRF forwarding)
- Glassmorphism UI with vector backgrounds on auth flows
- Responsive, accessible layout with semantic HTML and ARIA labels

## Tech Stack

- Next.js 16 (React 19, App Router)
- TypeScript
- Tailwind CSS v4 with PostCSS
- Zustand (state + localStorage persistence)
- Chart.js and react-chartjs-2
- Lucide React icons
- Jose (JWT decoding)
- ESLint

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

Copy `.env.example` to `.env.local` and set:

- `BACKEND_URL` (Django backend base URL)
- `NEXT_PUBLIC_SUPABASE_URL` (optional; resume uploads)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_RESUME_BUCKET` (default: `resumes`)

If Supabase is not configured, resume upload will warn and users can continue with manual entry.

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
      candidates/[jobId]/page.tsx       # Candidate management per job
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
      profile-edit/page.tsx             # Edit profile
      profile-update/page.tsx           # Update profile
      career-coach/page.tsx             # Career guidance
      career-coach/start/page.tsx        # Career coach start

  api/
    auth/                               # Auth proxy routes
      login/route.ts
      logout/route.ts
      signup/route.ts
      verify-email/route.ts
      resend-verification/route.ts
      change-password/route.ts
      csrf/route.ts
      token/refresh/route.ts
      add-feedback/route.ts
    candidates/
      profiles/route.ts
      profiles/[slug]/route.ts
      profiles/[slug]/parse-resume/route.ts
      profiles/[slug]/parsing-status/route.ts
      profiles/[slug]/verify-profile/route.ts
    resume/parse/route.ts               # Resume upload + parsing proxy
    organizations/route.ts              # Organization API proxy
    user/me/route.ts                    # Current user session

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

## Authentication & Data Management

### Backend Integration

- Django backend integration via `BACKEND_URL` in `lib/api-config.ts`
- Next.js route handlers in `app/api/*` proxy requests and forward cookies/CSRF
- CSRF handling in `lib/api-client.ts` for client-side requests

### Local State

- Zustand stores for talent profiles, employer profiles, applied jobs, and job listings

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

Last Updated: January 2026
