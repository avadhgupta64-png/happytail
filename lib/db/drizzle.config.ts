// Schema is managed by the happy-tail app directly (happy-tail/shared/schema.ts)
// The lib/db workspace package does not own any database schema.
// Run migrations via: cd happy-tail && npx drizzle-kit push --config push.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
