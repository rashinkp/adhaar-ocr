import type { Request, Response } from "express";
import { performOcrProcessing } from "../services/ocr.service.js";
import { AadhaarModel } from "../models/Aadhaar.js";
import { parse, format } from "date-fns";
import logger from "../config/logger.config.js";

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

    logger.info("OCR processing completed", {
      hasParsedData: !!ocrResult.parsed,
      aadhaarNumber: ocrResult.parsed?.aadhaarNumber,
      ip: req.ip,
    });

    console.log(ocrResult);

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
      !parsed.name
    ) {
      logger.warn("OCR parsing incomplete", {
        missingFields: {
          aadhaarNumber: !parsed?.aadhaarNumber,
          dob: !parsed?.dob,
          name: !parsed?.name,
          address: !parsed?.address,
        },
        ip: req.ip,
      });
      
      // Only Aadhaar number and name are mandatory now
      if (!parsed?.aadhaarNumber || !parsed?.name) {
        return res.status(422).json({
          message: "Parsed data incomplete; cannot store",
          parsed: parsed || {},
          ocrText: { frontText, backText },
        });
      }
    }

    let formattedDate: string | undefined;
    if (parsed.dob) {
      const dobDate = parse(parsed.dob, "dd/MM/yyyy", new Date());
      formattedDate = format(dobDate, "yyyy-MM-dd");
    }

    const saved = await AadhaarModel.findOneAndUpdate(
      { aadhaarNumber: parsed.aadhaarNumber },
      {
        aadhaarNumber: parsed.aadhaarNumber,
        name: parsed.name,
        ...(formattedDate ? { dob: formattedDate } : {}),
        address: parsed.address,
        gender: parsed.gender || "",
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    logger.info("Aadhaar record saved successfully", {
      aadhaarNumber: saved.aadhaarNumber,
      isNewRecord: !saved.createdAt,
      ip: req.ip,
    });

    res.json({
      success: true,
      data: saved,
      ocrText: { frontText, backText },
      parsed,
    });
  } catch (error) {
    logger.error("OCR processing failed", {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      ip: req.ip,
    });
    res.status(500).json({ success: false, message: "OCR processing failed" });
  }
};

export const findRecord = async (req: Request, res: Response) => {
  const { aadhaarNumber, dob } = req.query;
  
  try {
    if (!aadhaarNumber) {
      logger.warn("Search request missing aadhaarNumber", {
        hasAadhaarNumber: !!aadhaarNumber,
        hasDob: !!dob,
        ip: req.ip,
      });
      res.status(400).json({ success: false, message: "aadhaarNumber is required" });
      return;
    }

    let record = null as Awaited<ReturnType<typeof AadhaarModel.findOne>> | null;

    if (dob) {
      let searchDob = dob as string;
      if (searchDob.includes('/')) {
        const dobDate = parse(searchDob, "dd/MM/yyyy", new Date());
        searchDob = format(dobDate, "yyyy-MM-dd");
      }

      record = await AadhaarModel.findOne({
        aadhaarNumber: aadhaarNumber as string,
        dob: searchDob,
      });

      if (!record) {
        const allRecords = await AadhaarModel.find({
          aadhaarNumber: aadhaarNumber as string,
        });
        
        for (const dbRecord of allRecords) {
          if (dbRecord.dob && dbRecord.dob.includes('/')) {
            const dbDobDate = parse(dbRecord.dob, "dd/MM/yyyy", new Date());
            const dbFormattedDob = format(dbDobDate, "yyyy-MM-dd");
            if (dbFormattedDob === searchDob) {
              record = dbRecord;
              break;
            }
          }
        }
      }
    } else {
      record = await AadhaarModel.findOne({ aadhaarNumber: aadhaarNumber as string }).sort({ createdAt: -1 });
    }

    if (!record) {
      logger.info("Aadhaar record not found", {
        aadhaarNumber,
        dob: dob as string | undefined,
        ip: req.ip,
      });
      res.status(404).json({ success: false, message: "Record not found" });
      return;
    }

    const doc = record as unknown as { aadhaarNumber: string };

    logger.info("Aadhaar record found successfully", {
      aadhaarNumber: doc.aadhaarNumber,
      ip: req.ip,
    });

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    logger.error("Error finding Aadhaar record", {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      aadhaarNumber: aadhaarNumber as string,
      dob: dob as string | undefined,
      ip: req.ip,
    });
    res.status(500).json({ success: false, message: "Error finding Aadhaar record" });
  }
};
