import mongoose from "mongoose";
import config from "./env.config.js";
import logger from "./logger.config.js";
export const connectDB = async () => {
    try {
        await mongoose.connect(config.mongoUri);
        logger.info("MongoDB connected successfully");
    }
    catch (error) {
        logger.error("MongoDB connection error:", error);
        process.exit(1);
    }
};
//# sourceMappingURL=database.config.js.map