import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  const MONGO_URI = process.env.MONGO_URI!;

  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Atlas connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); 
  }
};
