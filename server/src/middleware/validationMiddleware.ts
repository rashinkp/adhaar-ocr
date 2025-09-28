import type { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../constants/http.status';
import { ResponseMessages } from '../constants/response.messages';
import { ResponseHelper } from '../utils/response.helper';

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
    const { response } = ResponseHelper.badRequest('Aadhaar number and DOB are required');
    return res.status(HttpStatus.BAD_REQUEST).json(response);
  }
  
  if (!isValidAadhaar(aadhaarNumber as string)) {
    const { response } = ResponseHelper.badRequest('Invalid Aadhaar number');
    return res.status(HttpStatus.BAD_REQUEST).json(response);
  }
  
  if (!isValidDate(dob as string)) {
    const { response } = ResponseHelper.badRequest('Invalid date of birth');
    return res.status(HttpStatus.BAD_REQUEST).json(response);
  }
  
  next();
};

export const validateFiles = (req: Request, res: Response, next: NextFunction) => {
  if (!req.files) {
    const { response } = ResponseHelper.badRequest(ResponseMessages.FILES_REQUIRED);
    return res.status(HttpStatus.BAD_REQUEST).json(response);
  }
  
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  
  if (!files.frontFile || !files.backFile) {
    const { response } = ResponseHelper.badRequest(ResponseMessages.FILES_REQUIRED);
    return res.status(HttpStatus.BAD_REQUEST).json(response);
  }
  
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  for (const [, fileArray] of Object.entries(files)) {
    for (const file of fileArray) {
      if (!allowedTypes.includes(file.mimetype)) {
        const { response } = ResponseHelper.badRequest(ResponseMessages.INVALID_FILE_FORMAT);
        return res.status(HttpStatus.BAD_REQUEST).json(response);
      }
      
      if (file.size > maxSize) {
        const { response } = ResponseHelper.badRequest(ResponseMessages.FILE_TOO_LARGE);
        return res.status(HttpStatus.BAD_REQUEST).json(response);
      }
    }
  }
  
  next();
};
