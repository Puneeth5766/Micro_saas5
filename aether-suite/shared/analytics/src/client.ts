"use client";

import { useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AETHER_EVENTS, type AetherEventCategory, type AetherEventName } from "./events";

const SESSION_KEY = "aether_analytics_session_id";

function getSessionId(): string {
  const existing = window.sessionStorage.getItem(SESSION_KEY);
  if (existing) {
    return existing;
  }

  const sessionId = crypto.randomUUID();
  window.sessionStorage.setItem(SESSION_KEY, sessionId);
  return sessionId;
}

function resolveCategory(event: AetherEventName | string): AetherEventCategory {
  const categories = Object.entries(AETHER_EVENTS) as [AetherEventCategory, readonly string[]][];
  const found = categories.find(([, events]) => events.includes(event));
  return found?.[0] ?? "feature";
}

export const analyticsClient = {
  track(event: AetherEventName | string, properties?: Record<string, unknown>, page?: string): void {
    try {
      const sessionId = getSessionId();
      const currentPage = page ?? window.location.pathname;

      void fetch("/api/analytics/track", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          event,
          category: resolveCategory(event),
          properties,
          page: currentPage,
          sessionId,
        }),
      });
    } catch {
      return;
    }
  },
};

export function useAnalytics() {
  const pathname = usePathname();

  const track = useCallback(
    (event: AetherEventName | string, properties?: Record<string, unknown>, page?: string) => {
      analyticsClient.track(event, properties, page);
    },
    [],
  );

  useEffect(() => {
    try {
      const sessionId = getSessionId();
      void fetch("/api/analytics/track", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          event: "page_view",
          category: "navigation",
          page: pathname,
          sessionId,
        }),
      });
    } catch {
      return;
    }
  }, [pathname]);

  return { track };
}
