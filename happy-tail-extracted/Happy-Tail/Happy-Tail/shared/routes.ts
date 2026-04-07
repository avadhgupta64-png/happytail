import { z } from 'zod';
import { 
  insertBreedSchema, 
  insertLocationSchema, 
  insertEmotionLogSchema,
  breeds,
  locations,
  emotionLogs,
  analyzeEmotionSchema,
  analyzeEmotionResponseSchema,
} from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  breeds: {
    list: {
      method: 'GET' as const,
      path: '/api/breeds',
      responses: {
        200: z.array(z.custom<typeof breeds.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/breeds/:id',
      responses: {
        200: z.custom<typeof breeds.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    // Seed/Admin routes
    create: {
      method: 'POST' as const,
      path: '/api/breeds',
      input: insertBreedSchema,
      responses: {
        201: z.custom<typeof breeds.$inferSelect>(),
      },
    }
  },
  locations: {
    list: {
      method: 'GET' as const,
      path: '/api/locations',
      responses: {
        200: z.array(z.custom<typeof locations.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/locations',
      input: insertLocationSchema,
      responses: {
        201: z.custom<typeof locations.$inferSelect>(),
      },
    }
  },
  emotions: {
    analyze: {
      method: 'POST' as const,
      path: '/api/emotions/analyze',
      input: analyzeEmotionSchema,
      responses: {
        200: analyzeEmotionResponseSchema,
        500: errorSchemas.internal,
      },
    },
    history: {
      method: 'GET' as const,
      path: '/api/emotions/history',
      responses: {
        200: z.array(z.custom<typeof emotionLogs.$inferSelect>()),
      },
    }
  },
};

// ============================================
// HELPER
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
