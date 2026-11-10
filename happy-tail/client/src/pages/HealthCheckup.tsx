import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, HeartPulse, Loader2, Sparkles, Stethoscope,
  AlertCircle, CheckCircle2, XCircle, ArrowLeft, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest, UnauthorizedError } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { useGuest } from "@/lib/guest-context";
import { AIUsageCounter } from "@/components/AIUsageCounter";
import { AIUsageLimitRequest } from "@/components/AIUsageLimitRequest";

interface HealthResult {
  breed: string;
  is_emergency: boolean;
  possible_conditions: string[];
  home_remedy: string;
  detailed_analysis: string;
}

export default function HealthCheckup() {
  const { t, lang } = useLanguage();
  const [images, setImages] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<HealthResult | null>(null);
  // Always-mounted hidden input — prevents iOS click-chain issues
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { checkGuestAccess, setShowLoginPrompt } = useGuest();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // reset so the same file can be reselected

    if (files.length === 0) return;

    const remaining = 5 - images.length;
    if (remaining <= 0) {
      toast({ title: "Limit reached", description: "You can upload up to 5 photos.", variant: "destructive" });
      return;
    }

    if (files.length > remaining) {
      toast({
        title: `Only ${remaining} photo${remaining === 1 ? "" : "s"} allowed`,
        description: `You can add ${remaining} more photo${remaining === 1 ? "" : "s"} (max 5 total). Extra files were ignored.`,
        variant: "destructive",
      });
    }

    const toProcess = files.slice(0, remaining);
    let loaded = 0;
    const newImages: string[] = [];

    toProcess.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast({ title: "Unsupported file", description: `${file.name} is not an image.`, variant: "destructive" });
        loaded++;
        if (loaded === toProcess.length && newImages.length > 0) {
          setImages((prev) => [...prev, ...newImages]);
        }
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: `${file.name} exceeds 10 MB.`, variant: "destructive" });
        loaded++;
        if (loaded === toProcess.length && newImages.length > 0) {
          setImages((prev) => [...prev, ...newImages]);
        }
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result as string);
        loaded++;
        if (loaded === toProcess.length) {
          setImages((prev) => [...prev, ...newImages]);
        }
      };
      reader.onerror = () => { loaded++; };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCheckup = async () => {
    if (images.length === 0) {
      toast({ title: "No photos", description: "Please upload at least 1 photo.", variant: "destructive" });
      return;
    }
    if (!checkGuestAccess()) return;
    setIsAnalyzing(true);
    try {
      const res = await apiRequest("POST", "/api/health/checkup", { images, language: lang });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        setShowLoginPrompt(true);
      } else {
        toast({ title: "Checkup failed", description: "Could not analyze the photos. Please try again.", variant: "destructive" });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setImages([]);
    setResult(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <AIUsageCounter featureKey="health_scan" />
      <AIUsageLimitRequest featureKey="health_scan" />
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <Link href="/health">
          <Button variant="ghost" size="icon" data-testid="button-back-health">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-foreground leading-tight">
            {t.healthScan.title}
          </h1>
          <p className="text-sm text-muted-foreground">{t.healthScan.subtitle}</p>
        </div>
      </div>

      {/* Always-mounted hidden input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,image/jpeg,image/png,image/webp,image/heic"
        multiple
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleFileChange}
        data-testid="input-health-images"
      />

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left — upload panel */}
        <div className="space-y-5">
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-5 sm:p-8 shadow-lg border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary shrink-0" />
              {t.healthScan.uploadPhotos}
              <span className="text-muted-foreground text-sm font-normal ml-1">({images.length}/5)</span>
            </h3>

            {/* Image grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                >
                  <img src={img} alt={`Health photo ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(idx)}
                    aria-label="Remove image"
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Add slot */}
              {images.length < 5 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Add photo"
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary dark:hover:border-primary transition-all gap-1.5"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-xs font-medium">{t.common.upload}</span>
                </button>
              )}
            </div>

            <Button
              onClick={handleCheckup}
              disabled={isAnalyzing || images.length === 0}
              className="w-full py-5 rounded-xl text-base font-bold"
            >
              {isAnalyzing ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> {t.healthScan.analyzing}</>
              ) : (
                <><Sparkles className="w-5 h-5 mr-2" /> {t.healthScan.title}</>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-3">
              Accepts JPG, PNG, WebP · Max 10 MB per photo
              {images.length === 0
                ? " · Upload 1–5 photos to start"
                : images.length === 5
                ? " · Maximum 5 photos reached"
                : ` · ${5 - images.length} more photo${5 - images.length === 1 ? "" : "s"} allowed`}
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 sm:p-5 rounded-2xl border border-amber-100 dark:border-amber-800">
            <h4 className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2 mb-2 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" /> Important Disclaimer
            </h4>
            <p className="text-amber-700 dark:text-amber-400 text-xs sm:text-sm leading-relaxed">
              This AI tool is for informational purposes only and is not a substitute for professional
              veterinary advice, diagnosis, or treatment. Always consult your veterinarian for medical concerns.
            </p>
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
                className="bg-white dark:bg-gray-900 rounded-[2rem] p-5 sm:p-8 shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col"
              >
                <div className="flex justify-between items-start mb-5 gap-3">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-gray-800 dark:text-gray-100">
                      {result.breed}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{t.healthScan.results}</p>
                  </div>
                  {result.is_emergency ? (
                    <Badge variant="destructive" className="px-3 py-1 text-xs sm:text-sm flex items-center gap-1 shrink-0">
                      <XCircle className="w-3.5 h-3.5" /> Emergency
                    </Badge>
                  ) : (
                    <Badge className="bg-green-500 hover:bg-green-600 px-3 py-1 text-xs sm:text-sm flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Non-Emergency
                    </Badge>
                  )}
                </div>

                <div className="space-y-4 flex-1">
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 sm:p-5 rounded-2xl border border-red-100 dark:border-red-800">
                    <h3 className="font-bold text-red-800 dark:text-red-300 mb-3 flex items-center gap-2 text-sm">
                      <Stethoscope className="w-4 h-4 shrink-0" /> {t.healthScan.conditions}
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {result.possible_conditions.map((cond, i) => (
                        <li key={i} className="text-red-700 dark:text-red-400 text-sm flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                          {cond}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 sm:p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800">
                    <h3 className="font-bold text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-2 text-sm">
                      <HeartPulse className="w-4 h-4 shrink-0" /> {t.healthScan.homeRemedy}
                    </h3>
                    <p className="text-emerald-700 dark:text-emerald-400 text-sm leading-relaxed">
                      {result.home_remedy}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 sm:p-5 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2 text-sm">AI Observation</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {result.detailed_analysis}
                    </p>
                  </div>
                </div>

                <Button
                  className="mt-6 py-5 rounded-xl bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white"
                  onClick={handleReset}
                >
                  {t.emotionDetector.tryAnother}
                </Button>
              </motion.div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center p-10 text-center text-gray-400 min-h-[280px]">
                <Stethoscope className="w-14 h-14 mb-4 opacity-10" />
                <h3 className="text-xl font-bold mb-2 text-gray-500 dark:text-gray-400">{t.healthScan.title}</h3>
                <p className="text-sm max-w-xs">
                  Upload 1–5 clear photos of the affected area or your dog's skin for AI analysis.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
