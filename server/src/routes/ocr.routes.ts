import express from "express";
import { upload } from "../middleware/upload.middleware";
import {
  validateFiles,
  validateSearch,
} from "../middleware/validation.middleware";
import { OcrController } from "../controllers/ocr.controller";

const router = express.Router();
const ocrController = new OcrController();

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
