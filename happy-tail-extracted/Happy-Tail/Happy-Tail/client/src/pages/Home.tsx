import { motion } from "framer-motion";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Camera, MapPin, HeartPulse, ShieldAlert, MessageSquare, ArrowRight, BookOpen, Users, PawPrint } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { useWS } from "@/lib/ws-context";
import logoImg from "@assets/IMG-20260210-WA0048_1770744211559.jpg";

const topFeatures = [
  {
    title: "Emotion Detector",
    desc: "Snap a photo. AI reads what your dog is truly feeling.",
    icon: Camera,
    href: "/detector",
    gradient: "from-sky-400 to-blue-600",
    shadow: "shadow-blue-500/20",
    img: "https://images.unsplash.com/photo-1560807707-8cc77767d783?q=80&w=400&auto=format&fit=crop",
  },
  {
    title: "Bark Translator",
    desc: "Record your dog. Get a full body language breakdown.",
    icon: MessageSquare,
    href: "/bark-translator",
    gradient: "from-amber-400 to-orange-600",
    shadow: "shadow-orange-500/20",
    img: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?q=80&w=400&auto=format&fit=crop",
  },
  {
    title: "Dog Health",
    desc: "Health scan, AI diet planner, and vet chat — all in one place.",
    icon: HeartPulse,
    href: "/health",
    gradient: "from-emerald-400 to-green-600",
    shadow: "shadow-green-500/20",
    img: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=400&auto=format&fit=crop",
  },
];

const bottomFeatures = [
  {
    title: "Breed Guide",
    desc: "50+ breeds with detailed care & diet info.",
    icon: BookOpen,
    href: "/breeds",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    title: "Places in Delhi",
    desc: "Parks, cafes, vets — all dog-friendly.",
    icon: MapPin,
    href: "/locations",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    title: "Community",
    desc: "15+ WhatsApp groups for dog owners.",
    icon: Users,
    href: "/community",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    title: "Emergency",
    desc: "One-tap access to nearest vets.",
    icon: ShieldAlert,
    href: "/emergency",
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
];

export default function Home() {
  const { t } = useLanguage();
  const { onlineCount } = useWS();
  const { data: visitorData } = useQuery<{ count: number }>({
    queryKey: ["/api/visitors/count"],
  });

  return (
    <div className="space-y-10" data-testid="home-page">
      <div className="relative -mx-4 -mt-4 md:-mx-6 md:-mt-6 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=2070&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28 lg:pt-28 lg:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden ring-2 ring-white/20 mb-6 shadow-2xl"
            >
              <img
                src={logoImg}
                alt="Happy Tail"
                className="w-full h-full object-cover"
                style={{ mixBlendMode: "multiply" }}
                data-testid="img-hero-logo"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mb-6"
            >
              <PawPrint className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400/90 text-xs font-bold uppercase tracking-[0.2em]" data-testid="text-welcome-badge">
                Happy Tail
              </span>
              <PawPrint className="w-3.5 h-3.5 text-amber-400" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-display font-bold !text-white leading-[1.1] mb-5 max-w-3xl"
              data-testid="text-hero-title"
            >
              {t.home.heroTitle1}
              <br />
              <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-amber-400 bg-clip-text text-transparent">{t.home.heroTitle2}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-white/90 text-base md:text-lg max-w-lg leading-relaxed"
              data-testid="text-hero-description"
            >
              {t.home.heroDesc}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-3"
            >
              {onlineCount > 0 && (
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2" data-testid="badge-online-count">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white/90 text-sm">
                    <strong className="text-white">{onlineCount}</strong> online now
                  </span>
                </div>
              )}
              {visitorData && visitorData.count > 0 && (
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2" data-testid="badge-visitor-count">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-white/90 text-sm">
                    <strong className="text-white">{visitorData.count}</strong> {t.common.visitors}
                  </span>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topFeatures.map((feature, idx) => (
            <Link key={feature.title} href={feature.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + idx * 0.08 }}
                className={`group relative rounded-md overflow-hidden cursor-pointer shadow-xl ${feature.shadow} hover:-translate-y-1 transition-all duration-300`}
                data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="absolute inset-0">
                  <img src={feature.img} alt="" className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${feature.gradient} opacity-80`} />
                </div>

                <div className="relative z-10 p-6 pb-7 flex flex-col h-full min-h-[200px] justify-end">
                  <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-1">
                    {feature.title === "Emotion Detector" ? t.features.emotionDetector : 
                     feature.title === "Bark Translator" ? t.features.barkTranslator : 
                     t.features.dogHealth}
                  </h3>
                  <p className="text-white/90 text-sm leading-relaxed mb-3">
                    {feature.title === "Emotion Detector" ? t.features.emotionDetectorDesc : 
                     feature.title === "Bark Translator" ? t.features.barkTranslatorDesc : 
                     t.features.dogHealthDesc}
                  </p>
                  <div className="flex items-center text-[11px] font-bold text-white/70 group-hover:text-white transition-colors uppercase tracking-wider">
                    {t.home.tryNow} <ArrowRight className="w-3 h-3 ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {bottomFeatures.map((feature, idx) => (
            <Link key={feature.title} href={feature.href}>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.06 }}
                className="group cursor-pointer rounded-md border border-border bg-card p-4 hover-elevate transition-all h-full"
                data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className={`w-9 h-9 rounded-md ${feature.bg} flex items-center justify-center mb-3`}>
                  <feature.icon className={`w-4 h-4 ${feature.color}`} />
                </div>
                <h3 className="font-bold text-foreground text-sm mb-0.5">
                  {feature.title === "Breed Guide" ? t.features.breedGuide : 
                   feature.title === "Places in Delhi" ? t.features.places : 
                   feature.title === "Community" ? t.features.community : 
                   t.features.emergency}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {feature.title === "Breed Guide" ? t.features.breedGuideDesc : 
                   feature.title === "Places in Delhi" ? t.features.placesDesc : 
                   feature.title === "Community" ? t.features.communityDesc : 
                   t.features.emergencyDesc}
                </p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
