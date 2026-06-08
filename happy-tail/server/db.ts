import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const connectionString = process.env.EXTERNAL_DB_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "No database URL found. Set EXTERNAL_DB_URL or DATABASE_URL.",
  );
}

export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });
