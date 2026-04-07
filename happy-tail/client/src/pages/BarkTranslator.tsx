import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, MessageSquare, Loader2, Sparkles, Brain, Info, Dog, Activity, Heart, Volume2, AlertTriangle, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/lib/language-context";
import { useGuest } from "@/lib/guest-context";

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

function extractFramesFromVideo(videoSrc: string, numFrames: number = 6): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.src = videoSrc;

    video.onloadedmetadata = () => {
      const duration = video.duration;
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d")!;
      const frames: string[] = [];
      let currentFrame = 0;

      const intervals = Array.from({ length: numFrames }, (_, i) => {
        if (numFrames === 1) return duration / 2;
        return (duration * i) / (numFrames - 1);
      });

      const captureFrame = () => {
        if (currentFrame >= intervals.length) {
          resolve(frames);
          return;
        }
        video.currentTime = Math.min(intervals[currentFrame], duration - 0.1);
      };

      video.onseeked = () => {
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        const scale = Math.min(512 / vw, 512 / vh);
        const dw = vw * scale;
        const dh = vh * scale;
        ctx.clearRect(0, 0, 512, 512);
        ctx.drawImage(video, (512 - dw) / 2, (512 - dh) / 2, dw, dh);
        frames.push(canvas.toDataURL("image/jpeg", 0.85));
        currentFrame++;
        captureFrame();
      };

      video.onerror = () => reject(new Error("Failed to load video"));
      captureFrame();
    };

    video.onerror = () => reject(new Error("Failed to load video"));
  });
}

export default function BarkTranslator() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState("");
  const [result, setResult] = useState<TranslationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { checkGuestAccess } = useGuest();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please upload a video smaller than 50MB.", variant: "destructive" });
        return;
      }
      if (videoSrc && videoSrc.startsWith("blob:")) {
        URL.revokeObjectURL(videoSrc);
      }
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setResult(null);
    }
  };

  const handleTranslate = useCallback(async () => {
    if (!videoSrc) return;
    if (!checkGuestAccess()) return;
    setIsAnalyzing(true);
    setExtractionStatus("Extracting video frames...");
    try {
      const frames = await extractFramesFromVideo(videoSrc, 6);
      if (frames.length === 0) {
        toast({ title: "No frames captured", description: "Could not extract frames from the video. Try a different file.", variant: "destructive" });
        setIsAnalyzing(false);
        return;
      }
      setExtractionStatus(`Analyzing ${frames.length} frames with AI...`);
      const res = await apiRequest("POST", "/api/bark/translate", { frames });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      toast({ title: "Translation failed", description: "Could not analyze the video. Please try again.", variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
      setExtractionStatus("");
    }
  }, [videoSrc, toast]);

  const getUrgencyColor = (urgency: string) => {
    const u = urgency?.toLowerCase() || "";
    if (u.includes("high") || u.includes("urgent")) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    if (u.includes("medium") || u.includes("moderate")) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  };

  const getEmotionIcon = (emotion: string) => {
    const e = emotion?.toLowerCase() || "";
    if (e.includes("happy") || e.includes("excited") || e.includes("playful")) return Heart;
    if (e.includes("anxious") || e.includes("fear") || e.includes("stress")) return AlertTriangle;
    return Activity;
  };

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader 
        title={t.barkTranslator.title} 
        description={t.barkTranslator.subtitle}
      />

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="relative rounded-[2rem] overflow-hidden bg-black aspect-video shadow-2xl border-4 border-white ring-1 ring-gray-200 dark:border-gray-800 dark:ring-gray-700 flex items-center justify-center">
            {!videoSrc ? (
              <div className="text-center p-8">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <MessageSquare className="w-10 h-10 text-gray-500" />
                </div>
                <Button 
                  data-testid="button-upload-video"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-primary hover:bg-primary/90 text-white rounded-xl py-6 flex items-center gap-2"
                >
                  <Upload className="w-5 h-5" /> {t.barkTranslator.uploadVideo}
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="video/*" 
                  className="hidden"
                  data-testid="input-video-file"
                />
              </div>
            ) : (
              <video src={videoSrc} controls className="w-full h-full object-contain" data-testid="video-preview" />
            )}
          </div>

          {videoSrc && !result && (
            <Button 
              data-testid="button-translate"
              onClick={handleTranslate} 
              disabled={isAnalyzing}
              className="w-full py-8 text-xl font-bold rounded-[2rem] shadow-xl"
            >
              {isAnalyzing ? (
                <><Loader2 className="w-6 h-6 animate-spin mr-2" /> {extractionStatus || t.barkTranslator.analyzing}</>
              ) : (
                <><Sparkles className="w-6 h-6 mr-2" /> {t.barkTranslator.title}</>
              )}
            </Button>
          )}

          {videoSrc && result && (
            <Button data-testid="button-upload-another" variant="outline" onClick={() => {
              if (videoSrc.startsWith("blob:")) URL.revokeObjectURL(videoSrc);
              setVideoSrc(null);
              setResult(null);
            }} className="w-full py-6 rounded-xl">
              {t.barkTranslator.tryAnother}
            </Button>
          )}
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
                data-testid="translation-result"
              >
                <Card className="p-6">
                  <div className="text-center mb-6">
                    <Badge variant="secondary" className="mb-3 px-4 py-1" data-testid="badge-analysis-complete">{t.barkTranslator.results}</Badge>
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2" data-testid="text-translation-message">"{result.message}"</h2>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <Badge data-testid="badge-breed"><Dog className="w-3 h-3 mr-1" />{result.breed}</Badge>
                      <Badge variant="outline" data-testid="badge-confidence">{result.confidence_level}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {result.bark_type && (
                      <div className="bg-muted/50 p-3 rounded-lg text-center">
                        <Volume2 className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Bark Type</p>
                        <p className="text-sm font-semibold text-foreground" data-testid="text-bark-type">{result.bark_type}</p>
                      </div>
                    )}
                    {result.emotion && (
                      <div className="bg-muted/50 p-3 rounded-lg text-center">
                        <Heart className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">{t.barkTranslator.emotion}</p>
                        <p className="text-sm font-semibold text-foreground" data-testid="text-emotion">{result.emotion}</p>
                      </div>
                    )}
                    {result.energy_level && (
                      <div className="bg-muted/50 p-3 rounded-lg text-center">
                        <Activity className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">{t.barkTranslator.energy}</p>
                        <p className="text-sm font-semibold text-foreground" data-testid="text-energy">{result.energy_level}</p>
                      </div>
                    )}
                    {result.urgency && (
                      <div className="bg-muted/50 p-3 rounded-lg text-center">
                        <AlertTriangle className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">{t.barkTranslator.urgency}</p>
                        <Badge className={`text-xs ${getUrgencyColor(result.urgency)}`} data-testid="badge-urgency">{result.urgency}</Badge>
                      </div>
                    )}
                  </div>
                </Card>

                {(result.tail_position || result.ear_position || result.posture) && (
                  <Card className="p-5">
                    <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                      <Dog className="w-5 h-5 text-primary" /> {t.barkTranslator.bodyLanguage}
                    </h3>
                    <div className="space-y-2">
                      {result.tail_position && (
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-medium text-muted-foreground min-w-[60px]">Tail:</span>
                          <span className="text-sm text-foreground" data-testid="text-tail">{result.tail_position}</span>
                        </div>
                      )}
                      {result.ear_position && (
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-medium text-muted-foreground min-w-[60px]">Ears:</span>
                          <span className="text-sm text-foreground" data-testid="text-ears">{result.ear_position}</span>
                        </div>
                      )}
                      {result.posture && (
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-medium text-muted-foreground min-w-[60px]">Posture:</span>
                          <span className="text-sm text-foreground" data-testid="text-posture">{result.posture}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                <Card className="p-5">
                  <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" /> {t.barkTranslator.results}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-analysis">
                    {result.body_language_analysis}
                  </p>
                </Card>

                {result.recommended_response && (
                  <Card className="p-5 border-primary/20 bg-primary/5">
                    <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" /> {t.barkTranslator.recommendation}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-recommendation">
                      {result.recommended_response}
                    </p>
                  </Card>
                )}
              </motion.div>
            ) : (
              <div className="h-full bg-card rounded-[2rem] border-2 border-dashed border-muted flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <Info className="w-12 h-12 mb-4 opacity-20" />
                <h3 className="text-xl font-bold mb-2">{t.barkTranslator.title}</h3>
                <p className="mb-4">{t.barkTranslator.subtitle}</p>
                <div className="text-xs space-y-1 text-muted-foreground/60">
                  <p>The AI analyzes your dog's body language, posture,</p>
                  <p>ear & tail position, and facial expression across multiple frames.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
