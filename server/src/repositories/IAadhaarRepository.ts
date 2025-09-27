import type { IAadhaar } from "../models/Aadhaar.js";

export interface IAadhaarRepository {
  findByAadhaarNumber(aadhaarNumber: string): Promise<IAadhaar | null>;
  findByAadhaarNumberAndDob(aadhaarNumber: string, dob: string): Promise<IAadhaar | null>;
  save(aadhaarData: Partial<IAadhaar>): Promise<IAadhaar>;
  findAll(): Promise<IAadhaar[]>;
  deleteByAadhaarNumber(aadhaarNumber: string): Promise<boolean>;
  exists(aadhaarNumber: string): Promise<boolean>;
}
