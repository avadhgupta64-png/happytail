import { db } from "./db";
import {
  breeds, locations, emotionLogs, activityLogs, feedback,
  aiUsageLogs, userFeaturePermissions,
  type Breed, type InsertBreed,
  type Location, type InsertLocation,
  type EmotionLog, type InsertEmotionLog,
  type ActivityLog, type InsertActivityLog,
  type Feedback, type InsertFeedback,
  type AiUsageLog, type UserFeaturePermission,
} from "@shared/schema";
import { eq, desc, isNull, and, sql } from "drizzle-orm";

// ─── Constants ──────────────────────────────────────────────────────────────
export const AI_FEATURE_LIMIT = 3; // uses per feature per normal user

export const FEATURE_KEYS = [
  "emotion_scan",
  "behavior_analysis",
  "bark_translation",
  "health_scan",
  "diet_plan",
  "vet_chat",
  "location_search",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

// ─── Interface ───────────────────────────────────────────────────────────────
export interface IStorage {
  // Breeds
  getBreeds(): Promise<Breed[]>;
  getBreed(id: number): Promise<Breed | undefined>;
  createBreed(breed: InsertBreed): Promise<Breed>;

  // Locations
  getLocations(): Promise<Location[]>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocation(id: number, input: Partial<InsertLocation>): Promise<Location>;
  deleteLocation(id: number): Promise<void>;

  // Emotion Logs
  createEmotionLog(log: InsertEmotionLog): Promise<EmotionLog>;
  getEmotionHistory(deviceId?: string): Promise<EmotionLog[]>;

  // Activity Logs
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getActivityHistory(userId: string): Promise<ActivityLog[]>;

  // Feedback
  getAllFeedback(): Promise<Feedback[]>;
  createFeedback(entry: InsertFeedback): Promise<Feedback>;
  addFeedbackComment(id: number, adminComment: string): Promise<Feedback | undefined>;
  resolveFeedback(id: number, resolved: boolean): Promise<Feedback | undefined>;

  // AI Usage Limits
  getUsageCount(userId: string, featureKey: string): Promise<number>;
  incrementUsage(userId: string, featureKey: string): Promise<number>;
  getUserUsageSummary(userId: string): Promise<Record<string, number>>;

  // Feature Permissions (admin-granted unlimited)
  hasUnlimitedAccess(userId: string, featureKey: string): Promise<boolean>;
  grantUnlimitedAccess(userId: string, featureKey: string, grantedBy: string): Promise<void>;
  revokeUnlimitedAccess(userId: string, featureKey: string): Promise<void>;
  getUserPermissions(userId: string): Promise<UserFeaturePermission[]>;
  getAllPermissions(): Promise<UserFeaturePermission[]>;
}

// ─── Implementation ──────────────────────────────────────────────────────────
export class DatabaseStorage implements IStorage {
  // ── Breeds ──────────────────────────────────────────────────────────────────
  async getBreeds(): Promise<Breed[]> {
    return await db.select().from(breeds);
  }

  async getBreed(id: number): Promise<Breed | undefined> {
    const [breed] = await db.select().from(breeds).where(eq(breeds.id, id));
    return breed;
  }

  async createBreed(breed: InsertBreed): Promise<Breed> {
    const [newBreed] = await db.insert(breeds).values(breed).returning();
    return newBreed;
  }

  // ── Locations ────────────────────────────────────────────────────────────────
  async getLocations(): Promise<Location[]> {
    return await db.select().from(locations);
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const [newLocation] = await db.insert(locations).values(location).returning();
    return newLocation;
  }

  async updateLocation(id: number, input: Partial<InsertLocation>): Promise<Location> {
    const [updated] = await db.update(locations).set(input).where(eq(locations.id, id)).returning();
    return updated;
  }

  async deleteLocation(id: number): Promise<void> {
    await db.delete(locations).where(eq(locations.id, id));
  }

  // ── Emotion Logs ─────────────────────────────────────────────────────────────
  async createEmotionLog(log: InsertEmotionLog): Promise<EmotionLog> {
    const [newLog] = await db.insert(emotionLogs).values(log).returning();
    return newLog;
  }

  async getEmotionHistory(_deviceId?: string): Promise<EmotionLog[]> {
    return await db.select().from(emotionLogs).orderBy(desc(emotionLogs.createdAt)).limit(50);
  }

  // ── Activity Logs ────────────────────────────────────────────────────────────
  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [newLog] = await db.insert(activityLogs).values(log).returning();
    return newLog;
  }

  async getActivityHistory(userId: string): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLogs)
      .where(and(eq(activityLogs.userId, userId), isNull(activityLogs.deletedAt)))
      .orderBy(desc(activityLogs.createdAt));
  }

  // ── Feedback ─────────────────────────────────────────────────────────────────
  async getAllFeedback(): Promise<Feedback[]> {
    return await db.select().from(feedback).orderBy(desc(feedback.createdAt));
  }

  async createFeedback(entry: InsertFeedback): Promise<Feedback> {
    const [newEntry] = await db.insert(feedback).values(entry).returning();
    return newEntry;
  }

  async addFeedbackComment(id: number, adminComment: string): Promise<Feedback | undefined> {
    const [updated] = await db
      .update(feedback)
      .set({ adminComment, updatedAt: new Date() })
      .where(eq(feedback.id, id))
      .returning();
    return updated;
  }

  async resolveFeedback(id: number, resolved: boolean): Promise<Feedback | undefined> {
    const [updated] = await db
      .update(feedback)
      .set({ resolved, updatedAt: new Date() })
      .where(eq(feedback.id, id))
      .returning();
    return updated;
  }

  // ── AI Usage Limits ──────────────────────────────────────────────────────────
  async getUsageCount(userId: string, featureKey: string): Promise<number> {
    const [row] = await db
      .select({ usageCount: aiUsageLogs.usageCount })
      .from(aiUsageLogs)
      .where(and(eq(aiUsageLogs.userId, userId), eq(aiUsageLogs.featureKey, featureKey)));
    return row?.usageCount ?? 0;
  }

  async incrementUsage(userId: string, featureKey: string): Promise<number> {
    // Upsert: insert with count=1 or increment existing count
    const [row] = await db
      .insert(aiUsageLogs)
      .values({ userId, featureKey, usageCount: 1, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: [aiUsageLogs.userId, aiUsageLogs.featureKey],
        set: {
          usageCount: sql`${aiUsageLogs.usageCount} + 1`,
          updatedAt: new Date(),
        },
      })
      .returning({ usageCount: aiUsageLogs.usageCount });
    return row.usageCount;
  }

  async getUserUsageSummary(userId: string): Promise<Record<string, number>> {
    const rows = await db
      .select({ featureKey: aiUsageLogs.featureKey, usageCount: aiUsageLogs.usageCount })
      .from(aiUsageLogs)
      .where(eq(aiUsageLogs.userId, userId));
    const result: Record<string, number> = {};
    for (const row of rows) result[row.featureKey] = row.usageCount;
    return result;
  }

  // ── Feature Permissions ──────────────────────────────────────────────────────
  async hasUnlimitedAccess(userId: string, featureKey: string): Promise<boolean> {
    // Check for "all" grant first, then specific feature
    const rows = await db
      .select({ featureKey: userFeaturePermissions.featureKey })
      .from(userFeaturePermissions)
      .where(eq(userFeaturePermissions.userId, userId));
    return rows.some((r) => r.featureKey === "all" || r.featureKey === featureKey);
  }

  async grantUnlimitedAccess(userId: string, featureKey: string, grantedBy: string): Promise<void> {
    await db
      .insert(userFeaturePermissions)
      .values({ userId, featureKey, grantedBy, grantedAt: new Date() })
      .onConflictDoUpdate({
        target: [userFeaturePermissions.userId, userFeaturePermissions.featureKey],
        set: { grantedBy, grantedAt: new Date() },
      });
  }

  async revokeUnlimitedAccess(userId: string, featureKey: string): Promise<void> {
    await db
      .delete(userFeaturePermissions)
      .where(
        and(
          eq(userFeaturePermissions.userId, userId),
          eq(userFeaturePermissions.featureKey, featureKey),
        ),
      );
  }

  async getUserPermissions(userId: string): Promise<UserFeaturePermission[]> {
    return await db
      .select()
      .from(userFeaturePermissions)
      .where(eq(userFeaturePermissions.userId, userId));
  }

  async getAllPermissions(): Promise<UserFeaturePermission[]> {
    return await db.select().from(userFeaturePermissions);
  }
}

export const storage = new DatabaseStorage();
