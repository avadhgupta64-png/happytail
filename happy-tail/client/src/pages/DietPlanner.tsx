import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UtensilsCrossed, Loader2, ArrowLeft, Sparkles, Clock, Droplets, Flame, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useGuest } from "@/lib/guest-context";
import { useLanguage } from "@/lib/language-context";

interface MealPlan {
  summary: string;
  daily_calories: string;
  water_intake: string;
  meals: {
    name: string;
    time: string;
    foods: string[];
    portion: string;
  }[];
  weekly_treats: string[];
  foods_to_avoid: string[];
  supplements: string[];
  tips: string[];
}

export default function DietPlanner() {
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [conditions, setConditions] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const { toast } = useToast();
  const { checkGuestAccess } = useGuest();
  const { lang } = useLanguage();

  const handleGenerate = async () => {
    if (!breed.trim() || !age.trim() || !weight.trim()) {
      toast({ title: "Missing info", description: "Please fill in breed, age, and weight.", variant: "destructive" });
      return;
    }
    if (!checkGuestAccess()) return;
    setIsLoading(true);
    try {
      const res = await apiRequest("POST", "/api/health/diet", { breed, age, weight, conditions, language: lang });
      const data = await res.json();
      setPlan(data);
    } catch (err) {
      toast({ title: "Failed", description: "Could not generate diet plan. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto" data-testid="diet-planner-page">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/health">
          <Button variant="ghost" size="icon" data-testid="button-back-health">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground" data-testid="text-diet-title">
            AI Diet Planner
          </h1>
          <p className="text-sm text-muted-foreground">Personalized meal plan tailored to your dog</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!plan ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            <Card className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-md bg-amber-500/10 flex items-center justify-center">
                  <UtensilsCrossed className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h2 className="font-bold text-foreground">Tell us about your dog</h2>
                  <p className="text-xs text-muted-foreground">We'll create a customized daily meal plan</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Breed</label>
                  <Input
                    placeholder="e.g. Labrador, Indian Spitz"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    data-testid="input-breed"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Age</label>
                  <Input
                    placeholder="e.g. 2 years, 6 months"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    data-testid="input-age"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Weight (kg)</label>
                  <Input
                    placeholder="e.g. 25"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    data-testid="input-weight"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Health conditions (optional)</label>
                  <Input
                    placeholder="e.g. allergies, joint pain"
                    value={conditions}
                    onChange={(e) => setConditions(e.target.value)}
                    data-testid="input-conditions"
                  />
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full"
                data-testid="button-generate-diet"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating Plan...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Generate Meal Plan</>
                )}
              </Button>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            <Card className="p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                <div>
                  <h2 className="text-xl font-bold font-display text-foreground mb-1">Your Dog's Meal Plan</h2>
                  <p className="text-sm text-muted-foreground">{plan.summary}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setPlan(null)} data-testid="button-new-plan">
                  New Plan
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                <div className="bg-amber-500/10 rounded-md p-3 text-center">
                  <Flame className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Daily Calories</p>
                  <p className="font-bold text-sm text-foreground">{plan.daily_calories}</p>
                </div>
                <div className="bg-blue-500/10 rounded-md p-3 text-center">
                  <Droplets className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Water Intake</p>
                  <p className="font-bold text-sm text-foreground">{plan.water_intake}</p>
                </div>
                <div className="bg-emerald-500/10 rounded-md p-3 text-center col-span-2 sm:col-span-1">
                  <Clock className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Meals/Day</p>
                  <p className="font-bold text-sm text-foreground">{plan.meals.length}</p>
                </div>
              </div>

              <div className="space-y-3">
                {plan.meals.map((meal, idx) => (
                  <div key={idx} className="border border-border rounded-md p-4" data-testid={`meal-${idx}`}>
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <h3 className="font-bold text-foreground text-sm">{meal.name}</h3>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{meal.time}</span>
                    </div>
                    <ul className="space-y-1">
                      {meal.foods.map((food, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-primary mt-2 shrink-0" />
                          {food}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-primary font-medium mt-2">Portion: {meal.portion}</p>
                  </div>
                ))}
              </div>
            </Card>

            {plan.supplements.length > 0 && (
              <Card className="p-5">
                <h3 className="font-bold text-foreground text-sm mb-3">Recommended Supplements</h3>
                <div className="flex flex-wrap gap-2">
                  {plan.supplements.map((s, i) => (
                    <span key={i} className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs px-3 py-1 rounded-full font-medium">{s}</span>
                  ))}
                </div>
              </Card>
            )}

            {plan.foods_to_avoid.length > 0 && (
              <Card className="p-5 border-red-200/50 dark:border-red-900/30">
                <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" /> Foods to Avoid
                </h3>
                <div className="flex flex-wrap gap-2">
                  {plan.foods_to_avoid.map((f, i) => (
                    <span key={i} className="bg-red-500/10 text-red-700 dark:text-red-400 text-xs px-3 py-1 rounded-full font-medium">{f}</span>
                  ))}
                </div>
              </Card>
            )}

            {plan.tips.length > 0 && (
              <Card className="p-5">
                <h3 className="font-bold text-foreground text-sm mb-3">Feeding Tips</h3>
                <ul className="space-y-2">
                  {plan.tips.map((tip, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-amber-500 mt-2 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
