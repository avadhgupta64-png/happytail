-- Migration 0003: scope emotion scans to the authenticated account.
-- Existing historical rows are assigned to "unknown" and are intentionally not exposed to any user.
ALTER TABLE "emotion_logs"
  ADD COLUMN IF NOT EXISTS "user_id" text NOT NULL DEFAULT 'unknown';

CREATE INDEX IF NOT EXISTS "emotion_logs_user_created_idx"
  ON "emotion_logs" ("user_id", "created_at" DESC);
