"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

/**
 * SC 2.2.1 (Timing Adjustable, AA) — warns the user at least 20 s before an
 * inactivity-triggered sign-out and lets them extend the session.
 *
 * Strategy:
 *   - 28 min of inactivity  → show this dialog with a 2-min countdown
 *   - User clicks "Stay logged in" → timers reset, dialog closes
 *   - Countdown reaches 0 (or "Sign out now") → Clerk signOut + redirect
 *
 * Activity events (mousemove, keydown, click, scroll, touchstart) reset the
 * inactivity timer so active users are never interrupted.
 */

const INACTIVITY_MS = 28 * 60 * 1000; // 28 minutes idle before warning
const COUNTDOWN_S = 120; // 2-minute warning window (well above the 20 s minimum)

type SessionExpiryWarningProps = {
  /** Override the login path for redirect on sign-out. Defaults to /login-talent. */
  loginPath?: string;
};

export default function SessionExpiryWarning({
  loginPath = "/login-talent",
}: SessionExpiryWarningProps) {
  const { signOut } = useClerk();
  const router = useRouter();

  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_S);

  const inactivityRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (inactivityRef.current) clearTimeout(inactivityRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  }, []);

  const handleSignOut = useCallback(async () => {
    clearTimers();
    setShowWarning(false);
    await signOut();
    router.push(loginPath);
  }, [clearTimers, signOut, router, loginPath]);

  const startCountdown = useCallback(() => {
    let remaining = COUNTDOWN_S;
    setCountdown(remaining);
    setShowWarning(true);

    countdownRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(countdownRef.current!);
        void handleSignOut();
      }
    }, 1000);
  }, [handleSignOut]);

  const resetInactivityTimer = useCallback(() => {
    clearTimers();
    setShowWarning(false);
    setCountdown(COUNTDOWN_S);

    inactivityRef.current = setTimeout(startCountdown, INACTIVITY_MS);
  }, [clearTimers, startCountdown]);

  // Reset timer on any user activity
  useEffect(() => {
    const events = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ] as const;

    const handler = () => {
      // Only reset if warning is not already visible (let the dialog handle it)
      if (!showWarning) {
        resetInactivityTimer();
      }
    };

    events.forEach((e) =>
      window.addEventListener(e, handler, { passive: true })
    );
    resetInactivityTimer(); // prime the timer on mount

    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      clearTimers();
    };
    // resetInactivityTimer is stable; showWarning intentionally excluded so
    // activity events don't restart the timer mid-warning.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showWarning]);

  if (!showWarning) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timeStr = minutes > 0
    ? `${minutes} minute${minutes !== 1 ? "s" : ""} and ${seconds} second${seconds !== 1 ? "s" : ""}`
    : `${seconds} second${seconds !== 1 ? "s" : ""}`;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="session-warning-title"
      aria-describedby="session-warning-desc"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <h2
          id="session-warning-title"
          className="text-lg font-bold text-slate-900"
        >
          Your session is about to expire
        </h2>

        <p id="session-warning-desc" className="mt-3 text-sm text-slate-700">
          You will be automatically signed out in{" "}
          <strong className="font-semibold text-red-900 tabular-nums">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </strong>{" "}
          due to inactivity.
        </p>

        {/* Periodic SR announcements at 60 s and 30 s */}
        {(countdown === 60 || countdown === 30 || countdown === 10) && (
          <span className="sr-only" aria-live="assertive" aria-atomic="true">
            Session expiring in {timeStr}. Click &quot;Stay logged in&quot; to continue.
          </span>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={resetInactivityTimer}
            /* autoFocus moves keyboard focus into the dialog on appearance */
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            className="rounded-xl bg-orange-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C27803] focus-visible:ring-offset-2"
          >
            Stay logged in
          </button>

          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C27803] focus-visible:ring-offset-2"
          >
            Sign out now
          </button>
        </div>
      </div>
    </div>
  );
}
