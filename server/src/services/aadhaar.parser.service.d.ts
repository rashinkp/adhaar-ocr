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
export declare const parseAadhaarText: (frontText: string, backText: string) => ParsedAadhaar;
export declare const parseAadhaarTextWithValidation: (frontText: string, backText: string) => ParsedAadhaarWithValidation;
//# sourceMappingURL=aadhaar.parser.service.d.ts.map