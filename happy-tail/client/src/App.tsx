import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { SidebarProvider, SidebarTrigger, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { SplashScreen } from "@/components/SplashScreen";
import Home from "@/pages/Home";
import EmotionDetector from "@/pages/EmotionDetector";
import Emergency from "@/pages/Emergency";
import DogGuide from "./pages/DogGuide";
import BarkTranslator from "./pages/BarkTranslator";
import HealthCheckup from "./pages/HealthCheckup";
import HealthHub from "./pages/HealthHub";
import DietPlanner from "./pages/DietPlanner";
import VetChat from "./pages/VetChat";
import Locations from "@/pages/Locations";
import Community from "@/pages/Community";
import Landing from "@/pages/Landing";
import Profile from "@/pages/Profile";
import History from "@/pages/History";
import ExportData from "@/pages/ExportData";
import AdminDashboard from "@/pages/AdminDashboard";
import About from "@/pages/About";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import Feedback from "@/pages/Feedback";
import { HeartPulse, MessageSquare, ShieldAlert, BookOpen, Moon, Sun, Home as HomeIcon, MapPin, Users, Dog, Stethoscope, LogOut, LogIn, UserCircle, Clock, FileSpreadsheet, Shield, RefreshCw, ChevronDown, Info, Star } from "lucide-react";
import { useTheme } from "./hooks/use-theme";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import logoImg from "@assets/IMG-20260210-WA0048_1770744211559.jpg";
import { LanguageProvider } from "@/lib/language-context";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/hooks/use-auth";
import { WSProvider } from "@/lib/ws-context";
import { GuestProvider, useGuest } from "@/lib/guest-context";
import { LoginPromptModal } from "@/components/LoginPromptModal";
import { AuthModalProvider, useAuthModal } from "@/lib/auth-modal-context";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      data-testid="button-theme-toggle"
    >
      {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </Button>
  );
}

function accessRequestTarget(featureKey: string) {
  const routes: Record<string, string> = {
    emotion_scan: "/detector",
    behavior_analysis: "/detector",
    location_search: "/locations",
    geofencing: "/locations",
    bark_translation: "/bark-translator",
    health_scan: "/health/scan",
    diet_plan: "/health/diet",
    vet_chat: "/health/chat",
  };
  return routes[featureKey] || "/"; 
}

function AppSidebar() {
  const [location] = useLocation();
  const { t } = useLanguage();
  const [readNotificationKeys, setReadNotificationKeys] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("happy-tail-read-notifications") || "[]"); }
    catch { return []; }
  });

  const markNotificationKeysRead = useCallback((keys: string[]) => {
    setReadNotificationKeys((current) => {
      const next = Array.from(new Set([...current, ...keys]));
      try { localStorage.setItem("happy-tail-read-notifications", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const { data: adminCheck } = useQuery({
    queryKey: ["/api/admin/check"],
    queryFn: async () => {
      const res = await fetch("/api/admin/check", { credentials: "include" });
      return res.json();
    },
  });

  const { data: pendingAccessRequests = [] } = useQuery({
    queryKey: ["/api/admin/ai-access-requests"],
    queryFn: async () => {
      const res = await fetch("/api/admin/ai-access-requests", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!adminCheck?.isAdmin,
    refetchInterval: 10000,
  });

  const { data: myAccessRequests = [] } = useQuery({
    queryKey: ["/api/ai/access-requests/mine"],
    queryFn: async () => {
      const res = await fetch("/api/ai/access-requests/mine", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!adminCheck && !adminCheck?.isAdmin,
    refetchInterval: 10000,
  });

  const { data: adminActivity = [] } = useQuery({
    queryKey: ["/api/admin/all-activities"],
    queryFn: async () => {
      const res = await fetch("/api/admin/all-activities", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!adminCheck?.isAdmin,
    refetchInterval: 10000,
  });

  const { data: feedbackItems = [] } = useQuery({
    queryKey: [adminCheck?.isAdmin ? "/api/admin/feedback" : "/api/feedback"],
    queryFn: async () => {
      const endpoint = adminCheck?.isAdmin ? "/api/admin/feedback" : "/api/feedback";
      const res = await fetch(endpoint, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!adminCheck,
    refetchInterval: 10000,
  });

  const notificationItems = [
    ...(adminCheck?.isAdmin ? pendingAccessRequests.map((request: any) => ({ key: `admin-access-${request.id}-${request.status || "pending"}`, url: "/admin" })) : []),
    ...(adminCheck?.isAdmin ? adminActivity.map((activity: any) => ({ key: `admin-activity-${activity.id}`, url: "/admin" })) : []),
    ...(adminCheck?.isAdmin ? feedbackItems.filter((item: any) => !item.resolved).map((item: any) => ({ key: `admin-feedback-${item.id}-${item.updatedAt || item.createdAt}`, url: "/feedback" })) : []),
    ...(!adminCheck?.isAdmin ? myAccessRequests.filter((request: any) => ["approved", "denied", "revoked"].includes(request.status) && request.reviewedAt).map((request: any) => ({ key: `user-access-${request.id}-${request.status}-${request.reviewedAt}`, url: accessRequestTarget(request.featureKey) })) : []),
    ...(!adminCheck?.isAdmin ? feedbackItems.filter((item: any) => item.adminComment || item.resolved).map((item: any) => ({ key: `user-feedback-${item.id}-${item.updatedAt || item.adminComment || item.resolved}`, url: "/feedback" })) : []),
  ];
  const unreadNotificationItems = notificationItems.filter((item: any) => !readNotificationKeys.includes(item.key));
  const hasUnreadNotifications = unreadNotificationItems.length > 0;

  useEffect(() => {
    const targetUrl = location;
    const keys = notificationItems.filter((item: any) => item.url === targetUrl).map((item: any) => item.key);
    if (keys.length) markNotificationKeysRead(keys);
  }, [location, notificationItems.map((item: any) => item.key).join("|"), markNotificationKeysRead]);

  const navItems = [
    { title: t.nav.home, url: "/", icon: HomeIcon },
    { title: t.nav.emotionDetector, url: "/detector", icon: Dog },
    { title: t.nav.barkTranslator, url: "/bark-translator", icon: MessageSquare },
    { title: t.nav.dogHealth, url: "/health", icon: Stethoscope },
    { title: t.nav.breedGuide, url: "/breeds", icon: BookOpen },
    { title: t.nav.places, url: "/locations", icon: MapPin },
    { title: t.nav.community, url: "/community", icon: Users },
    { title: t.nav.emergency, url: "/emergency", icon: ShieldAlert },
    { title: t.nav.history, url: "/history", icon: Clock },
    { title: "Feedback", url: "/feedback", icon: Star },
    { title: t.nav.about, url: "/about", icon: Info },
    ...(adminCheck?.isAdmin ? [{ title: t.nav.admin, url: "/admin", icon: Shield }] : []),
  ];

  return (
    <Sidebar className="border-r border-gray-100 dark:border-gray-800 z-[100]">
      <SidebarContent className="bg-white dark:bg-gray-950">
        <SidebarGroup>
          <div className="flex items-center gap-3 px-5 py-6">
            <img
              src={logoImg}
              alt="Happy Tail Logo"
              className="w-9 h-9 rounded-xl object-cover"
              style={{ mixBlendMode: "multiply" }}
              data-testid="img-sidebar-logo"
            />
            <h2 className="text-lg font-bold text-primary font-display">Happy Tail</h2>
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="px-3 space-y-0.5">
              {navItems.map((item) => {
                const isActive = location === item.url || (item.url !== "/" && location.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link
                        href={item.url}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
                        data-testid={`nav-${item.url.replace(/\//g, '') || 'home'}`}
                      >
                        <item.icon
                          className={`w-4 h-4 shrink-0 ${isActive ? "!text-primary" : "!text-muted-foreground"}`}
                        />
                        <span className={`text-sm ${isActive ? "font-semibold !text-primary" : "!text-sidebar-foreground"}`}>
                          {item.title}
                        </span>
                        {unreadNotificationItems.some((notification: any) => notification.url === item.url) && (
                          <span aria-label="Unread notification" className="ml-auto h-2.5 w-2.5 rounded-full bg-red-600" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/detector" component={EmotionDetector} />
      <Route path="/emergency" component={Emergency} />
      <Route path="/breeds" component={DogGuide} />
      <Route path="/bark-translator" component={BarkTranslator} />
      <Route path="/health" component={HealthHub} />
      <Route path="/health/scan" component={HealthCheckup} />
      <Route path="/health/diet" component={DietPlanner} />
      <Route path="/health/chat" component={VetChat} />
      <Route path="/locations" component={Locations} />
      <Route path="/community" component={Community} />
      <Route path="/history" component={History} />
      <Route path="/export" component={ExportData} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/feedback" component={Feedback} />
      <Route path="/profile" component={Profile} />
      <Route path="/about" component={About} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route component={NotFound} />
    </Switch>
  );
}

function HeaderNotificationIndicator() {
  const { data: adminCheck } = useQuery({
    queryKey: ["/api/admin/check"],
    queryFn: async () => {
      const res = await fetch("/api/admin/check", { credentials: "include" });
      if (!res.ok) return { isAdmin: false };
      return res.json();
    },
  });
  const { data: requests = [] } = useQuery({
    queryKey: [adminCheck?.isAdmin ? "/api/admin/ai-access-requests" : "/api/ai/access-requests/mine"],
    queryFn: async () => {
      const endpoint = adminCheck?.isAdmin ? "/api/admin/ai-access-requests" : "/api/ai/access-requests/mine";
      const res = await fetch(endpoint, { credentials: "include" });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!adminCheck,
    refetchInterval: 10000,
  });
  const { data: activities = [] } = useQuery({
    queryKey: ["/api/admin/all-activities"],
    queryFn: async () => {
      const res = await fetch("/api/admin/all-activities", { credentials: "include" });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!adminCheck?.isAdmin,
    refetchInterval: 10000,
  });
  const { data: feedback = [] } = useQuery({
    queryKey: [adminCheck?.isAdmin ? "/api/admin/feedback" : "/api/feedback"],
    queryFn: async () => {
      const endpoint = adminCheck?.isAdmin ? "/api/admin/feedback" : "/api/feedback";
      const res = await fetch(endpoint, { credentials: "include" });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!adminCheck,
    refetchInterval: 10000,
  });
  const readKeys: string[] = (() => {
    try {
      const value = JSON.parse(localStorage.getItem("happy-tail-read-notifications") || "[]");
      return Array.isArray(value) ? value : [];
    } catch { return []; }
  })();
  const notifications = [
    ...(adminCheck?.isAdmin ? requests.map((item: any) => ({ key: `admin-access-${item.id}-${item.status || "pending"}` })) : []),
    ...(adminCheck?.isAdmin ? activities.map((item: any) => ({ key: `admin-activity-${item.id}` })) : []),
    ...(adminCheck?.isAdmin ? feedback.filter((item: any) => !item.resolved).map((item: any) => ({ key: `admin-feedback-${item.id}-${item.updatedAt || item.createdAt}` })) : []),
    ...(!adminCheck?.isAdmin ? requests.filter((item: any) => ["approved", "denied", "revoked"].includes(item.status) && item.reviewedAt).map((item: any) => ({ key: `user-access-${item.id}-${item.status}-${item.reviewedAt}`, url: accessRequestTarget(item.featureKey) })) : []),
    ...(!adminCheck?.isAdmin ? feedback.filter((item: any) => item.adminComment || item.resolved).map((item: any) => ({ key: `user-feedback-${item.id}-${item.updatedAt || item.adminComment || item.resolved}` })) : []),
  ];
  return notifications.some((item: any) => !readKeys.includes(item.key))
    ? <span aria-label="Unread notifications" className="pointer-events-none absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-600 dark:border-gray-950" />
    : null;
}

function AuthenticatedApp() {
  const { user, logout } = useAuth();
  const { isGuest, exitGuestMode } = useGuest();
  const { openAuthModal } = useAuthModal();

  const handleGuestLogin = () => {
    exitGuestMode();
    openAuthModal("login");
  };

  useState(() => {
    fetch("/api/visitors/log", { method: "POST", credentials: "include" }).catch(() => {});
  });

  const style = {
    "--sidebar-width": "15rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <WSProvider>
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-950 text-foreground">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
            <div className="flex items-center gap-3">
              <span className="relative inline-flex">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <HeaderNotificationIndicator />
              </span>
              <div className="flex items-center gap-2">
                <img
                  src={logoImg}
                  alt="Happy Tail Logo"
                  className="w-6 h-6 rounded-md object-cover"
                  style={{ mixBlendMode: "multiply" }}
                  data-testid="img-header-logo"
                />
                <h1 className="text-lg font-bold font-display text-primary">Happy Tail</h1>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Link href="/about">
                <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-primary" title="About Happy Tail" data-testid="button-about">
                  <Info className="w-4 h-4" />
                </Button>
              </Link>
              <LanguageSwitcher />
              <ThemeToggle />
              {isGuest && (
                <Button
                  size="sm"
                  onClick={handleGuestLogin}
                  className="ml-2 rounded-xl text-xs font-semibold bg-primary text-white hover:bg-primary/90"
                  data-testid="button-guest-login"
                >
                  <LogIn className="w-3.5 h-3.5 mr-1" /> Login
                </Button>
              )}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1.5 text-sm text-muted-foreground rounded-md px-2 py-1.5 ml-2 h-auto"
                      data-testid="button-user-menu"
                    >
                      <UserCircle className="w-4 h-4 shrink-0" />
                      <span className="hidden sm:inline max-w-[110px] truncate" data-testid="text-user-name">
                        {user.firstName || user.email?.split("@")[0] || "User"}
                      </span>
                      <ChevronDown className="w-3 h-3 shrink-0 opacity-60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl">
                    <div className="px-3 py-2">
                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                        {user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Account"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-200" data-testid="link-profile">
                        <UserCircle className="w-4 h-4" /> My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2 cursor-pointer text-amber-600 dark:text-amber-400 focus:text-amber-600 dark:focus:text-amber-400"
                      onClick={async () => {
                        await fetch("/api/switch-account", { method: "POST", credentials: "include" });
                        openAuthModal("login");
                      }}
                      data-testid="button-switch-account"
                    >
                      <RefreshCw className="w-4 h-4" /> Switch Account
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                      onClick={() => logout()}
                      data-testid="button-logout"
                    >
                      <LogOut className="w-4 h-4" /> Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <Router />
          </main>
        </div>
      </div>
    </SidebarProvider>
    </WSProvider>
  );
}

function AuthErrorScreen({ type }: { type: "banned" | "removed" }) {
  const isBanned = type === "banned";
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-md w-full text-center space-y-5">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${isBanned ? "bg-amber-100 dark:bg-amber-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
          <ShieldAlert className={`w-8 h-8 ${isBanned ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {isBanned ? "Account Suspended" : "Account Removed"}
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {isBanned
              ? "Your account has been suspended by an administrator. If you believe this is a mistake, please contact support."
              : "Your account has been permanently removed and cannot be used to sign in."}
          </p>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashComplete = useCallback(() => setShowSplash(false), []);
  const { user, isLoading } = useAuth();
  const { isGuest } = useGuest();

  // Check for auth error from login callback
  const authError = new URLSearchParams(window.location.search).get("auth_error");
  if (authError === "banned" || authError === "removed") {
    return <AuthErrorScreen type={authError} />;
  }

  // Show welcome toast after email verification
  const verified = new URLSearchParams(window.location.search).get("verified");
  if (verified === "1" && user) {
    // Clean the URL without reloading
    window.history.replaceState({}, "", "/");
  }

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (isLoading) {
    return (
      <div
        className="relative isolate flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#fff9fc] px-6 text-slate-900 dark:bg-[#090711] dark:text-white"
        role="status"
        aria-live="polite"
        aria-label="Loading Happy Tail"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute left-1/2 top-1/2 h-[min(78vw,34rem)] w-[min(78vw,34rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-300/25 blur-[75px] dark:bg-fuchsia-600/20"
            animate={{ scale: [0.82, 1.08, 0.92, 0.82], opacity: [0.45, 0.8, 0.55, 0.45] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -left-20 top-[18%] h-48 w-48 rounded-full bg-rose-200/40 blur-3xl dark:bg-rose-500/10"
            animate={{ x: [0, 30, 0], y: [0, 24, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -right-16 bottom-[14%] h-56 w-56 rounded-full bg-violet-200/40 blur-3xl dark:bg-violet-500/10"
            animate={{ x: [0, -26, 0], y: [0, -22, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((particle) => (
            <motion.span
              key={particle}
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-pink-400/70 shadow-[0_0_14px_rgba(244,114,182,0.65)]"
              animate={{
                x: [Math.cos((particle / 8) * Math.PI * 2) * 75, Math.cos((particle / 8) * Math.PI * 2) * 155],
                y: [Math.sin((particle / 8) * Math.PI * 2) * 75, Math.sin((particle / 8) * Math.PI * 2) * 155],
                opacity: [0, 1, 0],
                scale: [0.5, 1.25, 0.5],
              }}
              transition={{ duration: 2.8, repeat: Infinity, delay: particle * 0.22, ease: "easeInOut" }}
            />
          ))}
        </div>

        <motion.div
          className="relative z-10 flex w-full max-w-sm flex-col items-center text-center"
          initial={{ opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative mb-8 flex h-40 w-40 items-center justify-center">
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 rounded-full border border-pink-300/70 dark:border-fuchsia-300/25"
              animate={{ rotate: 360, scale: [0.96, 1.04, 0.96] }}
              transition={{ rotate: { duration: 12, repeat: Infinity, ease: "linear" }, scale: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
            />
            <motion.div
              aria-hidden="true"
              className="absolute inset-2 rounded-full border border-dashed border-rose-300/70 dark:border-pink-200/20"
              animate={{ rotate: -360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              aria-hidden="true"
              className="absolute inset-5 rounded-full bg-gradient-to-br from-pink-200/70 via-rose-100/30 to-violet-200/60 blur-xl dark:from-pink-500/20 dark:via-rose-400/10 dark:to-violet-500/20"
              animate={{ opacity: [0.55, 1, 0.55], scale: [0.9, 1.08, 0.9] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="relative flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/80 bg-white/75 shadow-[0_16px_55px_rgba(236,72,153,0.22)] backdrop-blur-xl dark:border-white/10 dark:bg-white/10 dark:shadow-[0_16px_55px_rgba(217,70,239,0.16)]"
              animate={{ y: [0, -7, 0], rotate: [0, -2, 2, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <img
                src={logoImg}
                alt="Happy Tail"
                className="h-[4.5rem] w-[4.5rem] rounded-[1.35rem] object-cover"
                style={{ mixBlendMode: "multiply" }}
              />
            </motion.div>
            <motion.span
              aria-hidden="true"
              className="absolute -right-0.5 top-5 text-xl drop-shadow-sm"
              animate={{ y: [0, -8, 0], rotate: [0, 12, 0], scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
            >✦</motion.span>
            <motion.span
              aria-hidden="true"
              className="absolute bottom-4 -left-1 text-lg text-pink-500"
              animate={{ y: [0, 7, 0], rotate: [0, -15, 0], opacity: [0.55, 1, 0.55] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            >♥</motion.span>
          </div>

          <motion.p
            className="text-[0.68rem] font-bold uppercase tracking-[0.38em] text-pink-600 dark:text-pink-300"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.5 }}
          >
            TECH FOR PAWS
          </motion.p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-800 dark:text-white">
            Happy <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-violet-500 bg-clip-text text-transparent">Tail</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            A little love is on its way.
          </p>

          <div className="mt-9 w-48">
            <div className="h-1.5 overflow-hidden rounded-full bg-pink-100/90 dark:bg-white/10">
              <motion.div
                className="h-full w-2/5 rounded-full bg-gradient-to-r from-pink-500 via-rose-400 to-violet-500 shadow-[0_0_16px_rgba(236,72,153,0.45)]"
                animate={{ x: ["-110%", "260%"] }}
                transition={{ duration: 1.55, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <motion.p
              className="mt-3 text-[0.7rem] font-medium tracking-[0.18em] text-slate-400 dark:text-slate-500"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              GETTING THINGS READY
            </motion.p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Legal pages must remain publicly accessible before sign-in, including from the consent links.
  if (!user && !isGuest && (window.location.pathname === "/privacy" || window.location.pathname === "/terms")) {
    return <Router />;
  }

  if (!user && !isGuest) {
    return <Landing />;
  }

  return (
    <>
      <AuthenticatedApp />
      <LoginPromptModal />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <GuestProvider>
            <AuthModalProvider>
              <AppContent />
            </AuthModalProvider>
          </GuestProvider>
        </LanguageProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
