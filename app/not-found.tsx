import Link from "next/link";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-slate-50 px-6 py-12"
    >
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-slate-700">
          Sorry, the page you&apos;re looking for doesn&apos;t exist or may have
          been moved.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C27803] focus-visible:ring-offset-2"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
