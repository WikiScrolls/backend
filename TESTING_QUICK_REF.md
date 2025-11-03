# WikiScrolls Backend - Testing Quick Reference

## 🚀 Quick Start

```bash
# Run all tests
pnpm test

# Watch mode (auto-rerun on changes)
pnpm test:watch

# With coverage report
pnpm test:coverage

# Verbose output
pnpm test:verbose
```

## 📊 Current Status

✅ **36 Tests Passing**  
✅ **97.67% Coverage on Utils**  
✅ **0 Failing Tests**  
✅ **~3 Second Test Run**

## 📁 Test Files

```
tests/
├── unit/utils/
│   ├── token.test.ts        (11 tests) ✅
│   ├── errors.test.ts       (12 tests) ✅
│   └── response.test.ts     (9 tests) ✅
└── integration/
    └── businessLogic.test.ts (4 tests) ✅
```

## 🧪 Test Pattern

```typescript
describe('Feature Name', () => {
  it('should do something when condition', () => {
    // Arrange
    const input = setupTestData();
    
    // Act
    const result = functionUnderTest(input);
    
    // Assert
    expect(result).toBe(expected);
  });
});
```

## 📦 What's Tested

- ✅ **Token Utils** - JWT generation, verification, extraction
- ✅ **Error Classes** - All custom error types
- ✅ **Response Utils** - Success/error formatting
- ✅ **Service Structure** - Instantiation & methods

## 🎯 Coverage Goals

| Metric | Target | Current (Utils) |
|--------|--------|-----------------|
| Statements | 80% | 97.67% ✅ |
| Branches | 75% | 86.66% ✅ |
| Functions | 80% | 91.66% ✅ |
| Lines | 80% | 97.29% ✅ |

## 📚 Documentation

- **TESTING.md** - Full testing guide
- **TEST_IMPLEMENTATION_SUMMARY.md** - Implementation details
- **jest.config.js** - Jest configuration

## 🔧 Troubleshooting

### Tests not running?
```bash
# Clear Jest cache
npx jest --clearCache

# Reinstall dependencies
pnpm install
```

### Coverage not generated?
```bash
# Ensure coverage directory exists
mkdir coverage

# Run with coverage flag
pnpm test:coverage
```

### TypeScript errors?
```bash
# Regenerate Prisma client
pnpm prisma:generate

# Check tsconfig
cat tsconfig.json
```

## 🎨 Test Organization

```
Unit Tests → Individual functions/methods
Integration Tests → Multiple components together
E2E Tests → Complete user workflows (future)
```

## ⚡ Tips

1. **Use `test.only()`** to run single test
2. **Use `describe.skip()`** to skip test suite
3. **Mock external dependencies** to isolate tests
4. **Clear mocks** in `beforeEach()`
5. **Check coverage** after adding features

## 🔗 Useful Commands

```bash
# Run specific test file
pnpm test token

# Run tests matching pattern
pnpm test --testNamePattern="should create"

# Update snapshots
pnpm test -u

# Show test coverage for specific file
pnpm test:coverage --collectCoverageFrom="src/utils/token.ts"
```

## 📈 Next Additions

1. Service layer tests (with Prisma mocks)
2. Controller tests (with service mocks)
3. Middleware tests (auth, validation)
4. API integration tests (supertest)
5. E2E tests (complete flows)

## ✨ Success Criteria

✅ All tests pass  
✅ No TypeScript errors  
✅ Coverage > 80% (Utils at 97.67%)  
✅ Fast execution (< 5 seconds)  
✅ Clear test names  
✅ Good documentation  

---

**Last Updated**: November 3, 2025  
**Test Framework**: Jest 30.2.0  
**Status**: ✅ All Systems Go
