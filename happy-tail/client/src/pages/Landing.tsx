import { motion } from "framer-motion";
import { Camera, HeartPulse, MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import logoImg from "@assets/IMG-20260210-WA0048_1770744211559.jpg";
import { useQuery } from "@tanstack/react-query";
import { useGuest } from "@/lib/guest-context";
import { useAuthModal } from "@/lib/auth-modal-context";

export default function Landing() {
  const { t } = useLanguage();
  const { enterGuestMode } = useGuest();
  const { openAuthModal } = useAuthModal();
  const { data: visitorData } = useQuery<{ count: number }>({
    queryKey: ["/api/visitors/count"],
  });

  const features = [
    { icon: Camera, title: t.features.emotionDetector, desc: t.features.emotionDetectorDesc, gradient: "from-sky-400 to-blue-600" },
    { icon: MessageSquare, title: t.features.barkTranslator, desc: t.features.barkTranslatorDesc, gradient: "from-amber-400 to-orange-600" },
    { icon: HeartPulse, title: t.features.dogHealth, desc: t.features.dogHealthDesc, gradient: "from-emerald-400 to-green-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex items-center justify-center p-6">
      <main className="w-full max-w-lg">
        <section className="relative">
          <div className="relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="mb-8">
                <img src={logoImg} alt="Happy Tail" className="w-24 h-24 mx-auto rounded-3xl shadow-2xl mb-6 border-4 border-white/10" />
                <h1 className="text-5xl font-display font-bold text-white mb-4 tracking-tight">
                  Happy Tail
                </h1>
                <p className="text-purple-200/80 text-lg mb-8 font-medium">
                  Your AI-powered dog care companion
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  size="lg"
                  className="w-full py-7 text-xl font-bold bg-white text-indigo-900 hover:bg-purple-100 shadow-2xl hover:scale-105 transition-all rounded-2xl"
                  onClick={() => openAuthModal("login")}
                  data-testid="button-get-started"
                >
                  Login to Continue <ArrowRight className="w-6 h-6 ml-2" />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="w-full py-6 text-base font-semibold text-indigo-900 border-white/30 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
                  onClick={() => openAuthModal("register")}
                  data-testid="button-create-account"
                >
                  Create a Free Account
                </Button>

                <Button
                  size="lg"
                  variant="ghost"
                  className="w-full py-6 text-base font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-2xl border border-white/20 transition-all"
                  onClick={enterGuestMode}
                  data-testid="button-skip-login"
                >
                  Try without signing in
                </Button>

                <p className="text-white/30 text-xs pt-2">
                  Browse the app freely • AI features require login
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
