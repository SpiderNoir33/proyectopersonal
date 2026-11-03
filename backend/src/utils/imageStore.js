import { unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Product } from "../models/Product.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const UPLOADS_DIR = path.resolve(__dirname, "../../uploads");

export const removeIfUnused = async (paths = []) => {
  for (const p of paths) {
    if (typeof p !== "string" || !p.startsWith("/uploads/")) continue;

    const stillUsed = await Product.countDocuments({ imagenes: p });
    if (stillUsed > 0) continue;

    const fileName = path.basename(p);
    await unlink(path.join(UPLOADS_DIR, fileName)).catch((err) => {
      console.error(`[FS] No se pudo eliminar el archivo ${fileName}:`, err.message);
    });
  }
};
