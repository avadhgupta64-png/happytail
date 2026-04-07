import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Users, Activity, Camera, Dog, Eye, Download,
  ChevronDown, ChevronUp, Search, RefreshCw,
  Shield, Clock, TrendingUp, FileSpreadsheet
} from "lucide-react";

interface AdminUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AdminActivity {
  id: number;
  userId: string;
  activityType: string;
  title: string;
  summary: string;
  details: Record<string, any> | null;
  createdAt: string;
}

interface AdminStats {
  totalUsers: number;
  totalActivities: number;
  totalEmotionScans: number;
  totalDogProfiles: number;
  uniqueVisitors: number;
}

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

function StatCard({ icon: Icon, label, value, gradient }: { icon: typeof Users; label: string; value: number; gradient: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-5 bg-gradient-to-br ${gradient} text-white shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <Icon className="w-10 h-10 opacity-60" />
      </div>
    </motion.div>
  );
}

function UserRow({ user }: { user: AdminUser }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
      {user.profileImageUrl ? (
        <img src={user.profileImageUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
          {(user.firstName || user.id)?.[0]?.toUpperCase() || "?"}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">
          {user.firstName || ""} {user.lastName || ""}
          {!user.firstName && !user.lastName && <span className="text-muted-foreground">User {user.id}</span>}
        </p>
        <p className="text-xs text-muted-foreground truncate">{user.email || "No email"}</p>
      </div>
      <div className="text-xs text-muted-foreground whitespace-nowrap">
        <Clock className="w-3 h-3 inline mr-1" />
        {formatDate(user.createdAt)}
      </div>
    </div>
  );
}

const activityTypeLabels: Record<string, string> = {
  emotion_scan: "Emotion Scan",
  bark_translation: "Bark Translation",
  health_scan: "Health Scan",
  diet_plan: "Diet Plan",
  vet_chat: "Vet Chat",
};

const activityColors: Record<string, string> = {
  emotion_scan: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  bark_translation: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  health_scan: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  diet_plan: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  vet_chat: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

function ActivityRow({ activity, userName }: { activity: AdminActivity; userName: string }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${activityColors[activity.activityType] || "bg-gray-100 text-gray-700"}`}>
          {activityTypeLabels[activity.activityType] || activity.activityType}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm truncate">{activity.title}</p>
          <p className="text-xs text-muted-foreground truncate">{activity.summary}</p>
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap mr-2">
          {userName}
        </span>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDate(activity.createdAt)}
        </span>
        {activity.details && (expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />)}
      </div>
      {expanded && activity.details && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
          {Object.entries(activity.details).map(([key, val]) => (
            <div key={key} className="flex gap-2 text-xs">
              <span className="text-muted-foreground font-medium capitalize min-w-[120px]">{key.replace(/_/g, " ")}:</span>
              <span className="text-foreground">{typeof val === "object" ? JSON.stringify(val) : String(val)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"users" | "activities">("users");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: adminCheck } = useQuery({
    queryKey: ["/api/admin/check"],
    queryFn: async () => {
      const res = await fetch("/api/admin/check", { credentials: "include" });
      return res.json();
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Forbidden");
      return res.json();
    },
    enabled: adminCheck?.isAdmin === true,
  });

  const { data: allUsers = [], isLoading: usersLoading, refetch: refetchUsers } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (!res.ok) throw new Error("Forbidden");
      return res.json();
    },
    enabled: adminCheck?.isAdmin === true,
    refetchInterval: 5000,
  });

  const { data: allActivities = [], isLoading: activitiesLoading, refetch: refetchActivities } = useQuery<AdminActivity[]>({
    queryKey: ["/api/admin/all-activities"],
    queryFn: async () => {
      const res = await fetch("/api/admin/all-activities", { credentials: "include" });
      if (!res.ok) throw new Error("Forbidden");
      return res.json();
    },
    enabled: adminCheck?.isAdmin === true,
    refetchInterval: 5000,
  });

  if (adminCheck && !adminCheck.isAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground mt-2">This page is restricted to the administrator.</p>
        </div>
      </div>
    );
  }

  const filteredUsers = allUsers.filter(u => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (u.firstName?.toLowerCase().includes(q) || u.lastName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.id.includes(q));
  });

  const filteredActivities = allActivities.filter(a => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q) || a.userId.includes(q) || a.activityType.includes(q));
  });

  const handleExport = async (type: string) => {
    try {
      const res = await fetch(`/api/admin/export/${type}`, { credentials: "include" });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-950 p-4 md:p-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Monitor all users and activity in real-time</p>
          </div>
        </div>
      </motion.div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <StatCard icon={Users} label="Total Users" value={stats.totalUsers} gradient="from-blue-500 to-blue-600" />
          <StatCard icon={Activity} label="Activities" value={stats.totalActivities} gradient="from-amber-500 to-orange-600" />
          <StatCard icon={Camera} label="Emotion Scans" value={stats.totalEmotionScans} gradient="from-sky-400 to-cyan-600" />
          <StatCard icon={Dog} label="Dog Profiles" value={stats.totalDogProfiles} gradient="from-emerald-500 to-green-600" />
          <StatCard icon={Eye} label="Unique Visitors" value={stats.uniqueVisitors} gradient="from-purple-500 to-violet-600" />
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === "users" ? "bg-primary text-white" : "bg-white dark:bg-gray-900 text-muted-foreground border border-gray-200 dark:border-gray-800"}`}
          >
            <Users className="w-4 h-4 inline mr-1.5" />
            Users ({allUsers.length})
          </button>
          <button
            onClick={() => setActiveTab("activities")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === "activities" ? "bg-primary text-white" : "bg-white dark:bg-gray-900 text-muted-foreground border border-gray-200 dark:border-gray-800"}`}
          >
            <Activity className="w-4 h-4 inline mr-1.5" />
            Activity ({allActivities.length})
          </button>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button
            onClick={() => { refetchUsers(); refetchActivities(); }}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => handleExport("users")} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
          <Download className="w-3 h-3" /> Export Users CSV
        </button>
        <button onClick={() => handleExport("all-activities")} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
          <Download className="w-3 h-3" /> Export Activities CSV
        </button>
        <button onClick={() => handleExport("all-emotion-logs")} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors">
          <Download className="w-3 h-3" /> Export Emotion Logs CSV
        </button>
      </div>

      {activeTab === "users" && (
        <div className="space-y-2">
          {usersLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No users found</div>
          ) : (
            filteredUsers.map(user => <UserRow key={user.id} user={user} />)
          )}
        </div>
      )}

      {activeTab === "activities" && (
        <div className="space-y-2">
          {activitiesLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading activities...</div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No activities found</div>
          ) : (
            filteredActivities.map(activity => {
              const user = allUsers.find(u => u.id === activity.userId);
              const name = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || `User ${user.id}` : `User ${activity.userId}`;
              return <ActivityRow key={activity.id} activity={activity} userName={name} />;
            })
          )}
        </div>
      )}

      <div className="mt-6 p-4 rounded-xl bg-violet-50 dark:bg-violet-900/10 border border-violet-200 dark:border-violet-800/30">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-violet-500" />
          <span className="text-sm font-medium text-violet-700 dark:text-violet-400">Auto-Refresh Active</span>
        </div>
        <p className="text-xs text-violet-600/70 dark:text-violet-400/60">
          Data refreshes every 5 seconds. New users and activities appear in real time.
        </p>
      </div>
    </div>
  );
}
