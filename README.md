# Enable Talent - Job Platform for Persons with Disabilities

A modern, accessible job platform designed to empower persons with disabilities to register, build their profiles, and connect with employment opportunities. Enable Talent creates an inclusive space where companies can discover talented individuals while prioritizing accessibility and equal opportunity.

## 🎯 Mission

To bridge the employment gap for persons with disabilities by providing an accessible, user-friendly platform that connects skilled individuals with inclusive employers and meaningful job opportunities.

## ✨ Features

- **Accessible Registration & Signup** - Easy-to-use onboarding process with accessibility-first design
- **Resume Management** - Upload resumes or fill out profiles manually with comprehensive job history and skills sections
- **Job Discovery** - Browse and search job listings from disability-inclusive employers
- **Profile Building** - Create detailed professional profiles showcasing skills, experience, and qualifications
- **Employment Opportunities** - Connect with companies actively looking to hire talented individuals with disabilities
- **Responsive Design** - Fully responsive interface that works seamlessly across all devices

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org) (React-based full-stack framework)
- **Language:** [TypeScript](https://www.typescriptlang.org)
- **Styling:** CSS with PostCSS
- **Linting:** ESLint
- **Package Manager:** npm/yarn

## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn package manager

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd product
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

The application will automatically reload as you make changes to the code.

## 📁 Project Structure

```
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout component
│   ├── page.tsx                 # Home page
│   ├── globals.css              # Global styles
│   └── (sign-up)/               # Sign-up route group
│       └── signup/
│           ├── page.tsx         # Main signup page
│           ├── manual-resume-fill/  # Manual profile entry
│           └── resume-upload/       # Resume upload functionality
├── components/                   # Reusable React components
│   └── signup/                   # Sign-up related components
│       ├── Header.tsx           # Header component
│       └── Navbar.tsx           # Navigation component
├── public/                       # Static assets
│   └── logo/                     # Logo files
├── package.json                  # Project dependencies
├── next.config.ts               # Next.js configuration
├── tsconfig.json                # TypeScript configuration
├── eslint.config.mjs            # ESLint configuration
└── postcss.config.mjs           # PostCSS configuration
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality

## ♿ Accessibility

Enable Talent is built with accessibility as a core principle. The platform follows WCAG guidelines to ensure it's usable by everyone, including persons with various disabilities.

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues and enhancement requests.

## 📄 License

[Add your license information here]

## 📞 Support

For questions or support, please contact the Enable Talent team.

---

Built with ❤️ to create inclusive employment opportunities
