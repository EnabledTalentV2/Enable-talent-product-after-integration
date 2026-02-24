import React from "react";
import "@testing-library/jest-dom";
import { configureAxe } from "jest-axe";

// Enable enhanced contrast checks (WCAG AAA SC 1.4.6)
configureAxe({
  rules: {
    "color-contrast-enhanced": { enabled: true },
  },
});

// Avoid Next.js Link async intersection observer updates in Jest/jsdom.
jest.mock("next/link", () => {
  function MockLink({ children, href }: { children: React.ReactNode; href: unknown }) {
    const resolvedHref =
      typeof href === "string" ? href : (href as { pathname?: string } | null)?.pathname ?? "";

    return React.createElement("a", { href: resolvedHref }, children);
  }

  return MockLink;
});
