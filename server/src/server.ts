import express from "express";
import cors from "cors";
import router from "./routes/ocr.routes.js";
import { connectDB } from "./config/database.config.js";
import config from "./config/env.config.js";
import logger from "./config/logger.config.js";
import { corsOptions, rateLimiter, errorHandler } from "./middleware/security.middleware.js";
import mongoose from "mongoose";

const app = express();

connectDB();


app.use(cors(corsOptions));
app.use(express.json());
app.use(rateLimiter);

app.use("/api", router);

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.use(errorHandler);

app.listen(config.port, () => {
  logger.info(`Server started successfully`, {
    port: config.port,
    environment: config.isDevelopment ? 'development' : 'production',
    nodeVersion: process.version,
  });
});
