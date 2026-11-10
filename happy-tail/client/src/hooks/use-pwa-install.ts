import { useEffect, useState, useCallback } from "react";

// BeforeInstallPromptEvent is not in the standard TS lib yet
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// ── Module-level capture ────────────────────────────────────────────────────
// beforeinstallprompt can fire before React mounts. We capture it immediately
// at module-load time so the hook never misses it.
let _deferredPrompt: BeforeInstallPromptEvent | null = null;
const _listeners = new Set<() => void>();

function notifyListeners() {
  _listeners.forEach((fn) => fn());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    _deferredPrompt = e as BeforeInstallPromptEvent;
    notifyListeners();
  });
  window.addEventListener("appinstalled", () => {
    _deferredPrompt = null;
    notifyListeners();
  });
}

// ── Hook ────────────────────────────────────────────────────────────────────
export function usePwaInstall() {
  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true ||
      navigator.userAgent.includes("HappyTailApp"));

  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(
    isStandalone ? null : _deferredPrompt
  );
  const [isInstalled, setIsInstalled] = useState(isStandalone);
  // Track manual dismissal per session
  const [dismissed, setDismissed] = useState(() =>
    sessionStorage.getItem("pwa-banner-dismissed") === "1"
  );

  useEffect(() => {
    if (isStandalone) return;

    const sync = () => setPrompt(_deferredPrompt);
    _listeners.add(sync);

    const onInstalled = () => {
      setIsInstalled(true);
      setPrompt(null);
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      _listeners.delete(sync);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [isStandalone]);

  const install = useCallback(async () => {
    if (!prompt) return;
    await prompt.prompt();
    const result = await prompt.userChoice;
    if (result.outcome === "accepted") setIsInstalled(true);
    _deferredPrompt = null;
    setPrompt(null);
  }, [prompt]);

  const dismiss = useCallback(() => {
    sessionStorage.setItem("pwa-banner-dismissed", "1");
    setDismissed(true);
  }, []);

  const canInstall = !!prompt && !isInstalled && !dismissed;

  return { canInstall, isInstalled, install, dismiss };
}
