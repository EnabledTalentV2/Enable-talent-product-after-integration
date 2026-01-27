"use client";

import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="flex h-20 items-center justify-center px-6 md:px-12 bg-white shadow-sm">
      <div className="flex w-full max-w-6xl items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/logo/et-new.svg"
            alt="EnabledTalent logo"
            width={150}
            height={40}
            priority
            className="h-10 w-auto object-contain"
          />
        </div>
      </div>
    </nav>
  );
}
        

