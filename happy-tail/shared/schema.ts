import { pgTable, text, serial, integer, boolean, timestamp, jsonb, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Import chat models from integration
export * from "./models/chat";
export * from "./models/auth";

// === TABLE DEFINITIONS ===

export const breeds = pgTable("breeds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  traits: jsonb("traits").$type<string[]>().notNull(), // e.g. ["Friendly", "Active"]
  imageUrl: text("image_url").notNull(),
  careGuide: text("care_guide").notNull(),
});

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'park', 'vet', 'restricted', 'cafe'
  description: text("description").notNull(),
  address: text("address").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  rules: text("rules"), // specific rules for this location
});

export const emotionLogs = pgTable("emotion_logs", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  detectedEmotion: text("detected_emotion").notNull(),
  detectedBreed: text("detected_breed").notNull().default("Unknown"),
  mood: text("mood").notNull(),
  suggestion: text("suggestion").notNull(),
  explanation: text("explanation").notNull().default(""),
  treatment: text("treatment").notNull().default(""),
  deviceId: text("device_id").notNull().default("unknown"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dogProfiles = pgTable("dog_profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  dogName: text("dog_name").notNull(),
  breed: text("breed").notNull(),
  age: text("age").notNull(),
  weight: text("weight"),
  gender: text("gender"),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const visitorLogs = pgTable("visitor_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  visitedAt: timestamp("visited_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  activityType: text("activity_type").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  details: jsonb("details").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===

export const insertBreedSchema = createInsertSchema(breeds).omit({ id: true });
export const insertLocationSchema = createInsertSchema(locations).omit({ id: true });
export const insertEmotionLogSchema = createInsertSchema(emotionLogs).omit({ id: true, createdAt: true });
export const insertDogProfileSchema = createInsertSchema(dogProfiles).omit({ id: true, createdAt: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({ id: true, createdAt: true });

// === TYPES ===

export type Breed = typeof breeds.$inferSelect;
export type InsertBreed = z.infer<typeof insertBreedSchema>;

export type Location = typeof locations.$inferSelect;
export type InsertLocation = z.infer<typeof insertLocationSchema>;

export type EmotionLog = typeof emotionLogs.$inferSelect;
export type InsertEmotionLog = z.infer<typeof insertEmotionLogSchema>;

export type DogProfile = typeof dogProfiles.$inferSelect;
export type InsertDogProfile = z.infer<typeof insertDogProfileSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

// Analysis Request
export const analyzeEmotionSchema = z.object({
  image: z.string().describe("Base64 encoded image"),
  deviceId: z.string().optional(),
  language: z.string().optional(),
});
export type AnalyzeEmotionRequest = z.infer<typeof analyzeEmotionSchema>;

export const analyzeEmotionResponseSchema = z.object({
  breed: z.string(),
  emotion: z.string(),
  mood: z.string(),
  explanation: z.string(),
  treatment: z.string(),
  suggestion: z.string(),
});
export type AnalyzeEmotionResponse = z.infer<typeof analyzeEmotionResponseSchema>;

