import { createContext, useContext, useState, useCallback, ReactNode } from "react";

const GUEST_MODE_KEY = "ht_guest_mode";
const GUEST_USED_KEY = "ht_guest_used";

interface GuestContextType {
  isGuest: boolean;
  hasUsedFeature: boolean;
  showLoginPrompt: boolean;
  setShowLoginPrompt: (v: boolean) => void;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
  checkGuestAccess: () => boolean;
}

const GuestContext = createContext<GuestContextType | null>(null);

export function GuestProvider({ children }: { children: ReactNode }) {
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem(GUEST_MODE_KEY) === "1");
  const [hasUsedFeature, setHasUsedFeature] = useState(() => localStorage.getItem(GUEST_USED_KEY) === "1");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const enterGuestMode = useCallback(() => {
    localStorage.setItem(GUEST_MODE_KEY, "1");
    setIsGuest(true);
  }, []);

  const exitGuestMode = useCallback(() => {
    localStorage.removeItem(GUEST_MODE_KEY);
    localStorage.removeItem(GUEST_USED_KEY);
    setIsGuest(false);
    setHasUsedFeature(false);
    setShowLoginPrompt(false);
  }, []);

  const checkGuestAccess = useCallback((): boolean => {
    if (!isGuest) return true;
    setShowLoginPrompt(true);
    return false;
  }, [isGuest]);

  return (
    <GuestContext.Provider
      value={{ isGuest, hasUsedFeature, showLoginPrompt, setShowLoginPrompt, enterGuestMode, exitGuestMode, checkGuestAccess }}
    >
      {children}
    </GuestContext.Provider>
  );
}

export function useGuest() {
  const ctx = useContext(GuestContext);
  if (!ctx) throw new Error("useGuest must be used within GuestProvider");
  return ctx;
}
