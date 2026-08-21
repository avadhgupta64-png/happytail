import { useState, useCallback } from "react";
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

function AppSidebar() {
  const [location] = useLocation();
  const { t } = useLanguage();

  const { data: adminCheck } = useQuery({
    queryKey: ["/api/admin/check"],
    queryFn: async () => {
      const res = await fetch("/api/admin/check", { credentials: "include" });
      return res.json();
    },
  });

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
      <Route component={NotFound} />
    </Switch>
  );
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
              <SidebarTrigger data-testid="button-sidebar-toggle" />
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

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <img src={logoImg} alt="Happy Tail" className="w-12 h-12 rounded-xl" style={{ mixBlendMode: "multiply" }} />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
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
