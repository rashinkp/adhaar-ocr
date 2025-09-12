import express from 'express'
import { findRecord, processOcr } from '../controllers/controller.js';


const router = express.Router();

router.post('/ocr' , processOcr)
router.get('/search', findRecord)



export default router;