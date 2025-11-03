import {
  AppError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
} from '../../../src/utils/errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create an AppError with message and status code', () => {
      // Arrange & Act
      const error = new AppError('Test error message', 500);

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Test error message');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
    });

    it('should have a proper stack trace', () => {
      // Arrange & Act
      const error = new AppError('Test error', 500);

      // Assert
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('Error'); // Stack trace contains "Error"
    });
  });

  describe('NotFoundError', () => {
    it('should create a 404 error with default message', () => {
      // Arrange & Act
      const error = new NotFoundError();

      // Assert
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
    });

    it('should create a 404 error with custom message', () => {
      // Arrange & Act
      const error = new NotFoundError('User not found');

      // Assert
      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('BadRequestError', () => {
    it('should create a 400 error with default message', () => {
      // Arrange & Act
      const error = new BadRequestError();

      // Assert
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Bad request');
      expect(error.statusCode).toBe(400);
    });

    it('should create a 400 error with custom message', () => {
      // Arrange & Act
      const error = new BadRequestError('Invalid input data');

      // Assert
      expect(error.message).toBe('Invalid input data');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('UnauthorizedError', () => {
    it('should create a 401 error with default message', () => {
      // Arrange & Act
      const error = new UnauthorizedError();

      // Assert
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Unauthorized');
      expect(error.statusCode).toBe(401);
    });

    it('should create a 401 error with custom message', () => {
      // Arrange & Act
      const error = new UnauthorizedError('Invalid credentials');

      // Assert
      expect(error.message).toBe('Invalid credentials');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('ForbiddenError', () => {
    it('should create a 403 error with default message', () => {
      // Arrange & Act
      const error = new ForbiddenError();

      // Assert
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Forbidden');
      expect(error.statusCode).toBe(403);
    });

    it('should create a 403 error with custom message', () => {
      // Arrange & Act
      const error = new ForbiddenError('Access denied');

      // Assert
      expect(error.message).toBe('Access denied');
      expect(error.statusCode).toBe(403);
    });
  });

  describe('ConflictError', () => {
    it('should create a 409 error with default message', () => {
      // Arrange & Act
      const error = new ConflictError();

      // Assert
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Conflict');
      expect(error.statusCode).toBe(409);
    });

    it('should create a 409 error with custom message', () => {
      // Arrange & Act
      const error = new ConflictError('Email already exists');

      // Assert
      expect(error.message).toBe('Email already exists');
      expect(error.statusCode).toBe(409);
    });
  });
});
