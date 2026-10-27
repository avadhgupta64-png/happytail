import type { Express, Request, Response } from "express";
import bcrypt from "bcrypt";
import { and, eq, sql } from "drizzle-orm";
import { authStorage } from "./storage";
import { isAuthenticated, type LocalUser } from "./replitAuth";
import { db, users } from "../../db";
import { removedUsers } from "@shared/schema";

function signInUser(req: Request, user: LocalUser): Promise<void> {
  return new Promise((resolve, reject) => {
    req.logIn(user, (error) => error ? reject(error) : resolve());
  });
}

function safeError(res: Response, status: number, message: string) {
  return res.status(status).json({ message });
}

// Register authentication routes used by the web app and Android WebView.
export function registerAuthRoutes(app: Express): void {
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
      const password = typeof req.body?.password === "string" ? req.body.password : "";
      const firstName = typeof req.body?.firstName === "string" ? req.body.firstName.trim().slice(0, 80) : "";
      const lastName = typeof req.body?.lastName === "string" ? req.body.lastName.trim().slice(0, 80) : "";

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return safeError(res, 400, "Enter a valid email address.");
      }
      if (password.length < 6 || password.length > 128) {
        return safeError(res, 400, "Password must be between 6 and 128 characters.");
      }

      const [removed] = await db.select({ id: removedUsers.id }).from(removedUsers)
        .where(sql`lower(${removedUsers.email}) = ${email}`).limit(1);
      if (removed) return safeError(res, 403, "This account cannot be recreated. Please contact support.");

      const [existing] = await db.select({ id: users.id }).from(users)
        .where(sql`lower(${users.email}) = ${email}`).limit(1);
      if (existing) return safeError(res, 409, "An account with this email already exists.");

      const password_hash = await bcrypt.hash(password, 12);
      const [dbUser] = await db.insert(users).values({
        email,
        password_hash,
        firstName,
        lastName,
        emailVerified: false,
      }).returning();

      const user: LocalUser = {
        claims: { sub: dbUser.id, email: dbUser.email! },
        dbUser,
      };
      await signInUser(req, user);
      return res.status(201).json({ success: true });
    } catch (error) {
      // Handle a concurrent registration without leaking database details.
      if ((error as { code?: string })?.code === "23505") {
        return safeError(res, 409, "An account with this email already exists.");
      }
      console.error("[auth] Registration failed:", error);
      return safeError(res, 500, "Registration failed. Please try again.");
    }
  });

  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
      const password = typeof req.body?.password === "string" ? req.body.password : "";
      if (!email || !password) return safeError(res, 400, "Enter your email and password.");

      const [dbUser] = await db.select().from(users)
        .where(sql`lower(${users.email}) = ${email}`).limit(1);
      if (!dbUser?.password_hash) {
        return safeError(res, 401, "Invalid email or password.");
      }

      const passwordMatches = await bcrypt.compare(password, dbUser.password_hash);
      if (!passwordMatches) return safeError(res, 401, "Invalid email or password.");
      if (dbUser.isBanned) return safeError(res, 403, "banned");

      const [removed] = await db.select({ id: removedUsers.id }).from(removedUsers)
        .where(sql`lower(${removedUsers.email}) = ${email}`).limit(1);
      if (removed) return safeError(res, 403, "This account is no longer available. Please contact support.");

      const user: LocalUser = {
        claims: { sub: dbUser.id, email: dbUser.email! },
        dbUser,
      };
      await signInUser(req, user);
      return res.json({ success: true });
    } catch (error) {
      console.error("[auth] Login failed:", error);
      return safeError(res, 500, "Login failed. Please try again.");
    }
  });

  // Get current authenticated user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}
