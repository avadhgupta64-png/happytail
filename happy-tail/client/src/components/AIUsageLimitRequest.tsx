import { useState } from "react";

interface AIUsageLimitRequestProps {
  featureKey: string;
}

export function AIUsageLimitRequest({ featureKey }: AIUsageLimitRequestProps) {
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");

  const requestAccess = async () => {
    if (pending || sent) return;
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/ai/access-requests", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featureKey }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Could not submit access request.");
      setSent(true);
      setMessage("Request sent to the Happy Tail admin.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not submit access request.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mt-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-100">
      <p className="text-sm font-medium">You’ve reached the usage limit for this AI feature.</p>
      <button
        type="button"
        onClick={requestAccess}
        disabled={pending || sent}
        className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Sending request…" : sent ? "Request sent" : "Request more access"}
      </button>
      {message && <p role="status" className="mt-2 text-sm">{message}</p>}
    </div>
  );
}
