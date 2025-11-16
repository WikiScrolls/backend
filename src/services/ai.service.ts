import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../config/logger';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export class AIService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  /**
   * Generate AI summary from article content
   * @param content - The article content to summarize
   * @param maxLength - Maximum length of summary in words (default: 200)
   * @returns Summarized text
   */
  async summarizeArticle(content: string, maxLength: number = 200): Promise<string> {
    try {
      logger.info('Generating AI summary', { contentLength: content.length, maxLength });

      const prompt = `Summarize the following Wikipedia article in approximately ${maxLength} words. 
Make it engaging and informative, suitable for someone who wants a quick overview. 
Focus on the key points and main ideas:

${content}`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const summary = response.text();

      logger.info('AI summary generated successfully', { summaryLength: summary.length });
      return summary;

    } catch (error) {
      logger.error('Error generating AI summary', error);
      throw new Error('Failed to generate AI summary');
    }
  }

  /**
   * Generate AI summary with custom instructions
   * @param content - The content to summarize
   * @param instructions - Custom summarization instructions
   * @returns Summarized text
   */
  async summarizeWithInstructions(content: string, instructions: string): Promise<string> {
    try {
      logger.info('Generating AI summary with custom instructions');

      const prompt = `${instructions}\n\nContent:\n${content}`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const summary = response.text();

      logger.info('AI summary generated successfully');
      return summary;

    } catch (error) {
      logger.error('Error generating AI summary', error);
      throw new Error('Failed to generate AI summary');
    }
  }

  /**
   * Generate tags for an article based on its content
   * @param content - The article content
   * @param maxTags - Maximum number of tags to generate (default: 5)
   * @returns Array of tags
   */
  async generateTags(content: string, maxTags: number = 5): Promise<string[]> {
    try {
      logger.info('Generating tags', { maxTags });

      const prompt = `Analyze the following content and generate ${maxTags} relevant tags or keywords.
Return only the tags as a comma-separated list, nothing else.

Content:
${content}`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const tagsText = response.text();

      // Parse the comma-separated tags
      const tags = tagsText
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .slice(0, maxTags);

      logger.info('Tags generated successfully', { tags });
      return tags;

    } catch (error) {
      logger.error('Error generating tags', error);
      throw new Error('Failed to generate tags');
    }
  }

  /**
   * Check if content is safe and appropriate
   * @param content - Content to check
   * @returns Boolean indicating if content is safe
   */
  async moderateContent(content: string): Promise<boolean> {
    try {
      logger.info('Moderating content');

      const prompt = `Analyze if the following content is safe, appropriate, and follows content guidelines. 
Respond with only "SAFE" or "UNSAFE":

${content}`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const moderationResult = response.text().trim().toUpperCase();

      const isSafe = moderationResult === 'SAFE';
      logger.info('Content moderation complete', { isSafe });
      
      return isSafe;

    } catch (error) {
      logger.error('Error moderating content', error);
      // Default to safe on error to avoid blocking content
      return true;
    }
  }
}

export const aiService = new AIService();
