import mongoose from "mongoose";
import app from "./src/app.js";
import { env } from "./src/config/env.js";
import { connectDB } from "./src/config/db.js";

await connectDB();

const server = app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`Backend escuchando en http://127.0.0.1:${env.PORT}`);
});

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => {
    console.log(`\n[${signal}] Cerrando el servidor...`);
    server.close(async () => {
      await mongoose.disconnect();
      console.log("[MongoDB] Conexión cerrada");
      process.exit(0);
    });

    setTimeout(() => process.exit(1), 1000).unref();
  });
}
