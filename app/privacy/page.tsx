import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Privacy Policy | Enabled Talent",
  description:
    "Read Enabled Talent's Privacy Policy. Learn how we collect, use, and protect your personal information, including sensitive accessibility and disability data.",
};

export default function PrivacyPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#F0F4F8]">
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block mb-6">
            <Image
              src="/logo/et-new.svg"
              alt="Enabled Talent logo"
              width={180}
              height={48}
              priority
              className="h-12 w-auto object-contain"
            />
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-base text-slate-700">
            Effective date: February 2026 &mdash; Last updated: February 2026
          </p>
        </div>

        {/* Content */}
        <div className="rounded-3xl bg-white p-8 shadow-sm md:p-12">
          <div className="prose prose-slate max-w-none">

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                1. Introduction
              </h2>
              <p className="text-slate-700 leading-relaxed">
                Enabled Talent (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or
                &ldquo;our&rdquo;) is committed to protecting the privacy of
                all users of our inclusive hiring platform. This Privacy Policy
                explains what personal information we collect, how we use it,
                and your rights regarding that information.
              </p>
              <p className="text-slate-700 leading-relaxed mt-3">
                We comply with the{" "}
                <em>Personal Information Protection and Electronic Documents Act (PIPEDA)</em>
                , Ontario&apos;s{" "}
                <em>Freedom of Information and Protection of Privacy Act</em>,
                and the{" "}
                <em>Accessibility for Ontarians with Disabilities Act (AODA)</em>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                2. Information We Collect
              </h2>

              <h3 className="text-base font-semibold text-slate-900 mb-2 mt-4">
                2.1 Information you provide directly
              </h3>
              <p className="text-slate-700 leading-relaxed mb-2">
                When you create an account or complete your profile, we may
                collect:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>
                  <strong>Identity information:</strong> full name, email
                  address, phone number, location, gender, ethnicity, and
                  citizenship status.
                </li>
                <li>
                  <strong>Professional information:</strong> work experience,
                  education, skills, certifications, projects, achievements,
                  career preferences, and resume content.
                </li>
                <li>
                  <strong>Accessibility information (sensitive):</strong>{" "}
                  disability categories, accommodation needs, workplace
                  accommodation preferences, and disclosure preferences. This
                  information is entirely optional and provided at your
                  discretion.
                </li>
                <li>
                  <strong>Profile media:</strong> a profile photo you choose to
                  upload.
                </li>
                <li>
                  <strong>Links:</strong> LinkedIn profile, GitHub, portfolio,
                  or social media URLs you provide.
                </li>
              </ul>

              <h3 className="text-base font-semibold text-slate-900 mb-2 mt-4">
                2.2 Information collected automatically
              </h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>
                  <strong>Usage data:</strong> pages visited, features used,
                  and interaction patterns within the Platform.
                </li>
                <li>
                  <strong>Technical data:</strong> IP address, browser type,
                  device type, and operating system.
                </li>
                <li>
                  <strong>Session data:</strong> authentication session
                  information managed by our authentication provider (Clerk).
                </li>
              </ul>

              <h3 className="text-base font-semibold text-slate-900 mb-2 mt-4">
                2.3 Employer information
              </h3>
              <p className="text-slate-700 leading-relaxed">
                If you register as an Employer, we collect your name, company
                name, email address, company profile information, and job
                postings you create on the Platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                3. How We Use Your Information
              </h2>
              <p className="text-slate-700 leading-relaxed mb-2">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>
                  Create and manage your account and authenticate your identity.
                </li>
                <li>
                  Match Candidates with relevant job opportunities and Employers
                  with suitable candidates.
                </li>
                <li>
                  Power AI-driven features such as resume coaching, career
                  advice, and candidate ranking, using your profile data to
                  provide personalised results.
                </li>
                <li>
                  Communicate with you about your account, job applications,
                  invitations, and platform updates.
                </li>
                <li>
                  Improve and develop the Platform through analytics and usage
                  patterns.
                </li>
                <li>
                  Comply with legal obligations and enforce our{" "}
                  <Link
                    href="/terms"
                    className="text-orange-900 underline hover:text-orange-800"
                  >
                    Terms of Service
                  </Link>
                  .
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                4. Sensitive Information — Accessibility and Disability Data
              </h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                We treat accessibility and disability-related information as
                sensitive personal information and apply heightened protections:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>
                  <strong>Voluntary disclosure:</strong> You choose whether to
                  disclose any accessibility needs. You can update or remove
                  this information at any time from your profile settings.
                </li>
                <li>
                  <strong>Controlled sharing:</strong> Accessibility information
                  is shared with Employers only according to your chosen
                  disclosure preference. If you prefer not to disclose, this
                  information will not be visible to Employers.
                </li>
                <li>
                  <strong>Purpose limitation:</strong> This information is used
                  exclusively to facilitate workplace accommodation discussions
                  and to help Employers create accessible, inclusive workplaces.
                </li>
                <li>
                  <strong>No profiling for discrimination:</strong> We never use
                  disability data to exclude candidates from job opportunities
                  or to rank candidates in a discriminatory manner.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                5. Information Sharing
              </h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                We do not sell your personal information. We share your
                information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>
                  <strong>With Employers:</strong> Your candidate profile
                  (excluding information you have chosen not to disclose) is
                  visible to Employers who use the Platform to search for and
                  evaluate candidates.
                </li>
                <li>
                  <strong>Service providers:</strong> We use trusted third-party
                  service providers to operate the Platform, including{" "}
                  <strong>Clerk</strong> (authentication and user management)
                  and cloud hosting and storage providers. These providers
                  process data only on our behalf and under strict
                  confidentiality obligations.
                </li>
                <li>
                  <strong>AI features:</strong> When you use AI-powered features
                  (such as career coaching or resume analysis), your profile data
                  is processed by our AI systems to generate personalised
                  responses. We do not share identifiable data with third-party
                  AI providers without your consent.
                </li>
                <li>
                  <strong>Legal requirements:</strong> We may disclose
                  information if required by law, court order, or governmental
                  authority, or to protect the rights, property, or safety of
                  Enabled Talent, our users, or the public.
                </li>
                <li>
                  <strong>Business transfers:</strong> In the event of a merger,
                  acquisition, or sale of assets, your information may be
                  transferred, subject to the same protections described in this
                  policy.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                6. Data Storage and Security
              </h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                Your data is stored on secure servers. We implement
                industry-standard security measures including:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>Encryption in transit (TLS) and at rest.</li>
                <li>
                  Role-based access controls limiting who can access personal
                  data.
                </li>
                <li>Regular security assessments.</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-3">
                While we take reasonable precautions, no transmission over the
                internet or electronic storage method is 100% secure. If you
                suspect a security breach, please contact us immediately at{" "}
                <a
                  href="mailto:privacy@enabledtalent.com"
                  className="text-orange-900 underline hover:text-orange-800"
                >
                  privacy@enabledtalent.com
                </a>
                .
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                7. Data Retention
              </h2>
              <p className="text-slate-700 leading-relaxed">
                We retain your personal information for as long as your account
                is active or as needed to provide our services. If you close
                your account, we will delete or anonymise your personal
                information within 90 days, except where retention is required
                by law or for legitimate business purposes (such as resolving
                disputes or enforcing our Terms).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                8. Cookies and Tracking
              </h2>
              <p className="text-slate-700 leading-relaxed">
                We use cookies and similar technologies to authenticate sessions,
                remember your preferences, and analyse Platform usage. Essential
                cookies (required for the Platform to function) are always
                active. You can control non-essential cookies through your
                browser settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                9. Your Rights
              </h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                Under PIPEDA and applicable provincial law, you have the right
                to:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>
                  <strong>Access:</strong> Request a copy of the personal
                  information we hold about you.
                </li>
                <li>
                  <strong>Correction:</strong> Request that we correct
                  inaccurate or incomplete information.
                </li>
                <li>
                  <strong>Withdrawal of consent:</strong> Withdraw consent to
                  the processing of non-essential personal information at any
                  time. This may affect your ability to use certain features.
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your account
                  and associated personal information.
                </li>
                <li>
                  <strong>Portability:</strong> Request a copy of your data in
                  a structured, machine-readable format.
                </li>
                <li>
                  <strong>Complaint:</strong> Lodge a complaint with the Office
                  of the Privacy Commissioner of Canada if you believe your
                  privacy rights have been violated.
                </li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-3">
                To exercise these rights, contact us at{" "}
                <a
                  href="mailto:privacy@enabledtalent.com"
                  className="text-orange-900 underline hover:text-orange-800"
                >
                  privacy@enabledtalent.com
                </a>
                . We will respond within 30 days.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                10. Children&apos;s Privacy
              </h2>
              <p className="text-slate-700 leading-relaxed">
                The Platform is not intended for use by individuals under the
                age of 16. We do not knowingly collect personal information from
                children under 16. If you believe we have inadvertently collected
                such information, please contact us and we will delete it promptly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                11. Changes to This Policy
              </h2>
              <p className="text-slate-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will
                notify you of material changes by email or through a prominent
                notice on the Platform before they take effect. The
                &ldquo;Last updated&rdquo; date at the top of this page will
                always reflect the most recent revision. Continued use of the
                Platform after changes take effect constitutes acceptance of the
                revised policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                12. Contact Us
              </h2>
              <p className="text-slate-700 leading-relaxed mb-2">
                For privacy-related questions, requests, or complaints:
              </p>
              <ul className="list-none text-slate-700 space-y-2">
                <li>
                  <strong>Privacy Officer Email:</strong>{" "}
                  <a
                    href="mailto:privacy@enabledtalent.com"
                    className="text-orange-900 underline hover:text-orange-800"
                  >
                    privacy@enabledtalent.com
                  </a>
                </li>
                <li>
                  <strong>General Support:</strong>{" "}
                  <a
                    href="mailto:support@enabledtalent.com"
                    className="text-orange-900 underline hover:text-orange-800"
                  >
                    support@enabledtalent.com
                  </a>
                </li>
                <li>
                  <strong>Website:</strong>{" "}
                  <a
                    href="https://www.enabledtalent.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-900 underline hover:text-orange-800"
                  >
                    www.enabledtalent.com
                  </a>
                </li>
                <li>
                  <strong>Response time:</strong> We aim to respond within 30
                  days as required under PIPEDA.
                </li>
              </ul>
            </section>

          </div>
        </div>

        {/* Footer navigation */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
          <Link
            href="/terms"
            className="hover:text-orange-900 underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C27803] focus-visible:ring-offset-2 rounded-sm"
          >
            Terms of Service
          </Link>
          <Link
            href="/accessibility"
            className="hover:text-orange-900 underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C27803] focus-visible:ring-offset-2 rounded-sm"
          >
            Accessibility Statement
          </Link>
          <Link
            href="/login-talent"
            className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C27803] focus-visible:ring-offset-2 rounded-sm"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
