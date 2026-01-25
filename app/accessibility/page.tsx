import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Accessibility Statement | Enabled Talent",
  description:
    "Learn about Enabled Talent's commitment to digital accessibility and our compliance with WCAG 2.2 AA and AODA standards.",
};

export default function AccessibilityPage() {
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
            Accessibility Statement
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Our commitment to digital accessibility for all users
          </p>
        </div>

        {/* Content */}
        <div className="rounded-3xl bg-white p-8 shadow-sm md:p-12">
          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Our Commitment
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Enabled Talent is committed to ensuring digital accessibility
                for people with disabilities. We are continually improving the
                user experience for everyone and applying the relevant
                accessibility standards to ensure we provide equal access to all
                users.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Conformance Status
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                The Web Content Accessibility Guidelines (WCAG) defines
                requirements for designers and developers to improve
                accessibility for people with disabilities. WCAG 2.2, published
                in October 2023 and updated in December 2024, is the current W3C
                accessibility standard. It defines three levels of conformance:
                Level A, Level AA, and Level AAA.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Enabled Talent is conformant with <strong>WCAG 2.2 Level AA</strong>.
                This includes all success criteria from WCAG 2.0, 2.1, and the new
                criteria introduced in WCAG 2.2, ensuring our platform meets the
                highest current accessibility standards.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                WCAG 2.2 New Criteria Support
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                We have implemented support for the new WCAG 2.2 success criteria:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>
                  <strong>2.4.11 Focus Not Obscured (Minimum):</strong> Focused
                  elements are never completely hidden by sticky headers or other
                  content.
                </li>
                <li>
                  <strong>2.5.7 Dragging Movements:</strong> All drag-and-drop
                  functionality includes single-pointer alternatives.
                </li>
                <li>
                  <strong>2.5.8 Target Size (Minimum):</strong> Interactive
                  elements meet the minimum 24x24 pixel target size requirement,
                  with 44x44 pixels for touch devices.
                </li>
                <li>
                  <strong>3.2.6 Consistent Help:</strong> Help mechanisms appear
                  in consistent locations across pages.
                </li>
                <li>
                  <strong>3.3.7 Redundant Entry:</strong> Previously entered
                  information is auto-populated when appropriate.
                </li>
                <li>
                  <strong>3.3.8 Accessible Authentication:</strong> Our login
                  process does not require cognitive function tests like CAPTCHAs.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                AODA Compliance
              </h2>
              <p className="text-slate-600 leading-relaxed">
                In accordance with the Accessibility for Ontarians with
                Disabilities Act (AODA), we are committed to achieving Level AA
                compliance with WCAG 2.2. We provide our services and
                information in ways that respect the dignity and independence of
                people with disabilities.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Accessibility Features
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                We have implemented the following accessibility features across
                our platform:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>
                  <strong>Keyboard Navigation:</strong> All functionality is
                  accessible via keyboard, including navigation menus, forms,
                  and interactive elements.
                </li>
                <li>
                  <strong>Skip Navigation:</strong> Skip links allow users to
                  bypass repetitive content and navigate directly to main
                  content.
                </li>
                <li>
                  <strong>Focus Indicators:</strong> Visible focus indicators
                  help keyboard users track their location on the page.
                </li>
                <li>
                  <strong>Color Contrast:</strong> Text and interactive elements
                  meet WCAG AA contrast requirements (4.5:1 for normal text,
                  3:1 for large text).
                </li>
                <li>
                  <strong>Screen Reader Support:</strong> Proper ARIA labels,
                  semantic HTML, and live regions ensure compatibility with
                  assistive technologies.
                </li>
                <li>
                  <strong>Form Accessibility:</strong> Forms include clear
                  labels, error messages, and required field indicators.
                </li>
                <li>
                  <strong>Alternative Text:</strong> Images include descriptive
                  alternative text for screen reader users.
                </li>
                <li>
                  <strong>Reduced Motion:</strong> Animations respect user
                  preferences for reduced motion.
                </li>
                <li>
                  <strong>High Contrast Mode:</strong> Support for Windows High
                  Contrast Mode.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Known Limitations
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Despite our best efforts to ensure accessibility, there may be
                some limitations. Below is a description of known limitations:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>
                  Some third-party content or integrations may not be fully
                  accessible.
                </li>
                <li>
                  Older PDF documents may not be fully accessible. We are
                  working to remediate these.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Feedback
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                We welcome your feedback on the accessibility of Enabled Talent.
                If you encounter accessibility barriers or have suggestions for
                improvement, please contact us:
              </p>
              <ul className="list-none text-slate-600 space-y-2">
                <li>
                  <strong>Email:</strong>{" "}
                  <a
                    href="mailto:accessibility@enabledtalent.com"
                    className="text-orange-700 hover:text-orange-800 underline"
                  >
                    accessibility@enabledtalent.com
                  </a>
                </li>
                <li>
                  <strong>Response Time:</strong> We aim to respond to
                  accessibility feedback within 5 business days.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Assistive Technologies Supported
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Enabled Talent is designed to be compatible with the following
                assistive technologies:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Screen readers (NVDA, JAWS, VoiceOver, TalkBack)</li>
                <li>Screen magnification software</li>
                <li>Speech recognition software</li>
                <li>Keyboard-only navigation</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Technical Specifications
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Accessibility of Enabled Talent relies on the following
                technologies to work with your web browser and any assistive
                technologies or plugins installed on your computer: HTML, CSS,
                JavaScript, and WAI-ARIA. These technologies are relied upon for
                conformance with the accessibility standards used.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Assessment and Updates
              </h2>
              <p className="text-slate-600 leading-relaxed">
                We assess the accessibility of our platform through:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2 mt-4">
                <li>Regular automated accessibility testing</li>
                <li>Manual testing with assistive technologies</li>
                <li>User feedback and testing</li>
              </ul>
              <p className="text-slate-600 leading-relaxed mt-4">
                <strong>Last updated:</strong> January 2026
              </p>
              <p className="text-slate-600 leading-relaxed mt-2">
                <strong>WCAG Version:</strong> 2.2 (W3C Recommendation, December 2024)
              </p>
            </section>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <svg
              className="h-5 w-5"
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
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
