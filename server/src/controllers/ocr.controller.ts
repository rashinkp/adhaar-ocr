import type { Request, Response } from "express";
import { performOcrProcessing } from "../services/ocr.service.js";
import { AadhaarModel } from "../models/Aadhaar.js";
import { parse, format } from "date-fns";

export const processOcr = async (req: Request, res: Response) => {
  try {
    if (
      !req.files ||
      Array.isArray(req.files) ||
      !(req.files as { [fieldname: string]: Express.Multer.File[] })
        .frontFile ||
      !(req.files as { [fieldname: string]: Express.Multer.File[] }).backFile
    ) {
      return res
        .status(400)
        .json({ message: "Both front and back images are required" });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (
      !files.frontFile ||
      !files.backFile ||
      !files.frontFile[0] ||
      !files.backFile[0]
    ) {
      return res
        .status(400)
        .json({ message: "Both front and back images are required" });
    }

    const frontBuffer = files.frontFile[0].buffer;
    const backBuffer = files.backFile[0].buffer;

    const ocrResult = await performOcrProcessing(frontBuffer, backBuffer);

    console.log("OCR Result:", ocrResult);

    const { parsed, frontText, backText } = ocrResult as unknown as {
      parsed?: {
        aadhaarNumber?: string;
        dob?: string;
        gender?: string;
        name?: string;
        address?: string;
      };
      frontText: string;
      backText: string;
    };

    if (
      !parsed ||
      !parsed.aadhaarNumber ||
      !parsed.dob ||
      !parsed.name ||
      !parsed.address
    ) {
      return res.status(422).json({
        message: "Parsed data incomplete; cannot store",
        parsed: parsed || {},
        ocrText: { frontText, backText },
      });
    }

    // Convert DOB from dd/MM/yyyy to yyyy-MM-dd format for consistent storage
    const dobDate = parse(parsed.dob, "dd/MM/yyyy", new Date());
    const formattedDate = format(dobDate, "yyyy-MM-dd");

    const saved = await AadhaarModel.findOneAndUpdate(
      { aadhaarNumber: parsed.aadhaarNumber },
      {
        aadhaarNumber: parsed.aadhaarNumber,
        name: parsed.name,
        dob: formattedDate,
        address: parsed.address,
        gender: parsed.gender || "",
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );


    res.json({
      success: true,
      data: saved,
      ocrText: { frontText, backText },
      parsed,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "OCR processing failed" });
  }
};

export const findRecord = async (req: Request, res: Response) => {
  try {
    const { aadhaarNumber, dob } = req.query;

    if (!aadhaarNumber || !dob) {
      res.status(400).json({
        success: false,
        message: "aadhaarNumber and dob are required",
      });
      return;
    }

    // Convert input DOB to yyyy-MM-dd format if it's in dd/MM/yyyy format
    let searchDob = dob as string;
    if (searchDob.includes('/')) {
      const dobDate = parse(searchDob, "dd/MM/yyyy", new Date());
      searchDob = format(dobDate, "yyyy-MM-dd");
    }

    // First try exact match with the converted format
    let record = await AadhaarModel.findOne({
      aadhaarNumber: aadhaarNumber as string,
      dob: searchDob,
    });

    // If no exact match, try to find records with old format and convert them for comparison
    if (!record) {
      const allRecords = await AadhaarModel.find({
        aadhaarNumber: aadhaarNumber as string,
      });
      
      // Check if any record has DOB in old format that matches when converted
      for (const dbRecord of allRecords) {
        if (dbRecord.dob.includes('/')) {
          // Convert database DOB from dd/MM/yyyy to yyyy-MM-dd for comparison
          const dbDobDate = parse(dbRecord.dob, "dd/MM/yyyy", new Date());
          const dbFormattedDob = format(dbDobDate, "yyyy-MM-dd");
          
          if (dbFormattedDob === searchDob) {
            record = dbRecord;
            break;
          }
        }
      }
    }

    if (!record) {
      res.status(404).json({ success: false, message: "Record not found" });
      return;
    }

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error finding Aadhaar record" });
  }
};
