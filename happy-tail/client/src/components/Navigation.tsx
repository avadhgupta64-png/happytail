import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Dog, MapPin, Activity, ShieldAlert, Home, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import logoImg from "@assets/IMG-20260210-WA0048_1770744211559.jpg";
import { useLanguage } from "@/lib/language-context";

export function Navigation() {
  const [location] = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { href: "/", icon: Home, label: t.nav.home },
    { href: "/detector", icon: Camera, label: t.nav.emotionDetector },
    { href: "/breeds", icon: Dog, label: t.nav.breedGuide },
    { href: "/locations", icon: MapPin, label: t.nav.places },
    { href: "/emergency", icon: ShieldAlert, label: t.nav.emergency, variant: "danger" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-64 fixed h-full bg-white border-r border-amber-100 p-6 z-50">
        <div className="flex items-center gap-3 mb-10 px-2">
          <img
            src={logoImg}
            alt="Happy Tail Logo"
            className="w-11 h-11 rounded-full object-cover"
            style={{ mixBlendMode: "multiply" }}
            data-testid="img-sidebar-logo"
          />
          <h1 className="text-2xl font-bold text-primary tracking-tight font-display">
            Happy Tail
          </h1>
        </div>

        <div className="space-y-2 flex-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const isDanger = item.variant === "danger";

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-4 px-4 py-3.5 rounded-2xl cursor-pointer transition-all duration-200 group relative overflow-hidden",
                    isActive && !isDanger ? "bg-amber-50 text-primary font-bold shadow-sm" : "text-gray-600 hover:bg-gray-50",
                    isDanger && "mt-4 bg-red-50 text-red-600 hover:bg-red-100 hover:shadow-red-100/50"
                  )}
                >
                  {isActive && !isDanger && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                    />
                  )}
                  <item.icon
                    className={cn(
                      "w-6 h-6 transition-transform group-hover:scale-110 duration-200",
                      isActive && !isDanger && "text-primary",
                      isDanger && "text-red-500"
                    )}
                  />
                  <span className="text-base">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-auto pt-6 border-t border-amber-100">
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-4 rounded-2xl text-center">
            <p className="text-sm font-semibold text-primary mb-1">Daily Tip 🦴</p>
            <p className="text-xs text-gray-600 italic">"Hydration is key! Keep water fresh."</p>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-amber-100 p-2 z-50 pb-safe">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const isDanger = item.variant === "danger";

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-xl cursor-pointer transition-colors",
                    isActive ? "text-primary" : "text-gray-400",
                    isDanger && "text-red-500"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-full transition-all",
                    isActive && "bg-amber-100",
                    isDanger && "bg-red-50"
                  )}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
