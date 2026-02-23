/**
 * SC 2.3.3 (Animation from Interactions, AAA) — returns "instant" when the
 * user prefers reduced motion, otherwise "smooth".  Use this instead of
 * hard-coding `behavior: "smooth"` on `scrollIntoView()` calls.
 */
export function scrollBehavior(): ScrollBehavior {
  if (typeof window === "undefined") return "instant";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "instant"
    : "smooth";
}
