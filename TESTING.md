# WikiScrolls Backend - Unit Testing Guide

## Overview

This project uses **Jest** as the testing framework for comprehensive unit testing. The test suite covers:

- **Services** - Business logic and data access
- **Controllers** - Request/response handling
- **Middleware** - Authentication, validation, error handling
- **Utils** - Token generation, error classes, response formatting

## Test Structure

```
tests/
├── setup.ts                          # Jest configuration and global mocks
├── mocks/
│   └── prisma.mock.ts               # Prisma client mock
└── unit/
    ├── services/
    │   ├── auth.service.test.ts     # Auth service tests
    │   └── article.service.test.ts  # Article service tests
    ├── controllers/
    │   ├── auth.controller.test.ts  # Auth controller tests
    │   └── article.controller.test.ts # Article controller tests
    ├── middleware/
    │   └── validateRequest.test.ts  # Validation middleware tests
    └── utils/
        ├── token.test.ts            # Token utility tests
        ├── errors.test.ts           # Error class tests
        └── response.test.ts         # Response utility tests
```

## Running Tests

### Run all tests
```bash
pnpm test
```

### Run tests in watch mode
```bash
pnpm test:watch
```

### Run tests with coverage report
```bash
pnpm test:coverage
```

### Run tests with verbose output
```bash
pnpm test:verbose
```

### Run only unit tests
```bash
pnpm test:unit
```

### Run specific test file
```bash
pnpm test auth.service.test
```

### Run tests matching a pattern
```bash
pnpm test --testNamePattern="should create"
```

## Test Coverage

The test suite aims for high code coverage across all critical components:

### Services (Business Logic)
- ✅ **AuthService**: Signup, login, profile retrieval
- ✅ **ArticleService**: CRUD operations, pagination, view count
- 🔄 **UserService**: User management
- 🔄 **CategoryService**: Category management
- 🔄 **InteractionService**: User interactions
- 🔄 **FeedService**: Feed management

### Controllers (Request Handling)
- ✅ **AuthController**: All authentication endpoints
- ✅ **ArticleController**: All article endpoints
- 🔄 **UserController**: User management endpoints
- 🔄 **CategoryController**: Category endpoints
- 🔄 **InteractionController**: Interaction endpoints
- 🔄 **FeedController**: Feed endpoints

### Middleware
- ✅ **validateRequest**: Express-validator error handling
- 🔄 **authenticate**: JWT authentication
- 🔄 **isAdmin**: Admin authorization
- 🔄 **errorHandler**: Global error handling

### Utilities
- ✅ **Token Utils**: Token generation, verification, extraction
- ✅ **Error Classes**: All custom error types
- ✅ **Response Utils**: Success/error response formatting

## Testing Patterns

### 1. Service Testing Pattern

```typescript
describe('ServiceName', () => {
  let service: ServiceName;
  let mockPrisma: MockPrismaClient;

  beforeEach(() => {
    service = new ServiceName();
    jest.clearAllMocks();
  });

  it('should perform operation successfully', async () => {
    // Arrange - Set up mocks and test data
    mockPrisma.model.findUnique.mockResolvedValue(mockData);

    // Act - Execute the method
    const result = await service.methodName(input);

    // Assert - Verify behavior and output
    expect(mockPrisma.model.findUnique).toHaveBeenCalledWith(...);
    expect(result).toEqual(expectedData);
  });
});
```

### 2. Controller Testing Pattern

```typescript
describe('ControllerName', () => {
  let controller: ControllerName;
  let mockService: jest.Mocked<ServiceName>;
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    controller = new ControllerName();
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should handle request successfully', async () => {
    // Arrange
    mockService.methodName.mockResolvedValue(mockResult);

    // Act
    await controller.methodName(mockRequest, mockResponse, mockNext);

    // Assert
    expect(mockService.methodName).toHaveBeenCalledWith(...);
    expect(mockSendSuccess).toHaveBeenCalledWith(...);
  });
});
```

### 3. Utility Testing Pattern

```typescript
describe('UtilityFunction', () => {
  it('should return expected output for valid input', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = utilityFunction(input);

    // Assert
    expect(result).toBe(expectedOutput);
  });
});
```

## Mocking Strategy

### Prisma Client
All database operations are mocked using a centralized Prisma mock in `tests/mocks/prisma.mock.ts`.

### External Dependencies
- **bcrypt**: Mocked in service tests for password hashing
- **jsonwebtoken**: Mocked in service tests for token operations
- **logger**: Globally mocked in `tests/setup.ts` to reduce test noise

### Express Objects
Request, Response, and NextFunction are mocked using Jest:
```typescript
const mockRequest = { body: {}, params: {}, query: {} };
const mockResponse = { status: jest.fn().mockReturnThis(), json: jest.fn() };
const mockNext = jest.fn();
```

## Test Data Conventions

### UUIDs
Use descriptive mock UUIDs:
```typescript
const userId = 'user-uuid';
const articleId = 'article-uuid';
const categoryId = 'cat-uuid';
```

### Dates
Use `new Date()` for current timestamps or specific dates for testing:
```typescript
const createdAt = new Date('2025-01-01');
```

### Sample Data
Create realistic test data that matches your schema:
```typescript
const mockUser = {
  id: 'user-uuid',
  username: 'testuser',
  email: 'test@example.com',
  passwordHash: 'hashed_password',
  isAdmin: false,
  createdAt: new Date(),
  lastLoginAt: null,
};
```

## Best Practices

### ✅ DO:
- Use descriptive test names: `it('should create user when valid data provided')`
- Follow AAA pattern: Arrange, Act, Assert
- Mock external dependencies
- Test both success and error cases
- Clear mocks between tests with `beforeEach`
- Use type assertions for Express objects: `as AuthRequest`
- Test edge cases and boundary conditions

### ❌ DON'T:
- Don't test implementation details
- Don't make actual database calls
- Don't share state between tests
- Don't test third-party library code
- Don't use real credentials or secrets

## Coverage Goals

Target coverage percentages:
- **Statements**: ≥ 80%
- **Branches**: ≥ 75%
- **Functions**: ≥ 80%
- **Lines**: ≥ 80%

View coverage report after running tests:
```bash
pnpm test:coverage
open coverage/lcov-report/index.html
```

## Continuous Integration

Tests should be run automatically:
- Before committing (using Git hooks)
- On pull requests
- Before deploying to production

## Common Issues & Solutions

### Issue: Tests timing out
**Solution**: Increase timeout in `jest.config.js` or specific test:
```typescript
it('should handle long operation', async () => {
  // test code
}, 15000); // 15 second timeout
```

### Issue: Mock not working
**Solution**: Ensure mock is declared before imports:
```typescript
jest.mock('../path/to/module');
// Then import the module
```

### Issue: Async test not completing
**Solution**: Always return promises or use async/await:
```typescript
it('should test async', async () => {
  await asyncFunction();
  expect(...).toBe(...);
});
```

## Next Steps

To expand test coverage:
1. ✅ Add tests for remaining services (User, Category, Interaction, Feed)
2. ✅ Add tests for remaining controllers
3. ✅ Add middleware tests (authenticate, isAdmin, errorHandler)
4. Add integration tests for API endpoints
5. Add E2E tests for critical user flows
6. Set up test coverage reporting in CI/CD

## Contributing

When adding new features:
1. Write tests first (TDD approach) or alongside implementation
2. Ensure all tests pass: `pnpm test`
3. Check coverage: `pnpm test:coverage`
4. Update this documentation if adding new test patterns

---

**Last Updated**: November 3, 2025
**Test Framework**: Jest 30.2.0
**Coverage**: Run `pnpm test:coverage` for current metrics
