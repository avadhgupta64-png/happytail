import { useEffect, useState } from "react";

// BeforeInstallPromptEvent is not in the standard TS lib yet
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePwaInstall() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [outcome, setOutcome] = useState<"accepted" | "dismissed" | null>(null);

  useEffect(() => {
    // Already running as installed PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Fired when the user installs from the native browser prompt or our button
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setPrompt(null);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const result = await prompt.userChoice;
    setOutcome(result.outcome);
    if (result.outcome === "accepted") {
      setIsInstalled(true);
    }
    setPrompt(null);
  };

  const dismiss = () => setPrompt(null);

  return { canInstall: !!prompt && !isInstalled, isInstalled, outcome, install, dismiss };
}
