import { Schema, model, Document } from "mongoose";

interface IAadhaar extends Document {
  aadhaarNumber: string;
  name: string;
  dob?: string;
  address: string;
  gender?: string;
  createdAt: Date;
}

const AadhaarSchema = new Schema<IAadhaar>({
  aadhaarNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  dob: { type: String, required: false }, 
  address: { type: String, required: false },
  gender: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

AadhaarSchema.index({ aadhaarNumber: 1, dob: 1 });

const AadhaarModel = model<IAadhaar>("Aadhaar", AadhaarSchema);

export { AadhaarModel };
export type { IAadhaar };
