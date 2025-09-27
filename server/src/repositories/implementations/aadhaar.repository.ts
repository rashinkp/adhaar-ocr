import { parse, format } from "date-fns";
import type { IAadhaarRepository } from "../interfaces/aadhaar.repository";
import { AadhaarModel, type IAadhaar } from "../../models/aadhaar.model";


export class AadhaarRepository implements IAadhaarRepository {
  async findByAadhaarNumber(aadhaarNumber: string): Promise<IAadhaar | null> {
    return await AadhaarModel.findOne({ aadhaarNumber }).sort({
      createdAt: -1,
    });
  }

  async findByAadhaarNumberAndDob(
    aadhaarNumber: string,
    dob: string
  ): Promise<IAadhaar | null> {
    // Try exact match first
    let record = await AadhaarModel.findOne({
      aadhaarNumber,
      dob,
    });

    if (!record) {
      // Try to find records with different date formats
      const allRecords = await AadhaarModel.find({ aadhaarNumber });

      for (const dbRecord of allRecords) {
        if (dbRecord.dob && dbRecord.dob.includes("/")) {
          try {
            const dbDobDate = parse(dbRecord.dob, "dd/MM/yyyy", new Date());
            const dbFormattedDob = format(dbDobDate, "yyyy-MM-dd");
            if (dbFormattedDob === dob) {
              record = dbRecord;
              break;
            }
          } catch (error) {
            continue;
          }
        }
      }
    }

    return record;
  }

  async save(aadhaarData: Partial<IAadhaar>): Promise<IAadhaar> {
    const { aadhaarNumber } = aadhaarData;
    if (!aadhaarNumber) {
      throw new Error("Aadhaar number is required for saving");
    }

    // Format date if provided
    let formattedData = { ...aadhaarData };
    if (aadhaarData.dob) {
      try {
        const dobDate = parse(aadhaarData.dob, "dd/MM/yyyy", new Date());
        formattedData.dob = format(dobDate, "yyyy-MM-dd");
      } catch (error) {
        // Keep original format if parsing fails
        console.warn(
          "Date parsing failed, keeping original format:",
          aadhaarData.dob
        );
      }
    }

    return await AadhaarModel.findOneAndUpdate(
      { aadhaarNumber },
      formattedData,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  }

  async findAll(): Promise<IAadhaar[]> {
    return await AadhaarModel.find().sort({ createdAt: -1 });
  }

  async deleteByAadhaarNumber(aadhaarNumber: string): Promise<boolean> {
    const result = await AadhaarModel.deleteOne({ aadhaarNumber });
    return result.deletedCount > 0;
  }

  async exists(aadhaarNumber: string): Promise<boolean> {
    const count = await AadhaarModel.countDocuments({ aadhaarNumber });
    return count > 0;
  }
}
