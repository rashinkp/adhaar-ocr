import express from 'express'
import { findRecord, processOcr } from '../controllers/controller.js';
import { upload } from '../middleware/multer.middleware.js';


const router = express.Router();

router.post(
  "/ocr",
  upload.fields([
    { name: "frontFile", maxCount: 1 },
    { name: "backFile", maxCount: 1 },
  ]),
  processOcr
);
router.get('/search', findRecord)



export default router;