import { AppError } from "../utils/AppError.js";

const issuesToFields = (issues) =>
  issues.reduce((acc, issue) => {
    acc[issue.path.join(".") || "_"] = issue.message;
    return acc;
  }, {});

export const validate =
  (schema) =>
  (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(
        new AppError("Validación fallida", 400, issuesToFields(result.error.issues))
      );
    }

    req.body = result.data;
    next();
  };

export const validateQuery =
  (schema) =>
  (req, res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      return next(
        new AppError("Parámetros inválidos", 400, issuesToFields(result.error.issues))
      );
    }

    req.parsedQuery = result.data;
    next();
  };
