# Happy Tail - Dog Companion App

## Overview

Happy Tail is a dog care companion web application that helps pet owners understand and care for their dogs. The app features AI-powered emotion detection from photos, Dog Mood Translator with AR-style overlays and body signal detection, a comprehensive breed guide, dog-friendly location finder, barking-to-text converter, AI-powered health checker and emergency protocols with quick vet contact access.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with custom playful theme (Fredoka/Quicksand fonts, warm color palette)
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Animations**: Framer Motion for page transitions and interactions
- **Camera Access**: react-webcam for emotion detection feature
- **Build Tool**: Vite with path aliases (@/ for client/src, @shared/ for shared)

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript with ESM modules
- **API Structure**: RESTful endpoints defined in shared/routes.ts with Zod validation
- **AI Integration**: OpenAI API via Replit AI Integrations for emotion analysis
- **Development**: tsx for TypeScript execution, Vite middleware for HMR

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: shared/schema.ts (breeds, locations, emotionLogs, conversations, messages, visitorLogs, dogProfiles)
- **Migrations**: Drizzle Kit with output to /migrations folder
- **Connection**: node-postgres Pool with DATABASE_URL environment variable

### Key Features
1. **Emotion Detector**: Upload photos for OpenAI-powered dog emotion analysis
2. **Bark Translator**: Upload video, extract 6 frames, send to GPT-4o vision for body language analysis
4. **Breed Guide**: Searchable database of 52+ dog breeds with traits, care guides, and images
5. **Locations**: Dog-friendly places in New Delhi (parks, cafes, vets) with coordinates and rules
6. **Community**: 15 WhatsApp group links for Delhi NCR dog owners with category filters and search
7. **Emergency**: Quick vet contact and first-aid protocols
8. **Dog Health Center** (hub at /health with 3 sub-features):
   - **Health Scan** (/health/scan): AI-powered photo-based health assessment
   - **AI Diet Planner** (/health/diet): Personalized meal plans based on breed, age, weight, conditions
   - **AI Vet Chat** (/health/chat): Conversational AI vet assistant for any dog health questions

### Real-Time Features
- **WebSocket Server**: server/ws.ts provides real-time visitor count via WebSocket (/ws path)
- **Session Auth**: WS connections authenticated server-side via express-session cookie
- **WSProvider**: client/src/lib/ws-context.tsx wraps authenticated app with shared WS connection
- **Online Count**: Broadcasts unique user count to all connected clients in real time

### API Contract Pattern
- Routes are defined in shared/routes.ts with Zod schemas for input/output validation
- Frontend hooks (use-breeds.ts, use-emotions.ts, use-locations.ts) consume these contracts
- Type safety is maintained across client and server through shared schema types

### Build Process
- Custom build script (script/build.ts) bundles client with Vite and server with esbuild
- Server dependencies are selectively bundled to optimize cold start times
- Production output goes to dist/ (server) and dist/public (client)

## External Dependencies

### AI Services
- **OpenAI API**: Accessed via Replit AI Integrations (AI_INTEGRATIONS_OPENAI_API_KEY, AI_INTEGRATIONS_OPENAI_BASE_URL)
- Used for dog emotion analysis from photos and potential chat/voice features

### Database
- **PostgreSQL**: Primary data store, connection via DATABASE_URL
- **Drizzle ORM**: Type-safe database queries and schema management

### Replit Integrations
- Audio utilities for voice chat (PCM16 encoding, AudioWorklet playback)
- Chat storage and routes for conversation management
- Image generation capabilities via gpt-image-1
- Batch processing utilities with rate limiting

### Third-Party Libraries
- **react-webcam**: Camera capture for emotion detection
- **framer-motion**: Animation library
- **shadcn/ui + Radix UI**: Accessible component primitives
- **TanStack Query**: Server state management
- **Zod**: Runtime validation for API contracts