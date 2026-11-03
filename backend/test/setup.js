// Fallback por si un worker no hereda el process.env del globalSetup:
// process.exit(1) de env.js es peor que un valor por defecto.
process.env.NODE_ENV ??= "test";
process.env.CLIENT_URL ??= "http://localhost:5173";
process.env.JWT_SECRET ??= "test-secret-de-32-caracteres-minimo!!";
process.env.JWT_EXPIRES_IN ??= "7d";
process.env.COOKIE_EXPIRES_IN ??= "7d";
