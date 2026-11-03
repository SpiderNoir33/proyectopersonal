import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);
    console.log(`[MongoDB] Conectado exitosamente a: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Error] No se pudo conectar: ${error.message}`);
    process.exit(1);
  }
};
