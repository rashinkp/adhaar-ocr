import logger from '../config/logger.config.js';
// Simple validation helpers
const isValidAadhaar = (aadhaar) => {
    return /^\d{12}$/.test(aadhaar) &&
        !aadhaar.split('').every((d) => d === aadhaar[0]) &&
        !aadhaar.split('').every((d, i) => {
            if (i === 0)
                return true;
            return Number(d) === Number(aadhaar.charAt(i - 1)) + 1;
        });
};
const isValidDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    return date < today && date.getFullYear() > 1900;
};
// Simple search validation
export const validateSearch = (req, res, next) => {
    const { aadhaarNumber, dob } = req.query;
    if (!aadhaarNumber || !dob) {
        return res.status(400).json({ success: false, message: 'Aadhaar number and DOB are required' });
    }
    if (!isValidAadhaar(aadhaarNumber)) {
        return res.status(400).json({ success: false, message: 'Invalid Aadhaar number' });
    }
    if (!isValidDate(dob)) {
        return res.status(400).json({ success: false, message: 'Invalid date of birth' });
    }
    next();
};
// Simple file validation
export const validateFiles = (req, res, next) => {
    if (!req.files) {
        return res.status(400).json({ success: false, message: 'No files provided' });
    }
    const files = req.files;
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
//# sourceMappingURL=validation.middleware.js.map