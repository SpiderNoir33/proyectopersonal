import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import { UPLOADS_DIR } from "./utils/imageStore.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

if (env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.use("/uploads", express.static(UPLOADS_DIR));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sellers", sellerRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "success", ok: true });
});

app.use(notFound);
app.use(errorHandler);

export default app;
