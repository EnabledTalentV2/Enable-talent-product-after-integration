'use client';

export default function Header() {
  const percent = 68; // 0-100

  return (
    <header className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-[#C05621] to-[#FBBF24] shadow-lg px-6 py-8 md:px-12 md:py-10">
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="text-white">
          <p className="text-lg md:text-xl font-light opacity-90">Welcome</p>
          <h1 className="text-3xl md:text-4xl font-bold mt-1">Jenny Wilson</h1>
        </div>

        <div className="relative flex items-center justify-center bg-white/90 backdrop-blur rounded-full w-28 h-28 shadow-md border-4 border-white/20">
          <svg
            className="w-full h-full -rotate-90"
            viewBox="0 0 36 36"
            role="img"
            aria-label={`Profile completed ${percent}%`}
          >
            <path
              className="text-gray-200"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="text-orange-500"
              strokeDasharray={`${percent}, 100`}
              strokeLinecap="round"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
            <span className="text-2xl font-bold text-[#C05621]">{percent}</span>
            <span className="text-[9px] uppercase font-semibold text-slate-500">Profile</span>
            <span className="text-[9px] uppercase font-semibold text-slate-500">Completed</span>
          </div>
        </div>
      </div>
    </header>
  );
}
