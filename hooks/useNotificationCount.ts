"use client";
// Used by all three sidebars to show live unread badge on the Bell nav item.

import { useState, useEffect, useCallback } from "react";
import { authService } from "@/services/authService";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export function useNotificationCount() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCount = useCallback(async () => {
    try {
      // ✅ Use authService.getToken() — same source AuthContext uses
      const token = authService.getToken();
      if (!token) return; // Not logged in, don't bother fetching

      const res = await fetch(`${API_URL}/notifications?page=1&limit=1`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return;

      const data = await res.json();

      // ✅ Backend always returns unreadCount as a top-level field
      // (confirmed in notification.controller.ts — it's always computed separately)
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // Silently fail — badge just won't show
    }
  }, []);

  useEffect(() => {
    void fetchCount();
    const interval = setInterval(() => void fetchCount(), 60_000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  return { unreadCount, refetch: fetchCount };
}