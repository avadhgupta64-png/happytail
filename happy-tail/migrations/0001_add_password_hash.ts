import { sql } from "drizzle-orm";

export default {
  up: sql`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
  `,
  down: sql`
    ALTER TABLE users DROP COLUMN IF EXISTS password_hash;
  `,
};
