import type { Request, Response } from "express";
import type { IAadhaarService } from "../services/interfaces/aadhaar.service.interface";
import type { ILogger } from "../providers/interfaces/logger.provider.interface";
import type { AadhaarSearchDto } from "../dto/service.dto";
import { HttpStatus } from "../constants/http.status";
import { ResponseMessages } from "../constants/response.messages";
import { ErrorCodes } from "../constants/error.codes";
import { ResponseHelper } from "../utils/response.helper";

export class AadhaarController {
  constructor(
    private readonly _aadhaarService: IAadhaarService,
    private readonly _logger: ILogger
  ) {}

  processOcr = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate file upload
      if (
        !req.files ||
        Array.isArray(req.files) ||
        !(req.files as { [fieldname: string]: Express.Multer.File[] })
          .frontFile ||
        !(req.files as { [fieldname: string]: Express.Multer.File[] }).backFile
      ) {
        const { response } = ResponseHelper.badRequest(ResponseMessages.FILES_REQUIRED);
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (
        !files.frontFile ||
        !files.backFile ||
        !files.frontFile[0] ||
        !files.backFile[0]
      ) {
        const { response } = ResponseHelper.badRequest(ResponseMessages.FILES_REQUIRED);
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const frontBuffer = files.frontFile[0].buffer;
      const backBuffer = files.backFile[0].buffer;

      // Process OCR through service
      const result = await this._aadhaarService.processOcr(
        frontBuffer,
        backBuffer
      );

      // Handle service response
      if (!result.success) {
        // Error response
        let statusCode: number;
        let message: string;
        let errorCode: string;
        
        switch (result.error.type) {
          case 'INCOMPLETE_DATA':
            statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
            message = ResponseMessages.OCR_INCOMPLETE;
            errorCode = ErrorCodes.OCR_INCOMPLETE_DATA;
            break;
          case 'OCR_ERROR':
            statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
            message = ResponseMessages.OCR_FAILED;
            errorCode = ErrorCodes.OCR_PROCESSING_FAILED;
            break;
          default:
            statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
            message = ResponseMessages.INTERNAL_ERROR;
            errorCode = ErrorCodes.INTERNAL_ERROR;
        }

        const { response } = ResponseHelper.error(message, errorCode, statusCode, result.error.details);
        
        this._logger.info("OCR request processed", {
          success: false,
          errorType: result.error.type,
          ip: req.ip,
        });

        res.status(statusCode).json(response);
      } else {
        // Success response
        const { response } = ResponseHelper.success(result.data, ResponseMessages.OCR_COMPLETED);
        
        this._logger.info("OCR request processed", {
          success: true,
          aadhaarNumber: result.data.data.aadhaarNumber,
          ip: req.ip,
        });

        res.status(HttpStatus.OK).json(response);
      }
    } catch (error) {
      this._logger.error("OCR controller error", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        ip: req.ip,
      });

      const { response } = ResponseHelper.error(
        ResponseMessages.INTERNAL_ERROR,
        ErrorCodes.INTERNAL_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  };

  findRecord = async (req: Request, res: Response): Promise<void> => {
    try {
      const { aadhaarNumber, dob } = req.query;

      const searchDto: AadhaarSearchDto = {
        aadhaarNumber: aadhaarNumber as string,
        ...(dob && { dob: dob as string }),
      };

      const result = await this._aadhaarService.findRecord(searchDto);

      // Handle service response
      if (!result.success) {
        // Error response
        let statusCode: number;
        let message: string;
        let errorCode: string;
        
        switch (result.error.type) {
          case 'VALIDATION_ERROR':
            statusCode = HttpStatus.BAD_REQUEST;
            message = result.error.message;
            errorCode = ErrorCodes.VALIDATION_ERROR;
            break;
          case 'NOT_FOUND':
            statusCode = HttpStatus.NOT_FOUND;
            message = ResponseMessages.NOT_FOUND;
            errorCode = ErrorCodes.NOT_FOUND;
            break;
          case 'DATABASE_ERROR':
            statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
            message = ResponseMessages.INTERNAL_ERROR;
            errorCode = ErrorCodes.DATABASE_OPERATION_FAILED;
            break;
          default:
            statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
            message = ResponseMessages.INTERNAL_ERROR;
            errorCode = ErrorCodes.INTERNAL_ERROR;
        }

        const { response } = ResponseHelper.error(message, errorCode, statusCode, result.error.details);
        
        this._logger.info("Search request processed", {
          success: false,
          errorType: result.error.type,
          aadhaarNumber: searchDto.aadhaarNumber,
          ip: req.ip,
        });

        res.status(statusCode).json(response);
      } else {
        // Success response
        const { response } = ResponseHelper.success(result.data, ResponseMessages.RECORD_FOUND);
        
        this._logger.info("Search request processed", {
          success: true,
          aadhaarNumber: result.data.aadhaarNumber,
          ip: req.ip,
        });

        res.status(HttpStatus.OK).json(response);
      }
    } catch (error) {
      this._logger.error("Search controller error", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        ip: req.ip,
      });

      const { response } = ResponseHelper.error(
        ResponseMessages.INTERNAL_ERROR,
        ErrorCodes.INTERNAL_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  };

  getAllRecords = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this._aadhaarService.getAllRecords();

      // Handle service response
      if (!result.success) {
        // Error response
        const { response } = ResponseHelper.error(
          ResponseMessages.INTERNAL_ERROR,
          ErrorCodes.DATABASE_OPERATION_FAILED,
          HttpStatus.INTERNAL_SERVER_ERROR,
          result.error.details
        );
        
        this._logger.info("Get all records request processed", {
          success: false,
          errorType: result.error.type,
          ip: req.ip,
        });

        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
      } else {
        // Success response
        const { response } = ResponseHelper.success(result.data, ResponseMessages.RECORDS_FETCHED);
        
        this._logger.info("Get all records request processed", {
          success: true,
          recordCount: result.data.length,
          ip: req.ip,
        });

        res.status(HttpStatus.OK).json(response);
      }
    } catch (error) {
      this._logger.error("Get all records controller error", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        ip: req.ip,
      });

      const { response } = ResponseHelper.error(
        ResponseMessages.INTERNAL_ERROR,
        ErrorCodes.INTERNAL_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  };

  deleteRecord = async (req: Request, res: Response): Promise<void> => {
    try {
      const { aadhaarNumber } = req.params;

      if (!aadhaarNumber) {
        const { response } = ResponseHelper.badRequest(ResponseMessages.AADHAAR_NUMBER_REQUIRED);
        res.status(HttpStatus.BAD_REQUEST).json(response);
        return;
      }

      const result = await this._aadhaarService.deleteRecord(aadhaarNumber);

      // Handle service response
      if (!result.success) {
        // Error response
        let statusCode: number;
        let message: string;
        let errorCode: string;
        
        switch (result.error.type) {
          case 'NOT_FOUND':
            statusCode = HttpStatus.NOT_FOUND;
            message = ResponseMessages.NOT_FOUND;
            errorCode = ErrorCodes.NOT_FOUND;
            break;
          case 'DATABASE_ERROR':
            statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
            message = ResponseMessages.INTERNAL_ERROR;
            errorCode = ErrorCodes.DATABASE_OPERATION_FAILED;
            break;
          default:
            statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
            message = ResponseMessages.INTERNAL_ERROR;
            errorCode = ErrorCodes.INTERNAL_ERROR;
        }

        const { response } = ResponseHelper.error(message, errorCode, statusCode, result.error.details);
        
        this._logger.info("Delete record request processed", {
          success: false,
          errorType: result.error.type,
          aadhaarNumber,
          ip: req.ip,
        });

        res.status(statusCode).json(response);
      } else {
        // Success response
        const { response } = ResponseHelper.success(null, ResponseMessages.RECORD_DELETED);
        
        this._logger.info("Delete record request processed", {
          success: true,
          aadhaarNumber,
          ip: req.ip,
        });

        res.status(HttpStatus.OK).json(response);
      }
    } catch (error) {
      this._logger.error("Delete record controller error", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        aadhaarNumber: req.params.aadhaarNumber,
        ip: req.ip,
      });

      const { response } = ResponseHelper.error(
        ResponseMessages.INTERNAL_ERROR,
        ErrorCodes.INTERNAL_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  };
}
