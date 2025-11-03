import { sendSuccess, sendError } from '../../src/utils/response';
import { AuthService } from '../../src/services/auth.service';
import { ArticleService } from '../../src/services/article.service';

// Simple integration-style tests for core business logic
describe('Core Business Logic Tests', () => {
  describe('Response Utilities', () => {
    it('should format success responses correctly', () => {
      const mockRes: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      sendSuccess(mockRes, 'Success', { id: '123' }, 201);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        data: { id: '123' },
      });
    });

    it('should format error responses correctly', () => {
      const mockRes: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const errors = [{ field: 'email', message: 'Invalid' }];
      sendError(mockRes, 'Validation failed', errors, 400);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors,
      });
    });
  });

  describe('Service Layer Structure', () => {
    it('should instantiate AuthService', () => {
      const authService = new AuthService();
      expect(authService).toBeDefined();
      expect(authService).toHaveProperty('signup');
      expect(authService).toHaveProperty('login');
      expect(authService).toHaveProperty('getProfile');
    });

    it('should instantiate ArticleService', () => {
      const articleService = new ArticleService();
      expect(articleService).toBeDefined();
      expect(articleService).toHaveProperty('getAllArticles');
      expect(articleService).toHaveProperty('getArticleById');
      expect(articleService).toHaveProperty('createArticle');
      expect(articleService).toHaveProperty('updateArticle');
      expect(articleService).toHaveProperty('deleteArticle');
      expect(articleService).toHaveProperty('incrementViewCount');
    });
  });
});
