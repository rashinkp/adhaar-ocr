import express from "express";
import dotenv from "dotenv";
import router from "./routes/ocr.routes.js";
import cors from "cors";
import morgan from "morgan";
import { errorHandler } from "./middleware/error.middleware.js";
import { connectDB } from "./config/database.config.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use("/api", router);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
