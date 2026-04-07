import { motion } from "framer-motion";
import { Link } from "wouter";
import { Stethoscope, UtensilsCrossed, MessageCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/lib/language-context";

export default function HealthHub() {
  const { t } = useLanguage();

  const subFeatures = [
    {
      title: t.health.healthScan,
      desc: t.features.dogHealthDesc,
      icon: Stethoscope,
      href: "/health/scan",
      gradient: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/20",
      img: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=400&auto=format&fit=crop",
    },
    {
      title: t.health.dietPlanner,
      desc: t.dietPlanner.subtitle,
      icon: UtensilsCrossed,
      href: "/health/diet",
      gradient: "from-amber-500 to-orange-600",
      shadow: "shadow-amber-500/20",
      img: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=400&auto=format&fit=crop",
    },
    {
      title: t.health.vetChat,
      desc: t.vetChat.subtitle,
      icon: MessageCircle,
      href: "/health/chat",
      gradient: "from-blue-500 to-indigo-600",
      shadow: "shadow-blue-500/20",
      img: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?q=80&w=400&auto=format&fit=crop",
    },
  ];
  return (
    <div className="max-w-4xl mx-auto" data-testid="health-hub-page">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          AI-Powered
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3" data-testid="text-health-hub-title">
          {t.health.title}
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto" data-testid="text-health-hub-desc">
          {t.features.dogHealthDesc}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {subFeatures.map((feature, idx) => (
          <Link key={feature.title} href={feature.href}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.1 }}
              className={`group relative rounded-md overflow-hidden cursor-pointer shadow-xl ${feature.shadow} hover:-translate-y-1 transition-all duration-300 h-full`}
              data-testid={`card-health-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="absolute inset-0">
                <img src={feature.img} alt="" className="w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-t ${feature.gradient} opacity-85`} />
              </div>

              <div className="relative z-10 p-6 flex flex-col h-full min-h-[260px] justify-end">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-white text-xl mb-2">{feature.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-4">{feature.desc}</p>
                <div className="flex items-center text-xs font-bold text-white/50 group-hover:text-white transition-colors uppercase tracking-wider">
                  Open <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/15 rounded-md p-4 text-center"
      >
        <p className="text-xs text-muted-foreground">
          These AI tools are for informational purposes only and do not replace professional veterinary care. Always consult your vet for serious health concerns.
        </p>
      </motion.div>
    </div>
  );
}
