import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import { users } from "@shared/models/auth";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "No database URL found. Set DATABASE_URL.",
  );
}

export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });

export { users };
