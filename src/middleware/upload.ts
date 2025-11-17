import multer from 'multer';
import { Request } from 'express';
import { BadRequestError } from '../utils/errors';

// Configure multer for memory storage (we'll upload to Cloudinary from memory)
const storage = multer.memoryStorage();

// File filter to only accept images
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept images only
  if (!file.mimetype.startsWith('image/')) {
    cb(new BadRequestError('Only image files are allowed'));
    return;
  }

  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    cb(new BadRequestError('File size cannot exceed 5MB'));
    return;
  }

  cb(null, true);
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 1, // Only one file per request
  },
});

// Middleware for handling single image upload
export const uploadSingle = upload.single('image');
