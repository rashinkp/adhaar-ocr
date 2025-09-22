export type ParsedAadhaar = {
  aadhaarNumber?: string;
  dob?: string;
  gender?: "Male" | "Female" | "Other";
  name?: string;
  address?: string;
};

export type ParsedAadhaarWithValidation = ParsedAadhaar & {
  validation: ValidationResult;
  rawText: {
    frontText: string;
    backText: string;
  };
};

export interface RawText {
  frontText: string;
  backText: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
}


export interface OcrResult {
  frontText: string;
  backText: string;
  parsed: ParsedAadhaar;
}
