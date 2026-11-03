import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

// manejo centralizado de errores por numero de status

const handleCastError = (err) => {
  const value = err?.value ?? "desconocido";
  return new AppError(`ID inválido: ${value}`, 400);
};

const handleValidationError = (err) => {
  const errors = err?.errors ?? {};
  const messages = Object.values(errors).map((e) => e.message);
  return new AppError(`Datos inválidos: ${messages.join(". ")}`, 400);
};

const handleDuplicateKey = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || "campo";
  return new AppError(`El campo ${field} ya está en uso`, 409);
};

const handleMongoNetworkError = () =>
  new AppError("El servicio de base de datos no está disponible", 503);

const handleJWTError = () =>
  new AppError("Token inválido, vuelve a iniciar sesión", 401);

const handleJWTExpired = () =>
  new AppError("Tu sesión expiró, vuelve a iniciar sesión", 401);

const handleMulterError = (err) => {
  switch (err.code) {
    case "LIMIT_FILE_SIZE":
      return new AppError("Imagen demasiado grande (máx. 3MB por archivo)", 400);
    case "LIMIT_FILE_COUNT":
      return new AppError("Máximo 10 imágenes por producto", 400);
    case "LIMIT_UNEXPECTED_FILE":
      return new AppError('Campo de archivo inesperado (usa el campo "imagenes")', 400);
    default:
      return new AppError("Error al subir las imágenes", 400);
  }
};

export const errorHandler = (err, req, res, _next) => {
  let error = err;

  if (env.NODE_ENV === "development") {
    console.error("[ERROR]", err);
  }

  switch (true) {
    case err?.name === "CastError":
      error = handleCastError(err);
      break;

    case err?.name === "ValidationError":
      error = handleValidationError(err);
      break;

    case err?.code === 11000:
      error = handleDuplicateKey(err);
      break;

    case err?.name === "JsonWebTokenError":
      error = handleJWTError();
      break;

    case err?.name === "TokenExpiredError":
      error = handleJWTExpired(err);
      break;

    case err?.name === "MulterError":
      error = handleMulterError(err);
      break;


    case err?.name === "MongoServerSelectionError" ||
      err?.name === "MongoNetworkError":
      error = handleMongoNetworkError();
      break;
  }

  if (error instanceof AppError) {
    const statusCode = error.statusCode || 500;
    const body = {
      status: `${statusCode}`.startsWith("4") ? "fail" : "error",
      message: error.message,
    };
    if (error.fields) body.errors = error.fields;
    return res.status(statusCode).json(body);
  }

  if (env.NODE_ENV === "development") {
    console.error("[ERROR FATAL]", err);
  } else {
    console.error("[ERROR FATAL]", err?.message);
  }

  return res.status(500).json({
    status: "error",
    message: "Algo salió mal en el servidor",
  });
};
