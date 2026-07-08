import { db } from "./db";
import { 
  breeds, locations, emotionLogs, activityLogs, feedback,
  type Breed, type InsertBreed,
  type Location, type InsertLocation,
  type EmotionLog, type InsertEmotionLog,
  type ActivityLog, type InsertActivityLog,
  type Feedback, type InsertFeedback
} from "@shared/schema";
import { eq, desc, isNull, and } from "drizzle-orm";

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
}

export class DatabaseStorage implements IStorage {
  // Breeds
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

  // Locations
  async getLocations(): Promise<Location[]> {
    return await db.select().from(locations);
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    const [newLocation] = await db.insert(locations).values(location).returning();
    return newLocation;
  }

  async updateLocation(id: number, input: Partial<InsertLocation>): Promise<Location> {
    const [updated] = await db
      .update(locations)
      .set(input)
      .where(eq(locations.id, id))
      .returning();
    return updated;
  }

  async deleteLocation(id: number): Promise<void> {
    await db.delete(locations).where(eq(locations.id, id));
  }

  // Emotion Logs
  async createEmotionLog(log: InsertEmotionLog): Promise<EmotionLog> {
    const [newLog] = await db.insert(emotionLogs).values(log).returning();
    return newLog;
  }

  async getEmotionHistory(deviceId?: string): Promise<EmotionLog[]> {
    return await db
      .select()
      .from(emotionLogs)
      .orderBy(desc(emotionLogs.createdAt))
      .limit(50);
  }

  // Activity Logs
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

  // Feedback
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
}

export const storage = new DatabaseStorage();
