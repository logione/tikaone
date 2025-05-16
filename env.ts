import { z } from 'zod'

const envSchema = z.object({
    TIKA_URL: z.string().url().default('http://tika:9998'),
    PORT: z.coerce.number().min(1).max(65535).default(3000)
})

export const env = envSchema.parse(process.env)