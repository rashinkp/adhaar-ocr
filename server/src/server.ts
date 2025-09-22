import express from "express";
import cors from "cors";
import { connectDB } from "./config/database.config";
import { corsOptions, rateLimiter } from "./middleware/security.middleware";
import router from "./routes/ocr.routes";
import { errorHandler } from "./middleware/error.middleware";
import config from "./config/env.config";
import logger from "./config/logger.config";

const app = express();

connectDB();


app.use(cors(corsOptions));
console.log("CORS Origins:", corsOptions.origin);
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
