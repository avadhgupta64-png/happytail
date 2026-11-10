import { useEffect } from "react";

// Splash screen removed — load the app immediately on every launch.
export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    onComplete();
  }, [onComplete]);
  return null;
}
