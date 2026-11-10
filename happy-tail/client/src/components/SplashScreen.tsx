import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoImg from "@assets/logo.png";
import splashBg from "@/assets/images/splash-bg.png";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(onComplete, 500);
    }, 2800);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6"
          data-testid="splash-screen"
          role="status"
          aria-live="polite"
          aria-label="Loading Happy Tail"
        >
          <div className="absolute inset-0">
            <img src={splashBg} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-purple-900/15 to-indigo-950/35" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-6 text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="relative"
            >
              <motion.div
                className="absolute -inset-4 rounded-[2rem] border border-white/30"
                animate={{ rotate: 360, scale: [1, 1.06, 1] }}
                transition={{ rotate: { duration: 18, repeat: Infinity, ease: "linear" }, scale: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } }}
              />
              <img
                src={logoImg}
                alt="Happy Tail Logo"
                className="relative h-28 w-28 rounded-3xl object-contain shadow-2xl"
                data-testid="img-splash-logo"
              />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.55 }}
            >
              <h1 className="text-4xl font-display font-bold tracking-tight text-white drop-shadow-lg">
                Happy Tail
              </h1>
            </motion.div>

            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.75, duration: 0.55 }}
              className="text-sm font-semibold uppercase tracking-[0.2em] text-white/90 drop-shadow"
            >
              Tech for Paws · Care for Life
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.4 }}
              className="mt-5"
            >
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.75)]"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.45, 1, 0.45] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
