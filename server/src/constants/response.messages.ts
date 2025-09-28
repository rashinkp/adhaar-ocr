export enum ResponseMessages {
  // Success messages
  SUCCESS = 'Operation completed successfully',
  RECORD_SAVED = 'Record saved successfully',
  RECORD_FOUND = 'Record found successfully',
  RECORD_DELETED = 'Record deleted successfully',
  RECORDS_FETCHED = 'Records fetched successfully',
  OCR_COMPLETED = 'OCR processing completed successfully',

  // Error messages
  INTERNAL_ERROR = 'Internal server error occurred',
  VALIDATION_ERROR = 'Validation failed',
  NOT_FOUND = 'Record not found',
  DUPLICATE_RECORD = 'Record already exists',
  INVALID_DATA = 'Invalid data provided',
  MISSING_REQUIRED_FIELD = 'Required field is missing',
  
  // OCR specific messages
  OCR_FAILED = 'OCR processing failed',
  OCR_INCOMPLETE = 'Parsed data incomplete; cannot store',
  FILES_REQUIRED = 'Both front and back images are required',
  AADHAAR_NUMBER_REQUIRED = 'Aadhaar number is required',
  
  // File upload messages
  INVALID_FILE_FORMAT = 'Invalid file format',
  FILE_TOO_LARGE = 'File size too large',
  FILE_UPLOAD_FAILED = 'File upload failed',
}

export enum ValidationMessages {
  AADHAAR_NUMBER_MISSING = 'Aadhaar number is missing',
  AADHAAR_NUMBER_INVALID = 'Aadhaar number must be exactly 12 digits',
  AADHAAR_NUMBER_IDENTICAL = 'Aadhaar number cannot have all identical digits',
  AADHAAR_NUMBER_SEQUENTIAL = 'Aadhaar number appears to be sequential',
  
  NAME_MISSING = 'Name is missing',
  NAME_TOO_SHORT = 'Name must be at least 2 characters long',
  NAME_TOO_LONG = 'Name is too long. Maximum 50 characters allowed',
  NAME_INVALID_CHARS = 'Name contains invalid characters',
  NAME_INCOMPLETE = 'Name appears to be incomplete',
  
  DOB_MISSING = 'Date of birth is missing',
  DOB_INVALID_FORMAT = 'Invalid date format. Expected DD/MM/YYYY or DD-MM-YYYY',
  DOB_INVALID_MONTH = 'Invalid month. Must be between 01-12',
  DOB_INVALID_DAY = 'Invalid day. Must be between 01-31',
  DOB_INVALID_DATE = 'Invalid date. Please check day, month, and year',
  DOB_FUTURE = 'Date of birth cannot be in the future',
  DOB_AGE_INVALID = 'Invalid age. Please check the year of birth',
  
  ADDRESS_TOO_SHORT = 'Address is too short',
  ADDRESS_TOO_LONG = 'Address is too long',
  ADDRESS_INCOMPLETE = 'Address appears incomplete',
  
  GENDER_INVALID = 'Invalid gender. Must be one of: Male, Female, Other',
}

