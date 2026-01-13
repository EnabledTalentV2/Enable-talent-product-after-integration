"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleExit = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      // Call logout API
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      // Redirect to signup page after logout
      router.push("/signup");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, redirect to signup
      router.push("/signup");
    } finally {
      setIsLoggingOut(false);
    }
  };

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

          <div className="flex items-center">
            <button
              type="button"
              onClick={handleExit}
              disabled={isLoggingOut}
              className="flex items-center justify-center rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              aria-label="Exit sign-up"
            >
              <X size={24} strokeWidth={2} />
            </button>
          </div>
        </div>
      </nav>
  );
}
        

