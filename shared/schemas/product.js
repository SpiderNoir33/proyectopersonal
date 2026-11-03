import { z } from "zod";

// Imagen: solo http(s). Zod .url() acepta javascript: y data:, que son XSS
// si el front las renderiza como enlace.
const imageUrl = z
  .string()
  .trim()
  .url("URL de imagen inválida")
  .refine((v) => /^https?:\/\//i.test(v), "La URL debe empezar por http:// o https://");

// Multipart llega como string y Number("") === 0 crearia productos gratis:
// vacio → undefined (cayo en required_error) y string → number real.
const emptyToUndefined = (v) => {
  if (v === "" || v === null) return undefined;
  if (typeof v === "string") {
    const t = v.trim();
    return t === "" ? undefined : Number(t);
  }
  return v;
};

// Ruta de imagen generada por el servidor: /uploads/<uuid>.jpg|png
const uploadPath = z
  .string()
  .trim()
  .regex(/^\/uploads\/[A-Za-z0-9-]+\.(jpg|png)$/, "Ruta de imagen inválida");

export const createProductSchema = z.object({
  nombre: z.string().trim().min(2, "Mínimo 2 caracteres").max(120),
  categoria: z.string().trim().min(2, "Mínimo 2 caracteres").max(50),
  descripcion: z.string().trim().max(1000).optional(),
  precio: z.preprocess(
    emptyToUndefined,
    z
      .number({ required_error: "El precio es obligatorio", invalid_type_error: "El precio debe ser un número" })
      .nonnegative("El precio no puede ser negativo")
  ),
  // .optional() va DENTRO del preprocess: si va fuera, deja pasar el "" crudo
  // hasta z.number() y el form no podia crear productos sin stock (N2).
  stock: z.preprocess(
    emptyToUndefined,
    z
      .number({ required_error: "El stock es obligatorio", invalid_type_error: "El stock debe ser un número" })
      .int("El stock debe ser un número entero")
      .nonnegative("El stock no puede ser negativo")
      .optional()
  ),
  // Sin campo "imagenes" a propósito: las imágenes llegan como archivos
  // (multipart), nunca como texto. Un intento de mandarlas por body
  // se descarta al hacer strip de las claves desconocidas.
});

// keep = imágenes existentes que se conservan en la edición. Acepta rutas
// /uploads/... y también https://... de productos antiguos (legacy).
// Multipart manda un solo "keep" como string; "" significa "ninguna" (no se
// puede mandar un array vacío por FormData) y sin campo = no se tocan.
export const updateProductSchema = createProductSchema
  .partial()
  .extend({
    keep: z.preprocess(
      (v) =>
        v === undefined
          ? undefined
          : v === ""
            ? []
            : Array.isArray(v)
              ? v
              : [v],
      z.array(z.union([uploadPath, imageUrl])).max(10).optional()
    ),
  });

// Los query params antes no se validaban en ningun sitio.
export const listProductsQuerySchema = z.object({
  categoria: z.string().trim().min(1).max(50).optional(),
  nombre: z.string().trim().min(1).max(120).optional(),
  // Filtrar por vendedor (página /vendedores/:id) reusando este endpoint
  owner: z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, "ID de vendedor inválido")
    .optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
