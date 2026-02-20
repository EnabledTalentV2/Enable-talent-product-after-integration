import Link from "next/link";

type SearchParams = Record<string, string | string[] | undefined>;

function resolveSafeNext(value: unknown) {
  if (typeof value !== "string") return "/";
  // Only allow internal navigation to avoid open-redirect issues.
  if (!value.startsWith("/")) return "/";
  return value;
}

export default async function BackendErrorPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const next = resolveSafeNext(params.next);
  const statusRaw = params.status;
  const status = typeof statusRaw === "string" ? statusRaw : null;

  return (
    <main
      id="main-content"
      className="min-h-screen bg-slate-50 px-6 py-12"
    >
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          We&apos;re having trouble reaching the server
        </h1>
        <p className="mt-2 text-sm text-slate-700">
          Please try again in a moment. If this keeps happening, it may be a
          temporary backend issue.
        </p>

        <div
          className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
          role="status"
        >
          <p className="font-semibold">Backend request failed</p>
          <p className="mt-1 text-amber-900/90">
            {status ? `Status: ${status}` : "Status: unavailable"}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={next}
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            Try again
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    </main>
  );
}

