import multer from "multer";

export const uploadProductImages = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 3 * 1024 * 1024,
    files: 10,
  },

}).array("imagenes", 10);
