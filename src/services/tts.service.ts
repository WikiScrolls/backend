import textToSpeech from '@google-cloud/text-to-speech';
import { logger } from '../config/logger';
import fs from 'fs';
import util from 'util';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';

// Initialize Google Cloud TTS client
const client = new textToSpeech.TextToSpeechClient();

export interface TTSOptions {
  voiceName?: string;
  languageCode?: string;
  pitch?: number;
  speakingRate?: number;
  gender?: 'MALE' | 'FEMALE' | 'NEUTRAL';
}

export class TTSService {
  /**
   * Convert text to speech and upload to Cloudinary
   * @param text - Text to convert to speech
   * @param articleId - Article ID for naming the file
   * @param options - Voice and audio settings
   * @returns Cloudinary URL of the uploaded audio file
   */
  async textToSpeech(
    text: string,
    articleId: string,
    options: TTSOptions = {}
  ): Promise<string> {
    try {
      logger.info('Converting text to speech', { articleId, textLength: text.length });

      const {
        voiceName,
        languageCode = 'en-US',
        pitch = 0,
        speakingRate = 1.0,
        gender = 'NEUTRAL',
      } = options;

      // Prepare the text-to-speech request
      const request = {
        input: { text },
        voice: voiceName
          ? { name: voiceName, languageCode }
          : { languageCode, ssmlGender: gender as any },
        audioConfig: {
          audioEncoding: 'MP3' as const,
          pitch,
          speakingRate,
        },
      };

      // Perform the text-to-speech request
      const [response] = await client.synthesizeSpeech(request);

      if (!response.audioContent) {
        throw new Error('No audio content received from TTS service');
      }

      logger.info('Audio generated successfully');

      // Save audio to temporary file
      const tempDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const tempFilePath = path.join(tempDir, `${articleId}-${Date.now()}.mp3`);
      const writeFile = util.promisify(fs.writeFile);
      await writeFile(tempFilePath, response.audioContent, 'binary');

      logger.info('Audio saved to temporary file', { tempFilePath });

      // Upload to Cloudinary
      const cloudinaryResult = await cloudinary.uploader.upload(tempFilePath, {
        resource_type: 'video', // Cloudinary treats audio as video
        folder: 'wikiscrolls/audio',
        public_id: `article-${articleId}-audio`,
        format: 'mp3',
        overwrite: true,
      });

      logger.info('Audio uploaded to Cloudinary', { url: cloudinaryResult.secure_url });

      // Clean up temporary file
      fs.unlinkSync(tempFilePath);

      return cloudinaryResult.secure_url;

    } catch (error) {
      logger.error('Error converting text to speech', error);
      throw new Error('Failed to convert text to speech');
    }
  }

  /**
   * Generate audio for article summary
   * @param summary - Article summary text
   * @param articleId - Article ID
   * @returns Cloudinary URL of the audio file
   */
  async generateAudioSummary(summary: string, articleId: string): Promise<string> {
    return this.textToSpeech(summary, articleId, {
      languageCode: 'en-US',
      gender: 'NEUTRAL',
      speakingRate: 1.0,
      pitch: 0,
    });
  }

  /**
   * Get available voices for a language
   * @param languageCode - Language code (e.g., 'en-US')
   * @returns List of available voices
   */
  async getAvailableVoices(languageCode: string = 'en-US') {
    try {
      const [response] = await client.listVoices({ languageCode });
      return response.voices || [];
    } catch (error) {
      logger.error('Error fetching available voices', error);
      throw new Error('Failed to fetch available voices');
    }
  }

  /**
   * Delete audio file from Cloudinary
   * @param audioUrl - Cloudinary URL of the audio file
   */
  async deleteAudio(audioUrl: string): Promise<void> {
    try {
      // Extract public_id from Cloudinary URL
      const urlParts = audioUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      const publicId = `wikiscrolls/audio/${filename.split('.')[0]}`;

      await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
      logger.info('Audio deleted from Cloudinary', { publicId });
    } catch (error) {
      logger.error('Error deleting audio from Cloudinary', error);
      throw new Error('Failed to delete audio');
    }
  }
}

export const ttsService = new TTSService();
