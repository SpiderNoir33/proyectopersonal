import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileTypeFromBuffer } from "file-type";
import { AppError } from "../utils/AppError.js";
import { UPLOADS_DIR } from "../utils/imageStore.js";

export const validateImages = async (req, res, next) => {
  const files = req.files ?? [];
  if (files.length === 0) return next();

  const validadas = [];
  for (const file of files) {
    const detected = await fileTypeFromBuffer(file.buffer);

    let ext;
    switch (detected?.mime) {
      case "image/jpeg":
        ext = "jpg";
        break;
      case "image/png":
        ext = "png";
        break;
      default:
        return next(
          new AppError(
            `Tipo de archivo no permitido: "${file.originalname}". Solo se aceptan imágenes JPG o PNG`,
            400
          )
        );
    }

    validadas.push({ ext, buffer: file.buffer });
  }

  try {
    await mkdir(UPLOADS_DIR, { recursive: true });
    const paths = [];
    for (const { ext, buffer } of validadas) {
      const name = `${randomUUID()}.${ext}`;
      await writeFile(path.join(UPLOADS_DIR, name), buffer);
      paths.push(`/uploads/${name}`);
    }
    req.imagePaths = paths;
    next();
  } catch (err) {
    next(err);
  }
};
