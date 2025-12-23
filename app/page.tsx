import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F0F4F8] p-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <a
          href="https://enable-talent-landing.vercel.app/"
          className="flex justify-center"
        >
          <Image
            src="/logo/et-new.svg"
            alt="EnabledTalent logo"
            width={200}
            height={54}
            priority
            className="h-12 w-auto object-contain"
          />
        </a>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Welcome to Enabled Talent
          </h1>
          <p className="text-xl text-slate-600">
            Connecting exceptional talent with inclusive employers.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/login-talent"
            className="flex items-center justify-center rounded-xl bg-gradient-to-r from-[#C05621] to-[#FBBF24] px-6 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:opacity-90 active:scale-95"
          >
            For Talent
          </Link>
          <Link
            href="/employer"
            className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-4 text-lg font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
          >
            For Employers
          </Link>
        </div>

        <p className="text-base text-slate-500">
          Empowering careers through accessibility and opportunity.
        </p>
      </div>
    </main>
  );
}

