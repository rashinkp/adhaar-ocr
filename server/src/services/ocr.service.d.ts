import { type ParsedAadhaar, type ParsedAadhaarWithValidation } from "./aadhaar.parser.service.js";
export declare const performOcrProcessing: (frontBuffer: Buffer, backBuffer: Buffer) => Promise<{
    frontText: string;
    backText: string;
    parsed: ParsedAadhaar;
}>;
export declare const performOcrProcessingWithValidation: (frontBuffer: Buffer, backBuffer: Buffer) => Promise<ParsedAadhaarWithValidation>;
//# sourceMappingURL=ocr.service.d.ts.map