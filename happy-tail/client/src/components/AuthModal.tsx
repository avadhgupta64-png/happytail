/**
 * AuthModal — shown when a guest tries to use an AI feature.
 * Supports email/password login, email/password registration, and Google OAuth.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useGuest } from "@/lib/guest-context";
import { useQueryClient } from "@tanstack/react-query";

export type AuthTab = "login" | "register";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: AuthTab;
}

// ---------------------------------------------------------------------------
// Google button (shared)
// ---------------------------------------------------------------------------
function GoogleButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-100 shadow-sm transition-all hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-[0.98]"
      data-testid="button-google-login"
    >
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      Continue with Google
    </button>
  );
}

// ---------------------------------------------------------------------------
// Login form
// ---------------------------------------------------------------------------
function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message === "banned"
          ? "Your account has been suspended. Please contact support."
          : data.message || "Invalid email or password.");
        return;
      }
      // Notify parent — it will invalidate /api/auth/user and close
      onSuccess();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="modal-login-email" className="text-xs text-muted-foreground">
          Email address
        </Label>
        <Input
          id="modal-login-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded-xl h-10 text-sm"
          data-testid="input-login-email"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="modal-login-password" className="text-xs text-muted-foreground">
          Password
        </Label>
        <div className="relative">
          <Input
            id="modal-login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-xl h-10 text-sm pr-10"
            data-testid="input-login-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-3 py-2 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl h-10 text-sm font-semibold mt-1"
        data-testid="button-login-submit"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Register form
// ---------------------------------------------------------------------------
function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          res.status === 409
            ? "An account with this email already exists."
            : data.message || "Registration failed. Please try again.",
        );
        return;
      }
      onSuccess();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="modal-reg-firstname" className="text-xs text-muted-foreground">
            First name
          </Label>
          <Input
            id="modal-reg-firstname"
            type="text"
            autoComplete="given-name"
            placeholder="Alex"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="rounded-xl h-10 text-sm"
            data-testid="input-register-firstname"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="modal-reg-lastname" className="text-xs text-muted-foreground">
            Last name
          </Label>
          <Input
            id="modal-reg-lastname"
            type="text"
            autoComplete="family-name"
            placeholder="Smith"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="rounded-xl h-10 text-sm"
            data-testid="input-register-lastname"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="modal-reg-email" className="text-xs text-muted-foreground">
          Email address
        </Label>
        <Input
          id="modal-reg-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded-xl h-10 text-sm"
          data-testid="input-register-email"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="modal-reg-password" className="text-xs text-muted-foreground">
          Password
        </Label>
        <div className="relative">
          <Input
            id="modal-reg-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-xl h-10 text-sm pr-10"
            data-testid="input-register-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-3 py-2 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl h-10 text-sm font-semibold mt-1"
        data-testid="button-register-submit"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
      </Button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// AuthModal
// ---------------------------------------------------------------------------
export function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const [tab, setTab] = useState<AuthTab>(defaultTab);
  const { exitGuestMode } = useGuest();
  const queryClient = useQueryClient();

  function handleGoogle() {
    exitGuestMode();
    window.location.href = "/api/auth/google";
  }

  async function handleSuccess() {
    // Refresh auth state in-place — no page reload needed
    await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="auth-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={(e: React.MouseEvent) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            key="auth-card"
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Sign in to Happy Tail"
          >
            {/* Header */}
            <div className="relative px-6 pt-6 pb-5">
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-5">
                <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-gray-100">
                  Welcome to Happy Tail 🐾
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  AI features require an account
                </p>
              </div>

              {/* Tab switcher */}
              <div className="flex rounded-2xl bg-gray-100 dark:bg-gray-800 p-1 mb-4">
                {(["login", "register"] as AuthTab[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
                      tab === t
                        ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    data-testid={`tab-${t}`}
                  >
                    {t === "login" ? "Sign in" : "Register"}
                  </button>
                ))}
              </div>

              {/* Google button — always visible */}
              <GoogleButton onClick={handleGoogle} />

              <div className="flex items-center gap-3 my-4">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">or</span>
                <Separator className="flex-1" />
              </div>

              {/* Email / password form */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  {tab === "login" ? (
                    <LoginForm onSuccess={handleSuccess} />
                  ) : (
                    <RegisterForm onSuccess={handleSuccess} />
                  )}
                </motion.div>
              </AnimatePresence>

              <p className="text-center text-xs text-muted-foreground mt-4">
                {tab === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setTab("register")}
                      className="text-violet-600 dark:text-violet-400 font-medium hover:underline"
                    >
                      Create one free
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setTab("login")}
                      className="text-violet-600 dark:text-violet-400 font-medium hover:underline"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>

              <p className="text-center text-xs text-muted-foreground mt-2">
                Just exploring?{" "}
                <button
                  type="button"
                  onClick={onClose}
                  className="text-violet-600 dark:text-violet-400 font-medium hover:underline"
                >
                  Continue as guest
                </button>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
