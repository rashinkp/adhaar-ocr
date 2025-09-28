export type ParsedAadhaar = {
  aadhaarNumber?: string;
  dob?: string;
  gender?: "Male" | "Female" | "Other";
  name?: string;
  address?: string;
};

export type ValidationResult = {
  isValid: boolean;
  confidence: number;
  errors: string[];
  warnings: string[];
  suggestions: string[];
};

export type ParsedAadhaarWithValidation = ParsedAadhaar & {
  validation: ValidationResult;
  rawText: {
    frontText: string;
    backText: string;
  };
};
