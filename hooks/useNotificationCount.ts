"use client";

// hooks/useNotificationCount.ts
// Drop this in: src/hooks/useNotificationCount.ts
// Used by all three sidebars to show live unread badge on the Bell nav item.

import { useState, useEffect, useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export function useNotificationCount() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("token") ||
        document.cookie.match(/token=([^;]+)/)?.[1];

      const res = await fetch(`${API_URL}/notifications?page=1&limit=1&unreadOnly=true`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      if (!res.ok) return;
      const data = await res.json();

      // Backend returns { total, unreadCount, data } — use whichever field exists
      const count =
        data.unreadCount ??
        data.total ??
        (Array.isArray(data.data) ? data.data.length : 0);

      setUnreadCount(count);
    } catch {
      // Silently fail — count stays 0
    }
  }, []);

  useEffect(() => {
    void fetchCount();
    // Refresh every 60 seconds
    const interval = setInterval(() => void fetchCount(), 60_000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  return { unreadCount, refetch: fetchCount };
}