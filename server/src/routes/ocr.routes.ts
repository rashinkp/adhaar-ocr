import express from "express";
import { upload } from "../middleware/upload.middleware";
import {
  validateFiles,
  validateSearch,
} from "../middleware/validation.middleware";
import { OcrController } from "../controllers/ocr.controller";
import AadhaarOcrProcessor from "../services/ocr.service";
import { AadhaarModel } from "../models/Aadhaar";

const router = express.Router();
const ocrProcessor = new AadhaarOcrProcessor();
const ocrController = new OcrController(AadhaarModel, ocrProcessor);

router.post(
  "/ocr",
  upload.fields([
    { name: "frontFile", maxCount: 1 },
    { name: "backFile", maxCount: 1 },
  ]),
  validateFiles,
  ocrController.processOcr.bind(ocrController) 
);

router.get(
  "/search",
  validateSearch,
  ocrController.findRecord.bind(ocrController)
);

export default router;
