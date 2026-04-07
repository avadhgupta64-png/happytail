import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, MessageSquare, Stethoscope, UtensilsCrossed, HeartPulse, Clock, ChevronDown, ChevronUp, Trash2, Trash } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ActivityLog {
  id: number;
  userId: string;
  activityType: string;
  title: string;
  summary: string;
  details: Record<string, any> | null;
  createdAt: string;
}

const activityConfig: Record<string, { icon: typeof Camera; gradient: string; bg: string; color: string }> = {
  emotion_scan: { icon: Camera, gradient: "from-sky-400 to-blue-600", bg: "bg-blue-500/10", color: "text-blue-500" },
  bark_translation: { icon: MessageSquare, gradient: "from-amber-400 to-orange-600", bg: "bg-orange-500/10", color: "text-orange-500" },
  health_scan: { icon: Stethoscope, gradient: "from-red-400 to-rose-600", bg: "bg-red-500/10", color: "text-red-500" },
  diet_plan: { icon: UtensilsCrossed, gradient: "from-emerald-400 to-green-600", bg: "bg-green-500/10", color: "text-green-500" },
  vet_chat: { icon: HeartPulse, gradient: "from-purple-400 to-violet-600", bg: "bg-purple-500/10", color: "text-purple-500" },
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value || value === "undefined") return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-muted-foreground font-medium min-w-[100px]">{label}:</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

function ActivityCard({ activity, onDelete }: { activity: ActivityLog; onDelete: (id: number) => void }) {
  const [expanded, setExpanded] = useState(false);
  const config = activityConfig[activity.activityType] || activityConfig.emotion_scan;
  const Icon = config.icon;
  const details = activity.details;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
    >
      <div
        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={`${config.bg} p-2.5 rounded-xl shrink-0`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-sm text-foreground">{activity.title}</h3>
            <div className="flex items-center gap-1.5 shrink-0">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{formatDate(activity.createdAt)}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{activity.summary}</p>
        </div>
        <div className="shrink-0 mt-1 flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(activity.id);
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Delete this entry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {expanded && details && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="border-t border-gray-100 dark:border-gray-800 px-4 py-3 space-y-1.5 bg-gray-50/50 dark:bg-gray-800/30"
        >
          {activity.activityType === "emotion_scan" && (
            <>
              <DetailRow label="Breed" value={details.breed} />
              <DetailRow label="Emotion" value={details.emotion} />
              <DetailRow label="Mood" value={details.mood} />
              <DetailRow label="Suggestion" value={details.suggestion} />
            </>
          )}
          {activity.activityType === "bark_translation" && (
            <>
              <DetailRow label="Breed" value={details.breed} />
              <DetailRow label="Bark Type" value={details.barkType} />
              <DetailRow label="Emotion" value={details.emotion} />
              <DetailRow label="Confidence" value={details.confidence} />
              <DetailRow label="Message" value={details.message} />
            </>
          )}
          {activity.activityType === "health_scan" && (
            <>
              <DetailRow label="Breed" value={details.breed} />
              <DetailRow label="Emergency" value={details.is_emergency ? "Yes" : "No"} />
              <DetailRow label="Conditions" value={Array.isArray(details.possible_conditions) ? details.possible_conditions.join(", ") : ""} />
              <DetailRow label="Home Remedy" value={details.home_remedy} />
              <DetailRow label="Analysis" value={details.detailed_analysis} />
            </>
          )}
          {activity.activityType === "diet_plan" && (
            <>
              <DetailRow label="Breed" value={details.breed} />
              <DetailRow label="Age" value={details.age} />
              <DetailRow label="Weight" value={details.weight ? `${details.weight} kg` : ""} />
              <DetailRow label="Calories" value={details.daily_calories} />
              <DetailRow label="Water" value={details.water_intake} />
              <DetailRow label="Summary" value={details.summary} />
            </>
          )}
          {activity.activityType === "vet_chat" && (
            <>
              <DetailRow label="Question" value={details.question} />
              <DetailRow label="AI Reply" value={details.reply} />
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

export default function History() {
  const [filter, setFilter] = useState<string>("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: activities = [], isLoading } = useQuery<ActivityLog[]>({
    queryKey: ["/api/activity-history"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/activity-history/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activity-history"] });
      toast({ title: "Entry deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete", variant: "destructive" });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/activity-history/all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activity-history"] });
      toast({ title: "History cleared", description: "All activity history has been deleted." });
    },
    onError: () => {
      toast({ title: "Failed to clear history", variant: "destructive" });
    },
  });

  const filtered = filter === "all" ? activities : activities.filter((a) => a.activityType === filter);

  const filters = [
    { key: "all", label: "All" },
    { key: "emotion_scan", label: "Emotion Scans" },
    { key: "bark_translation", label: "Bark Translations" },
    { key: "health_scan", label: "Health Scans" },
    { key: "diet_plan", label: "Diet Plans" },
    { key: "vet_chat", label: "Vet Chats" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Activity History</h1>
          <p className="text-sm text-muted-foreground mt-1">Everything you've done with Happy Tail</p>
        </div>

        {activities.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
              >
                <Trash className="w-3.5 h-3.5 mr-1.5" />
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all history?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all your activity history. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => clearAllMutation.mutate()}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-gray-100 dark:bg-gray-800 text-muted-foreground hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">No activity yet</h3>
          <p className="text-sm text-muted-foreground">
            {filter === "all"
              ? "Start using features like Emotion Detector or Bark Translator to see your history here!"
              : "No activities of this type yet. Try using this feature!"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
