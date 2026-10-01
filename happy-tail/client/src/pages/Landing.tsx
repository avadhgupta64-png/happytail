import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Users, Camera, MessageSquare, HeartPulse, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGuest } from "@/lib/guest-context";
import logoImg from "@assets/IMG-20260210-WA0048_1770744211559.jpg";

// ---------------------------------------------------------------------------
// Feature carousel data
// ---------------------------------------------------------------------------

const FEATURES = [
  {
    Icon: Camera,
    gradient: "from-sky-500/25 via-blue-400/10 to-indigo-500/25",
    iconColor: "text-sky-400",
    dotColor: "bg-sky-400",
    badge: "AI Vision",
    title: "Understand your dog's emotions",
    desc: "Real-time emotion detection powered by AI. Know exactly how your pet is feeling — happy, anxious, playful, or tired.",
  },
  {
    Icon: MessageSquare,
    gradient: "from-amber-500/25 via-orange-400/10 to-rose-500/25",
    iconColor: "text-amber-400",
    dotColor: "bg-amber-400",
    badge: "Bark Translator",
    title: "Decode every bark & body signal",
    desc: "AI listens to your dog's bark and reads body language to translate what they're really trying to tell you.",
  },
  {
    Icon: HeartPulse,
    gradient: "from-emerald-500/25 via-teal-400/10 to-cyan-500/25",
    iconColor: "text-emerald-400",
    dotColor: "bg-emerald-400",
    badge: "Health Hub",
    title: "Personalised care & guidance",
    desc: "Tailored feeding schedules, training tips, and health reminders built around your pet's breed, age, and personality.",
  },
  {
    Icon: Users,
    gradient: "from-violet-500/25 via-purple-400/10 to-fuchsia-500/25",
    iconColor: "text-violet-400",
    dotColor: "bg-violet-400",
    badge: "Community",
    title: "Connect with pet lovers",
    desc: "Share stories, ask questions, and build friendships with a community that shares your passion for dogs.",
  },
] as const;

const AUTOPLAY_MS = 4000;

// ---------------------------------------------------------------------------
// Feature carousel
// ---------------------------------------------------------------------------

function FeatureCarousel({ compact = false }: { compact?: boolean }) {
  const shouldReduceMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = useCallback(() => setIndex((i) => (i + 1) % FEATURES.length), []);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(advance, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [advance, paused]);

  const f = FEATURES[index];

  const slideVariants = {
    enter: { opacity: 0, y: shouldReduceMotion ? 0 : 18 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: shouldReduceMotion ? 0 : -18 },
  };

  if (compact) {
    return (
      <div
        className="w-full px-5 py-4"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: "easeOut" }}
            className="flex items-center gap-3"
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${f.gradient}`}
            >
              <f.Icon className={`h-4 w-4 ${f.iconColor}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{f.title}</p>
              <p className="text-xs text-white/50 truncate">{f.badge}</p>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="mt-3 flex justify-center gap-1.5">
          {FEATURES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === index ? `w-5 ${f.dotColor}` : "w-1 bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex flex-col justify-between h-full p-8 xl:p-10 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence>
        <motion.div
          key={`bg-${index}`}
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.7, ease: "easeOut" }}
          className={`absolute inset-0 bg-gradient-to-br ${f.gradient} pointer-events-none`}
          aria-hidden
        />
      </AnimatePresence>

      <div className="relative z-10 flex items-center gap-3 select-none">
        <img
          src={logoImg}
          alt="Happy Tail"
          className="w-9 h-9 rounded-xl object-cover shadow-lg border border-white/10"
        />
        <span className="text-sm font-bold text-white/90 tracking-wide">Happy Tail</span>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: "easeOut" }}
            className="flex flex-col gap-5"
          >
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${f.gradient} border border-white/10 shadow-md`}
            >
              <f.Icon className={`h-7 w-7 ${f.iconColor}`} />
            </div>
            <span
              className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold border border-current/20 bg-current/10 ${f.iconColor}`}
            >
              {f.badge}
            </span>
            <h2 className="text-2xl xl:text-3xl font-bold text-white leading-tight tracking-tight">
              {f.title}
            </h2>
            <p className="text-sm xl:text-base text-white/60 leading-relaxed max-w-xs">{f.desc}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex gap-2">
          {FEATURES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Feature ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index
                  ? `w-6 ${f.dotColor}`
                  : "w-1.5 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-white/30 tabular-nums select-none">
          {index + 1} / {FEATURES.length}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared Google button
// ---------------------------------------------------------------------------
function GoogleButton() {
  return (
    <a
      href="/api/auth/google"
      className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl active:scale-[0.98]"
      data-testid="button-google-login"
    >
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      Continue with Google
    </a>
  );
}

// ---------------------------------------------------------------------------
// Error alert
// ---------------------------------------------------------------------------
function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-red-500/15 border border-red-400/30 px-3 py-2 text-xs text-red-300">
      <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
      {message}
    </div>
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
        setError(
          data.message === "banned"
            ? "Your account has been suspended. Please contact support."
            : data.message || "Invalid email or password.",
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
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="landing-login-email" className="text-xs text-white/60">
          Email address
        </Label>
        <Input
          id="landing-login-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded-xl h-10 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-white/40"
          data-testid="input-login-email"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="landing-login-password" className="text-xs text-white/60">
          Password
        </Label>
        <div className="relative">
          <Input
            id="landing-login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-xl h-10 text-sm pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-white/40"
            data-testid="input-login-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-white px-4 py-3 text-sm font-semibold shadow-lg transition-all disabled:opacity-60 mt-1"
        data-testid="button-login-submit"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
      </button>
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

  const inputCls =
    "rounded-xl h-10 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-white/40";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="landing-reg-firstname" className="text-xs text-white/60">
            First name
          </Label>
          <Input
            id="landing-reg-firstname"
            type="text"
            autoComplete="given-name"
            placeholder="Alex"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className={inputCls}
            data-testid="input-register-firstname"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="landing-reg-lastname" className="text-xs text-white/60">
            Last name
          </Label>
          <Input
            id="landing-reg-lastname"
            type="text"
            autoComplete="family-name"
            placeholder="Smith"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputCls}
            data-testid="input-register-lastname"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="landing-reg-email" className="text-xs text-white/60">
          Email address
        </Label>
        <Input
          id="landing-reg-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputCls}
          data-testid="input-register-email"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="landing-reg-password" className="text-xs text-white/60">
          Password
        </Label>
        <div className="relative">
          <Input
            id="landing-reg-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={`${inputCls} pr-10`}
            data-testid="input-register-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-white px-4 py-3 text-sm font-semibold shadow-lg transition-all disabled:opacity-60 mt-1"
        data-testid="button-register-submit"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Auth panel (tab switcher + forms)
// ---------------------------------------------------------------------------
type Tab = "login" | "register";

function AuthPanel() {
  const [tab, setTab] = useState<Tab>("login");
  const { enterGuestMode } = useGuest();

  function handleSuccess() {
    // Full reload so App picks up the new session
    window.location.href = "/";
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Tab switcher */}
      <div className="flex rounded-2xl bg-white/10 p-1">
        {(["login", "register"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
              tab === t
                ? "bg-white text-gray-900 shadow-sm"
                : "text-white/50 hover:text-white/80"
            }`}
            data-testid={`tab-${t}`}
          >
            {t === "login" ? "Sign in" : "Register"}
          </button>
        ))}
      </div>

      {/* Google */}
      <GoogleButton />

      {/* Divider */}
      <div className="flex items-center gap-3">
        <Separator className="flex-1 bg-white/15" />
        <span className="text-xs text-white/30">or</span>
        <Separator className="flex-1 bg-white/15" />
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

      {/* Switch tab hint */}
      <p className="text-center text-xs text-white/30">
        {tab === "login" ? (
          <>
            No account?{" "}
            <button
              type="button"
              onClick={() => setTab("register")}
              className="text-violet-400 font-medium hover:underline"
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
              className="text-violet-400 font-medium hover:underline"
            >
              Sign in
            </button>
          </>
        )}
      </p>

      {/* Guest mode */}
      <button
        type="button"
        onClick={enterGuestMode}
        className="group w-full flex flex-col items-center gap-0.5 rounded-2xl py-3 px-4 text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-all border border-white/10 hover:border-white/20"
        data-testid="button-skip-login"
      >
        <span className="font-medium text-white/60 group-hover:text-white/80 transition-colors">
          Try without signing in
        </span>
        <span className="text-xs text-white/25 group-hover:text-white/40 transition-colors">
          Browse freely · AI features require login
        </span>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Landing page
// ---------------------------------------------------------------------------

export default function Landing() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-950 via-purple-950 to-black flex flex-col lg:flex-row">

      {/* Left panel — feature carousel (desktop) */}
      <div
        className="hidden lg:flex lg:w-[46%] xl:w-[48%] shrink-0 border-r border-white/8"
        aria-hidden="true"
      >
        <FeatureCarousel />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">

        {/* Mobile — compact feature strip */}
        <div className="lg:hidden border-b border-white/10 bg-white/5">
          <FeatureCarousel compact />
        </div>

        {/* Auth area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">

          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex flex-col items-center gap-3 select-none"
          >
            <img
              src={logoImg}
              alt="Happy Tail"
              className="w-20 h-20 rounded-3xl object-cover shadow-2xl border-2 border-white/10"
            />
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-white">Happy Tail</h1>
              <p className="text-sm text-white/50 mt-1">Your AI-powered dog care companion</p>
            </div>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full max-w-xs"
          >
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-6">
              <AuthPanel />
            </div>
          </motion.div>

          <p className="mt-6 text-xs text-white/20 text-center">
            By continuing you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
