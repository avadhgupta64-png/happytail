import { motion } from "framer-motion";
import { ShieldCheck, Linkedin, Instagram, Heart, Camera, MessageSquare, Stethoscope, UtensilsCrossed, MapPin, Users, BookOpen, Bot, TriangleAlert } from "lucide-react";
import founderImg from "@assets/Passport_Size_Photo_1775645573471.jpg";
import logoImg from "@assets/IMG-20260210-WA0048_1770744211559.jpg";

const features = [
  {
    icon: Camera,
    title: "Emotion Detector",
    desc: "Upload a photo of your dog and our AI instantly reads their emotional state — happiness, anxiety, excitement, fear, and more — by analysing facial cues, ear position, and body posture.",
    color: "text-sky-500",
    bg: "bg-sky-500/10",
  },
  {
    icon: MessageSquare,
    title: "Bark Translator",
    desc: "Record a short video of your dog barking or playing. The AI extracts frames, analyses body language across multiple moments, and tells you exactly what your dog is trying to communicate.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Stethoscope,
    title: "AI Health Scanner",
    desc: "Describe or photograph a visible symptom and get an instant AI assessment — possible conditions, home remedies, and a clear flag if an emergency vet visit is needed.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    icon: UtensilsCrossed,
    title: "Diet Planner",
    desc: "Enter your dog's breed, age, weight, and health goals. The AI generates a complete personalised diet plan with daily calorie targets, meal timings, safe foods, and water intake.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Bot,
    title: "Vet Chat",
    desc: "Chat with an AI vet assistant any time of the day. Ask anything about your dog's behaviour, health, grooming, training, or general care and get expert-level guidance instantly.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    icon: MapPin,
    title: "Nearby Places",
    desc: "Discover dog-friendly parks, pet stores, vet clinics, and grooming centres near you — all on an interactive map tailored for dog owners.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: BookOpen,
    title: "Breed Guide",
    desc: "Explore detailed profiles of dog breeds with temperament traits, care guides, exercise needs, and health information to help you understand and raise your dog better.",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  {
    icon: Users,
    title: "Community",
    desc: "Connect with fellow dog lovers — share stories, ask questions, post photos, and support each other in a safe and friendly community built around a love for dogs.",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
];

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto space-y-10 pb-16"
    >
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 p-8 text-center shadow-2xl"
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #a855f7 0%, transparent 50%), radial-gradient(circle at 80% 20%, #6366f1 0%, transparent 40%)" }}
        />
        <img src={logoImg} alt="Happy Tail" className="w-16 h-16 mx-auto rounded-2xl shadow-xl mb-4 border-2 border-white/20" />
        <p className="text-xs font-bold tracking-[0.3em] text-purple-300 uppercase mb-2">Happy Tail Presents</p>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3 leading-tight">
          VOICE for the<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-pink-400">VOICELESS</span>
        </h1>
        <p className="text-purple-200/80 text-base max-w-lg mx-auto leading-relaxed">
          Because your dog can't tell you when they're hurting, scared, or just really, really happy — but now, they don't have to.
        </p>
      </motion.div>

      {/* Verification Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-start gap-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5"
      >
        <div className="shrink-0 w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-emerald-800 dark:text-emerald-300 text-base mb-1">
            Verified & Professionally Reviewed
          </h2>
          <p className="text-emerald-700 dark:text-emerald-400 text-sm leading-relaxed">
            The AI models and health information used in Happy Tail have been reviewed and validated by professional veterinarians. Every feature — from emotion detection to health scanning — has been tested to ensure accuracy, reliability, and the safety of your dog.
          </p>
        </div>
      </motion.div>

      {/* Medical Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-start gap-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-5"
      >
        <div className="shrink-0 w-12 h-12 rounded-xl bg-amber-400 flex items-center justify-center shadow-lg">
          <TriangleAlert className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-amber-800 dark:text-amber-300 text-base mb-1">
            Important — For the Safety of Your Dog
          </h2>
          <p className="text-amber-700 dark:text-amber-400 text-sm leading-relaxed">
            Happy Tail is an AI-powered companion tool designed to guide and inform. However, for serious health concerns, emergencies, or any medical decisions regarding your dog, you <strong>must consult a qualified, licensed veterinarian</strong>. AI cannot replace professional medical advice.
          </p>
        </div>
      </motion.div>

      {/* About the App */}
      <section>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">About Happy Tail</h2>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          Happy Tail is an AI-powered dog care companion built to bridge the communication gap between dogs and their owners. Using cutting-edge computer vision and large language models, Happy Tail gives every dog owner the power to understand, care for, and advocate for their pet — no experience required. Whether you're a first-time dog owner or a lifelong pet lover, Happy Tail puts professional-level insights in your pocket.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex gap-3"
            >
              <div className={`${f.bg} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Founder Section */}
      <section>
        <h2 className="text-2xl font-display font-bold text-foreground mb-6">Meet the Founder</h2>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-100 dark:border-indigo-900 rounded-3xl p-6 md:p-8"
        >
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <div className="shrink-0 text-center">
              <img
                src={founderImg}
                alt="Avadh Gupta — Founder of Happy Tail"
                className="w-32 h-40 object-cover rounded-2xl shadow-xl border-4 border-white dark:border-gray-800 mx-auto"
              />
              <div className="mt-3 flex flex-wrap gap-2 justify-center">
                <a
                  href="https://www.linkedin.com/in/avadhgupta"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#0A66C2] hover:bg-[#004182] px-3 py-1.5 rounded-lg transition-colors shadow"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  LinkedIn
                </a>
                <a
                  href="https://www.instagram.com/avxdhgupta/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] hover:opacity-90 px-3 py-1.5 rounded-lg transition-opacity shadow"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  Instagram
                </a>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 shadow-sm mb-3 border border-indigo-100 dark:border-indigo-800">
                <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
                Founder & Developer
              </div>

              <h3 className="text-2xl font-display font-bold text-foreground mb-1">Avadh Gupta</h3>
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-4">
                Student · Innovator · Dog Advocate · Age 14
              </p>

              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                At just <strong className="text-foreground">14 years old</strong>, Avadh Gupta conceptualised and built Happy Tail from the ground up — entirely on his own — as part of the prestigious <strong className="text-foreground">Impact Summit 2026</strong>. Driven by a deep love for dogs and a belief that every animal deserves to be heard and cared for, Avadh set out to create a tool that gives a voice to the voiceless.
              </p>

              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                A student at <strong className="text-foreground">Bhai Parmanand Vidya Mandir School</strong>, Avadh combines his passion for technology and animal welfare to build meaningful solutions that make a real difference. Happy Tail is his way of proving that age is never a barrier to impact.
              </p>

              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {["Impact Summit 2026", "Age 14", "BPVM School", "AI & Dog Welfare", "Youth Innovator"].map(tag => (
                  <span key={tag} className="text-xs bg-white dark:bg-gray-800 border border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-full font-medium shadow-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer note */}
      <div className="text-center text-xs text-muted-foreground pt-2 pb-4">
        <p>Made with <Heart className="inline w-3 h-3 text-pink-500 fill-pink-500 mx-0.5" /> for every dog that deserves to be understood.</p>
        <p className="mt-1 opacity-60">Happy Tail © 2026 · Built by Avadh Gupta</p>
      </div>
    </motion.div>
  );
}
