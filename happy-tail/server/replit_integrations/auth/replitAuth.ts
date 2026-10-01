import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { randomBytes } from "crypto";
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
      console.warn("[auth] SESSION_SECRET not set — using a random secret.");
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

  passport.serializeUser((user: any, cb) => cb(null, user.claims.sub));
  passport.deserializeUser(async (id: string, cb) => {
    try {
      const [dbUser] = await db.select().from(users).where(eq(users.id, id));
      if (!dbUser) return cb(null, false);
      const user: LocalUser = {
        claims: { sub: dbUser.id, email: dbUser.email! },
        dbUser,
      };
      cb(null, user);
    } catch (err) {
      cb(err as Error);
    }
  });

  // ── Google OAuth ──────────────────────────────────────────────────────────
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/api/auth/google/callback",
          scope: ["profile", "email"],
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value?.toLowerCase().trim();
            if (!email) return done(new Error("No email returned from Google"));

            let [dbUser] = await db.select().from(users).where(eq(users.email, email));

            if (!dbUser) {
              [dbUser] = await db
                .insert(users)
                .values({
                  email,
                  firstName: profile.name?.givenName ?? profile.displayName ?? "",
                  lastName: profile.name?.familyName ?? "",
                  profileImageUrl: profile.photos?.[0]?.value ?? null,
                  password_hash: null,
                  emailVerified: true,
                })
                .returning();
            } else if (dbUser.isBanned) {
              return done(null, false);
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

    app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

    app.get(
      "/api/auth/google/callback",
      passport.authenticate("google", { failureRedirect: "/?auth_error=google_failed", session: true }),
      (_req, res) => res.redirect("/"),
    );

    console.info("[auth] Google OAuth enabled");
  } else {
    console.warn("[auth] GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET not set — Google login disabled");
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  app.post("/api/logout", (req, res) => {
    req.logout(() => res.json({ success: true }));
  });

  app.post("/api/switch-account", (req, res) => {
    req.logout(() => res.json({ success: true }));
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export const isAdmin: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const userId = String((req.user as LocalUser).claims?.sub);
  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean);
  try {
    const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId));
    (req.user as LocalUser).isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;
    next();
  } catch {
    res.status(500).json({ message: "Failed to check admin status" });
  }
};
