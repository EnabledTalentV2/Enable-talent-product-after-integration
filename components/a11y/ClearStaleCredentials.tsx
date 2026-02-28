"use client";

import { useEffect } from "react";

const STALE_KEYS = ["et_users", "et_current_user", "et_pending_signup"];

export function ClearStaleCredentials() {
  useEffect(() => {
    STALE_KEYS.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore — storage may be unavailable
      }
    });
  }, []);

  return null;
}
