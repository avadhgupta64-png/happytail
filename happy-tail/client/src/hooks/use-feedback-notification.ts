import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

const STORAGE_KEY = "ht_feedback_last_read";

/**
 * Returns whether there is an unread admin reply on the current user's feedback,
 * and a function to mark it as read.
 *
 * The backend provides the timestamp of the most recent admin reply.
 * We persist the "last read" timestamp in localStorage so the indicator
 * survives page refreshes and survives across sessions.
 */
export function useFeedbackNotification() {
  const { data } = useQuery<{ latestReplyAt: string | null }>({
    queryKey: ["/api/feedback/my-notifications"],
    queryFn: async () => {
      const res = await fetch("/api/feedback/my-notifications", { credentials: "include" });
      if (!res.ok) return { latestReplyAt: null };
      return res.json();
    },
    // Poll every 60 s so users see the dot appear without a refresh
    refetchInterval: 60_000,
    // Don't poll when the tab is hidden
    refetchIntervalInBackground: false,
  });

  const lastRead = typeof window !== "undefined"
    ? localStorage.getItem(STORAGE_KEY)
    : null;

  const latestReplyAt = data?.latestReplyAt ?? null;

  // There is an unread notification when the server's latest-reply timestamp is
  // more recent than whatever the user last read.
  const hasUnread =
    latestReplyAt !== null &&
    (lastRead === null || new Date(latestReplyAt) > new Date(lastRead));

  const queryClient = useQueryClient();

  const markAsRead = useCallback(() => {
    if (latestReplyAt) {
      localStorage.setItem(STORAGE_KEY, latestReplyAt);
    } else {
      // No replies yet — store current time so any future reply is "new"
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    }
    // Force the query to re-evaluate so the dot disappears immediately
    queryClient.invalidateQueries({ queryKey: ["/api/feedback/my-notifications"] });
  }, [latestReplyAt, queryClient]);

  return { hasUnread, markAsRead };
}
