import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../config/logger';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Upload an image to Cloudinary
 * @param file - The file buffer to upload
 * @param folder - The folder in Cloudinary to store the image
 * @param publicId - Optional custom public ID for the image
 * @returns Upload result with secure_url and public_id
 */
export const uploadImage = async (
  file: Buffer,
  folder: string,
  publicId?: string
): Promise<CloudinaryUploadResult> => {
  try {
    logger.info(`Uploading image to Cloudinary folder: ${folder}`);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: 'image',
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            logger.error('Cloudinary upload error', error);
            reject(error);
          } else if (result) {
            logger.info(`Image uploaded successfully: ${result.public_id}`);
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
              format: result.format,
              width: result.width,
              height: result.height,
              bytes: result.bytes,
            });
          }
        }
      );

      uploadStream.end(file);
    });
  } catch (error) {
    logger.error('Error uploading image to Cloudinary', error);
    throw error;
  }
};

/**
 * Delete an image from Cloudinary
 * @param publicId - The public ID of the image to delete
 * @returns Deletion result
 */
export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    logger.info(`Deleting image from Cloudinary: ${publicId}`);
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      logger.info(`Image deleted successfully: ${publicId}`);
    } else {
      logger.warn(`Image deletion result: ${result.result} for ${publicId}`);
    }
  } catch (error) {
    logger.error('Error deleting image from Cloudinary', error);
    throw error;
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param url - The Cloudinary URL
 * @returns The public ID
 */
export const extractPublicId = (url: string): string | null => {
  try {
    // Example URL: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/image-id.jpg
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    
    if (uploadIndex === -1) return null;
    
    // Get everything after 'upload/v123456789/'
    const pathAfterUpload = parts.slice(uploadIndex + 2).join('/');
    
    // Remove file extension
    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');
    
    return publicId;
  } catch (error) {
    logger.error('Error extracting public ID from URL', error);
    return null;
  }
};

export default cloudinary;
