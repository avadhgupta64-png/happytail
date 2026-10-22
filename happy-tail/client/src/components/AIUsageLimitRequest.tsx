import { useEffect, useState } from "react";

interface AIUsageLimitRequestProps {
  featureKey: string;
}

interface AccessRequest {
  id?: number;
  featureKey: string;
  status: string;
  requestedAt?: string;
  reviewedAt?: string | null;
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
      if (requestsResponse.ok) {
        const data = await requestsResponse.json();
        if (Array.isArray(data)) {
          setRequests(data.sort((a: AccessRequest, b: AccessRequest) =>
            new Date(b.requestedAt || 0).getTime() - new Date(a.requestedAt || 0).getTime()
          ));
        }
      }
    } catch {
      // Keep the existing status visible if a refresh briefly fails.
    }
  };

  useEffect(() => {
    void loadStatus();
    const interval = window.setInterval(() => void loadStatus(), 5000);
    const onFocus = () => void loadStatus();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
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

  const decisionStatus = latestRequest?.status;
  const showDecisionNotice = decisionStatus === "approved" || decisionStatus === "denied" || decisionStatus === "revoked";
  if (!reachedLimit && !showDecisionNotice) return null;

  return (
    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900 dark:border-red-900 dark:bg-red-950/30 dark:text-red-100" role="status" aria-live="polite">
      {reachedLimit && <p className="text-sm font-semibold">You’ve reached the {limit}-use limit for this AI feature.</p>}
      {showDecisionNotice && (
        <div className="mt-3 rounded-lg border border-red-300 bg-red-100 px-3 py-3 text-red-900 dark:border-red-800 dark:bg-red-950/60 dark:text-red-100" role="alert" aria-live="assertive">
          <span className="mb-1 inline-flex items-center rounded-full border border-red-400 bg-red-200 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide text-red-900 dark:border-red-700 dark:bg-red-900 dark:text-red-100">
            {decisionStatus === "approved" ? "Access approved" : decisionStatus === "denied" ? "Access request declined" : "Access revoked"}
          </span>
          <p className="text-sm font-semibold">
            {decisionStatus === "approved"
              ? "Your access request has been approved. Additional access is now active for this feature."
              : decisionStatus === "denied"
                ? "Your request for additional access was declined by the admin. You can submit a new request if you still need access."
                : "Your additional access to this feature has been revoked by the admin. The standard usage limit now applies."}
          </p>
        </div>
      )}
      {reachedLimit && requestPending ? (
        <>
          <button type="button" disabled className="mt-3 cursor-not-allowed rounded-lg bg-gray-400 px-4 py-2 text-sm font-semibold text-white opacity-80">
            Request sent — awaiting approval
          </button>
          <p className="mt-2 text-sm">Your request has been sent to the admin. Please wait for approval.</p>
        </>
      ) : reachedLimit ? (
        <button
          type="button"
          onClick={requestAccess}
          disabled={sending}
          className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {sending ? "Sending request…" : "Request more access"}
        </button>
      ) : null}
      {message && !requestPending && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}
