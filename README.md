# Enabled Talent - Inclusive Job Platform

A modern, accessible job platform designed to empower talents and connect them with disability-inclusive employers. Enabled Talent provides an intuitive interface for job seekers to build profiles, upload resumes, and discover opportunities, while employers can post jobs and find top talent.

## 🎯 Mission

To bridge the employment gap for persons with disabilities by providing an accessible, user-friendly platform that connects skilled individuals with disability-inclusive employers and meaningful job opportunities.

## ✨ Key Features

**For Talents:**

- **User Authentication** - Secure signup and login with email verification
- **Profile Management** - Build comprehensive professional profiles with work experience, education, skills, and certifications
- **Resume Handling** - Upload resumes or manually fill profiles with detailed information
- **Job Discovery** - Browse and apply for jobs from disability-inclusive companies
- **Dashboard** - Personalized dashboard with applied jobs, profile completion tracking, and career resources
- **Career Coach** - Access career guidance and support resources

**For Employers:**

- **Employer Authentication** - Secure signup and login for company accounts
- **Job Management** - Post, edit, and manage job listings
- **Candidate Management** - Review candidate profiles and send interview invitations
- **Company Profile** - Showcase company information and culture
- **Analytics** - Track job posting performance and candidate engagement

**Design & Experience:**

- **Beautiful UI** - Modern glassmorphism design with gradient backgrounds and smooth animations
- **Responsive Design** - Fully responsive interface optimized for desktop, tablet, and mobile
- **Accessibility First** - WCAG-compliant interface with proper semantic HTML and ARIA labels

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org) (React 19, App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org)
- **Styling:** Tailwind CSS with PostCSS
- **State Management:** Zustand (for user and employer data stores)
- **UI Components:** Lucide React (icons)
- **Linting:** ESLint with modern config
- **Image Handling:** Next.js Image component with WebP optimization

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

### Installation & Setup

1. **Clone the repository:**

```bash
git clone <repository-url>
cd product
```

2. **Install dependencies:**

```bash
npm install
```

3. **Run the development server:**

```bash
npm run dev
```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

The application will automatically reload as you make changes.

### Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
├── app/                                    # Next.js App Router
│   ├── layout.tsx                         # Root layout wrapper
│   ├── page.tsx                           # Landing/home page
│   ├── globals.css                        # Global styles
│   │
│   ├── (login)/                           # Login route group
│   │   ├── login-talent/
│   │   │   └── page.tsx                  # Talent login with vector background
│   │   └── login-employer/
│   │       └── page.tsx                  # Employer login with vector background
│   │
│   ├── (sign-up)/                         # Sign-up route group
│   │   ├── signup/
│   │   │   ├── page.tsx                  # Talent signup form
│   │   │   ├── manual-resume-fill/       # Manual profile data entry
│   │   │   └── resume-upload/            # Resume file upload
│   │   └── signup-employer/
│   │       ├── page.tsx                  # Employer signup form
│   │       └── email-verification/       # Email verification flow
│   │
│   ├── (employer)/                        # Employer dashboard route group
│   │   └── employer/
│   │       ├── page.tsx                  # Main employer page
│   │       └── dashboard/
│   │           ├── page.tsx              # Employer dashboard
│   │           ├── candidates/           # Candidate management
│   │           ├── listed-jobs/          # Posted jobs list
│   │           ├── post-jobs/            # Job posting form
│   │           ├── edit-job/             # Job editing
│   │           ├── company-profile/      # Company info
│   │           └── company-profile-edit/ # Edit company info
│   │
│   ├── (user-dashboard)/                  # Talent dashboard route group
│   │   └── dashboard/
│   │       ├── page.tsx                  # Dashboard home
│   │       ├── home/                     # Dashboard home section
│   │       ├── my-jobs/                  # Applied jobs
│   │       ├── profile/                  # View profile
│   │       ├── profile-edit/             # Edit profile
│   │       ├── profile-update/           # Update profile
│   │       ├── companies/                # Browse companies
│   │       └── career-coach/             # Career guidance
│   │
│   └── api/                               # API routes
│       ├── auth/
│       │   ├── login/
│       │   ├── logout/
│       │   ├── signup/
│       │   └── resend-verification/
│       └── user/
│           └── me/
│
├── components/                            # Reusable React components
│   ├── DashBoardNavbar.tsx               # Talent dashboard navbar
│   ├── DashBaordNavbarEmployer.tsx       # Employer dashboard navbar
│   ├── DashboardSubnav.tsx               # Talent subnav
│   ├── DashBoardSubNavEmployer.tsx       # Employer subnav
│   ├── DashboardProfilePrompt.tsx        # Profile completion prompt
│   ├── EngagementTrendChart.tsx          # Analytics chart
│   ├── Toast.tsx                         # Toast notifications
│   │
│   ├── employer/
│   │   ├── NavBarEmployerSignUp.tsx      # Signup navbar
│   │   ├── dashboard/
│   │   │   ├── JobForm.tsx               # Job posting form
│   │   │   ├── ListedJobCard.tsx         # Job card display
│   │   │   ├── RecentJobCard.tsx         # Recent job card
│   │   │   ├── CandidateCard.tsx         # Candidate card
│   │   │   ├── DashboardMetricCard.tsx   # Metric widget
│   │   │   ├── AttentionWidget.tsx       # Alert widget
│   │   │   ├── TimeRangeTabs.tsx         # Date filter tabs
│   │   │   ├── JobDetailView.tsx         # Job detail view
│   │   │   └── DashboardSummaryCard.tsx  # Summary widget
│   │   └── candidates/
│   │       ├── CandidateList.tsx         # Candidates list
│   │       ├── CandidateListItem.tsx     # Individual candidate item
│   │       ├── CandidateDetail.tsx       # Candidate profile view
│   │       ├── JobHeader.tsx             # Job header in candidates view
│   │       ├── ProfileSection.tsx        # Profile section display
│   │       ├── SendInvitesModal.tsx      # Interview invite modal
│   │       └── SuccessModal.tsx          # Success notification
│   │
│   └── signup/
│       ├── Header.tsx                    # Signup page header
│       ├── Navbar.tsx                    # Signup navbar
│       ├── Sidebar.tsx                   # Signup sidebar/stepper
│       ├── types.ts                      # TypeScript types for signup
│       └── forms/                        # Form components for signup steps
│           ├── BasicInfo.tsx             # Full name and email
│           ├── Education.tsx             # Education history
│           ├── WorkExperience.tsx        # Work experience
│           ├── Skills.tsx                # Skills section
│           ├── Certification.tsx         # Certifications
│           ├── Projects.tsx              # Projects showcase
│           ├── Achievements.tsx          # Achievements section
│           ├── Preference.tsx            # Job preferences
│           ├── OtherDetails.tsx          # Additional info
│           ├── ReviewAndAgree.tsx        # Final review
│           ├── InputBlock.tsx            # Reusable input component
│           └── SimpleText.tsx            # Text input field
│
├── lib/                                   # Utility functions and stores
│   ├── userDataStore.ts                  # Zustand store for talent data
│   ├── employerDataStore.ts              # Zustand store for employer data
│   ├── localUserStore.ts                 # Local storage for users
│   ├── localEmployerStore.ts             # Local storage for employers
│   ├── userDataDefaults.ts               # Default user data
│   ├── userDataDefaults.ts               # Default data structures
│   ├── talentAppliedJobsStore.ts         # Applied jobs state
│   ├── employerJobsStore.ts              # Employer jobs state
│   ├── employerJobsTypes.ts              # Job type definitions
│   ├── employerJobsUtils.ts              # Job utility functions
│   ├── profileCompletion.ts              # Profile progress tracking
│   ├── mockUserSession.ts                # Mock session data
│   └── mock-db.ts                        # Mock database
│
├── public/                                # Static assets
│   ├── logo/                             # Brand logos
│   └── Vector 4500.svg                   # Background vector design
│
├── package.json                           # Dependencies and scripts
├── next.config.ts                        # Next.js configuration
├── tsconfig.json                         # TypeScript config
├── eslint.config.mjs                     # ESLint rules
├── postcss.config.mjs                    # PostCSS config
├── tailwind.config.ts                    # Tailwind CSS config
└── proxy.ts                              # Proxy configuration
```

## 📝 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Create optimized production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality and fix issues

## 🎨 Design Features

### Authentication Pages (Talent & Employer)

- **Vector Background Design** - Decorative SVG background with glassmorphism effect
- **Gradient Styling** - Modern color gradients that maintain brand identity
  - Talent: Orange/yellow gradient (`#F7D877`, `#F2BF4A`, `#E8A426`)
  - Employer: Blue gradient (`#C5D8F5`)
- **Semi-opaque Card Background** - 90% opacity with backdrop blur for depth
- **Responsive Layout** - Two-column layout on desktop, single column on mobile

### Dashboard Pages

- **Responsive Navigation** - Collapsible sidebars with icon-based navigation
- **Metric Widgets** - Visual display of key performance indicators
- **Card-based Layout** - Organized content using reusable card components
- **Status Indicators** - Visual cues for job status, profile completion, etc.

## 🔐 Authentication & Data Management

### State Management

- **Zustand Stores** - Lightweight state management for user and employer data
  - `userDataStore` - Manages talent profile and application data
  - `employerDataStore` - Manages employer profile and job listings

### Data Persistence

- **Local Storage** - Browser-based storage for demo/prototype functionality
- **Mock Database** - In-memory mock data for testing features
- Note: Production should integrate with backend API

## ♿ Accessibility

Enabled Talent is built with accessibility at its core:

- ✅ Semantic HTML structure
- ✅ ARIA labels and roles for screen readers
- ✅ Keyboard navigation support
- ✅ Focus management and visible focus indicators
- ✅ Form error handling and validation messages
- ✅ Proper heading hierarchy
- ✅ Color contrast compliance
- ✅ Responsive design for all device sizes

## 🤝 Contributing

We welcome contributions! Please feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

[Add your license information here]

## 📞 Support & Contact

For questions, bug reports, or support requests, please contact the Enabled Talent team.

---

**Built with ❤️ to create inclusive employment opportunities for everyone**

_Last Updated: December 2025_
