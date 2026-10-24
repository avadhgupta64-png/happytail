import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import splashBg from "@/assets/images/splash-bg.png";
import logoImg from "@assets/IMG-20260210-WA0048_1770744211559.jpg";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Give the branded animation enough time to be seen, without delaying startup excessively.
    const timer = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(onComplete, 450);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.025, filter: "blur(8px)" }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[#fff8fc] px-5 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] text-slate-900 dark:bg-[#090711] dark:text-white"
          data-testid="splash-screen"
          role="status"
          aria-live="polite"
          aria-label="Loading Happy Tail"
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <img src={splashBg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20 dark:opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-[#fff5fa]/80 to-[#fff8fc]/95 dark:from-[#090711]/90 dark:via-[#100918]/90 dark:to-[#090711]/95" />
            <motion.div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-[min(130vw,42rem)] w-[min(130vw,42rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-pink-300/20 dark:border-fuchsia-200/10"
              animate={{ rotate: 360, scale: [0.94, 1.04, 0.94], opacity: [0.2, 0.55, 0.2] }}
              transition={{ rotate: { duration: 42, repeat: Infinity, ease: "linear" }, scale: { duration: 7, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 7, repeat: Infinity, ease: "easeInOut" } }}
            />
            <motion.div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-[min(108vw,34rem)] w-[min(108vw,34rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-violet-300/25 dark:border-violet-200/10"
              animate={{ rotate: -360 }}
              transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute left-1/2 top-1/2 h-[min(92vw,28rem)] w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-300/30 blur-[70px] dark:bg-fuchsia-600/20"
              animate={{ scale: [0.82, 1.08, 0.92, 0.82], opacity: [0.45, 0.85, 0.55, 0.45] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -left-20 top-[14%] h-52 w-52 rounded-full bg-rose-200/50 blur-3xl dark:bg-rose-500/10"
              animate={{ x: [0, 28, 0], y: [0, 22, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -right-20 bottom-[12%] h-60 w-60 rounded-full bg-violet-200/50 blur-3xl dark:bg-violet-500/10"
              animate={{ x: [0, -25, 0], y: [0, -22, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            {[0, 1, 2, 3, 4, 5, 6, 7].map((particle) => {
              const angle = (particle / 8) * Math.PI * 2;
              return (
                <motion.span
                  key={particle}
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-pink-400/80 shadow-[0_0_14px_rgba(244,114,182,0.7)]"
                  animate={{
                    x: [Math.cos(angle) * 48, Math.cos(angle) * 128],
                    y: [Math.sin(angle) * 48, Math.sin(angle) * 128],
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.2, 0.5],
                  }}
                  transition={{ duration: 2.7, repeat: Infinity, delay: particle * 0.2, ease: "easeInOut" }}
                />
              );
            })}
          </div>

          <motion.div
            className="relative z-10 flex w-full max-w-sm flex-col items-center text-center"
            initial={{ opacity: 0, y: 22, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative mb-8 flex h-52 w-52 items-center justify-center sm:h-56 sm:w-56">
              <motion.div
                aria-hidden="true"
                className="absolute inset-0 rounded-full border border-pink-300/80 shadow-[0_0_35px_rgba(236,72,153,0.12)] dark:border-fuchsia-300/30"
                animate={{ rotate: 360, scale: [0.96, 1.04, 0.96] }}
                transition={{ rotate: { duration: 12, repeat: Infinity, ease: "linear" }, scale: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
              />
              <motion.div
                aria-hidden="true"
                className="absolute inset-3 rounded-full border border-dashed border-rose-300/80 dark:border-pink-200/25"
                animate={{ rotate: -360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                aria-hidden="true"
                className="absolute inset-7 rounded-full bg-gradient-to-br from-pink-200/80 via-rose-100/40 to-violet-200/80 blur-2xl dark:from-pink-500/25 dark:via-rose-400/10 dark:to-violet-500/25"
                animate={{ opacity: [0.55, 1, 0.55], scale: [0.88, 1.1, 0.88] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="relative flex h-32 w-32 items-center justify-center rounded-[2.4rem] border border-white/90 bg-white/85 shadow-[0_22px_75px_rgba(236,72,153,0.32)] backdrop-blur-xl dark:border-white/10 dark:bg-white/10 dark:shadow-[0_22px_75px_rgba(217,70,239,0.25)] sm:h-36 sm:w-36"
                animate={{ y: [0, -7, 0], rotate: [0, -2, 2, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <motion.img
                  src={logoImg}
                  alt="Happy Tail"
                  className="h-28 w-28 rounded-[1.85rem] object-cover sm:h-32 sm:w-32"
                  style={{ mixBlendMode: "multiply" }}
                  animate={{ scale: [0.97, 1.03, 0.97] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
              <motion.span
                aria-hidden="true"
                className="absolute right-0 top-5 text-2xl text-pink-500 drop-shadow-sm"
                animate={{ y: [0, -9, 0], rotate: [0, 14, 0], scale: [0.9, 1.15, 0.9] }}
                transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
              >✦</motion.span>
              <motion.span
                aria-hidden="true"
                className="absolute bottom-4 left-0 text-xl text-rose-500"
                animate={{ y: [0, 7, 0], rotate: [0, -15, 0], opacity: [0.55, 1, 0.55] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              >♥</motion.span>
            </div>

            <motion.div
              aria-hidden="true"
              className="mb-4 flex items-center gap-2 rounded-full border border-pink-200/80 bg-white/65 px-4 py-2 text-[0.62rem] font-bold uppercase tracking-[0.24em] text-pink-600 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-white/5 dark:text-pink-200"
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.12, duration: 0.5 }}
            >
              <motion.span
                className="h-1.5 w-1.5 rounded-full bg-pink-500"
                animate={{ opacity: [0.35, 1, 0.35], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
              />
              Made with love for every paw
            </motion.div>

            <motion.p
              className="text-[0.68rem] font-bold uppercase tracking-[0.4em] text-pink-600 dark:text-pink-300"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.55 }}
            >TECH FOR PAWS</motion.p>
            <motion.h1
              className="mt-2 text-4xl font-bold tracking-tight text-slate-800 dark:text-white"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
            >
              Happy <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-violet-500 bg-clip-text text-transparent">Tail</span>
            </motion.h1>
            <motion.p
              className="mt-3 text-sm text-slate-500 dark:text-slate-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >Your pet's happier world starts here.</motion.p>

            <motion.div
              className="mt-9 w-48"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.5 }}
            >
              <div className="h-1.5 overflow-hidden rounded-full bg-pink-100/90 dark:bg-white/10">
                <motion.div
                  className="h-full w-2/5 rounded-full bg-gradient-to-r from-pink-500 via-rose-400 to-violet-500 shadow-[0_0_16px_rgba(236,72,153,0.5)]"
                  animate={{ x: ["-110%", "260%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <motion.p
                className="mt-3 text-[0.7rem] font-semibold tracking-[0.2em] text-slate-400 dark:text-slate-500"
                animate={{ opacity: [0.55, 1, 0.55] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >GETTING THINGS READY</motion.p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
