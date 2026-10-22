-- Happy Tail migration 0004: private scan history and AI access requests.
-- Safe to run more than once.
ALTER TABLE "emotion_logs"
  ADD COLUMN IF NOT EXISTS "user_id" text NOT NULL DEFAULT 'unknown';

CREATE INDEX IF NOT EXISTS "emotion_logs_user_created_idx"
  ON "emotion_logs" ("user_id", "created_at" DESC);

CREATE TABLE IF NOT EXISTS "ai_access_requests" (
  "id" serial PRIMARY KEY,
  "user_id" text NOT NULL,
  "feature_key" text NOT NULL,
  "status" text NOT NULL DEFAULT 'pending',
  "requested_at" timestamp DEFAULT now(),
  "reviewed_at" timestamp,
  "reviewed_by" text
);

CREATE INDEX IF NOT EXISTS "ai_access_requests_status_requested_idx"
  ON "ai_access_requests" ("status", "requested_at" DESC);
CREATE INDEX IF NOT EXISTS "ai_access_requests_user_feature_idx"
  ON "ai_access_requests" ("user_id", "feature_key", "status");
