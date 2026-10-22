import { useEffect, useState } from "react";

interface AIUsageSummary {
  isAdmin?: boolean;
  hasAllUnlimited?: boolean;
  limit?: number;
  usage?: Record<string, number>;
  unlimitedFeatures?: string[];
}

interface AIUsageCounterProps {
  featureKey: string;
}

export function AIUsageCounter({ featureKey }: AIUsageCounterProps) {
  const [summary, setSummary] = useState<AIUsageSummary | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const loadUsage = async () => {
      try {
        const response = await fetch("/api/ai/usage-summary", { credentials: "include" });
        if (!response.ok) throw new Error("Could not load usage");
        const data = await response.json();
        if (active) {
          setSummary(data);
          setFailed(false);
        }
      } catch {
        if (active) setFailed(true);
      }
    };
    void loadUsage();
    const interval = window.setInterval(loadUsage, 15000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [featureKey]);

  if (failed || !summary) {
    return (
      <div role="status" className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
        AI usage: unable to load counter
      </div>
    );
  }

  const used = summary.usage?.[featureKey] ?? 0;
  const unlimited = summary.isAdmin || summary.hasAllUnlimited || summary.unlimitedFeatures?.includes(featureKey);

  return (
    <div aria-live="polite" className="mb-4 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-950 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-100">
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold">AI usage</span>
        <span className="font-bold tabular-nums">{unlimited ? "Unlimited" : `${used}/${summary.limit ?? 3} uses`}</span>
      </div>
      {!unlimited && (
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-indigo-200 dark:bg-indigo-900" role="progressbar" aria-label="AI feature usage" aria-valuemin={0} aria-valuemax={summary.limit ?? 3} aria-valuenow={Math.min(used, summary.limit ?? 3)}>
          <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${Math.min(100, (used / (summary.limit ?? 3)) * 100)}%` }} />
        </div>
      )}
    </div>
  );
}
