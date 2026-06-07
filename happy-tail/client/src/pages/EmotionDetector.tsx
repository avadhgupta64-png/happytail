import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, RefreshCcw, Sparkles, AlertCircle, Loader2, Upload, Clock,
  Dog, Heart, XCircle, Video, Brain, Activity, Zap, Shield, ChevronRight
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useAnalyzeEmotion, useEmotionHistory } from "@/hooks/use-emotions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/language-context";
import { useGuest } from "@/lib/guest-context";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// ─── Emotion helpers ───────────────────────────────────────────────
const emotionColors: Record<string, string> = {
  "Happy": "bg-green-100 text-green-700 border-green-200",
  "Sad": "bg-blue-100 text-blue-700 border-blue-200",
  "Anxious": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "Calm": "bg-teal-100 text-teal-700 border-teal-200",
  "Angry": "bg-red-100 text-red-700 border-red-200",
  "Neutral": "bg-gray-100 text-gray-700 border-gray-200",
  "Excited": "bg-orange-100 text-orange-700 border-orange-200",
};
function getEmotionStyle(emotion: string) {
  return emotionColors[emotion] || "bg-gray-100 text-gray-700 border-gray-200";
}
function formatDate(dateStr: string | Date | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Stress/energy level badge colors ─────────────────────────────
const levelColors: Record<string, string> = {
  Low: "bg-green-100 text-green-700 border-green-200",
  Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  High: "bg-red-100 text-red-700 border-red-200",
};
function getLevelStyle(level: string) {
  return levelColors[level] || "bg-gray-100 text-gray-700 border-gray-200";
}

// ─── Video frame extractor ─────────────────────────────────────────
async function extractFrames(file: File, count = 6): Promise<string[]> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const frames: string[] = [];
    video.src = URL.createObjectURL(file);
    video.load();
    video.addEventListener("loadedmetadata", () => {
      canvas.width = 640;
      canvas.height = 360;
      const interval = video.duration / count;
      let captured = 0;
      const captureFrame = () => {
        if (captured >= count) {
          URL.revokeObjectURL(video.src);
          resolve(frames);
          return;
        }
        video.currentTime = captured * interval;
      };
      video.addEventListener("seeked", () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        frames.push(canvas.toDataURL("image/jpeg", 0.7));
        captured++;
        captureFrame();
      });
      captureFrame();
    });
  });
}

// ─── Expanded scan for history ─────────────────────────────────────
function ExpandedScan({ scan, onClose }: { scan: any | null; onClose: () => void }) {
  if (!scan) return null;
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-6 bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Dog className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-bold text-gray-800">{scan.detectedBreed || "Unknown breed"}</h4>
              <p className="text-xs text-gray-400">{formatDate(scan.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`text-xs border ${getEmotionStyle(scan.detectedEmotion)}`}>
              {scan.detectedEmotion}
            </Badge>
            <Button size="icon" variant="ghost" onClick={onClose}>
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {scan.mood && (
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
              <p className="text-xs font-bold text-amber-700 mb-1">Mood</p>
              <p className="text-sm text-amber-600">{scan.mood}</p>
            </div>
          )}
          {scan.explanation && (
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <p className="text-xs font-bold text-blue-700 mb-1">Why</p>
              <p className="text-sm text-blue-600">{scan.explanation}</p>
            </div>
          )}
          {scan.treatment && (
            <div className="bg-green-50 rounded-xl p-3 border border-green-100">
              <p className="text-xs font-bold text-green-700 mb-1">What to do</p>
              <p className="text-sm text-green-600">{scan.treatment}</p>
            </div>
          )}
          {scan.suggestion && (
            <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
              <p className="text-xs font-bold text-purple-700 mb-1">Quick Tip</p>
              <p className="text-sm text-purple-600">{scan.suggestion}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Behavior result display ───────────────────────────────────────
function BehaviorResult({ result, onReset }: { result: any; onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white rounded-[2rem] p-6 shadow-xl border border-purple-100 flex flex-col gap-4"
    >
      <div className="text-center">
        <span className="inline-block px-4 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-bold mb-3">
          Behavior Analysis
        </span>
        <h2 className="text-4xl font-display font-bold text-gray-800 mb-1">{result.overall_mood}</h2>
        <p className="text-lg text-primary font-semibold">{result.breed}</p>
      </div>

      <div className="flex gap-3 justify-center flex-wrap">
        <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
          <Shield className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-600">Stress</span>
          <Badge className={`text-xs border ml-1 ${getLevelStyle(result.stress_level)}`}>{result.stress_level}</Badge>
        </div>
        <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
          <Zap className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-600">Energy</span>
          <Badge className={`text-xs border ml-1 ${getLevelStyle(result.energy_level)}`}>{result.energy_level}</Badge>
        </div>
      </div>

      {result.dominant_behaviors?.length > 0 && (
        <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100">
          <h3 className="font-bold text-purple-800 mb-2 flex items-center gap-2 text-sm">
            <Brain className="w-4 h-4" /> Observed Behaviors
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.dominant_behaviors.map((b: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-white text-purple-700 rounded-full text-xs font-semibold border border-purple-200">
                {b}
              </span>
            ))}
          </div>
        </div>
      )}

      {result.body_language && (
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <h3 className="font-bold text-blue-800 mb-1 flex items-center gap-2 text-sm">
            <Activity className="w-4 h-4" /> Body Language
          </h3>
          <p className="text-blue-700 text-sm leading-relaxed">{result.body_language}</p>
        </div>
      )}

      {result.triggers && (
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
          <h3 className="font-bold text-amber-800 mb-1 text-sm">Possible Triggers</h3>
          <p className="text-amber-700 text-sm leading-relaxed">{result.triggers}</p>
        </div>
      )}

      {result.recommendations?.length > 0 && (
        <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
          <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2 text-sm">
            <Heart className="w-4 h-4" /> Recommendations
          </h3>
          <ul className="space-y-1.5">
            {result.recommendations.map((r: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button
        className="py-5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white w-full gap-2"
        onClick={onReset}
      >
        <RefreshCcw className="w-4 h-4" /> Analyze Another Video
      </Button>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────
export default function EmotionDetector() {
  const [activeTab, setActiveTab] = useState<"emotion" | "behavior">("emotion");

  // Emotion tab state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [expandedScan, setExpandedScan] = useState<any | null>(null);
  const { mutate: analyze, isPending, data: result, error, reset: resetMutation } = useAnalyzeEmotion();
  const { data: history } = useEmotionHistory();

  // Behavior tab state
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [behaviorResult, setBehaviorResult] = useState<any | null>(null);
  const [extracting, setExtracting] = useState(false);

  const { toast } = useToast();
  const { t } = useLanguage();
  const { checkGuestAccess } = useGuest();

  const { mutate: analyzeBehavior, isPending: behaviorPending } = useMutation({
    mutationFn: async (frames: string[]) => {
      const res = await apiRequest("POST", "/api/behavior/analyze", { frames });
      return res.json();
    },
    onSuccess: (data) => setBehaviorResult(data),
    onError: (err: any) => {
      toast({
        title: "Analysis failed",
        description: err.message || "Could not analyze behavior. Please try with a clearer video.",
        variant: "destructive",
      });
    },
  });

  // Emotion handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please upload an image under 8MB.", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImgSrc(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  const handleAnalyze = () => {
    if (!imgSrc) return;
    if (!checkGuestAccess()) return;
    analyze({ image: imgSrc }, {
      onError: (err) => {
        toast({ title: "Analysis failed", description: err.message || "Could not analyze the image.", variant: "destructive" });
      },
    });
  };
  const reset = () => { setImgSrc(null); resetMutation(); };

  // Behavior handlers
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please upload a video under 100MB.", variant: "destructive" });
        return;
      }
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
      setBehaviorResult(null);
    }
  };
  const handleBehaviorAnalyze = async () => {
    if (!videoFile) return;
    if (!checkGuestAccess()) return;
    setExtracting(true);
    try {
      const frames = await extractFrames(videoFile, 6);
      setExtracting(false);
      analyzeBehavior(frames);
    } catch {
      setExtracting(false);
      toast({ title: "Could not read video", description: "Please try a different video file.", variant: "destructive" });
    }
  };
  const resetBehavior = () => {
    setVideoFile(null);
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoPreviewUrl(null);
    setBehaviorResult(null);
  };

  return (
    <div className="max-w-5xl mx-auto" data-testid="emotion-detector-page">
      <PageHeader
        title={t.emotionDetector.title}
        description={t.emotionDetector.subtitle}
      />

      {/* Tab switcher */}
      <div className="flex gap-2 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("emotion")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "emotion"
              ? "bg-white dark:bg-gray-900 text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Camera className="w-4 h-4" /> Emotion Analysis
        </button>
        <button
          onClick={() => setActiveTab("behavior")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "behavior"
              ? "bg-white dark:bg-gray-900 text-purple-600 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Brain className="w-4 h-4" /> Behavior Analysis
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "emotion" ? (
          <motion.div
            key="emotion"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* ── Emotion Analysis Layout ── */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="relative rounded-[2rem] overflow-hidden bg-black aspect-[4/3] shadow-2xl border-4 border-white ring-1 ring-gray-200">
                  {!imgSrc ? (
                    <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center p-8 text-center">
                      <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                        <Camera className="w-10 h-10 text-gray-500" />
                      </div>
                      <div className="flex flex-col gap-4 w-full max-w-xs">
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-primary hover:bg-primary/90 text-white rounded-xl py-6 flex items-center gap-2"
                          data-testid="button-upload-photo"
                        >
                          <Upload className="w-5 h-5" /> {t.emotionDetector.uploadPrompt}
                        </Button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept="image/*"
                          className="hidden"
                          data-testid="input-file-upload"
                        />
                      </div>
                    </div>
                  ) : (
                    <img src={imgSrc} alt="Captured" className="w-full h-full object-cover" data-testid="img-preview" />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent flex justify-center gap-4">
                    {imgSrc && (
                      <div className="flex gap-3">
                        <button
                          onClick={reset}
                          className="px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2"
                          data-testid="button-retake"
                        >
                          <RefreshCcw className="w-5 h-5" /> {t.emotionDetector.tryAnother}
                        </button>
                        {!result && (
                          <button
                            onClick={handleAnalyze}
                            disabled={isPending}
                            className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            data-testid="button-analyze"
                          >
                            {isPending ? (
                              <><Loader2 className="w-5 h-5 animate-spin" /> {t.emotionDetector.analyzing}</>
                            ) : (
                              <><Sparkles className="w-5 h-5" /> {t.features.emotionDetector}</>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 p-4 rounded-2xl flex gap-3 text-red-700 border border-red-100">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm">{error.message || "Something went wrong. Please try again."}</p>
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 text-blue-700 border border-blue-100 shadow-sm">
                  <Sparkles className="w-5 h-5 shrink-0 text-blue-500" />
                  <div>
                    <p className="text-sm font-bold mb-1">How to get the best result:</p>
                    <p className="text-xs leading-relaxed">
                      Upload a clear, front-facing photo of your dog's face. Good lighting and a calm environment help our AI understand your pet better!
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  {result ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-white rounded-[2rem] p-8 shadow-xl border border-amber-100 h-full flex flex-col"
                      data-testid="emotion-result"
                    >
                      <div className="text-center mb-8">
                        <span className="inline-block px-4 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-bold mb-4">
                          {t.barkTranslator.results}
                        </span>
                        <h2 className="text-5xl font-display font-bold text-gray-800 mb-2">{result.emotion}</h2>
                        <p className="text-xl text-primary font-bold mb-1">{result.breed}</p>
                        <p className="text-lg text-gray-500 font-medium">{result.mood}</p>
                      </div>

                      <div className="space-y-4 flex-1">
                        <div className="bg-blue-600 p-5 rounded-2xl border border-blue-400 shadow-lg text-white">
                          <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-blue-200" /> Quick Tip
                          </h3>
                          <p className="text-blue-50 text-sm leading-relaxed font-semibold">
                            {result.suggestion || "Ensure your dog has plenty of fresh water and a quiet place to rest!"}
                          </p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-md">
                          <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-500" /> Why?
                          </h3>
                          <p className="text-gray-700 text-sm leading-relaxed">{result.explanation}</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-green-200 shadow-md">
                          <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                            <Heart className="w-5 h-5 text-green-500" /> What to do?
                          </h3>
                          <p className="text-gray-700 text-sm leading-relaxed">{result.treatment}</p>
                        </div>
                      </div>

                      <Button
                        className="mt-8 py-6 rounded-xl bg-gray-900 hover:bg-gray-800 text-white w-full gap-2"
                        onClick={reset}
                        data-testid="button-new-scan"
                      >
                        <RefreshCcw className="w-5 h-5" /> {t.emotionDetector.tryAnother}
                      </Button>
                    </motion.div>
                  ) : (
                    <div className="h-full bg-white rounded-[2rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Camera className="w-10 h-10 text-gray-300" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-500 mb-2">{t.emotionDetector.noHistory}</h3>
                      <p>{t.emotionDetector.subtitle}</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* History */}
            {history && history.length > 0 && (
              <div className="mt-16" data-testid="recent-scans-section">
                <div className="flex items-center gap-3 mb-6">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <h3 className="text-2xl font-bold font-display text-gray-800">{t.emotionDetector.history}</h3>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-500 border-none">{history.length}</Badge>
                </div>
                <ExpandedScan scan={expandedScan} onClose={() => setExpandedScan(null)} />
                <div className="flex flex-wrap gap-3">
                  {history.slice(0, 12).map((log) => (
                    <motion.button
                      key={log.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => setExpandedScan(log)}
                      className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer text-left"
                    >
                      <Dog className="w-4 h-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 text-sm truncate">{log.detectedBreed || "Unknown breed"}</p>
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
        ) : (
          <motion.div
            key="behavior"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* ── Behavior Analysis Layout ── */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="relative rounded-[2rem] overflow-hidden bg-black aspect-[4/3] shadow-2xl border-4 border-white ring-1 ring-purple-200">
                  {!videoPreviewUrl ? (
                    <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center p-8 text-center">
                      <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                        <Video className="w-10 h-10 text-gray-500" />
                      </div>
                      <p className="text-gray-400 text-sm mb-6 max-w-xs">
                        Upload a short video of your dog to analyze their body language and behavior patterns
                      </p>
                      <Button
                        onClick={() => videoInputRef.current?.click()}
                        className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-6 flex items-center gap-2"
                      >
                        <Upload className="w-5 h-5" /> Upload Video
                      </Button>
                      <input
                        type="file"
                        ref={videoInputRef}
                        onChange={handleVideoUpload}
                        accept="video/*"
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <video
                      src={videoPreviewUrl}
                      className="w-full h-full object-cover"
                      controls
                      muted
                    />
                  )}
                  {videoPreviewUrl && (
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent flex justify-center gap-3">
                      <button
                        onClick={resetBehavior}
                        className="px-5 py-3 bg-white/20 backdrop-blur-md text-white rounded-xl font-bold hover:bg-white/30 transition-all flex items-center gap-2"
                      >
                        <RefreshCcw className="w-4 h-4" /> Change Video
                      </button>
                      {!behaviorResult && (
                        <button
                          onClick={handleBehaviorAnalyze}
                          disabled={behaviorPending || extracting}
                          className="px-5 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg hover:bg-purple-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {(behaviorPending || extracting) ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> {extracting ? "Extracting frames..." : "Analyzing..."}</>
                          ) : (
                            <><Brain className="w-4 h-4" /> Analyze Behavior</>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-purple-50 p-4 rounded-2xl flex gap-3 text-purple-700 border border-purple-100 shadow-sm">
                  <Brain className="w-5 h-5 shrink-0 text-purple-500" />
                  <div>
                    <p className="text-sm font-bold mb-1">How behavior analysis works:</p>
                    <p className="text-xs leading-relaxed">
                      Our AI extracts frames from your video and analyzes body posture, tail position, ear orientation, and movement patterns to understand your dog's behavioral state and stress levels.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  {behaviorResult ? (
                    <BehaviorResult result={behaviorResult} onReset={resetBehavior} />
                  ) : (
                    <div className="h-full bg-white rounded-[2rem] border-2 border-dashed border-purple-200 flex flex-col items-center justify-center p-8 text-center text-gray-400 min-h-[300px]">
                      <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mb-4">
                        <Brain className="w-10 h-10 text-purple-200" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-500 mb-2">No Analysis Yet</h3>
                      <p className="text-sm">Upload a video of your dog to get a detailed behavior and body language report</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
