import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, HeartPulse, Loader2, Sparkles, Stethoscope, AlertCircle, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest, UnauthorizedError } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { useGuest } from "@/lib/guest-context";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { checkGuestAccess, setShowLoginPrompt } = useGuest();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    if (images.length + files.length > 5) {
      toast({ title: "Limit exceeded", description: "Please upload exactly 5 photos.", variant: "destructive" });
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCheckup = async () => {
    if (images.length < 5) {
      toast({ title: "More photos needed", description: "Please upload 5 photos for a complete analysis.", variant: "destructive" });
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/health">
          <Button variant="ghost" size="icon" data-testid="button-back-health">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">{t.healthScan.title}</h1>
          <p className="text-sm text-muted-foreground">{t.healthScan.subtitle}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] p-8 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" /> 
              {t.healthScan.uploadPhotos} ({images.length}/5)
            </h3>
            
            <div className="grid grid-cols-3 gap-3 mb-6">
              {images.map((img, idx) => (
                <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-gray-100 border relative group">
                  <img src={img} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-all"
                >
                  <Upload className="w-6 h-6 mb-2" />
                  <span className="text-xs">{t.common.upload}</span>
                </button>
              )}
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              multiple 
              className="hidden" 
            />

            <Button 
              onClick={handleCheckup} 
              disabled={isAnalyzing || images.length < 5}
              className="w-full py-6 rounded-xl text-lg font-bold"
            >
              {isAnalyzing ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> {t.healthScan.analyzing}</>
              ) : (
                <><Sparkles className="w-5 h-5 mr-2" /> {t.healthScan.title}</>
              )}
            </Button>
          </div>

          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
            <h4 className="font-bold text-amber-800 flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5" /> Important Disclaimer
            </h4>
            <p className="text-amber-700 text-sm leading-relaxed">
              This AI tool is for informational purposes only and is not a substitute for professional veterinary advice, diagnosis, or treatment. Always seek the advice of your veterinarian with any questions regarding a medical condition.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-display font-bold text-gray-800">{result.breed}</h2>
                    <p className="text-gray-500">{t.healthScan.results}</p>
                  </div>
                  {result.is_emergency ? (
                    <Badge variant="destructive" className="px-4 py-1 text-sm flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> Emergency
                    </Badge>
                  ) : (
                    <Badge className="bg-green-500 hover:bg-green-600 px-4 py-1 text-sm flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Non-Emergency
                    </Badge>
                  )}
                </div>

                <div className="space-y-6 flex-1">
                  <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                    <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                      <Stethoscope className="w-5 h-5" /> {t.healthScan.conditions}
                    </h3>
                    <ul className="grid grid-cols-2 gap-2">
                      {result.possible_conditions.map((cond, i) => (
                        <li key={i} className="text-red-700 text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> {cond}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                    <h3 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
                      <HeartPulse className="w-5 h-5" /> {t.healthScan.homeRemedy}
                    </h3>
                    <p className="text-emerald-700 text-sm leading-relaxed">
                      {result.home_remedy}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <h3 className="font-bold text-gray-700 mb-2 italic">Detailed AI Observation</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {result.detailed_analysis}
                    </p>
                  </div>
                </div>

                <Button 
                  className="mt-8 py-6 rounded-xl bg-gray-900 hover:bg-gray-800"
                  onClick={() => {setImages([]); setResult(null);}}
                >
                  {t.emotionDetector.tryAnother}
                </Button>
              </motion.div>
            ) : (
              <div className="h-full bg-white rounded-[2rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-12 text-center text-gray-400">
                <Stethoscope className="w-16 h-16 mb-4 opacity-10" />
                <h3 className="text-2xl font-bold mb-2">{t.healthScan.title}</h3>
                <p className="max-w-xs">Upload 5 clear photos of the affected area or the dog's skin for analysis.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}