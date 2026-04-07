import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGuest } from "@/lib/guest-context";

export function LoginPromptModal() {
  const { showLoginPrompt, exitGuestMode } = useGuest();

  if (!showLoginPrompt) return null;

  const handleLogin = () => {
    exitGuestMode();
    window.location.href = "/api/login";
  };

  return (
    <AnimatePresence>
      {showLoginPrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 max-w-sm w-full"
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-2xl font-bold font-display text-foreground mb-2">
                Login required
              </h2>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                AI features require a free account. Log in to unlock all features, save your results, and get personalized insights for your dog.
              </p>

              <Button
                size="lg"
                className="w-full py-6 text-base font-bold rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg"
                onClick={handleLogin}
              >
                <LogIn className="w-5 h-5 mr-2" />
                Log In to Continue
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
