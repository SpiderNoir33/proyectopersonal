import { z } from "zod";
import { EMAIL_REGEX, EMAIL_MSG } from "./auth.js";

// Un input vacío significa "sin cambio", pero Zod .optional() solo acepta
// undefined: sin esto, "" en los campos de contraseña rompia el guardado
// entero del perfil (N1).
const emptyToUndefined = (v) => (v === "" || v === null ? undefined : v);

export const updateMeSchema = z
  .object({
    nombre: z.string().trim().min(2).max(80).optional(),
    email: z.string().trim().toLowerCase().email("Email inválido").optional(),
    password: z.preprocess(
      emptyToUndefined,
      z.string().min(8, "Mínimo 8 caracteres").max(72).optional()
    ),
    confirmPassword: z.preprocess(emptyToUndefined, z.string().min(8).optional()),
    // Cambiar la contraseña exige la contraseña actual (si no, una sesión
    // robada se queda con la cuenta para siempre).
    currentPassword: z.preprocess(
      emptyToUndefined,
      z.string().min(8, "Mínimo 8 caracteres").max(72).optional()
    ),
  })
  .refine(
    (data) => !data.password || data.password === data.confirmPassword,
    { message: "Las contraseñas no coinciden", path: ["confirmPassword"] }
  )
  .refine(
    (data) => !data.password || Boolean(data.currentPassword),
    { message: "Confirma tu contraseña actual para cambiarla", path: ["currentPassword"] }
  )
  // Mismo dominio que en registro: sin esto se podia cambiar el email a
  // cualquier sitio y Mongoose lo rechazaba luego con un 400 generico.
  .refine(
    (data) => !data.email || EMAIL_REGEX.test(data.email),
    { message: EMAIL_MSG, path: ["email"] }
  );
