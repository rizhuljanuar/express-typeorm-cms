import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default(3000),
  DATABASE_HOST: z.string().default('localhost'),
  DATABASE_PORT: z.string().transform(Number).default(5432),
  DATABASE_USERNAME: z.string().default('postgres'),
  DATABASE_PASSWORD: z.string().default('postgres'),
  DATABASE_NAME: z.string().default('cms_db'),
  DATABASE_SYNCHRONIZE: z.string().transform((val) => val === 'true').default(false),
  DATABASE_LOGGING: z.string().transform((val) => val === 'true').default(false),
  JWT_SECRET: z.string().default('your-super-secret-key-change-in-production'),
  JWT_EXPIRES_IN: z.string().default('7d'),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DATABASE_HOST: process.env.DATABASE_HOST,
    DATABASE_PORT: process.env.DATABASE_PORT,
    DATABASE_USERNAME: process.env.DATABASE_USERNAME,
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
    DATABASE_NAME: process.env.DATABASE_NAME,
    DATABASE_SYNCHRONIZE: process.env.DATABASE_SYNCHRONIZE,
    DATABASE_LOGGING: process.env.DATABASE_LOGGING,
  };

  const parsedEnv = envSchema.safeParse(envVars);

  if (!parsedEnv.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsedEnv.error.issues);
    process.exit(1);
  }

  return parsedEnv.data;
}

export const env = validateEnv();
