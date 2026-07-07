---
name: Happy Tail production startup crash
description: Why the production server crashed and how it was fixed
---

# The problem
`server/index.ts` used `(async () => { ... })().catch(handler)` — but esbuild's CJS
bundle transform compiles the async IIFE in a way that drops the Promise return
value, so `.catch()` throws `TypeError: (intermediate value).catch is not a function`
and the process exits with code 1 BEFORE port 24183 is bound.

# The fix
Replace `.catch()` with `try/catch` **inside** the IIFE, so `startListening()` always
runs in the fallback path:

```ts
(async () => {
  let routesOk = false;
  try {
    await registerRoutes(httpServer, app);
    routesOk = true;
  } catch (err) {
    console.error("[startup] fallback mode:", err);
  }
  // ... register fallback or real middleware
  startListening(); // always runs
})();
```

**Why:** esbuild's `cjs` format wraps the module in a sync IIFE; the async IIFE
becomes an expression whose Promise return value is discarded, making `.catch()` unavailable.

# Secondary fix
`replitAuth.ts` `getSession()` used `process.env.SESSION_SECRET!` — if unset,
express-session throws synchronously inside `registerRoutes`. Fixed by:
```ts
import { randomBytes } from "crypto";
const secret = process.env.SESSION_SECRET || randomBytes(32).toString("hex");
```

# Database note
`EXTERNAL_DB_URL` shared env var points to the dev Replit postgres. Production
deployment should use its own `DATABASE_URL` from Replit. If `EXTERNAL_DB_URL`
is set as shared, production uses the dev DB — which can be suspended. 
