import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  /*
   * Specify what prefix the client-side variables must have.
   * This is enforced both on type-level and at runtime.
   */
  server: {},
  client: {
    NEXT_PUBLIC_WSS_URL: z.string().min(1),
  },
  /**
   * What object holds the environment variables at runtime.
   * Often `process.env` or `import.meta.env`
   */
  runtimeEnv: {
    NEXT_PUBLIC_WSS_URL: process.env.NEXT_PUBLIC_WSS_URL,
  },
})
