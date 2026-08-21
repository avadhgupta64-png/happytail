import { useState } from "react";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, LogIn, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

// ─── Schemas ────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required").max(100),
    lastName: z.string().max(100).optional(),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ─── Sub-components ─────────────────────────────────────────────────────────

function PasswordInput({
  id,
  placeholder,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="pr-10"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

// ─── Login Form ──────────────────────────────────────────────────────────────

function LoginTab({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(result.data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: "Login failed" }));
        if (res.status === 403) {
          toast({
            title: "Account suspended",
            description: "Your account has been suspended. Contact support.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login failed",
            description: body.message || "Invalid email or password",
            variant: "destructive",
          });
        }
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onSuccess();
    } catch {
      toast({
        title: "Network error",
        description: "Check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="login-password">Password</Label>
        <PasswordInput
          id="login-password"
          placeholder="Enter your password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full py-5 text-base font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
        disabled={isSubmitting}
        data-testid="button-login-submit"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            Signing in…
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <LogIn className="w-4 h-4" /> Sign In
          </span>
        )}
      </Button>
    </form>
  );
}

// ─── Register Form ───────────────────────────────────────────────────────────

function RegisterTab({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = registerSchema.safeParse({
      firstName,
      lastName: lastName || undefined,
      email,
      password,
      confirmPassword,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: result.data.email,
          password: result.data.password,
          firstName: result.data.firstName,
          lastName: result.data.lastName || "",
        }),
      });

      if (!res.ok) {
        const body = await res
          .json()
          .catch(() => ({ message: "Registration failed" }));
        toast({
          title: "Registration failed",
          description: body.message || "Please try again",
          variant: "destructive",
        });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome to Happy Tail! 🐾",
        description: "Your account has been created.",
      });
      onSuccess();
    } catch {
      toast({
        title: "Network error",
        description: "Check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="reg-first-name">First Name *</Label>
          <Input
            id="reg-first-name"
            placeholder="Jane"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          {errors.firstName && (
            <p className="text-xs text-destructive">{errors.firstName}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reg-last-name">Last Name</Label>
          <Input
            id="reg-last-name"
            placeholder="Doe"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reg-email">Email *</Label>
        <Input
          id="reg-email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reg-password">Password *</Label>
        <PasswordInput
          id="reg-password"
          placeholder="At least 6 characters"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reg-confirm-password">Confirm Password *</Label>
        <PasswordInput
          id="reg-confirm-password"
          placeholder="Repeat your password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full py-5 text-base font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
        disabled={isSubmitting}
        data-testid="button-register-submit"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            Creating account…
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Create Account
          </span>
        )}
      </Button>
    </form>
  );
}

// ─── Main Modal ──────────────────────────────────────────────────────────────

export type AuthTab = "login" | "register";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: AuthTab;
}

export function AuthModal({
  isOpen,
  onClose,
  defaultTab = "login",
}: AuthModalProps) {
  const [tab, setTab] = useState<AuthTab>(defaultTab);

  function handleSuccess() {
    onClose();
    window.location.href = "/";
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
            aria-label={
              tab === "login"
                ? "Sign in to Happy Tail"
                : "Create a Happy Tail account"
            }
          >
            {/* Header */}
            <div className="relative px-6 pt-6 pb-0">
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
                  {tab === "login" ? "Welcome back 🐾" : "Join Happy Tail 🐾"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {tab === "login"
                    ? "Sign in to access all features"
                    : "Create a free account to get started"}
                </p>
              </div>

              {/* Tabs */}
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-5">
                <button
                  type="button"
                  onClick={() => setTab("login")}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                    tab === "login"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid="tab-login"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setTab("register")}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                    tab === "register"
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid="tab-register"
                >
                  Create Account
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 pb-6">
              <AnimatePresence mode="wait">
                {tab === "login" ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.15 }}
                  >
                    <LoginTab onSuccess={handleSuccess} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    <RegisterTab onSuccess={handleSuccess} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tab switcher hint */}
              <p className="text-center text-xs text-muted-foreground mt-4">
                {tab === "login" ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setTab("register")}
                      className="text-violet-600 dark:text-violet-400 font-medium hover:underline"
                    >
                      Create one
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
