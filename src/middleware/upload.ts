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

// File filter for audio files
const audioFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept audio files only
  const allowedMimeTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
  
  if (!allowedMimeTypes.includes(file.mimetype)) {
    cb(new BadRequestError('Only audio files (MP3, WAV, OGG) are allowed'));
    return;
  }

  // Check file size (10MB max for audio)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    cb(new BadRequestError('Audio file size cannot exceed 10MB'));
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

// Configure multer for audio
export const uploadAudioConfig = multer({
  storage,
  fileFilter: audioFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max for audio
    files: 1,
  },
});

// Middleware for handling single image upload
export const uploadSingle = upload.single('image');

// Middleware for handling single audio upload
export const uploadAudioSingle = uploadAudioConfig.single('audio');
