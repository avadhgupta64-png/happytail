import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, RefreshCcw, Sparkles, AlertCircle, Loader2, Upload, Clock,
  Dog, Heart, XCircle, Video, Brain, Activity, Zap, Shield, ChevronRight,
} from "lucide-react";
import CameraCapture, { type CaptureResult } from "@/components/CameraCapture";
import { UnauthorizedError, apiRequest } from "@/lib/queryClient";
import { PageHeader } from "@/components/PageHeader";
import { useAnalyzeEmotion, useEmotionHistory } from "@/hooks/use-emotions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";
import { useGuest } from "@/lib/guest-context";
import { useMutation } from "@tanstack/react-query";
import { AIUsageCounter } from "@/components/AIUsageCounter";
import { AIUsageLimitRequest } from "@/components/AIUsageLimitRequest";

// ─── Emotion helpers ──────────────────────────────────────────────────────────
const emotionColors: Record<string, string> = {
  Happy:   "bg-green-100  text-green-700  border-green-200",
  Sad:     "bg-blue-100   text-blue-700   border-blue-200",
  Anxious: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Calm:    "bg-teal-100   text-teal-700   border-teal-200",
  Angry:   "bg-red-100    text-red-700    border-red-200",
  Neutral: "bg-gray-100   text-gray-700   border-gray-200",
  Excited: "bg-orange-100 text-orange-700 border-orange-200",
};
function getEmotionStyle(e: string) {
  return emotionColors[e] ?? "bg-gray-100 text-gray-700 border-gray-200";
}
function formatDate(d: string | Date | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
const levelColors: Record<string, string> = {
  Low:    "bg-green-100  text-green-700  border-green-200",
  Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  High:   "bg-red-100    text-red-700    border-red-200",
};
function getLevelStyle(l: string) {
  return levelColors[l] ?? "bg-gray-100 text-gray-700 border-gray-200";
}

// ─── Video frame extractor ────────────────────────────────────────────────────
async function extractFrames(src: string, count = 6): Promise<string[]> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const frames: string[] = [];
    canvas.width = 640;
    canvas.height = 360;
    video.muted = true;
    video.playsInline = true;
    video.src = src;
    video.load();

    video.addEventListener("loadedmetadata", () => {
      const duration = isFinite(video.duration) ? video.duration : 5;
      const interval = duration / count;
      let captured = 0;

      const captureNext = () => {
        if (captured >= count) { resolve(frames); return; }
        video.currentTime = Math.min(captured * interval, duration - 0.05);
      };

      video.addEventListener("seeked", () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        frames.push(canvas.toDataURL("image/jpeg", 0.75));
        captured++;
        captureNext();
      });

      captureNext();
    });

    // Fallback if metadata never loads
    video.addEventListener("error", () => resolve(frames));
  });
}

// ─── Expanded history entry ───────────────────────────────────────────────────
function ExpandedScan({ scan, onClose }: { scan: any | null; onClose: () => void }) {
  if (!scan) return null;
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-md overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Dog className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-100">{scan.detectedBreed || "Unknown breed"}</h4>
              <p className="text-xs text-gray-400">{formatDate(scan.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge className={`text-xs border ${getEmotionStyle(scan.detectedEmotion)}`}>
              {scan.detectedEmotion}
            </Badge>
            <Button size="icon" variant="ghost" onClick={onClose} aria-label="Close">
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {scan.mood && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-100 dark:border-amber-800">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">Mood</p>
              <p className="text-sm text-amber-600 dark:text-amber-300">{scan.mood}</p>
            </div>
          )}
          {scan.explanation && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800">
              <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-1">Why</p>
              <p className="text-sm text-blue-600 dark:text-blue-300">{scan.explanation}</p>
            </div>
          )}
          {scan.treatment && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 border border-green-100 dark:border-green-800">
              <p className="text-xs font-bold text-green-700 dark:text-green-400 mb-1">What to do</p>
              <p className="text-sm text-green-600 dark:text-green-300">{scan.treatment}</p>
            </div>
          )}
          {scan.suggestion && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 border border-purple-100 dark:border-purple-800">
              <p className="text-xs font-bold text-purple-700 dark:text-purple-400 mb-1">Quick Tip</p>
              <p className="text-sm text-purple-600 dark:text-purple-300">{scan.suggestion}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Behavior result card ─────────────────────────────────────────────────────
function BehaviorResult({ result, onReset }: { result: any; onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-white dark:bg-gray-900 rounded-[2rem] p-5 sm:p-6 shadow-xl border border-purple-100 dark:border-purple-900 flex flex-col gap-4"
    >
      <div className="text-center">
        <span className="inline-block px-4 py-1 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-sm font-bold mb-3">
          Behavior Analysis
        </span>
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-800 dark:text-gray-100 mb-1">
          {result.overall_mood}
        </h2>
        <p className="text-base sm:text-lg text-primary font-semibold">{result.breed}</p>
      </div>

      <div className="flex gap-3 justify-center flex-wrap">
        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 border border-gray-100 dark:border-gray-700">
          <Shield className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Stress</span>
          <Badge className={`text-xs border ml-1 ${getLevelStyle(result.stress_level)}`}>{result.stress_level}</Badge>
        </div>
        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 border border-gray-100 dark:border-gray-700">
          <Zap className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Energy</span>
          <Badge className={`text-xs border ml-1 ${getLevelStyle(result.energy_level)}`}>{result.energy_level}</Badge>
        </div>
      </div>

      {result.dominant_behaviors?.length > 0 && (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 border border-purple-100 dark:border-purple-800">
          <h3 className="font-bold text-purple-800 dark:text-purple-300 mb-2 flex items-center gap-2 text-sm">
            <Brain className="w-4 h-4" /> Observed Behaviors
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.dominant_behaviors.map((b: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-white dark:bg-gray-800 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold border border-purple-200 dark:border-purple-700">
                {b}
              </span>
            ))}
          </div>
        </div>
      )}

      {result.body_language && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-800">
          <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-2 text-sm">
            <Activity className="w-4 h-4" /> Body Language
          </h3>
          <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">{result.body_language}</p>
        </div>
      )}

      {result.triggers && (
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 border border-amber-100 dark:border-amber-800">
          <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-1 text-sm">Possible Triggers</h3>
          <p className="text-amber-700 dark:text-amber-300 text-sm leading-relaxed">{result.triggers}</p>
        </div>
      )}

      {result.recommendations?.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 border border-green-100 dark:border-green-800">
          <h3 className="font-bold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2 text-sm">
            <Heart className="w-4 h-4" /> Recommendations
          </h3>
          <ul className="space-y-1.5">
            {result.recommendations.map((r: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-green-700 dark:text-green-300">
                <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button className="py-4 rounded-xl bg-gray-900 hover:bg-gray-800 text-white w-full gap-2" onClick={onReset}>
        <RefreshCcw className="w-4 h-4" /> Analyze Another Video
      </Button>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EmotionDetector() {
  const [activeTab, setActiveTab] = useState<"emotion" | "behavior">("emotion");

  // ── Emotion tab state ──
  const emotionFileRef = useRef<HTMLInputElement>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [expandedScan, setExpandedScan] = useState<any | null>(null);
  const { mutate: analyze, isPending, data: result, error, reset: resetMutation } = useAnalyzeEmotion();
  const { data: history } = useEmotionHistory();
  const [showEmotionCamera, setShowEmotionCamera] = useState(false);

  // ── Behavior tab state ──
  const behaviorVideoRef = useRef<HTMLInputElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [behaviorResult, setBehaviorResult] = useState<any | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [showBehaviorCamera, setShowBehaviorCamera] = useState(false);

  const { toast } = useToast();
  const { t } = useLanguage();
  const { checkGuestAccess, setShowLoginPrompt } = useGuest();

  const { mutate: analyzeBehavior, isPending: behaviorPending } = useMutation({
    mutationFn: async (frames: string[]) => {
      const res = await apiRequest("POST", "/api/behavior/analyze", { frames });
      return res.json();
    },
    onSuccess: (data) => setBehaviorResult(data),
    onError: (err: any) => {
      if (err instanceof UnauthorizedError) { setShowLoginPrompt(true); return; }
      toast({ title: "Analysis failed", description: err.message || "Could not analyze behavior.", variant: "destructive" });
    },
  });

  // ── Emotion handlers ──
  const handleEmotionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Unsupported file", description: "Please upload an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload an image under 8 MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => { setImgSrc(reader.result as string); resetMutation(); };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = () => {
    if (!imgSrc) return;
    if (!checkGuestAccess()) return;
    analyze({ image: imgSrc }, {
      onError: (err) => {
        if (err instanceof UnauthorizedError) { setShowLoginPrompt(true); return; }
        toast({ title: "Analysis failed", description: err.message || "Could not analyze the image.", variant: "destructive" });
      },
    });
  };

  const resetEmotion = () => { setImgSrc(null); resetMutation(); };

  const handleEmotionCamera = (r: CaptureResult) => {
    setShowEmotionCamera(false);
    if (r.mode === "photo") { setImgSrc(r.dataUrl); resetMutation(); }
  };

  // ── Behavior handlers ──
  const handleBehaviorFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast({ title: "Unsupported file", description: "Please upload a video file (MP4, MOV, WebM).", variant: "destructive" });
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload a video under 100 MB.", variant: "destructive" });
      return;
    }
    if (videoSrc?.startsWith("blob:")) URL.revokeObjectURL(videoSrc);
    setVideoSrc(URL.createObjectURL(file));
    setBehaviorResult(null);
  };

  const handleBehaviorAnalyze = async () => {
    if (!videoSrc) return;
    if (!checkGuestAccess()) return;
    setExtracting(true);
    try {
      const frames = await extractFrames(videoSrc, 6);
      setExtracting(false);
      if (frames.length === 0) {
        toast({ title: "No frames captured", description: "Could not read the video. Try a different file.", variant: "destructive" });
        return;
      }
      analyzeBehavior(frames);
    } catch {
      setExtracting(false);
      toast({ title: "Could not read video", description: "Please try a different video file.", variant: "destructive" });
    }
  };

  const resetBehavior = () => {
    if (videoSrc?.startsWith("blob:")) URL.revokeObjectURL(videoSrc);
    setVideoSrc(null);
    setBehaviorResult(null);
  };

  const handleBehaviorCamera = (r: CaptureResult) => {
    setShowBehaviorCamera(false);
    if (r.mode === "video") {
      if (videoSrc?.startsWith("blob:")) URL.revokeObjectURL(videoSrc);
      setVideoSrc(r.blobUrl);
      setBehaviorResult(null);
    }
  };

  const isBehaviorBusy = behaviorPending || extracting;

  return (
    <div className="max-w-5xl mx-auto" data-testid="emotion-detector-page">
      {/* Per-tab usage counter — switches featureKey when tab changes */}
      <AIUsageCounter featureKey={activeTab === "behavior" ? "behavior_analysis" : "emotion_scan"} />
      <AIUsageLimitRequest featureKey={activeTab === "behavior" ? "behavior_analysis" : "emotion_scan"} />
      {/* Always-mounted hidden inputs */}
      <input
        ref={emotionFileRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleEmotionFileChange}
        data-testid="input-file-upload"
      />
      <input
        ref={behaviorVideoRef}
        type="file"
        accept="video/*,video/mp4,video/webm,video/quicktime"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleBehaviorFileChange}
        data-testid="input-behavior-video"
      />

      <PageHeader title={t.emotionDetector.title} description={t.emotionDetector.subtitle} />

      {/* Tab switcher */}
      <div className="flex gap-2 mb-6 sm:mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("emotion")}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "emotion"
              ? "bg-white dark:bg-gray-900 text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Camera className="w-4 h-4" /> Emotion
        </button>
        <button
          onClick={() => setActiveTab("behavior")}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "behavior"
              ? "bg-white dark:bg-gray-900 text-purple-600 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Brain className="w-4 h-4" /> Behavior
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* ══ EMOTION TAB ══ */}
        {activeTab === "emotion" && (
          <motion.div
            key="emotion"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Left — image input */}
              <div className="space-y-5">
                <div className="relative rounded-[2rem] overflow-hidden bg-gray-900 shadow-2xl border-4 border-white dark:border-gray-800 ring-1 ring-gray-200 dark:ring-gray-700"
                  style={{ aspectRatio: "4/3" }}>
                  {!imgSrc ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 sm:p-8 text-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                        <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" />
                      </div>
                      <div className="flex flex-col gap-2.5 w-full max-w-[260px]">
                        <Button
                          onClick={() => setShowEmotionCamera(true)}
                          className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-11 flex items-center justify-center gap-2 text-sm"
                          data-testid="button-take-photo"
                        >
                          <Camera className="w-4 h-4 shrink-0" /> Take a Photo
                        </Button>
                        <Button
                          onClick={() => emotionFileRef.current?.click()}
                          variant="outline"
                          className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl h-11 flex items-center justify-center gap-2 text-sm"
                          data-testid="button-upload-photo"
                        >
                          <Upload className="w-4 h-4 shrink-0" /> {t.emotionDetector.uploadPrompt}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={imgSrc}
                      alt="Captured"
                      className="w-full h-full object-cover"
                      data-testid="img-preview"
                    />
                  )}

                  {/* Overlay controls when image is loaded */}
                  {imgSrc && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 bg-gradient-to-t from-black/60 to-transparent flex justify-center gap-3">
                      <button
                        onClick={resetEmotion}
                        className="px-4 py-2.5 bg-white/20 backdrop-blur-md text-white rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2 text-sm"
                        data-testid="button-retake"
                      >
                        <RefreshCcw className="w-4 h-4 shrink-0" /> Retake
                      </button>
                      {!result && (
                        <button
                          onClick={handleAnalyze}
                          disabled={isPending}
                          className="px-4 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-primary/90 transition-all flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          data-testid="button-analyze"
                        >
                          {isPending
                            ? <><Loader2 className="w-4 h-4 animate-spin shrink-0" /> {t.emotionDetector.analyzing}</>
                            : <><Sparkles className="w-4 h-4 shrink-0" /> Analyze</>}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl flex gap-3 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm">{(error as Error).message || "Something went wrong."}</p>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl flex gap-3 border border-blue-100 dark:border-blue-800">
                  <Sparkles className="w-4 h-4 shrink-0 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-1">Best results:</p>
                    <p className="text-xs leading-relaxed text-blue-600 dark:text-blue-400">
                      Clear, front-facing photo of your dog's face in good lighting.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right — results */}
              <div>
                <AnimatePresence mode="wait">
                  {result ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 sm:p-8 shadow-xl border border-amber-100 dark:border-amber-900 flex flex-col"
                      data-testid="emotion-result"
                    >
                      <div className="text-center mb-6">
                        <span className="inline-block px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-sm font-bold mb-3">
                          {t.barkTranslator.results}
                        </span>
                        <h2 className="text-4xl sm:text-5xl font-display font-bold text-gray-800 dark:text-gray-100 mb-1">
                          {result.emotion}
                        </h2>
                        <p className="text-lg sm:text-xl text-primary font-bold mb-0.5">{result.breed}</p>
                        <p className="text-base text-gray-500 dark:text-gray-400 font-medium">{result.mood}</p>
                      </div>

                      <div className="space-y-3 flex-1">
                        <div className="bg-blue-600 dark:bg-blue-700 p-4 rounded-2xl text-white">
                          <h3 className="font-bold mb-1.5 flex items-center gap-2 text-sm">
                            <Sparkles className="w-4 h-4 text-blue-200 shrink-0" /> Quick Tip
                          </h3>
                          <p className="text-blue-50 text-sm leading-relaxed">
                            {result.suggestion || "Ensure your dog has fresh water and a quiet resting place!"}
                          </p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-amber-200 dark:border-amber-800">
                          <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-1.5 flex items-center gap-2 text-sm">
                            <Sparkles className="w-4 h-4 shrink-0" /> Why?
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{result.explanation}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-green-200 dark:border-green-800">
                          <h3 className="font-bold text-green-800 dark:text-green-300 mb-1.5 flex items-center gap-2 text-sm">
                            <Heart className="w-4 h-4 shrink-0" /> What to do?
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{result.treatment}</p>
                        </div>
                      </div>

                      <Button
                        className="mt-6 py-5 rounded-xl bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white w-full gap-2"
                        onClick={resetEmotion}
                        data-testid="button-new-scan"
                      >
                        <RefreshCcw className="w-4 h-4" /> {t.emotionDetector.tryAnother}
                      </Button>
                    </motion.div>
                  ) : (
                    <div className="bg-white dark:bg-gray-900 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center p-8 text-center text-gray-400 min-h-[280px]">
                      <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <Camera className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400 mb-2">{t.emotionDetector.noHistory}</h3>
                      <p className="text-sm">{t.emotionDetector.subtitle}</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* History */}
            {history && history.length > 0 && (
              <div className="mt-12 sm:mt-16" data-testid="recent-scans-section">
                <div className="flex items-center gap-3 mb-5">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-gray-800 dark:text-gray-100">
                    {t.emotionDetector.history}
                  </h3>
                  <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-500 border-none">
                    {history.length}
                  </Badge>
                </div>
                <AnimatePresence>
                  <ExpandedScan scan={expandedScan} onClose={() => setExpandedScan(null)} />
                </AnimatePresence>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {history.slice(0, 12).map((log) => (
                    <motion.button
                      key={log.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => setExpandedScan(log)}
                      className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer text-left"
                    >
                      <Dog className="w-4 h-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 dark:text-gray-100 text-sm truncate max-w-[100px]">
                          {log.detectedBreed || "Unknown breed"}
                        </p>
                        <p className="text-xs text-gray-400">{formatDate(log.createdAt)}</p>
                      </div>
                      <Badge className={`shrink-0 text-xs border ${getEmotionStyle(log.detectedEmotion)}`}>
                        {log.detectedEmotion}
                      </Badge>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ══ BEHAVIOR TAB ══ */}
        {activeTab === "behavior" && (
          <motion.div
            key="behavior"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Left — video input */}
              <div className="space-y-5">
                <div
                  className="relative rounded-[2rem] overflow-hidden bg-gray-900 shadow-2xl border-4 border-white dark:border-gray-800 ring-1 ring-purple-200 dark:ring-purple-900"
                  style={{ aspectRatio: "4/3" }}
                >
                  {!videoSrc ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 sm:p-8 text-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <Video className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" />
                      </div>
                      <p className="text-gray-400 text-sm mb-5 max-w-xs">
                        Upload or record a short video of your dog
                      </p>
                      <div className="flex flex-col gap-2.5 w-full max-w-[260px]">
                        <Button
                          onClick={() => setShowBehaviorCamera(true)}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-11 flex items-center justify-center gap-2 text-sm"
                        >
                          <Video className="w-4 h-4 shrink-0" /> Record a Video
                        </Button>
                        <Button
                          onClick={() => behaviorVideoRef.current?.click()}
                          variant="outline"
                          className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl h-11 flex items-center justify-center gap-2 text-sm"
                        >
                          <Upload className="w-4 h-4 shrink-0" /> Upload Video
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <video
                      key={videoSrc}
                      src={videoSrc}
                      className="w-full h-full object-contain bg-black"
                      controls
                      playsInline
                      muted
                    />
                  )}

                  {/* Overlay controls when video loaded */}
                  {videoSrc && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent flex justify-center gap-3">
                      <button
                        onClick={resetBehavior}
                        className="px-4 py-2.5 bg-white/20 backdrop-blur-md text-white rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2 text-sm"
                      >
                        <RefreshCcw className="w-4 h-4 shrink-0" /> Change
                      </button>
                      {!behaviorResult && (
                        <button
                          onClick={handleBehaviorAnalyze}
                          disabled={isBehaviorBusy}
                          className="px-4 py-2.5 bg-purple-600 text-white rounded-xl font-bold shadow-lg hover:bg-purple-700 transition-all flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isBehaviorBusy
                            ? <><Loader2 className="w-4 h-4 animate-spin shrink-0" /> {extracting ? "Extracting…" : "Analyzing…"}</>
                            : <><Brain className="w-4 h-4 shrink-0" /> Analyze</>}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl border border-purple-100 dark:border-purple-800">
                  <div className="flex gap-3">
                    <Brain className="w-4 h-4 shrink-0 text-purple-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-purple-800 dark:text-purple-300 mb-1">About Behavior Analysis</p>
                      <p className="text-xs leading-relaxed text-purple-700 dark:text-purple-400">
                        Upload any short video — playing, resting, or interacting — and AI will generate a full behavioral report.
                        Works best with 5–30 second clips. Supports MP4, MOV, and WebM.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right — behavior results */}
              <div>
                <AnimatePresence mode="wait">
                  {behaviorResult ? (
                    <BehaviorResult key="result" result={behaviorResult} onReset={resetBehavior} />
                  ) : (
                    <div className="bg-white dark:bg-gray-900 rounded-[2rem] border-2 border-dashed border-purple-200 dark:border-purple-800 flex flex-col items-center justify-center p-8 text-center text-gray-400 min-h-[280px]">
                      <div className="w-20 h-20 bg-purple-50 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                        <Brain className="w-10 h-10 text-purple-200 dark:text-purple-700" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400 mb-2">No Analysis Yet</h3>
                      <p className="text-sm max-w-xs">
                        Upload a video of your dog to get a detailed behavior and body language report.
                      </p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera overlays */}
      {showEmotionCamera && (
        <CameraCapture mode="photo" onCapture={handleEmotionCamera} onClose={() => setShowEmotionCamera(false)} />
      )}
      {showBehaviorCamera && (
        <CameraCapture mode="video" onCapture={handleBehaviorCamera} onClose={() => setShowBehaviorCamera(false)} />
      )}
    </div>
  );
}
