import bcrypt from "bcrypt";
import { Strategy as LocalStrategy } from "passport-local";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { randomBytes } from "crypto";
import { authStorage } from "./storage";
import { db, users } from "../../db";
import { eq } from "drizzle-orm";
import type { User } from "@shared/models/auth";

export interface LocalUser extends Express.User {
  dbUser: User;
  claims: {
    sub: string;
    email: string;
  };
  isAdmin?: boolean;
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  const secret =
    process.env.SESSION_SECRET ||
    (() => {
      console.warn(
        "[auth] SESSION_SECRET not set — using a random secret. Sessions will not persist across restarts.",
      );
      return randomBytes(32).toString("hex");
    })();
  return session({
    secret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport local strategy for email/password
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passReqToCallback: false },
      async (
        email: string,
        password: string,
        done: (error: any, user?: Express.User | false, options?: { message: string }) => void,
      ) => {
        try {
          const normalizedEmail = email.toLowerCase().trim();

          // Find user by email
          const [dbUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, normalizedEmail));

          if (!dbUser) {
            return done(null, false, { message: "Invalid email or password" });
          }

          // Check banned status
          if (dbUser.isBanned) {
            return done(null, false, { message: "banned" });
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            password,
            dbUser.password_hash || "",
          );
          if (!isPasswordValid) {
            return done(null, false, { message: "Invalid email or password" });
          }

          const user: LocalUser = {
            claims: { sub: dbUser.id, email: dbUser.email! },
            dbUser,
          };
          done(null, user);
        } catch (err) {
          done(err as Error);
        }
      },
    ),
  );

  passport.serializeUser((user: any, cb) => cb(null, user.claims.sub));
  passport.deserializeUser(async (id: string, cb) => {
    try {
      const [dbUser] = await db.select().from(users).where(eq(users.id, id));
      if (!dbUser) {
        return cb(null, false);
      }
      const user: LocalUser = {
        claims: { sub: dbUser.id, email: dbUser.email! },
        dbUser,
      };
      cb(null, user);
    } catch (err) {
      cb(err as Error);
    }
  });

  // POST /api/login — email + password login
  app.post("/api/login", (req, res, next) => {
    passport.authenticate(
      "local",
      (err: any, user: LocalUser | false, info: { message?: string } | undefined) => {
        if (err) {
          console.error("[auth] Login error:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        if (!user) {
          const msg = info?.message || "Invalid email or password";
          const status = msg === "banned" ? 403 : 401;
          return res.status(status).json({ message: msg });
        }

        req.logIn(user, (loginErr) => {
          if (loginErr) {
            console.error("[auth] Session error:", loginErr);
            return res.status(500).json({ message: "Failed to create session" });
          }
          // Return the full user object (without password_hash)
          const { password_hash, ...safeUser } = user.dbUser as any;
          return res.json({ success: true, user: safeUser });
        });
      },
    )(req, res, next);
  });

  // POST /api/register — create new account
  app.post("/api/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName) {
        return res
          .status(400)
          .json({ message: "Email, password, and first name are required" });
      }

      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters" });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Check if user already exists
      const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, normalizedEmail));
      if (existing.length > 0) {
        return res.status(409).json({ message: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          email: normalizedEmail,
          password_hash: hashedPassword,
          firstName,
          lastName: lastName || "",
        })
        .returning();

      // Log the new user in
      const sessionUser: LocalUser = {
        claims: { sub: newUser.id, email: newUser.email! },
        dbUser: newUser,
      };

      req.logIn(sessionUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to create session" });
        }
        const { password_hash, ...safeUser } = newUser as any;
        return res.status(201).json({ success: true, user: safeUser });
      });
    } catch (err) {
      console.error("[auth] Registration error:", err);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // POST /api/logout
  app.post("/api/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  // POST /api/switch-account — same as logout for email/password auth
  app.post("/api/switch-account", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Admin check middleware
export const isAdmin: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = String((req.user as LocalUser).claims?.sub);
  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean);

  try {
    const [user] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId));
    const adminFlag = user?.email ? ADMIN_EMAILS.includes(user.email) : false;
    (req.user as LocalUser).isAdmin = adminFlag;
    next();
  } catch {
    res.status(500).json({ message: "Failed to check admin status" });
  }
};
