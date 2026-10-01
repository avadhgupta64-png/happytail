# Happy Tail 🐾

**Your AI-powered dog care companion**

[![Node.js](https://img.shields.io/badge/Node.js-24-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)](https://neon.tech)
[![Groq](https://img.shields.io/badge/AI-Groq-F55036?logo=groq&logoColor=white)](https://groq.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

</div>

---

## What is Happy Tail?

Happy Tail is a full-stack web app that helps dog owners understand and care for their pets using AI. Upload a photo to detect your dog's emotion, translate a bark from video, get a personalised diet plan, chat with an AI vet, discover dog-friendly places nearby, and connect with a community of dog lovers — all in one place, in 21 languages.

---

## Features

| Feature | Description |
|---|---|
| 🎭 **Emotion Detector** | Upload a photo — AI detects your dog's breed, emotion, mood, and gives personalised suggestions |
| 🔊 **Bark Translator** | Record or upload a video — AI analyzes frames to translate barks and body language |
| 🩺 **Health Scan** | Upload photos — AI checks for visible health conditions and flags emergencies |
| 🥗 **Diet Planner** | Enter breed, age, weight, and conditions — AI generates a full personalised meal plan |
| 💬 **AI Vet Chat** | Multi-turn conversational AI vet for any dog health question |
| 📍 **Nearby Places** | GPS-based discovery of dog-friendly parks, cafes, vets, and pet stores |
| 🐕 **Breed Guide** | Browsable guide with traits, care tips, and descriptions for all major breeds |
| 👥 **Community Chat** | Real-time chat room powered by WebSockets |
| 📊 **Activity History** | Full timeline of all your AI analyses with delete and export |
| 🔐 **Google Sign-In** | One-click sign in with Google — no passwords |
| 🌍 **21 Languages** | Full UI and AI response translation across 21 languages |
| 🌙 **Dark Mode** | Full light/dark theme support |
| 🛡️ **Admin Dashboard** | User management, ban/unban, stats, CSV exports, DB backups |

---

## Tech Stack

### Frontend
- **React 18** + **Vite 7** — fast development and optimised builds
- **TypeScript** — end-to-end type safety
- **Wouter** — lightweight client-side routing
- **TanStack Query 5** — server state management and caching
- **Tailwind CSS 3** + **shadcn/ui** — utility-first styling with accessible components
- **Framer Motion** — smooth animations and transitions
- **Radix UI** — unstyled accessible primitives
- **Recharts** — analytics charts
- **react-webcam** — in-browser camera access

### Backend
- **Node.js 24** + **Express 5** — HTTP server
- **TypeScript** via `tsx` — native TS execution
- **Drizzle ORM** — type-safe PostgreSQL queries
- **PostgreSQL** (Neon) — serverless database
- **Passport.js** + **Google OAuth 2.0** — authentication
- **express-session** + **connect-pg-simple** — persistent sessions
- **Groq API** (`qwen3.8-27b`) — vision and text AI
- **ws** — WebSocket for real-time community chat

### Shared
- **Zod** — runtime validation with shared schemas between client and server
- **drizzle-zod** — auto-generated Zod schemas from Drizzle tables

---

## Project Structure

```
happy-tail/
├── client/
│   ├── public/             # Static assets (favicon)
│   └── src/
│       ├── App.tsx         # Root component, layout, routing
│       ├── pages/          # 20+ page components
│       ├── components/     # Shared UI components
│       │   └── ui/         # shadcn/ui component library (55 components)
│       ├── hooks/          # Custom React hooks
│       ├── lib/            # Contexts, utils, translations, queryClient
│       └── data/           # Static breed and location data
├── server/
│   ├── index.ts            # Entry point and server bootstrap
│   ├── routes.ts           # All API route handlers (~900 lines)
│   ├── db.ts               # Drizzle database client
│   ├── storage.ts          # Data access layer (CRUD helpers)
│   ├── ws.ts               # WebSocket server for community chat
│   ├── backup.ts           # Scheduled database backups
│   ├── static.ts           # Production static file serving
│   ├── vite.ts             # Development Vite middleware
│   └── replit_integrations/
│       └── auth/           # Passport strategies, session config, auth routes
├── shared/
│   ├── schema.ts           # Drizzle tables + Zod schemas + TypeScript types
│   ├── routes.ts           # Typed API route contract
│   └── models/             # Auth and chat model definitions
├── migrations/             # Drizzle migration files
├── .env.example            # Environment variable template
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── drizzle.config.ts
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A PostgreSQL database ([Neon](https://neon.tech) free tier works great)
- A [Groq API key](https://console.groq.com) (free)
- Google OAuth credentials ([Google Cloud Console](https://console.cloud.google.com))

### 1. Clone the repo

```bash
git clone https://github.com/your-username/happy-tail.git
cd happy-tail/happy-tail
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
DATABASE_URL=postgresql://...
SESSION_SECRET=<random 32-byte hex string>
GROQ_API_KEY=gsk_...
GOOGLE_CLIENT_ID=....apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
```

> **Google OAuth setup:** In [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → Create OAuth 2.0 Client ID:
> - Authorised JavaScript origins: `http://localhost:5000`
> - Authorised redirect URIs: `http://localhost:5000/api/auth/google/callback`

### 4. Push database schema

```bash
npm run db:push
```

### 5. Start the development server

```bash
npm run dev
```

Open **http://localhost:5000** in your browser.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server (Vite + Express, hot reload) |
| `npm run build` | Build for production (bundles client + server) |
| `npm start` | Run production build |
| `npm run check` | TypeScript type check |
| `npm run db:push` | Push Drizzle schema changes to the database |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SESSION_SECRET` | ✅ | Secret for signing session cookies |
| `GROQ_API_KEY` | ✅ | Groq API key for all AI features |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth client secret |
| `PORT` | ❌ | Server port (default: `5000`) |
| `NODE_ENV` | ❌ | `development` or `production` |

---

## API Overview

<details>
<summary><strong>Auth</strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/auth/user` | Get current authenticated user |
| `GET` | `/api/auth/google` | Redirect to Google consent screen |
| `GET` | `/api/auth/google/callback` | Google OAuth callback |
| `POST` | `/api/logout` | Sign out |

</details>

<details>
<summary><strong>AI Features</strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/emotions/analyze` | Analyze dog emotion from image |
| `POST` | `/api/bark/translate` | Translate bark from video frames |
| `POST` | `/api/health/checkup` | AI health scan from photos |
| `POST` | `/api/health/diet` | Generate personalised diet plan |
| `POST` | `/api/health/vet-chat` | Multi-turn AI vet conversation |
| `POST` | `/api/locations/nearby` | GPS-based dog-friendly place discovery |

</details>

<details>
<summary><strong>User Data</strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| `GET/POST/DELETE` | `/api/dog-profiles` | Manage dog profiles |
| `PATCH` | `/api/profile` | Update user profile |
| `GET/DELETE` | `/api/activity-history` | View or delete activity history |
| `GET` | `/api/export/*` | Download personal data as CSV |

</details>

<details>
<summary><strong>Admin</strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/users` | List all users |
| `POST` | `/api/admin/users/:id/ban` | Ban a user |
| `DELETE` | `/api/admin/users/:id` | Permanently remove a user |
| `GET` | `/api/admin/stats` | Aggregate app statistics |
| `POST` | `/api/admin/backup` | Trigger database backup |

</details>

---

## Database Schema

| Table | Description |
|---|---|
| `users` | Authenticated users (Google OAuth, profile info, ban status) |
| `breeds` | Dog breed records with traits and care guides |
| `locations` | Dog-friendly places (parks, cafes, vets, pet stores) |
| `dog_profiles` | User-owned dog profiles (name, breed, age, weight) |
| `emotion_logs` | AI emotion scan results |
| `activity_logs` | All AI feature activity history (soft-delete) |
| `visitor_logs` | Unique visitor tracking |
| `chat_messages` | Community real-time chat messages |
| `feedback` | User feedback with admin comments |
| `removed_users` | Archive of permanently deleted accounts |
| `sessions` | Server-side session storage |

---

## Languages Supported

English · Hindi · Tamil · Telugu · Marathi · Bengali · Gujarati · Kannada · Malayalam · Punjabi · Odia · Urdu · Spanish · French · German · Japanese · Chinese · Arabic · Portuguese · Korean · Russian

All AI responses adapt to the user's selected language automatically.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

MIT © [Happy Tail](https://github.com/your-username/happy-tail)

---

<div align="center">
  <sub>Built with ❤️ for dog lovers everywhere</sub>
</div>
