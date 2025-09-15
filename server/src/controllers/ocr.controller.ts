import type { Request, Response } from "express";
import { performOcrProcessing } from "../services/ocr.service.js";
import { AadhaarModel } from "../models/Aadhaar.js";

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

    if (!parsed || !parsed.aadhaarNumber || !parsed.dob || !parsed.name || !parsed.address) {
      return res.status(422).json({
        message: "Parsed data incomplete; cannot store",
        parsed: parsed || {},
        ocrText: { frontText, backText },
      });
    }

    // Upsert by aadhaarNumber to avoid duplicates
    const saved = await AadhaarModel.findOneAndUpdate(
      { aadhaarNumber: parsed.aadhaarNumber },
      {
        aadhaarNumber: parsed.aadhaarNumber,
        name: parsed.name,
        dob: parsed.dob,
        address: parsed.address,
        gender: parsed.gender || "",
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, data: saved, ocrText: { frontText, backText }, parsed });
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

    const dummyRecord = {
      aadhaarNumber,
      name: "Jane Doe",
      dob,
      address: "456 Another Street, City",
    };

    res.status(200).json({ success: true, data: dummyRecord });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error finding Aadhaar record" });
  }
};
