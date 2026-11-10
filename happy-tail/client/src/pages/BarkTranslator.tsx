import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, MessageSquare, Loader2, Sparkles, Brain, Info,
  Dog, Activity, Heart, Volume2, AlertTriangle, CheckCircle,
  Video, Mic, RefreshCcw,
} from "lucide-react";
import CameraCapture, { type CaptureResult } from "@/components/CameraCapture";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { apiRequest, UnauthorizedError } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/lib/language-context";
import { useGuest } from "@/lib/guest-context";
import { AIUsageCounter } from "@/components/AIUsageCounter";
import { AIUsageLimitRequest } from "@/components/AIUsageLimitRequest";

interface TranslationResult {
  breed: string;
  message: string;
  confidence_level: string;
  body_language_analysis: string;
  bark_type: string;
  emotion: string;
  energy_level: string;
  urgency: string;
  recommended_response: string;
  tail_position: string;
  ear_position: string;
  posture: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function extractFramesFromVideo(videoSrc: string, numFrames = 6): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    video.src = videoSrc;

    video.onloadedmetadata = () => {
      const duration = isFinite(video.duration) ? video.duration : 5;
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d")!;
      const frames: string[] = [];
      let idx = 0;

      const intervals = Array.from({ length: numFrames }, (_, i) =>
        numFrames === 1 ? duration / 2 : (duration * i) / (numFrames - 1)
      );

      const captureNext = () => {
        if (idx >= intervals.length) { resolve(frames); return; }
        video.currentTime = Math.min(intervals[idx], duration - 0.05);
      };

      video.onseeked = () => {
        const vw = video.videoWidth || 512;
        const vh = video.videoHeight || 512;
        const scale = Math.min(512 / vw, 512 / vh);
        const dw = vw * scale;
        const dh = vh * scale;
        ctx.clearRect(0, 0, 512, 512);
        ctx.drawImage(video, (512 - dw) / 2, (512 - dh) / 2, dw, dh);
        frames.push(canvas.toDataURL("image/jpeg", 0.85));
        idx++;
        captureNext();
      };

      video.onerror = () => reject(new Error("Failed to load video for frame extraction"));
      captureNext();
    };

    video.onerror = () => reject(new Error("Failed to load video"));
  });
}

/** Convert an audio blob to a base64 data-URL for sending to the server. */
function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ─── Urgency / emotion helpers ───────────────────────────────────────────────
const getUrgencyColor = (urgency: string) => {
  const u = urgency?.toLowerCase() ?? "";
  if (u.includes("high") || u.includes("urgent"))
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  if (u.includes("medium") || u.includes("moderate"))
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
  return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
};

// ─── Result display ──────────────────────────────────────────────────────────
function ResultPanel({ result, t }: { result: TranslationResult; t: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
      data-testid="translation-result"
    >
      <Card className="p-5 sm:p-6">
        <div className="text-center mb-5">
          <Badge variant="secondary" className="mb-3 px-4 py-1" data-testid="badge-analysis-complete">
            {t.barkTranslator.results}
          </Badge>
          <h2
            className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-foreground mb-2 leading-snug"
            data-testid="text-translation-message"
          >
            "{result.message}"
          </h2>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Badge data-testid="badge-breed">
              <Dog className="w-3 h-3 mr-1" />{result.breed}
            </Badge>
            <Badge variant="outline" data-testid="badge-confidence">{result.confidence_level}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {result.bark_type && (
            <div className="bg-muted/50 p-3 rounded-lg text-center">
              <Volume2 className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Bark Type</p>
              <p className="text-sm font-semibold text-foreground leading-tight" data-testid="text-bark-type">
                {result.bark_type}
              </p>
            </div>
          )}
          {result.emotion && (
            <div className="bg-muted/50 p-3 rounded-lg text-center">
              <Heart className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{t.barkTranslator.emotion}</p>
              <p className="text-sm font-semibold text-foreground leading-tight" data-testid="text-emotion">
                {result.emotion}
              </p>
            </div>
          )}
          {result.energy_level && (
            <div className="bg-muted/50 p-3 rounded-lg text-center">
              <Activity className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{t.barkTranslator.energy}</p>
              <p className="text-sm font-semibold text-foreground leading-tight" data-testid="text-energy">
                {result.energy_level}
              </p>
            </div>
          )}
          {result.urgency && (
            <div className="bg-muted/50 p-3 rounded-lg text-center">
              <AlertTriangle className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{t.barkTranslator.urgency}</p>
              <Badge className={`text-xs mt-0.5 ${getUrgencyColor(result.urgency)}`} data-testid="badge-urgency">
                {result.urgency}
              </Badge>
            </div>
          )}
        </div>
      </Card>

      {(result.tail_position || result.ear_position || result.posture) && (
        <Card className="p-4 sm:p-5">
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2 text-sm sm:text-base">
            <Dog className="w-4 h-4 text-primary shrink-0" /> {t.barkTranslator.bodyLanguage}
          </h3>
          <div className="space-y-2">
            {result.tail_position && (
              <div className="flex items-start gap-2">
                <span className="text-xs font-medium text-muted-foreground w-14 shrink-0 pt-0.5">Tail:</span>
                <span className="text-sm text-foreground" data-testid="text-tail">{result.tail_position}</span>
              </div>
            )}
            {result.ear_position && (
              <div className="flex items-start gap-2">
                <span className="text-xs font-medium text-muted-foreground w-14 shrink-0 pt-0.5">Ears:</span>
                <span className="text-sm text-foreground" data-testid="text-ears">{result.ear_position}</span>
              </div>
            )}
            {result.posture && (
              <div className="flex items-start gap-2">
                <span className="text-xs font-medium text-muted-foreground w-14 shrink-0 pt-0.5">Posture:</span>
                <span className="text-sm text-foreground" data-testid="text-posture">{result.posture}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card className="p-4 sm:p-5">
        <h3 className="font-bold text-foreground mb-2 flex items-center gap-2 text-sm sm:text-base">
          <Brain className="w-4 h-4 text-primary shrink-0" /> {t.barkTranslator.results}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-analysis">
          {result.body_language_analysis}
        </p>
      </Card>

      {result.recommended_response && (
        <Card className="p-4 sm:p-5 border-primary/20 bg-primary/5">
          <h3 className="font-bold text-foreground mb-2 flex items-center gap-2 text-sm sm:text-base">
            <CheckCircle className="w-4 h-4 text-primary shrink-0" /> {t.barkTranslator.recommendation}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-recommendation">
            {result.recommended_response}
          </p>
        </Card>
      )}
    </motion.div>
  );
}

// ─── Empty panel ─────────────────────────────────────────────────────────────
function EmptyPanel({ t }: { t: any }) {
  return (
    <div className="bg-card rounded-[2rem] border-2 border-dashed border-muted flex flex-col items-center justify-center p-8 text-center text-muted-foreground min-h-[280px] lg:min-h-0 lg:h-full">
      <Info className="w-12 h-12 mb-4 opacity-20" />
      <h3 className="text-lg font-bold mb-2">{t.barkTranslator.title}</h3>
      <p className="text-sm mb-4">{t.barkTranslator.subtitle}</p>
      <p className="text-xs text-muted-foreground/60 max-w-xs">
        The AI analyzes your dog's body language, posture, ear &amp; tail position, and facial
        expression across multiple frames.
      </p>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function BarkTranslator() {
  // "video" mode uses video file/camera; "audio" mode uses audio-only recording/upload
  const [inputMode, setInputMode] = useState<"video" | "audio">("video");

  const [mediaSrc, setMediaSrc] = useState<string | null>(null);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState("");
  const [result, setResult] = useState<TranslationResult | null>(null);

  // Always-mounted hidden file inputs — prevents iOS tap-through issues
  const videoFileRef = useRef<HTMLInputElement>(null);
  const audioFileRef = useRef<HTMLInputElement>(null);

  const [showCamera, setShowCamera] = useState(false);
  const { toast } = useToast();
  const { t, lang } = useLanguage();
  const { checkGuestAccess, setShowLoginPrompt } = useGuest();

  // ── Reset ──────────────────────────────────────────────────────
  const reset = () => {
    if (mediaSrc?.startsWith("blob:")) URL.revokeObjectURL(mediaSrc);
    setMediaSrc(null);
    setMediaBlob(null);
    setResult(null);
    // Reset file inputs so the same file can be re-selected
    if (videoFileRef.current) videoFileRef.current.value = "";
    if (audioFileRef.current) audioFileRef.current.value = "";
  };

  const switchMode = (mode: "video" | "audio") => {
    reset();
    setInputMode(mode);
  };

  // ── File upload handlers ───────────────────────────────────────
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // reset so same file can be picked again

    const allowedTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo", "video/x-matroska"];
    const isAllowed = allowedTypes.some((t) => file.type.startsWith(t)) || file.type.startsWith("video/");
    if (!isAllowed) {
      toast({ title: "Unsupported file", description: "Please upload an MP4, MOV, WebM or similar video file.", variant: "destructive" });
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload a video smaller than 100 MB.", variant: "destructive" });
      return;
    }

    if (mediaSrc?.startsWith("blob:")) URL.revokeObjectURL(mediaSrc);
    const url = URL.createObjectURL(file);
    setMediaSrc(url);
    setMediaBlob(file);
    setResult(null);
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (!file.type.startsWith("audio/") && !file.type.startsWith("video/")) {
      toast({ title: "Unsupported file", description: "Please upload an audio file (MP3, WAV, M4A, WebM).", variant: "destructive" });
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload an audio file smaller than 50 MB.", variant: "destructive" });
      return;
    }

    if (mediaSrc?.startsWith("blob:")) URL.revokeObjectURL(mediaSrc);
    const url = URL.createObjectURL(file);
    setMediaSrc(url);
    setMediaBlob(file);
    setResult(null);
  };

  // ── Camera capture handler ─────────────────────────────────────
  const handleCameraCapture = (captureResult: CaptureResult) => {
    setShowCamera(false);
    if (captureResult.mode === "video") {
      if (mediaSrc?.startsWith("blob:")) URL.revokeObjectURL(mediaSrc);
      setMediaSrc(captureResult.blobUrl);
      setMediaBlob(captureResult.blob);
      setResult(null);
    } else if (captureResult.mode === "audio") {
      if (mediaSrc?.startsWith("blob:")) URL.revokeObjectURL(mediaSrc);
      setMediaSrc(captureResult.blobUrl);
      setMediaBlob(captureResult.blob);
      setResult(null);
    }
  };

  // ── Translate ──────────────────────────────────────────────────
  const handleTranslate = useCallback(async () => {
    if (!mediaSrc && !mediaBlob) return;
    if (!checkGuestAccess()) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      let frames: string[] = [];

      if (inputMode === "video" && mediaSrc) {
        setExtractionStatus("Extracting video frames…");
        frames = await extractFramesFromVideo(mediaSrc, 6);
        if (frames.length === 0) {
          toast({ title: "No frames captured", description: "Could not read frames from the video. Try a different file.", variant: "destructive" });
          setIsAnalyzing(false);
          setExtractionStatus("");
          return;
        }
      } else if (inputMode === "audio" && mediaBlob) {
        // For audio-only: convert the recording to a data URL and send it as a
        // single "frame" so the existing /api/bark/translate endpoint can handle it.
        setExtractionStatus("Processing audio…");
        const dataUrl = await blobToDataURL(mediaBlob);
        frames = [dataUrl];
      }

      setExtractionStatus(`Analyzing with AI…`);
      const res = await apiRequest("POST", "/api/bark/translate", { frames, language: lang });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        setShowLoginPrompt(true);
      } else {
        toast({ title: "Translation failed", description: "Could not analyze the media. Please try again.", variant: "destructive" });
      }
    } finally {
      setIsAnalyzing(false);
      setExtractionStatus("");
    }
  }, [mediaSrc, mediaBlob, inputMode, checkGuestAccess, lang, toast, setShowLoginPrompt]);

  const hasMedia = !!mediaSrc || !!mediaBlob;

  return (
    <div className="max-w-5xl mx-auto">
      <AIUsageCounter featureKey="bark_translation" />
      <AIUsageLimitRequest featureKey="bark_translation" />
      <PageHeader
        title={t.barkTranslator.title}
        description={t.barkTranslator.subtitle}
      />

      {/* ── Mode switcher ── */}
      <div className="flex gap-2 mb-6 bg-muted/60 p-1 rounded-2xl w-fit">
        <button
          onClick={() => switchMode("video")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            inputMode === "video"
              ? "bg-white dark:bg-gray-900 text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Video className="w-4 h-4" /> Video
        </button>
        <button
          onClick={() => switchMode("audio")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            inputMode === "audio"
              ? "bg-white dark:bg-gray-900 text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Mic className="w-4 h-4" /> Audio Only
        </button>
      </div>

      {/* Always-mounted hidden inputs – refs are always valid */}
      <input
        ref={videoFileRef}
        type="file"
        accept="video/*,video/mp4,video/webm,video/quicktime"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleVideoFileChange}
        data-testid="input-video-file"
      />
      <input
        ref={audioFileRef}
        type="file"
        accept="audio/*,video/webm,audio/webm,audio/mpeg,audio/wav,audio/mp4,audio/ogg"
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleAudioFileChange}
        data-testid="input-audio-file"
      />

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
        {/* ── Left: media input ── */}
        <div className="space-y-4">
          {/* Preview / empty state */}
          <div className="relative rounded-[2rem] overflow-hidden bg-gray-900 shadow-2xl border-4 border-white dark:border-gray-800 ring-1 ring-gray-200 dark:ring-gray-700"
            style={{ aspectRatio: inputMode === "audio" ? "16/7" : "16/9" }}>
            {!hasMedia ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 mx-auto">
                  {inputMode === "video"
                    ? <Video className="w-8 h-8 text-gray-500" />
                    : <Mic className="w-8 h-8 text-gray-500" />}
                </div>
                <p className="text-gray-400 text-sm text-center mb-5 px-4">
                  {inputMode === "video"
                    ? "Record or upload a video of your dog barking"
                    : "Record or upload audio of your dog's bark"}
                </p>
                {/* Action buttons — two equal-width side-by-side, no overflow */}
                <div className="flex flex-col gap-2 w-full max-w-[260px]">
                  <Button
                    data-testid="button-record"
                    onClick={() => setShowCamera(true)}
                    className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-11 flex items-center justify-center gap-2 text-sm"
                  >
                    {inputMode === "video" ? <Video className="w-4 h-4 shrink-0" /> : <Mic className="w-4 h-4 shrink-0" />}
                    {inputMode === "video" ? "Record Video" : "Record Audio"}
                  </Button>
                  <Button
                    data-testid="button-upload"
                    variant="outline"
                    onClick={() => {
                      if (inputMode === "video") videoFileRef.current?.click();
                      else audioFileRef.current?.click();
                    }}
                    className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl h-11 flex items-center justify-center gap-2 text-sm"
                  >
                    <Upload className="w-4 h-4 shrink-0" />
                    {inputMode === "video" ? t.barkTranslator.uploadVideo : "Upload Audio"}
                  </Button>
                </div>
              </div>
            ) : inputMode === "video" ? (
              <video
                key={mediaSrc ?? ""}
                src={mediaSrc ?? undefined}
                controls
                playsInline
                className="w-full h-full object-contain"
                data-testid="video-preview"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6">
                <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-400/30 flex items-center justify-center">
                  <Mic className="w-7 h-7 text-green-400" />
                </div>
                <audio
                  key={mediaSrc ?? ""}
                  src={mediaSrc ?? undefined}
                  controls
                  className="w-full max-w-xs rounded-xl"
                  data-testid="audio-preview"
                />
              </div>
            )}
          </div>

          {/* Translate / reset buttons */}
          {hasMedia && (
            <div className="flex flex-col gap-3">
              {!result && (
                <Button
                  data-testid="button-translate"
                  onClick={handleTranslate}
                  disabled={isAnalyzing}
                  className="w-full py-6 text-base font-bold rounded-2xl shadow-lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2 shrink-0" />
                      <span className="truncate">{extractionStatus || t.barkTranslator.analyzing}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2 shrink-0" />
                      {t.barkTranslator.title}
                    </>
                  )}
                </Button>
              )}
              <Button
                data-testid="button-upload-another"
                variant="outline"
                onClick={reset}
                className="w-full py-4 rounded-xl flex items-center justify-center gap-2"
              >
                <RefreshCcw className="w-4 h-4 shrink-0" />
                {result ? t.barkTranslator.tryAnother : "Change File"}
              </Button>
            </div>
          )}

          {/* Upload hint (audio mode info) */}
          {inputMode === "audio" && !hasMedia && (
            <p className="text-xs text-muted-foreground text-center px-2">
              Accepts MP3, WAV, M4A, AAC, WebM · Max 50 MB
            </p>
          )}
          {inputMode === "video" && !hasMedia && (
            <p className="text-xs text-muted-foreground text-center px-2">
              Accepts MP4, MOV, WebM · Max 100 MB
            </p>
          )}
        </div>

        {/* ── Right: results ── */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {result
              ? <ResultPanel key="result" result={result} t={t} />
              : <EmptyPanel key="empty" t={t} />}
          </AnimatePresence>
        </div>
      </div>

      {/* Camera / mic overlay */}
      {showCamera && (
        <CameraCapture
          mode={inputMode === "audio" ? "audio" : "video"}
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
