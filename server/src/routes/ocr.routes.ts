import express from 'express';
import { findRecord, processOcr } from '../controllers/ocr.controller.js';
import { upload } from '../middleware/upload.middleware.js';
import { validateFiles, validateSearch } from '../middleware/validation.middleware.js';

const router = express.Router();

router.post("/ocr", upload.fields([
  { name: "frontFile", maxCount: 1 },
  { name: "backFile", maxCount: 1 },
]), validateFiles, processOcr);

router.get('/search', validateSearch, findRecord);

export default router;