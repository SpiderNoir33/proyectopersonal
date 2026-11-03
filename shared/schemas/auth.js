import { z } from "zod";

export const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@(gmail|outlook|hotmail)\.com$/;
export const EMAIL_MSG = "Solo se permiten correos Gmail, Outlook o Hotmail";

export const registerSchema = z
  .object({
    nombre: z
      .string({ required_error: "El nombre es obligatorio" })
      .trim()
      .min(2, "Mínimo 2 caracteres")
      .max(80, "Máximo 80 caracteres"),
    email: z
      .string({ required_error: "El email es obligatorio" })
      .trim()
      .toLowerCase()
      .email("Email inválido"),
    password: z
      .string({ required_error: "La contraseña es obligatoria" })
      .min(8, "Mínimo 8 caracteres")
      .max(72, "Máximo 72 caracteres"),
    confirmPassword: z
      .string({ required_error: "Confirma la contraseña" })
      .min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })
  .refine((data) => EMAIL_REGEX.test(data.email), {
    message: EMAIL_MSG,
    path: ["email"],
  });

export const loginSchema = z.object({
  email: z
    .string({ required_error: "El email es obligatorio" })
    .trim()
    .toLowerCase()
    .email("Email inválido"),
  password: z.string({ required_error: "La contraseña es obligatoria" }),
}).refine((data) => EMAIL_REGEX.test(data.email), {
  message: EMAIL_MSG,
  path: ["email"],
});
