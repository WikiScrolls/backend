import { sendSuccess, sendError } from '../../../src/utils/response';
import { Response } from 'express';

describe('Response Utils', () => {
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockResponse = {
      status: statusMock,
    };
  });

  describe('sendSuccess', () => {
    it('should send success response with default status code 200', () => {
      // Arrange
      const message = 'Operation successful';
      const data = { id: '123', name: 'Test' };

      // Act
      sendSuccess(mockResponse as Response, message, data);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message,
        data,
      });
    });

    it('should send success response with custom status code', () => {
      // Arrange
      const message = 'Resource created';
      const data = { id: '123' };
      const statusCode = 201;

      // Act
      sendSuccess(mockResponse as Response, message, data, statusCode);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message,
        data,
      });
    });

    it('should send success response without data', () => {
      // Arrange
      const message = 'Operation successful';

      // Act
      sendSuccess(mockResponse as Response, message);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message,
        data: undefined,
      });
    });

    it('should handle 204 No Content status', () => {
      // Arrange
      const message = 'Resource deleted';

      // Act
      sendSuccess(mockResponse as Response, message, null, 204);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(204);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message,
        data: null,
      });
    });
  });

  describe('sendError', () => {
    it('should send error response with default status code 400', () => {
      // Arrange
      const message = 'Validation failed';
      const errors = [
        { field: 'email', message: 'Invalid email format' },
        { field: 'password', message: 'Password too short' },
      ];

      // Act
      sendError(mockResponse as Response, message, errors);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message,
        errors,
      });
    });

    it('should send error response with custom status code', () => {
      // Arrange
      const message = 'Resource not found';
      const statusCode = 404;

      // Act
      sendError(mockResponse as Response, message, undefined, statusCode);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message,
        errors: undefined,
      });
    });

    it('should send error response with 401 Unauthorized', () => {
      // Arrange
      const message = 'Authentication required';
      const errors = [{ field: 'token', message: 'No token provided' }];

      // Act
      sendError(mockResponse as Response, message, errors, 401);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message,
        errors,
      });
    });

    it('should send error response with 500 Internal Server Error', () => {
      // Arrange
      const message = 'Internal server error';
      const statusCode = 500;

      // Act
      sendError(mockResponse as Response, message, undefined, statusCode);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message,
        errors: undefined,
      });
    });

    it('should send error response without error details', () => {
      // Arrange
      const message = 'Something went wrong';

      // Act
      sendError(mockResponse as Response, message);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        message,
        errors: undefined,
      });
    });
  });
});
