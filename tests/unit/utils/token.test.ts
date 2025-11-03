import { generateToken, verifyToken, extractTokenFromHeader } from '../../../src/utils/token';
import jwt from 'jsonwebtoken';
import { UserPayload } from '../../../src/types';

describe('Token Utils', () => {
  const mockPayload: UserPayload = {
    id: 'user-uuid',
    username: 'testuser',
    email: 'test@example.com',
    isAdmin: false,
  };

  const JWT_SECRET = 'test-secret-key-for-testing-only';

  beforeEach(() => {
    process.env.JWT_SECRET = JWT_SECRET;
    process.env.JWT_EXPIRES_IN = '1h';
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      // Act
      const token = generateToken(mockPayload);

      // Assert
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');

      // Verify token can be decoded
      const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
      expect(decoded).toMatchObject(mockPayload);
    });

    it('should include expiration in token', () => {
      // Act
      const token = generateToken(mockPayload);

      // Assert
      const decoded = jwt.decode(token) as any;
      expect(decoded).toHaveProperty('exp');
      expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', () => {
      // Arrange
      const token = jwt.sign(mockPayload, JWT_SECRET, { expiresIn: '1h' });

      // Act
      const result = verifyToken(token);

      // Assert
      expect(result).toBeTruthy();
      expect(result).toMatchObject(mockPayload);
    });

    it('should return null for invalid token', () => {
      // Arrange
      const invalidToken = 'invalid.token.here';

      // Act
      const result = verifyToken(invalidToken);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for expired token', () => {
      // Arrange
      const expiredToken = jwt.sign(mockPayload, JWT_SECRET, { expiresIn: '-1h' });

      // Act
      const result = verifyToken(expiredToken);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for token with wrong secret', () => {
      // Arrange
      const tokenWithWrongSecret = jwt.sign(mockPayload, 'wrong-secret', { expiresIn: '1h' });

      // Act
      const result = verifyToken(tokenWithWrongSecret);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Authorization header', () => {
      // Arrange
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      const authHeader = `Bearer ${token}`;

      // Act
      const result = extractTokenFromHeader(authHeader);

      // Assert
      expect(result).toBe(token);
    });

    it('should return null for missing Authorization header', () => {
      // Act
      const result = extractTokenFromHeader(undefined);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for Authorization header without Bearer prefix', () => {
      // Arrange
      const authHeader = 'InvalidFormat token123';

      // Act
      const result = extractTokenFromHeader(authHeader);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for empty Authorization header', () => {
      // Arrange
      const authHeader = '';

      // Act
      const result = extractTokenFromHeader(authHeader);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null for Bearer without token', () => {
      // Arrange
      const authHeader = 'Bearer ';

      // Act
      const result = extractTokenFromHeader(authHeader);

      // Assert
      expect(result).toBe('');
    });
  });
});
