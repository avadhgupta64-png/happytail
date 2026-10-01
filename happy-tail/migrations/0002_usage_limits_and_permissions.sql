-- Migration: AI usage limits and per-user feature permissions
-- Run with: cd happy-tail && npm run db:push  (or apply manually)

-- Add resolved column to feedback (if it doesn't already exist)
ALTER TABLE "feedback" ADD COLUMN IF NOT EXISTS "resolved" boolean DEFAULT false NOT NULL;

-- AI usage counter: one row per (user_id, feature_key)
CREATE TABLE IF NOT EXISTS "ai_usage_logs" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "feature_key" text NOT NULL,
  "usage_count" integer DEFAULT 0 NOT NULL,
  "updated_at" timestamp DEFAULT now(),
  CONSTRAINT "ai_usage_unique" UNIQUE ("user_id", "feature_key")
);

-- Admin-granted unlimited access per user+feature
CREATE TABLE IF NOT EXISTS "user_feature_permissions" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "feature_key" text NOT NULL,
  "granted_by" text NOT NULL,
  "granted_at" timestamp DEFAULT now(),
  CONSTRAINT "user_feature_perm_unique" UNIQUE ("user_id", "feature_key")
);
