import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  CLIENT_URL: z.string().url(),
  MONGO_URI: z.string().min(1, "MONGO_URI es obligatoria"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET debe tener al menos 32 caracteres"),
  JWT_EXPIRES_IN: z.string().default("7d"),

  COOKIE_EXPIRES_IN: z
    .string()
    .regex(/^\d+(\.\d+)?d$/, "COOKIE_EXPIRES_IN debe ser un número de días (ej: 7d)")
    .default("7d"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {

  console.error("[ENV] Variables de entorno inválidas:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1)
  }

export const env = parsed.data;