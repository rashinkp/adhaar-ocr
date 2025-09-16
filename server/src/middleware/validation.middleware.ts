import type { NextFunction, Request, Response } from 'express';

const isValidAadhaar = (aadhaar: string): boolean => {
  return /^\d{12}$/.test(aadhaar) && 
         !aadhaar.split('').every((d: string) => d === aadhaar[0]) &&
         !aadhaar.split('').every((d: string, i: number) => {
           if (i === 0) return true;
           return Number(d) === Number(aadhaar.charAt(i - 1)) + 1;
         });
};

const isValidDate = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  const today = new Date();
  return date < today && date.getFullYear() > 1900;
};

export const validateSearch = (req: Request, res: Response, next: NextFunction) => {
  const { aadhaarNumber, dob } = req.query;
  
  if (!aadhaarNumber || !dob) {
    return res.status(400).json({ success: false, message: 'Aadhaar number and DOB are required' });
  }
  
  if (!isValidAadhaar(aadhaarNumber as string)) {
    return res.status(400).json({ success: false, message: 'Invalid Aadhaar number' });
  }
  
  if (!isValidDate(dob as string)) {
    return res.status(400).json({ success: false, message: 'Invalid date of birth' });
  }
  
  next();
};

export const validateFiles = (req: Request, res: Response, next: NextFunction) => {
  if (!req.files) {
    return res.status(400).json({ success: false, message: 'No files provided' });
  }
  
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  
  if (!files.frontFile || !files.backFile) {
    return res.status(400).json({ success: false, message: 'Both front and back images are required' });
  }
  
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  for (const [fieldName, fileArray] of Object.entries(files)) {
    for (const file of fileArray) {
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ success: false, message: 'Invalid file type' });
      }
      
      if (file.size > maxSize) {
        return res.status(400).json({ success: false, message: 'File too large' });
      }
    }
  }
  
  next();
};
