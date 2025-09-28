import { ValidationMessages } from "../constants/response.messages";
import { ErrorCodes } from "../constants/error.codes";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
  code?: string;
}

export class ValidationHelper {
  static validateAadhaarNumber(aadhaarNumber: string): ValidationResult {
    if (!aadhaarNumber) {
      return {
        isValid: false,
        error: ValidationMessages.AADHAAR_NUMBER_MISSING,
        code: ErrorCodes.MISSING_REQUIRED_FIELD,
      };
    }
    
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      return {
        isValid: false,
        error: ValidationMessages.AADHAAR_NUMBER_INVALID,
        code: ErrorCodes.INVALID_AADHAAR_NUMBER,
      };
    }
    
    if (/^(\d)\1{11}$/.test(aadhaarNumber)) {
      return {
        isValid: false,
        error: ValidationMessages.AADHAAR_NUMBER_IDENTICAL,
        code: ErrorCodes.INVALID_AADHAAR_NUMBER,
      };
    }
    
    if (/^012345678901$|^123456789012$/.test(aadhaarNumber)) {
      return {
        isValid: false,
        error: ValidationMessages.AADHAAR_NUMBER_SEQUENTIAL,
        code: ErrorCodes.INVALID_AADHAAR_NUMBER,
      };
    }
    
    return { isValid: true };
  }

  static validateName(name: string): ValidationResult {
    if (!name) {
      return {
        isValid: false,
        error: ValidationMessages.NAME_MISSING,
        code: ErrorCodes.MISSING_REQUIRED_FIELD,
      };
    }
    
    if (name.length < 2) {
      return {
        isValid: false,
        error: ValidationMessages.NAME_TOO_SHORT,
        code: ErrorCodes.INVALID_NAME_FORMAT,
      };
    }
    
    if (name.length > 50) {
      return {
        isValid: false,
        error: ValidationMessages.NAME_TOO_LONG,
        code: ErrorCodes.INVALID_NAME_FORMAT,
      };
    }
    
    if (!/^[A-Za-z\s\.\-']+$/.test(name)) {
      return {
        isValid: false,
        error: ValidationMessages.NAME_INVALID_CHARS,
        code: ErrorCodes.INVALID_NAME_FORMAT,
      };
    }
    
    if (name.trim().split(/\s+/).length < 2) {
      return {
        isValid: true,
        warning: ValidationMessages.NAME_INCOMPLETE,
      };
    }
    
    return { isValid: true };
  }

  static validateDOB(dob: string): ValidationResult {
    if (!dob) {
      return {
        isValid: false,
        error: ValidationMessages.DOB_MISSING,
        code: ErrorCodes.INVALID_DATE_FORMAT,
      };
    }
    
    // eslint-disable-next-line no-useless-escape
    const dateRegex = /^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/;
    const match = dob.match(dateRegex);
    
    if (!match) {
      return {
        isValid: false,
        error: ValidationMessages.DOB_INVALID_FORMAT,
        code: ErrorCodes.INVALID_DATE_FORMAT,
      };
    }
    
    const [, day, month, year] = match;
    const dayNum = parseInt(day!);
    const monthNum = parseInt(month!);
    const yearNum = parseInt(year!);
    
    if (monthNum < 1 || monthNum > 12) {
      return {
        isValid: false,
        error: ValidationMessages.DOB_INVALID_MONTH,
        code: ErrorCodes.INVALID_DATE_FORMAT,
      };
    }
    
    if (dayNum < 1 || dayNum > 31) {
      return {
        isValid: false,
        error: ValidationMessages.DOB_INVALID_DAY,
        code: ErrorCodes.INVALID_DATE_FORMAT,
      };
    }
    
    const date = new Date(yearNum, monthNum - 1, dayNum);
    if (date.getFullYear() !== yearNum || date.getMonth() !== monthNum - 1 || date.getDate() !== dayNum) {
      return {
        isValid: false,
        error: ValidationMessages.DOB_INVALID_DATE,
        code: ErrorCodes.INVALID_DATE_FORMAT,
      };
    }
    
    const today = new Date();
    const age = today.getFullYear() - yearNum;
    
    if (age < 0) {
      return {
        isValid: false,
        error: ValidationMessages.DOB_FUTURE,
        code: ErrorCodes.INVALID_DATE_FORMAT,
      };
    }
    
    if (age > 120) {
      return {
        isValid: false,
        error: ValidationMessages.DOB_AGE_INVALID,
        code: ErrorCodes.INVALID_DATE_FORMAT,
      };
    }
    
    return { isValid: true };
  }

  static validateGender(gender: string): ValidationResult {
    if (!gender) {
      return {
        isValid: false,
        error: ValidationMessages.GENDER_INVALID,
        code: ErrorCodes.VALIDATION_ERROR,
      };
    }
    
    const validGenders = ["Male", "Female", "Other"];
    if (!validGenders.includes(gender)) {
      return {
        isValid: false,
        error: ValidationMessages.GENDER_INVALID,
        code: ErrorCodes.VALIDATION_ERROR,
      };
    }
    
    return { isValid: true };
  }
}

