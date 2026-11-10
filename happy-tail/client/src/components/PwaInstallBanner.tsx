import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import logoImg from "@assets/logo_transparent.png";

export function PwaInstallBanner() {
  const { canInstall, install, dismiss } = usePwaInstall();

  return (
    <AnimatePresence>
      {canInstall && (
        <motion.div
          key="pwa-banner"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 z-[200] mx-auto max-w-sm"
          role="alert"
          aria-label="Install Happy Tail app"
        >
          <div className="flex items-center gap-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl px-4 py-3">
            {/* App logo — no background, no border-radius clipping */}
            <img
              src={logoImg}
              alt="Happy Tail"
              className="shrink-0 h-14 w-14 object-contain bg-transparent"
            />

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">
                Install Happy Tail
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
                Add to home screen for the full app experience
              </p>
            </div>

            {/* Install button */}
            <button
              onClick={install}
              className="shrink-0 flex items-center gap-1.5 rounded-xl bg-primary hover:bg-primary/90 active:bg-primary/80 px-3 py-2 text-xs font-bold text-white transition-colors"
              aria-label="Install app"
            >
              <Download className="h-3.5 w-3.5" />
              Install
            </button>

            {/* Dismiss */}
            <button
              onClick={dismiss}
              className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label="Dismiss install banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
