import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  serial,
  integer,
  timestamp,
  jsonb,
  doublePrecision,
  varchar,
  index,
} from "drizzle-orm/pg-core";

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  bio: varchar("bio"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const breeds = pgTable("breeds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  traits: jsonb("traits").$type<string[]>().notNull(),
  imageUrl: text("image_url").notNull(),
  careGuide: text("care_guide").notNull(),
});

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  rules: text("rules"),
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
  details: jsonb("details").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow(),
});
