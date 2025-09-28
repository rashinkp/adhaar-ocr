// Service layer DTOs - focused on data only
export interface AadhaarDataDto {
  id: string;
  aadhaarNumber: string;
  name: string;
  dob?: string;
  address?: string;
  gender?: "Male" | "Female" | "Other";
  createdAt?: Date;
}

export interface AadhaarSearchDto {
  aadhaarNumber: string;
  dob?: string;
}

export interface AadhaarProcessDto {
  data: AadhaarDataDto;
  ocrText: {
    frontText: string;
    backText: string;
  };
  parsed: Partial<AadhaarDataDto>;
}

export interface AadhaarValidationError {
  field: string;
  message: string;
  code: string;
}

// Clean service result types - no HTTP concerns
export type ServiceResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: {
    type: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'DATABASE_ERROR' | 'OCR_ERROR' | 'INCOMPLETE_DATA';
    message: string;
    details?: unknown;
  };
};

// Specific result types for each service method
export type ProcessOcrResult = ServiceResult<AadhaarProcessDto>;
export type FindRecordResult = ServiceResult<AadhaarDataDto>;
export type GetAllRecordsResult = ServiceResult<AadhaarDataDto[]>;
export type DeleteRecordResult = ServiceResult<boolean>;

// Legacy types for backward compatibility (to be removed after refactoring)
export interface AadhaarProcessingError {
  type: 'OCR_FAILED' | 'VALIDATION_FAILED' | 'DATABASE_ERROR' | 'INCOMPLETE_DATA';
  message: string;
  details?: unknown;
}