import { useEffect, useState } from "react";

interface AIUsageLimitRequestProps {
  featureKey: string;
}

interface AccessRequest {
  featureKey: string;
  status: string;
}

interface UsageSummary {
  isAdmin?: boolean;
  hasAllUnlimited?: boolean;
  limit?: number;
  usage?: Record<string, number>;
  unlimitedFeatures?: string[];
}

export function AIUsageLimitRequest({ featureKey }: AIUsageLimitRequestProps) {
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [pending, setPending] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const loadStatus = async () => {
    try {
      const [usageResponse, requestsResponse] = await Promise.all([
        fetch("/api/ai/usage-summary", { credentials: "include" }),
        fetch("/api/ai/access-requests/mine", { credentials: "include" }),
      ]);
      if (usageResponse.ok) setUsage(await usageResponse.json());
      if (requestsResponse.ok) setRequests(await requestsResponse.json());
    } catch {
      // Keep the existing status visible if a refresh briefly fails.
    }
  };

  useEffect(() => {
    void loadStatus();
    const interval = window.setInterval(() => void loadStatus(), 5000);
    return () => window.clearInterval(interval);
  }, [featureKey]);

  const latestRequest = requests.find((request) => request.featureKey === featureKey);
  const isUnlimited = !!usage && (usage.isAdmin || usage.hasAllUnlimited || usage.unlimitedFeatures?.includes(featureKey));
  const limit = usage?.limit ?? 3;
  const used = usage?.usage?.[featureKey] ?? 0;
  const reachedLimit = !isUnlimited && used >= limit;
  const requestPending = latestRequest?.status === "pending";

  const requestAccess = async () => {
    if (sending || requestPending) return;
    setSending(true);
    setMessage("");
    try {
      const response = await fetch("/api/ai/access-requests", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featureKey }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok && response.status !== 409) throw new Error(data.message || "Could not submit access request.");
      setMessage("Your request has been sent to the admin. Please wait for approval.");
      await loadStatus();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not submit access request.");
    } finally {
      setSending(false);
    }
  };

  if (!reachedLimit) return null;

  return (
    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900 dark:border-red-900 dark:bg-red-950/30 dark:text-red-100" role="status" aria-live="polite">
      <p className="text-sm font-semibold">You’ve reached the {limit}-use limit for this AI feature.</p>
      {requestPending ? (
        <>
          <button type="button" disabled className="mt-3 cursor-not-allowed rounded-lg bg-gray-400 px-4 py-2 text-sm font-semibold text-white opacity-80">
            Request sent — awaiting approval
          </button>
          <p className="mt-2 text-sm">Your request has been sent to the admin. Please wait for approval.</p>
        </>
      ) : (
        <button
          type="button"
          onClick={requestAccess}
          disabled={sending}
          className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {sending ? "Sending request…" : "Request more access"}
        </button>
      )}
      {message && !requestPending && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}
