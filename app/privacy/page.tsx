import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Privacy Policy | Enabled Talent",
  description:
    "Privacy Policy, AI Transparency Notice, and Regulatory Readiness Memorandum for ENABLED HR LABS INC. operating as Enabled Talent.",
};

const linkCls =
  "text-orange-900 underline hover:text-orange-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C27803] focus-visible:ring-offset-2 rounded-sm";

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
          <p className="mt-3 text-base text-slate-700">
            Effective Date: January 27, 2026
          </p>
          <p className="mt-1 text-sm text-slate-600">
            <strong>Legal Entity:</strong> ENABLED HR LABS INC.&ensp;&mdash;&ensp;
            <strong>Operating Name:</strong> Enabled Talent
          </p>
        </div>

        {/* Content card */}
        <div className="rounded-3xl bg-white p-8 shadow-sm md:p-12">
          <div className="space-y-2 text-slate-700">

            {/* NOTICE */}
            <section className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-2 uppercase tracking-wide">
                Notice
              </h2>
              <p className="leading-relaxed text-slate-700">
                This document sets out the privacy practices, artificial intelligence
                transparency disclosures, and regulatory compliance framework of{" "}
                <strong>ENABLED HR LABS INC.</strong> (&ldquo;Enabled Talent&rdquo;,
                &ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or
                &ldquo;our&rdquo;) in connection with its recruitment and employment
                technology platform, associated websites, applications, and services
                (collectively, the &ldquo;Platform&rdquo;).
              </p>
              <p className="leading-relaxed text-slate-700 mt-3">
                By accessing or using the Platform, all users acknowledge that they
                have read, understood, and agreed to the practices described herein.
              </p>
            </section>

            {/* ── SECTION 1 ── */}
            <div className="mb-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-orange-900 mb-4">
                Section 1 — Privacy Policy
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                1. Purpose and Scope
              </h2>
              <p className="leading-relaxed">
                This Privacy Policy governs the collection, use, disclosure,
                retention, and safeguarding of personal information obtained through
                the operation of the Platform.
              </p>
              <p className="leading-relaxed mt-3">
                This Policy applies to all individuals and entities accessing or
                using the Platform, including job seekers, employers, institutional
                partners, representatives, and website visitors (&ldquo;Users&rdquo;).
              </p>
              <p className="leading-relaxed mt-3">
                The Company is committed to protecting privacy, dignity, and
                autonomy in all information-handling practices.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                2. Legal Compliance Framework
              </h2>
              <p className="leading-relaxed">
                The Company&apos;s privacy practices are designed to comply with
                applicable Canadian federal private-sector privacy legislation,
                Ontario provincial legislation governing employment standards,
                accessibility, and human rights, and applicable electronic
                communications and anti-spam legislation.
              </p>
              <p className="leading-relaxed mt-3">
                Where Users voluntarily provide disability-related,
                accommodation-related, or health-related information, the Company
                applies enhanced confidentiality and security safeguards consistent
                with recognized health-information protection standards.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                3. Collection of Personal Information
              </h2>
              <p className="leading-relaxed">
                The Company collects only personal information that is reasonably
                necessary to operate the Platform, deliver services, meet legal
                obligations, and improve system performance.
              </p>

              <h3 className="text-base font-semibold text-slate-900 mt-5 mb-2">
                3.1 Information Provided by Users
              </h3>
              <p className="leading-relaxed mb-3">The Company may collect:</p>
              <ol className="list-[lower-alpha] pl-6 space-y-2">
                <li>
                  Identity and contact information, including name, email address,
                  telephone number, mailing address, and optional profile image;
                </li>
                <li>
                  Account information, including login credentials, preferences,
                  and user role classification;
                </li>
                <li>
                  Professional information, including r&eacute;sum&eacute;s,
                  education history, employment history, skills, certifications,
                  and career preferences;
                </li>
                <li>
                  Accessibility or accommodation information, where voluntarily
                  disclosed;
                </li>
                <li>
                  Employer information, including organization details, job
                  postings, hiring preferences, interview records, and
                  compensation information;
                </li>
                <li>
                  Billing and transaction information processed through secure
                  third-party payment service providers.
                </li>
              </ol>
              <p className="leading-relaxed mt-3 text-sm bg-amber-50 border border-amber-200 rounded-lg p-4">
                <strong>Note:</strong> Disclosure of disability-related or
                accommodation information is strictly voluntary and may be
                withdrawn at any time.
              </p>

              <h3 className="text-base font-semibold text-slate-900 mt-5 mb-2">
                3.2 Automatically Collected Information
              </h3>
              <p className="leading-relaxed mb-3">
                When Users interact with the Platform, the Company automatically
                collects:
              </p>
              <ol className="list-[lower-alpha] pl-6 space-y-2">
                <li>IP address and approximate location;</li>
                <li>device type, browser type, and operating system;</li>
                <li>usage activity, interaction logs, and session data;</li>
                <li>cookies and similar tracking technologies.</li>
              </ol>
              <p className="leading-relaxed mt-3">
                This information is used for system security, fraud prevention,
                analytics, performance optimization, and accessibility improvements.
              </p>

              <h3 className="text-base font-semibold text-slate-900 mt-5 mb-2">
                3.3 Information from Third Parties
              </h3>
              <p className="leading-relaxed mb-3">
                The Company may receive limited personal information from:
              </p>
              <ol className="list-[lower-alpha] pl-6 space-y-2">
                <li>authentication or identity-verification services;</li>
                <li>
                  analytics, communication, and cloud service providers;
                </li>
                <li>authorized employer or institutional partners.</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                4. Use of Personal Information
              </h2>
              <p className="leading-relaxed mb-3">
                The Company uses personal information to:
              </p>
              <ol className="list-[lower-alpha] pl-6 space-y-2">
                <li>operate and maintain the Platform;</li>
                <li>create and manage user accounts;</li>
                <li>facilitate recruitment and job application processes;</li>
                <li>match job seekers with employment opportunities;</li>
                <li>deliver accessibility and accommodation features;</li>
                <li>personalize user experience;</li>
                <li>communicate service-related notices;</li>
                <li>prevent fraud, misuse, or security incidents;</li>
                <li>conduct analytics and improve system performance; and</li>
                <li>comply with legal and regulatory obligations.</li>
              </ol>
              <p className="leading-relaxed mt-3 font-medium">
                The Company does not sell or rent personal information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                5. Sensitive Personal Information
              </h2>
              <p className="leading-relaxed mb-3">
                Disability-related, health-related, and accommodation-related
                information is treated as sensitive personal information.
              </p>
              <p className="leading-relaxed mb-3">The Company:</p>
              <ol className="list-[lower-alpha] pl-6 space-y-2">
                <li>
                  collects such information only where voluntarily provided;
                </li>
                <li>
                  uses such information solely to support accessibility and
                  accommodation services;
                </li>
                <li>
                  restricts access to authorized personnel on a need-to-know
                  basis; and
                </li>
                <li>
                  applies enhanced technical and organizational safeguards.
                </li>
              </ol>
              <p className="leading-relaxed mt-3">
                Withdrawal of such information does not affect access to core
                Platform services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                6. Artificial Intelligence and Automated Processing
              </h2>
              <p className="leading-relaxed mb-3">
                The Company employs artificial intelligence and statistical models
                to support:
              </p>
              <ol className="list-[lower-alpha] pl-6 space-y-2 mb-5">
                <li>job matching and candidate recommendations;</li>
                <li>
                  r&eacute;sum&eacute; parsing and skill identification;
                </li>
                <li>accessibility optimization; and</li>
                <li>system performance enhancement.</li>
              </ol>
              <h3 className="text-base font-semibold text-slate-900 mb-2">
                Safeguards
              </h3>
              <ol className="list-[lower-alpha] pl-6 space-y-2">
                <li>
                  AI systems assist but do not make final hiring or rejection
                  decisions;
                </li>
                <li>all recruitment decisions remain under human authority;</li>
                <li>AI outputs are subject to human review;</li>
                <li>
                  sensitive disability or health information is not used for
                  hiring decisions;
                </li>
                <li>
                  Users may request information regarding AI-assisted processing
                  affecting them.
                </li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                7. Legal Basis for Processing
              </h2>
              <p className="leading-relaxed mb-3">
                Personal information is processed on the basis of:
              </p>
              <ol className="list-[lower-alpha] pl-6 space-y-2">
                <li>User consent;</li>
                <li>performance of a contract;</li>
                <li>legitimate business interests; and</li>
                <li>compliance with legal or regulatory obligations.</li>
              </ol>
              <p className="leading-relaxed mt-3">
                Users may withdraw consent at any time, subject to legal or
                contractual restrictions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                8. Disclosure of Personal Information
              </h2>
              <p className="leading-relaxed mb-3">
                The Company may disclose personal information:
              </p>
              <ol className="list-[lower-alpha] pl-6 space-y-2">
                <li>
                  to employers where Users apply to positions or share profiles;
                </li>
                <li>
                  to service providers supporting Platform operations;
                </li>
                <li>
                  to affiliated corporate entities for internal operations;
                </li>
                <li>where required by law or court order; and</li>
                <li>
                  in connection with corporate restructuring, merger, or sale of
                  assets.
                </li>
              </ol>
              <p className="leading-relaxed mt-3">
                All third parties receiving personal information are required to
                maintain confidentiality and appropriate security safeguards.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                9. Employer Obligations
              </h2>
              <p className="leading-relaxed">
                Employers using the Platform act as independent controllers of
                personal information they receive and are solely responsible for
                compliance with employment, recruitment, and human rights laws.
                The Company does not control employer hiring decisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                10. Cross-Border Data Transfers
              </h2>
              <p className="leading-relaxed">
                Personal information may be processed or stored outside Canada.
                The Company implements contractual and technical safeguards to
                ensure appropriate protection for cross-border data transfers. Use
                of the Platform constitutes consent to such transfers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                11. Data Retention
              </h2>
              <p className="leading-relaxed">
                Personal information is retained only for as long as necessary to
                provide services, meet legal obligations, resolve disputes, and
                enforce agreements. Thereafter, information is securely deleted or
                anonymized.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                12. Security Measures
              </h2>
              <p className="leading-relaxed">
                The Company implements reasonable administrative, technical, and
                physical safeguards to protect personal information, including
                encryption, access controls, secure infrastructure, and
                incident-response procedures. No system can be guaranteed
                completely secure, and Users accept this inherent risk.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                13. User Rights
              </h2>
              <p className="leading-relaxed mb-3">
                Subject to applicable law, Users may request:
              </p>
              <ol className="list-[lower-alpha] pl-6 space-y-2">
                <li>access to their personal information;</li>
                <li>correction of inaccurate information;</li>
                <li>withdrawal of consent;</li>
                <li>deletion where legally permissible; and</li>
                <li>
                  information regarding AI-assisted processing.
                </li>
              </ol>
              <p className="leading-relaxed mt-4">
                Requests may be submitted to:
              </p>
              <address className="not-italic mt-2 space-y-1 text-slate-700">
                <p className="font-semibold">ENABLED HR LABS INC.</p>
                <p>
                  Email:{" "}
                  <a href="mailto:jeby@enabledtalent.com" className={linkCls}>
                    jeby@enabledtalent.com
                  </a>
                </p>
              </address>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                14. Cookies and Tracking Technologies
              </h2>
              <p className="leading-relaxed">
                The Platform uses cookies and similar technologies to maintain
                sessions and analyze usage. Users may control cookie settings
                through their browser. Disabling cookies may affect Platform
                functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                15. Minors
              </h2>
              <p className="leading-relaxed">
                The Platform is not intended for individuals under sixteen (16)
                years of age without appropriate authorization. The Company does
                not knowingly collect personal information from minors under
                sixteen.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                16. Amendments
              </h2>
              <p className="leading-relaxed">
                The Company may amend this Policy from time to time. Continued
                use of the Platform constitutes acceptance of the amended Policy.
              </p>
            </section>

            {/* ── SECTION 2 ── */}
            <div className="border-t border-slate-200 pt-8 mb-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-orange-900 mb-6">
                Section 2 — AI Transparency Notice
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                AI Transparency Notice
              </h2>
              <p className="leading-relaxed mb-3">
                Enabled Talent uses artificial intelligence to enhance recruitment
                efficiency, accessibility, and user experience.
              </p>

              <h3 className="text-base font-semibold text-slate-900 mb-2">
                AI is used to:
              </h3>
              <ol className="list-[lower-alpha] pl-6 space-y-2 mb-5">
                <li>recommend employment opportunities;</li>
                <li>identify relevant candidate skills;</li>
                <li>generate candidate summaries; and</li>
                <li>improve accessibility features.</li>
              </ol>

              <h3 className="text-base font-semibold text-slate-900 mb-2">
                AI is not used to:
              </h3>
              <ol className="list-[lower-alpha] pl-6 space-y-2 mb-5">
                <li>make final hiring or rejection decisions;</li>
                <li>
                  evaluate disability or health information for employment
                  decisions; or
                </li>
                <li>replace human judgment.</li>
              </ol>

              <p className="leading-relaxed">
                All employment decisions remain under human authority. Users may
                request information regarding AI-assisted recommendations affecting
                them.
              </p>
            </section>

            {/* ── SECTION 3 ── */}
            <div className="border-t border-slate-200 pt-8 mb-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-orange-900 mb-6">
                Section 3 — Regulatory Readiness Memorandum
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                Overview
              </h2>
              <p className="leading-relaxed">
                The Company operates in a regulatory environment involving
                recruitment, data protection, accessibility, and artificial
                intelligence. The Company maintains governance practices designed
                to comply with current legal requirements and adapt to evolving
                legislative standards.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                Compliance Commitments
              </h2>
              <p className="leading-relaxed mb-3">
                The Company commits to:
              </p>
              <ol className="list-[lower-alpha] pl-6 space-y-2">
                <li>
                  obtaining meaningful user consent for data collection and use;
                </li>
                <li>limiting data collection to defined purposes;</li>
                <li>implementing strong security safeguards;</li>
                <li>maintaining breach-response procedures;</li>
                <li>ensuring accessibility-first platform design;</li>
                <li>applying human oversight to AI systems; and</li>
                <li>
                  requiring employer accountability in recruitment practices.
                </li>
              </ol>
            </section>

            <section className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-2">
                Conclusion
              </h2>
              <p className="leading-relaxed text-slate-700">
                Enabled Talent is committed to operating a lawful,
                privacy-respecting, and inclusive recruitment platform that
                protects personal information, ensures accessibility, and applies
                artificial intelligence responsibly.
              </p>
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
