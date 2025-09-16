import { Schema, model, Document } from "mongoose";
const AadhaarSchema = new Schema({
    aadhaarNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    dob: { type: String, required: false },
    address: { type: String, required: false },
    gender: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
});
AadhaarSchema.index({ aadhaarNumber: 1, dob: 1 });
const AadhaarModel = model("Aadhaar", AadhaarSchema);
export { AadhaarModel };
//# sourceMappingURL=Aadhaar.js.map