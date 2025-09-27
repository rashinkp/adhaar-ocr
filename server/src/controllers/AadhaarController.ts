import type { Request, Response } from "express";
import type { IAadhaarService } from "../services/IAadhaarService.js";
import logger from "../config/logger.config.js";
import type { AadhaarSearchDto } from "../dto/AadhaarDto.js";

export class AadhaarController {
  constructor(private readonly aadhaarService: IAadhaarService) {}

  processOcr = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate file upload
      if (
        !req.files ||
        Array.isArray(req.files) ||
        !(req.files as { [fieldname: string]: Express.Multer.File[] }).frontFile ||
        !(req.files as { [fieldname: string]: Express.Multer.File[] }).backFile
      ) {
        res.status(400).json({ 
          success: false,
          message: "Both front and back images are required" 
        });
        return;
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (
        !files.frontFile ||
        !files.backFile ||
        !files.frontFile[0] ||
        !files.backFile[0]
      ) {
        res.status(400).json({ 
          success: false,
          message: "Both front and back images are required" 
        });
        return;
      }

      const frontBuffer = files.frontFile[0].buffer;
      const backBuffer = files.backFile[0].buffer;

      // Process OCR through service
      const result = await this.aadhaarService.processOcr(frontBuffer, backBuffer);

      // Set appropriate status code based on result
      const statusCode = result.success ? 200 : (result.message?.includes("incomplete") ? 422 : 500);
      
      logger.info("OCR request processed", {
        success: result.success,
        aadhaarNumber: result.data?.aadhaarNumber,
        ip: req.ip,
      });

      res.status(statusCode).json(result);

    } catch (error) {
      logger.error("OCR controller error", {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        ip: req.ip,
      });
      
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  };

  findRecord = async (req: Request, res: Response): Promise<void> => {
    try {
      const { aadhaarNumber, dob } = req.query;

      const searchDto: AadhaarSearchDto = {
        aadhaarNumber: aadhaarNumber as string,
        ...(dob && { dob: dob as string }),
      };

      const result = await this.aadhaarService.findRecord(searchDto);

      const statusCode = result.success ? 200 : (result.message?.includes("not found") ? 404 : 400);

      logger.info("Search request processed", {
        success: result.success,
        aadhaarNumber: searchDto.aadhaarNumber,
        hasDob: !!searchDto.dob,
        ip: req.ip,
      });

      res.status(statusCode).json(result);

    } catch (error) {
      logger.error("Search controller error", {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        ip: req.ip,
      });

      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  };

  getAllRecords = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.aadhaarService.getAllRecords();

      const statusCode = result.success ? 200 : 500;

      logger.info("Get all records request processed", {
        success: result.success,
        ip: req.ip,
      });

      res.status(statusCode).json(result);

    } catch (error) {
      logger.error("Get all records controller error", {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        ip: req.ip,
      });

      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  };

  deleteRecord = async (req: Request, res: Response): Promise<void> => {
    try {
      const { aadhaarNumber } = req.params;

      if (!aadhaarNumber) {
        res.status(400).json({ 
          success: false,
          message: "Aadhaar number is required" 
        });
        return;
      }

      const result = await this.aadhaarService.deleteRecord(aadhaarNumber);

      const statusCode = result.success ? 200 : (result.message?.includes("not found") ? 404 : 500);

      logger.info("Delete record request processed", {
        success: result.success,
        aadhaarNumber,
        ip: req.ip,
      });

      res.status(statusCode).json(result);

    } catch (error) {
      logger.error("Delete record controller error", {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        aadhaarNumber: req.params.aadhaarNumber,
        ip: req.ip,
      });

      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  };
}
