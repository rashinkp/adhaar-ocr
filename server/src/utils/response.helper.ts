import { HttpStatus } from "../constants/http.status.js";
import { ResponseMessages } from "../constants/response.messages.js";
import { ErrorCodes } from "../constants/error.codes.js";
import type { AadhaarDto } from "../dto/aadhaar.dto.js";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export class ResponseHelper {
  static success<T>(
    data?: T,
    message: string = ResponseMessages.SUCCESS,
    statusCode: number = HttpStatus.OK
  ): { statusCode: number; response: ApiResponse<T> } {
    return {
      statusCode,
      response: {
        success: true,
        message,
        data,
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
    };
  }

  static error(
    message: string = ResponseMessages.INTERNAL_ERROR,
    errorCode: string = ErrorCodes.INTERNAL_ERROR,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: any
  ): { statusCode: number; response: ApiResponse } {
    return {
      statusCode,
      response: {
        success: false,
        message,
        error: {
          code: errorCode,
          details,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
    };
  }

  static validationError(
    message: string = ResponseMessages.VALIDATION_ERROR,
    details?: any
  ): { statusCode: number; response: ApiResponse } {
    return this.error(
      message,
      ErrorCodes.VALIDATION_ERROR,
      HttpStatus.BAD_REQUEST,
      details
    );
  }

  static notFound(
    message: string = ResponseMessages.NOT_FOUND
  ): { statusCode: number; response: ApiResponse } {
    return this.error(
      message,
      ErrorCodes.NOT_FOUND,
      HttpStatus.NOT_FOUND
    );
  }

  static badRequest(
    message: string = ResponseMessages.INVALID_DATA,
    details?: any
  ): { statusCode: number; response: ApiResponse } {
    return this.error(
      message,
      ErrorCodes.BAD_REQUEST,
      HttpStatus.BAD_REQUEST,
      details
    );
  }

  static unprocessableEntity(
    message: string = ResponseMessages.OCR_INCOMPLETE,
    details?: any
  ): { statusCode: number; response: ApiResponse } {
    return this.error(
      message,
      ErrorCodes.OCR_INCOMPLETE_DATA,
      HttpStatus.UNPROCESSABLE_ENTITY,
      details
    );
  }

  static created<T>(
    data: T,
    message: string = ResponseMessages.RECORD_SAVED
  ): { statusCode: number; response: ApiResponse<T> } {
    return this.success(data, message, HttpStatus.CREATED);
  }
}

