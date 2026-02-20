import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Terms of Service | Enabled Talent",
  description:
    "Read the Terms of Service for Enabled Talent's inclusive hiring platform. Understand your rights and responsibilities as a Candidate or Employer.",
};

export default function TermsPage() {
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
            Terms of Service
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
                1. Acceptance of Terms
              </h2>
              <p className="text-slate-700 leading-relaxed">
                By accessing or using the Enabled Talent platform
                (&ldquo;Platform&rdquo;), you agree to be bound by these Terms
                of Service (&ldquo;Terms&rdquo;). If you do not agree, please do
                not use the Platform. These Terms apply to all visitors, Candidates,
                and Employers who access the Platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                2. About Enabled Talent
              </h2>
              <p className="text-slate-700 leading-relaxed">
                Enabled Talent is an inclusive hiring platform based in Canada
                that connects employers with candidates who have disabilities,
                helping create accessible and equitable workplaces. Our
                mission is to ensure every talent deserves the right chance.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                3. User Accounts
              </h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                To access most features of the Platform, you must create an
                account. You are responsible for:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>Providing accurate and current information when registering.</li>
                <li>
                  Maintaining the confidentiality of your login credentials.
                </li>
                <li>
                  Notifying us immediately of any unauthorised access to your
                  account at{" "}
                  <a
                    href="mailto:support@enabledtalent.com"
                    className="text-orange-900 underline hover:text-orange-800"
                  >
                    support@enabledtalent.com
                  </a>
                  .
                </li>
                <li>
                  All activity that occurs under your account.
                </li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-3">
                You must be at least 16 years of age to create an account. By
                creating an account, you confirm that you meet this requirement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                4. Candidate Responsibilities
              </h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                As a Candidate on the Platform, you agree to:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>
                  Provide truthful, accurate, and complete information in your
                  profile, resume, and any communications.
                </li>
                <li>
                  Keep your profile and preferences up to date.
                </li>
                <li>
                  Disclose accessibility needs only to the extent you choose;
                  disclosure is always voluntary.
                </li>
                <li>
                  Use the platform only for legitimate job-seeking activities.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                5. Employer Responsibilities
              </h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                As an Employer on the Platform, you agree to:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>
                  Post only genuine, accurate, and current job opportunities.
                </li>
                <li>
                  Comply with all applicable employment and human rights laws,
                  including the <em>Ontario Human Rights Code</em>, the{" "}
                  <em>Accessibility for Ontarians with Disabilities Act (AODA)</em>,
                  and the <em>Canadian Human Rights Act</em>.
                </li>
                <li>
                  Not discriminate against candidates on the basis of disability,
                  or any other protected ground.
                </li>
                <li>
                  Use candidate profile data only for the purposes of evaluating
                  candidates for employment opportunities.
                </li>
                <li>
                  Not share, sell, or use candidate data for any other purpose
                  without explicit consent.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                6. Prohibited Conduct
              </h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                You must not use the Platform to:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-2">
                <li>
                  Post fraudulent, misleading, or discriminatory content.
                </li>
                <li>
                  Harass, threaten, or harm other users.
                </li>
                <li>
                  Scrape, harvest, or systematically collect data from the
                  Platform without our written permission.
                </li>
                <li>
                  Attempt to gain unauthorised access to any part of the Platform
                  or its systems.
                </li>
                <li>
                  Violate any applicable Canadian federal or provincial law,
                  including privacy legislation.
                </li>
                <li>
                  Circumvent any security or access controls.
                </li>
              </ul>
              <p className="text-slate-700 leading-relaxed mt-3">
                We reserve the right to suspend or terminate accounts that
                violate these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                7. Intellectual Property
              </h2>
              <p className="text-slate-700 leading-relaxed">
                The Enabled Talent name, logo, and all Platform content
                (excluding user-submitted content) are the intellectual property
                of Enabled Talent or its licensors. You may not reproduce,
                distribute, or create derivative works without our prior written
                consent.
              </p>
              <p className="text-slate-700 leading-relaxed mt-3">
                By submitting content to the Platform (such as your profile,
                resume, or job postings), you grant Enabled Talent a
                non-exclusive, worldwide, royalty-free licence to store, display,
                and process that content solely to operate and improve the Platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                8. Privacy
              </h2>
              <p className="text-slate-700 leading-relaxed">
                Your use of the Platform is also governed by our{" "}
                <Link
                  href="/privacy"
                  className="text-orange-900 underline hover:text-orange-800"
                >
                  Privacy Policy
                </Link>
                , which is incorporated into these Terms by reference. We
                encourage you to read it carefully.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                9. Disclaimers
              </h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                The Platform is provided on an &ldquo;as is&rdquo; and
                &ldquo;as available&rdquo; basis without warranties of any
                kind, express or implied, including but not limited to warranties
                of merchantability, fitness for a particular purpose, or
                non-infringement.
              </p>
              <p className="text-slate-700 leading-relaxed">
                We do not guarantee that the Platform will be uninterrupted,
                secure, or error-free. We do not endorse any specific employer,
                candidate, or job posting.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                10. Limitation of Liability
              </h2>
              <p className="text-slate-700 leading-relaxed">
                To the fullest extent permitted by applicable law, Enabled Talent
                and its officers, directors, employees, and agents shall not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages arising from your use of, or inability to use,
                the Platform. Our total liability to you for any claim arising
                out of these Terms shall not exceed the amount you paid us (if
                any) in the twelve months preceding the claim.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                11. Governing Law
              </h2>
              <p className="text-slate-700 leading-relaxed">
                These Terms are governed by and construed in accordance with the
                laws of the Province of Ontario and the federal laws of Canada
                applicable therein, without regard to conflict of law principles.
                Any disputes arising under these Terms shall be resolved in the
                courts of Ontario.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                12. Changes to These Terms
              </h2>
              <p className="text-slate-700 leading-relaxed">
                We may update these Terms from time to time. When we do, we will
                revise the &ldquo;Last updated&rdquo; date at the top of this
                page. If changes are material, we will notify you by email or
                through a prominent notice on the Platform. Continued use of the
                Platform after changes take effect constitutes your acceptance of
                the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                13. Contact Us
              </h2>
              <p className="text-slate-700 leading-relaxed mb-2">
                If you have questions about these Terms, please contact us:
              </p>
              <ul className="list-none text-slate-700 space-y-2">
                <li>
                  <strong>Email:</strong>{" "}
                  <a
                    href="mailto:legal@enabledtalent.com"
                    className="text-orange-900 underline hover:text-orange-800"
                  >
                    legal@enabledtalent.com
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
              </ul>
            </section>

          </div>
        </div>

        {/* Footer navigation */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
          <Link
            href="/privacy"
            className="hover:text-orange-900 underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C27803] focus-visible:ring-offset-2 rounded-sm"
          >
            Privacy Policy
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
