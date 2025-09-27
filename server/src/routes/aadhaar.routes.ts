import express from "express";
import type { AadhaarController } from "../controllers/aadhaar.controller";
import { upload } from "../middleware/uploadMiddleware";
import { validateFiles, validateSearch } from "../middleware/validationMiddleware";


export default function createAadhaarRoutes(
  aadhaarController: AadhaarController
) {
  const router = express.Router();

  // OCR processing endpoint
  router.post(
    "/ocr",
    upload.fields([
      { name: "frontFile", maxCount: 1 },
      { name: "backFile", maxCount: 1 },
    ]),
    validateFiles,
    aadhaarController.processOcr
  );

  // Search endpoint
  router.get("/search", validateSearch, aadhaarController.findRecord);

  // Get all records endpoint
  router.get("/records", aadhaarController.getAllRecords);

  // Delete record endpoint
  router.delete("/records/:aadhaarNumber", aadhaarController.deleteRecord);

  return router;
}
