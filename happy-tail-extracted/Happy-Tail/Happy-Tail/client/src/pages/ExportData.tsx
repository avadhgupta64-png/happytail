import { motion } from "framer-motion";
import { Download, Dog, MapPin, Camera, Clock, Heart, FileSpreadsheet } from "lucide-react";
import { useState } from "react";

interface ExportOption {
  id: string;
  title: string;
  description: string;
  endpoint: string;
  filename: string;
  icon: typeof Download;
  color: string;
  bg: string;
}

const exportOptions: ExportOption[] = [
  {
    id: "breeds",
    title: "Dog Breeds",
    description: "All 50+ breeds with descriptions, traits, images, and care guides",
    endpoint: "/api/export/breeds",
    filename: "breeds.csv",
    icon: Dog,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    id: "activity",
    title: "Activity History",
    description: "Your complete activity log — every scan, translation, and chat",
    endpoint: "/api/export/activity-history",
    filename: "activity-history.csv",
    icon: Clock,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    id: "emotions",
    title: "Emotion Scan Logs",
    description: "All emotion detection results with breed, mood, and suggestions",
    endpoint: "/api/export/emotion-logs",
    filename: "emotion-logs.csv",
    icon: Camera,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    id: "profiles",
    title: "Dog Profiles",
    description: "Your saved dog profiles with breed, age, weight, and details",
    endpoint: "/api/export/dog-profiles",
    filename: "dog-profiles.csv",
    icon: Heart,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    id: "locations",
    title: "Dog-Friendly Locations",
    description: "All parks, cafes, vets, and places with addresses and coordinates",
    endpoint: "/api/export/locations",
    filename: "locations.csv",
    icon: MapPin,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
];

function ExportCard({ option }: { option: ExportOption }) {
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);
  const Icon = option.icon;

  const handleDownload = async () => {
    setDownloading(true);
    setDone(false);
    try {
      const res = await fetch(option.endpoint, { credentials: "include" });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = option.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex items-center gap-4"
    >
      <div className={`${option.bg} p-3 rounded-xl shrink-0`}>
        <Icon className={`w-6 h-6 ${option.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground">{option.title}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">{option.description}</p>
      </div>
      <button
        onClick={handleDownload}
        disabled={downloading}
        className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
          done
            ? "bg-green-500/10 text-green-600"
            : downloading
            ? "bg-gray-100 dark:bg-gray-800 text-muted-foreground cursor-wait"
            : "bg-primary/10 text-primary hover:bg-primary/20"
        }`}
      >
        {done ? (
          "Downloaded!"
        ) : downloading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            CSV
          </>
        )}
      </button>
    </motion.div>
  );
}

export default function ExportData() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-2.5 rounded-xl">
          <FileSpreadsheet className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Export Data</h1>
          <p className="text-sm text-muted-foreground">Download your data as CSV files for Excel or Google Sheets</p>
        </div>
      </div>

      <div className="space-y-3">
        {exportOptions.map((option, i) => (
          <motion.div key={option.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <ExportCard option={option} />
          </motion.div>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl p-4">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Your personal data (Activity History, Dog Profiles) only includes your own records. Shared data (Breeds, Locations) includes all entries.
        </p>
      </div>
    </motion.div>
  );
}
