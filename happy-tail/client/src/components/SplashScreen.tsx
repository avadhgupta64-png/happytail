import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoImg from "@assets/IMG-20260210-WA0048_1770744211559.jpg";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(onComplete, 380);
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.main
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.015, filter: "blur(5px)" }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#08090d] px-6 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] text-white"
          data-testid="splash-screen"
          role="status"
          aria-live="polite"
          aria-label="Loading Happy Tail"
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(236,72,153,0.11),transparent_38%),radial-gradient(ellipse_at_85%_85%,rgba(99,102,241,0.07),transparent_34%)]" />
            <div className="absolute inset-0 opacity-[0.13] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]" />
            <motion.div
              aria-hidden="true"
              className="absolute left-1/2 top-[42%] h-[min(75vw,25rem)] w-[min(75vw,25rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07]"
              animate={{ rotate: 360 }}
              transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              aria-hidden="true"
              className="absolute left-1/2 top-[42%] h-[min(62vw,20rem)] w-[min(62vw,20rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-pink-300/[0.12]"
              animate={{ rotate: -360 }}
              transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              aria-hidden="true"
              className="absolute left-1/2 top-[42%] h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/[0.09] blur-[70px]"
              animate={{ scale: [0.85, 1.12, 0.85], opacity: [0.55, 0.9, 0.55] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
            />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <motion.span
                key={i}
                aria-hidden="true"
                className="absolute left-1/2 top-[42%] h-1 w-1 rounded-full bg-pink-200/70"
                animate={{
                  x: [Math.cos((i / 6) * Math.PI * 2) * 100, Math.cos((i / 6) * Math.PI * 2) * 145],
                  y: [Math.sin((i / 6) * Math.PI * 2) * 100, Math.sin((i / 6) * Math.PI * 2) * 145],
                  opacity: [0, 0.65, 0],
                }}
                transition={{ duration: 3.4, repeat: Infinity, delay: i * 0.45, ease: "easeInOut" }}
              />
            ))}
          </div>

          <motion.div
            className="relative z-10 flex w-full max-w-sm flex-col items-center text-center"
            initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative mb-10 flex h-48 w-48 items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full border border-white/[0.10]"
                animate={{ rotate: 360 }}
                transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
              >
                <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-300 shadow-[0_0_12px_rgba(244,114,182,0.9)]" />
              </motion.div>
              <motion.div
                aria-hidden="true"
                className="absolute inset-3 rounded-full border border-pink-200/[0.12]"
                animate={{ scale: [1, 1.07, 1], opacity: [0.35, 0.8, 0.35] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                aria-hidden="true"
                className="absolute -inset-3 rounded-full border border-white/[0.035]"
                animate={{ rotate: -360 }}
                transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="relative flex h-24 w-24 items-center justify-center rounded-[1.8rem] border border-white/[0.16] bg-[#101116]/90 shadow-[0_0_90px_rgba(236,72,153,0.17),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <img
                  src={logoImg}
                  alt="Happy Tail"
                  className="h-[4.5rem] w-[4.5rem] rounded-[1.25rem] object-cover"
                  style={{
                    mixBlendMode: "normal",
                    filter: "saturate(1.4) contrast(1.06)",
                    boxShadow: "0 0 28px rgba(236,72,153,0.28)",
                  }}
                />
              </motion.div>
            </div>

            <motion.p
              className="text-[0.62rem] font-semibold uppercase tracking-[0.48em] text-white/45"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.22, duration: 0.5 }}
            >A NEW STANDARD IN PET CARE</motion.p>

            <motion.h1
              className="mt-4 text-[2.65rem] font-semibold tracking-[-0.075em] text-white [text-shadow:0_0_32px_rgba(255,255,255,0.08)]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              happy<span className="font-light text-pink-300">tail</span>
              <span className="ml-1 align-top text-sm font-medium tracking-normal text-pink-300">®</span>
            </motion.h1>

            <motion.p
              className="mt-2 text-sm font-light tracking-wide text-white/45"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.48, duration: 0.5 }}
            >Built different. Made for the bond.</motion.p>

            <motion.div
              className="mt-12 w-44"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.5 }}
            >
              <div className="h-px w-full overflow-hidden bg-white/[0.12]">
                <motion.div
                  className="h-full w-1/3 bg-gradient-to-r from-transparent via-pink-300 to-transparent"
                  animate={{ x: ["-110%", "330%"] }}
                  transition={{ duration: 1.35, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <div className="mt-4 flex items-center justify-between text-[0.55rem] font-medium uppercase tracking-[0.22em] text-white/30">
                <span>Initializing</span>
                <motion.span
                  className="font-mono text-pink-200/60"
                  animate={{ opacity: [0.35, 1, 0.35] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                >● LIVE</motion.span>
              </div>
            </motion.div>
          </motion.div>

          <div className="absolute bottom-7 left-6 right-6 flex items-center justify-between">
            <p className="text-[0.52rem] font-medium uppercase tracking-[0.24em] text-white/20">HAPPY TAIL®</p>
            <p className="font-mono text-[0.52rem] tracking-[0.18em] text-white/20">SECURE • SMART • SIMPLE</p>
          </div>
        </motion.main>
      )}
    </AnimatePresence>
  );
}
