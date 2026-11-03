export class AppError extends Error {
  constructor(message, statusCode, fields) {
    super(message);
    this.statusCode = statusCode;
    this.fields = fields;
    Error.captureStackTrace(this, this.constructor);
  }
}
