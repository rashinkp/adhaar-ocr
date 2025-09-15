import { Schema, model, Document } from "mongoose";

// Interface for Aadhaar OCR Document
interface IAadhaar extends Document {
  aadhaarNumber: string;
  name: string;
  dob: string;
  address: string;
  gender: string;
  createdAt: Date;
}

// Mongoose Schema
const AadhaarSchema = new Schema<IAadhaar>({
  aadhaarNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  dob: { type: String, required: true }, 
  address: { type: String, required: true },
  gender: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Mongoose Model
const AadhaarModel = model<IAadhaar>("Aadhaar", AadhaarSchema);

export { AadhaarModel };
export type { IAadhaar };
