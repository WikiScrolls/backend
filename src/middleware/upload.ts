import multer from 'multer';
import { Request } from 'express';
import { BadRequestError } from '../utils/errors';

// Configure multer for memory storage (we'll upload to Cloudinary from memory)
const storage = multer.memoryStorage();

// File filter to only accept images
const imageFileFilter = (
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

// File filter to only accept audio files
const audioFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept audio only
  const allowedMimeTypes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/ogg',
    'audio/webm',
    'audio/flac',
    'audio/aac',
    'audio/m4a',
    'audio/x-m4a',
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    cb(new BadRequestError('Only audio files are allowed (MP3, WAV, OGG, FLAC, AAC, M4A)'));
    return;
  }

  // Check file size (20MB max for audio)
  const maxSize = 20 * 1024 * 1024; // 20MB
  if (file.size > maxSize) {
    cb(new BadRequestError('Audio file size cannot exceed 20MB'));
    return;
  }

  cb(null, true);
};

// Configure multer for images
export const imageUpload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 1, // Only one file per request
  },
});

// Configure multer for audio
export const audioUpload = multer({
  storage,
  fileFilter: audioFileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max
    files: 1, // Only one file per request
  },
});

// Middleware for handling single image upload
export const uploadSingle = imageUpload.single('image');

// Middleware for handling single audio upload
export const uploadAudioSingle = audioUpload.single('audio');

// Legacy export for backwards compatibility
export const upload = imageUpload;
