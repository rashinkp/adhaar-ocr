export interface AadhaarDto {
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

export interface AadhaarResponseDto {
  success: boolean;
  data?: AadhaarDto;
  message?: string;
  ocrText?: {
    frontText: string;
    backText: string;
  };
  parsed?: Partial<AadhaarDto>;
  validation?: {
    isValid: boolean;
    confidence: number;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  };
}

export interface OcrProcessingDto {
  frontBuffer: Buffer;
  backBuffer: Buffer;
}
