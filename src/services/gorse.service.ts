import { logger } from '../config/logger';

/**
 * Gorse Recommendation Engine Client
 * Syncs user interactions with the PageRank/Gorse service for personalized recommendations
 */

interface GorseFeedback {
  FeedbackType: string;
  UserId: string;
  ItemId: string;
  Timestamp: string;
}

interface GorseItem {
  ItemId: string;
  IsHidden: boolean;
  Labels: string[];
  Categories: string[];
  Comment: string;
  Timestamp: string;
}

interface GorseUser {
  UserId: string;
  Labels: string[];
}

export class GorseService {
  private baseUrl: string;
  private apiKey: string;
  private enabled: boolean;

  constructor() {
    this.baseUrl = process.env.GORSE_URL || '';
    this.apiKey = process.env.GORSE_API_KEY || '';
    this.enabled = !!this.baseUrl;

    if (!this.enabled) {
      logger.warn('Gorse integration disabled - GORSE_URL not configured');
    } else {
      logger.info(`Gorse integration enabled: ${this.baseUrl}`);
    }
  }

  private async request<T>(method: string, endpoint: string, body?: any): Promise<T | null> {
    if (!this.enabled) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const error = await response.text();
        logger.error(`Gorse API error: ${response.status} - ${error}`);
        return null;
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      logger.error('Gorse request failed:', error);
      return null;
    }
  }

  /**
   * Insert feedback when user interacts with an article
   * Maps our interaction types to Gorse feedback types
   */
  async insertFeedback(
    userId: string,
    articleWikipediaId: string,
    interactionType: 'LIKE' | 'VIEW' | 'SAVE'
  ): Promise<boolean> {
    // Map our interaction types to Gorse feedback types
    const feedbackTypeMap: Record<string, string> = {
      LIKE: 'like',
      VIEW: 'open_article',
      SAVE: 'save',
    };

    const feedback: GorseFeedback[] = [
      {
        FeedbackType: feedbackTypeMap[interactionType],
        UserId: userId,
        ItemId: articleWikipediaId,
        Timestamp: new Date().toISOString(),
      },
    ];

    const result = await this.request<any>('POST', '/api/feedback', feedback);
    
    if (result !== null) {
      logger.info(`Synced ${interactionType} feedback to Gorse`, { userId, articleWikipediaId });
      return true;
    }
    return false;
  }

  /**
   * Remove feedback when user unlikes/unsaves an article
   */
  async deleteFeedback(
    userId: string,
    articleWikipediaId: string,
    interactionType: 'LIKE' | 'SAVE'
  ): Promise<boolean> {
    const feedbackTypeMap: Record<string, string> = {
      LIKE: 'like',
      SAVE: 'save',
    };

    const feedbackType = feedbackTypeMap[interactionType];
    const endpoint = `/api/feedback/${feedbackType}/${userId}/${articleWikipediaId}`;

    const result = await this.request<any>('DELETE', endpoint);
    
    if (result !== null) {
      logger.info(`Removed ${interactionType} feedback from Gorse`, { userId, articleWikipediaId });
      return true;
    }
    return false;
  }

  /**
   * Insert or update an item (article) in Gorse
   * Called when a new article is added to the database
   */
  async upsertItem(
    wikipediaId: string,
    title: string,
    labels: string[] = []
  ): Promise<boolean> {
    const item: GorseItem = {
      ItemId: wikipediaId,
      IsHidden: false,
      Labels: ['wikipedia', 'article', ...labels],
      Categories: ['article'],
      Comment: title,
      Timestamp: new Date().toISOString(),
    };

    const result = await this.request<any>('POST', '/api/item', item);
    
    if (result !== null) {
      logger.info(`Upserted article in Gorse`, { wikipediaId, title });
      return true;
    }
    return false;
  }

  /**
   * Register a user in Gorse with their interests
   */
  async upsertUser(userId: string, interests: string[] = []): Promise<boolean> {
    const user: GorseUser = {
      UserId: userId,
      Labels: interests,
    };

    const result = await this.request<any>('POST', '/api/user', user);
    
    if (result !== null) {
      logger.info(`Upserted user in Gorse`, { userId, interests });
      return true;
    }
    return false;
  }

  /**
   * Get personalized recommendations for a user
   * Returns Wikipedia Page IDs
   */
  async getRecommendations(userId: string, count: number = 10): Promise<string[]> {
    const result = await this.request<string[]>(
      'GET',
      `/api/recommend/${userId}/article?n=${count}`
    );
    
    return result || [];
  }

  /**
   * Check if Gorse is available
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// Singleton instance
export const gorseService = new GorseService();
