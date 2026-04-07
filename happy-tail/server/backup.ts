import fs from "fs";
import path from "path";
import { db } from "./db";
import { users, activityLogs, emotionLogs, dogProfiles, visitorLogs, locations, breeds } from "../shared/schema";
import { log } from "./index";

const BACKUP_DIR = path.join(process.cwd(), "backups");
const MAX_BACKUPS = 10;

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

function pruneOldBackups() {
  const files = fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({ name: f, time: fs.statSync(path.join(BACKUP_DIR, f)).mtimeMs }))
    .sort((a, b) => b.time - a.time);

  if (files.length > MAX_BACKUPS) {
    files.slice(MAX_BACKUPS).forEach((f) => {
      fs.unlinkSync(path.join(BACKUP_DIR, f.name));
    });
  }
}

export async function runBackup(): Promise<string> {
  ensureBackupDir();

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `backup-${timestamp}.json`;
  const filepath = path.join(BACKUP_DIR, filename);

  const [
    allUsers,
    allActivities,
    allEmotions,
    allDogProfiles,
    allVisitors,
    allLocations,
    allBreeds,
  ] = await Promise.all([
    db.select().from(users),
    db.select().from(activityLogs),
    db.select().from(emotionLogs),
    db.select().from(dogProfiles),
    db.select().from(visitorLogs),
    db.select().from(locations),
    db.select().from(breeds),
  ]);

  const snapshot = {
    createdAt: new Date().toISOString(),
    counts: {
      users: allUsers.length,
      activityLogs: allActivities.length,
      emotionLogs: allEmotions.length,
      dogProfiles: allDogProfiles.length,
      visitorLogs: allVisitors.length,
      locations: allLocations.length,
      breeds: allBreeds.length,
    },
    data: {
      users: allUsers,
      activityLogs: allActivities,
      emotionLogs: allEmotions,
      dogProfiles: allDogProfiles,
      visitorLogs: allVisitors,
      locations: allLocations,
      breeds: allBreeds,
    },
  };

  fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2), "utf-8");
  pruneOldBackups();

  log(`[Backup] Saved ${filename} — ${allUsers.length} users, ${allActivities.length} activities`, "backup");
  return filepath;
}

export function listBackups(): { filename: string; createdAt: string; counts: Record<string, number> }[] {
  ensureBackupDir();
  const files = fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .reverse();

  return files.map((f) => {
    try {
      const raw = fs.readFileSync(path.join(BACKUP_DIR, f), "utf-8");
      const parsed = JSON.parse(raw);
      return { filename: f, createdAt: parsed.createdAt, counts: parsed.counts };
    } catch {
      return { filename: f, createdAt: "unknown", counts: {} };
    }
  });
}

export function getBackupPath(filename: string): string | null {
  const safe = path.basename(filename);
  const filepath = path.join(BACKUP_DIR, safe);
  return fs.existsSync(filepath) ? filepath : null;
}

export function scheduleBackups() {
  const INTERVAL_MS = 24 * 60 * 60 * 1000;
  runBackup().catch((err) => log(`[Backup] Initial backup failed: ${err}`, "backup"));
  setInterval(() => {
    runBackup().catch((err) => log(`[Backup] Scheduled backup failed: ${err}`, "backup"));
  }, INTERVAL_MS);
  log("[Backup] Automatic daily backups scheduled", "backup");
}
