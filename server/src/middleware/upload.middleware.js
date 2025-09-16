import multer from "multer";
// Use memoryStorage to avoid writing files to disk
const storage = multer.memoryStorage();
export const upload = multer({ storage });
//# sourceMappingURL=upload.middleware.js.map