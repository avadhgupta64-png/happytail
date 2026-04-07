# Happy Tail - Dog Companion App

## Overview

Happy Tail is an AI-powered dog care companion web application built for pet owners in New Delhi, India. It combines multiple AI features—emotion detection from photos, bark/body language translation from video, health scanning, diet planning, and vet chat—with practical resources like a breed guide (50+ breeds), dog-friendly location finder, community WhatsApp groups, and emergency first-aid protocols. The app uses Replit Auth for authentication, supports multi-language UI, real-time online user count via WebSocket, and has a playful, warm visual design with dark mode support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, rendered client-side (no SSR)
- **Routing**: Wouter — a lightweight alternative to React Router
- **State Management**: TanStack React Query for all server state; local React state for UI
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode). Custom playful theme using Fredoka (display) and Quicksand (body) fonts with a warm amber/orange color palette
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives. Components live in `client/src/components/ui/`
- **Animations**: Framer Motion for page transitions, card animations, and micro-interactions
- **Build Tool**: Vite with path aliases (`@/` → `client/src/`, `@shared/` → `shared/`, `@assets/` → `attached_assets/`)
- **Key Client Features**:
  - Splash screen on app load
  - Sidebar navigation with responsive mobile bottom nav
  - Language switcher supporting multiple languages (translations in `client/src/lib/translations.ts`)
  - WebSocket context for real-time online user count
  - Device ID generation for anonymous emotion history tracking
  - Camera/file upload for photo-based AI features

### Backend Architecture
- **Runtime**: Node.js with Express (v5 style)
- **Language**: TypeScript with ESM modules, executed via `tsx`
- **HTTP Server**: Node `http.createServer` wrapping Express, enabling WebSocket on same port
- **API Design**: RESTful JSON endpoints under `/api/`. Route contracts defined in `shared/routes.ts` with Zod schemas for validation
- **AI Integration**: OpenAI API (GPT-4o with vision) accessed via the `openai` npm package. Configured to use Replit AI Integrations environment variables (`AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`) with fallback to standard OpenAI keys
- **WebSocket**: `ws` library on `/ws` path for real-time visitor count. Authenticated via express-session cookie parsing
- **Request Limits**: JSON body parser set to 10MB (main app), 50MB for audio routes
- **Build Process**: `script/build.ts` uses Vite for client build and esbuild for server bundling. Server output is `dist/index.cjs`, client output is `dist/public/`
- **Static Serving**: In production, Express serves `dist/public/` with SPA fallback. In development, Vite middleware handles HMR on `/vite-hmr`

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Connection**: `node-postgres` Pool using `DATABASE_URL` environment variable
- **Schema**: Defined in `shared/schema.ts` and `shared/models/` directory
  - `breeds` — dog breed catalog with traits, images, care guides
  - `locations` — dog-friendly places with coordinates
  - `emotionLogs` — AI emotion analysis results with device tracking
  - `dogProfiles` — user's dog profiles (linked by userId)
  - `conversations` / `messages` — chat history for AI vet chat
  - `sessions` — express-session storage (required for Replit Auth)
  - `users` — user accounts (required for Replit Auth)
  - `visitorLogs` — site visitor tracking
- **Migrations**: Drizzle Kit with `drizzle-kit push` command. Migration output in `/migrations` folder
- **Schema Validation**: `drizzle-zod` generates Zod schemas from Drizzle table definitions

### Authentication
- **Method**: Replit Auth integration (OAuth-based)
- **Implementation**: Located in `server/replit_integrations/auth/`
- **Session Storage**: PostgreSQL via `connect-pg-simple`
- **Key Endpoints**: `/api/login`, `/api/logout`, `/api/auth/user`
- **Client Hook**: `useAuth()` hook queries `/api/auth/user` and manages auth state
- **Protection**: `isAuthenticated` middleware guards protected API routes

### Audio/Voice Integration
- **Location**: `server/replit_integrations/audio/` and `client/replit_integrations/audio/`
- **Capabilities**: Voice recording (MediaRecorder API), audio streaming (SSE), PCM16 playback via AudioWorklet
- **Format Support**: WAV, MP3, WebM, MP4, OGG with ffmpeg conversion
- **Usage**: Available for voice-based vet chat conversations

### Key API Endpoints
- `GET/POST /api/breeds` — breed CRUD
- `GET/POST /api/locations` — location management
- `POST /api/emotions/analyze` — AI emotion detection from photo
- `GET /api/emotions/history` — emotion scan history
- `POST /api/bark-translate` — video-based bark/body language analysis
- `POST /api/health/scan` — AI health assessment from photos
- `POST /api/health/diet` — AI diet plan generation
- `POST /api/health/vet-chat` — conversational AI vet assistant
- `GET/POST /api/dog-profiles` — user dog profile management
- `GET /api/visitors/count` — visitor counter
- `/ws` — WebSocket for real-time online count

### Pages
| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing (unauthenticated) or Home (authenticated) | Feature showcase / dashboard |
| `/detector` | EmotionDetector | Upload photo for AI emotion analysis |
| `/bark-translator` | BarkTranslator | Upload video for body language analysis |
| `/breeds` | DogGuide | Searchable breed encyclopedia (client-side data) |
| `/health` | HealthHub | Hub linking to scan, diet, chat |
| `/health/scan` | HealthCheckup | Upload 5 photos for health assessment |
| `/health/diet` | DietPlanner | AI-generated meal plans |
| `/health/chat` | VetChat | Conversational AI vet |
| `/locations` | Locations | Delhi dog-friendly places with distance |
| `/community` | Community | WhatsApp group directory |
| `/emergency` | Emergency | First-aid protocols and vet contacts |
| `/profile` | Profile | User profile and dog profiles |

## External Dependencies

### Required Services
- **PostgreSQL Database**: Connected via `DATABASE_URL` environment variable. Used for all persistent data including sessions, users, breeds, emotion logs, dog profiles, and chat history
- **OpenAI API**: Powers all AI features (emotion detection, bark translation, health scan, diet planning, vet chat). Requires `AI_INTEGRATIONS_OPENAI_API_KEY` or `OPENAI_API_KEY` and optionally `AI_INTEGRATIONS_OPENAI_BASE_URL`. Uses GPT-4o with vision capabilities
- **Replit Auth**: OAuth authentication system. Setup code in `server/replit_integrations/auth/`

### Optional Services
- **ffmpeg**: Required on the system for audio format conversion (voice chat features)

### Key NPM Packages
- `drizzle-orm` + `drizzle-kit` — ORM and migration tooling
- `openai` — OpenAI API client
- `express` + `express-session` — HTTP server and sessions
- `connect-pg-simple` — PostgreSQL session store
- `ws` — WebSocket server
- `zod` + `drizzle-zod` — Runtime validation
- `@tanstack/react-query` — Client-side data fetching
- `framer-motion` — Animations
- `wouter` — Client-side routing
- `react-webcam` — Camera access

### External Assets
- Google Fonts (Fredoka, Quicksand, DM Sans, Geist Mono, Fira Code, Architects Daughter)
- Unsplash images for breed photos and feature cards