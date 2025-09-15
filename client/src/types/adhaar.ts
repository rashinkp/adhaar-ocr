export interface AadhaarData {
  aadhaarNumber: string;
  address: string;
  dob: string;
  name: string;
  gender: string;
}

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface AadhaarResponse {
  success: boolean;
  data?: AadhaarData;
  message?: string;
  validation?: ValidationResult;
  errors?: string[];
  suggestions?: string[];
  parsed?: Partial<AadhaarData>;
  rawText?: {
    frontText: string;
    backText: string;
  };
}