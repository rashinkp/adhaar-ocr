import express from "express";
import type { AadhaarController } from "../controllers/aadhaar.controller";
import { upload } from "../middleware/uploadMiddleware";
import { validateFiles, validateSearch } from "../middleware/validationMiddleware";
import { Routes } from "../constants/routes";


export default function createAadhaarRoutes(
  aadhaarController: AadhaarController
) {
  const router = express.Router();

  // OCR processing endpoint
  router.post(
    Routes.AADHAAR.OCR,
    upload.fields([
      { name: "frontFile", maxCount: 1 },
      { name: "backFile", maxCount: 1 },
    ]),
    validateFiles,
    aadhaarController.processOcr
  );

  // Search endpoint
  router.get(Routes.AADHAAR.SEARCH, validateSearch, aadhaarController.findRecord);

  // Get all records endpoint
  router.get(Routes.AADHAAR.RECORDS, aadhaarController.getAllRecords);

  // Delete record endpoint
  router.delete(`${Routes.AADHAAR.RECORDS}/:aadhaarNumber`, aadhaarController.deleteRecord);

  return router;
}
