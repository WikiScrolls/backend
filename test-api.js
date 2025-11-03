/**
 * WikiScrolls API Complete Test Suite
 * 
 * This script tests all API endpoints in a logical flow.
 * Run with: node test-api.js
 * 
 * Make sure your server is running on http://localhost:3000
 */

const BASE_URL = 'https://backend-production-cc13.up.railway.app';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

// Test state
const state = {
  userToken: null,
  adminToken: null,
  userId: null,
  categoryId: null,
  articleId: null,
  articleId2: null,
  articleId3: null,
  passedTests: 0,
  failedTests: 0,
  totalTests: 0,
};

// Helper functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(testNumber, description) {
  log(`\n${colors.bright}Test ${testNumber}: ${description}${colors.reset}`, colors.cyan);
}

function logSuccess(message) {
  state.passedTests++;
  log(`✓ ${message}`, colors.green);
}

function logError(message, error) {
  state.failedTests++;
  log(`✗ ${message}`, colors.red);
  if (error) {
    console.error(error);
  }
}

function logInfo(message) {
  log(`  ${message}`, colors.yellow);
}

async function makeRequest(method, endpoint, options = {}) {
  state.totalTests++;
  const url = `${BASE_URL}${endpoint}`;
  
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);
    
    return {
      ok: response.ok,
      status: response.status,
      data,
      response,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error.message,
    };
  }
}

// Test functions
async function testHealthCheck() {
  logTest(1, 'Health Check');
  
  const result = await makeRequest('GET', '/health');
  
  if (result.ok && result.data.status === 'ok') {
    logSuccess('Health check passed');
    logInfo(`Status: ${result.data.status}`);
    return true;
  } else {
    logError('Health check failed', result.error);
    return false;
  }
}

async function testUserSignup() {
  logTest(2, 'User Signup');
  
  const result = await makeRequest('POST', '/api/auth/signup', {
    body: {
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'Test1234',
    },
  });
  
  if (result.ok && result.data.data.token) {
    state.userToken = result.data.data.token;
    state.userId = result.data.data.user.id;
    logSuccess('User registered successfully');
    logInfo(`User ID: ${state.userId}`);
    logInfo(`Token: ${state.userToken.substring(0, 20)}...`);
    return true;
  } else {
    // User might already exist, which is okay - we'll login next
    if (result.status === 409) {
      logInfo('User already exists (will login in next step)');
      return true; // Don't count as failure
    }
    logError('User signup failed', result.data);
    return false;
  }
}

async function testUserLogin() {
  logTest(3, 'User Login');
  
  const result = await makeRequest('POST', '/api/auth/login', {
    body: {
      email: 'testuser@example.com',
      password: 'Test1234',
    },
  });
  
  if (result.ok && result.data.data.token) {
    // Set both tokens from login (in case signup failed due to existing user)
    state.userToken = result.data.data.token;
    state.adminToken = result.data.data.token;
    state.userId = result.data.data.user.id;
    logSuccess('Login successful');
    logInfo(`User ID: ${state.userId}`);
    logInfo(`Last login: ${result.data.data.user.lastLoginAt}`);
    logInfo(`Is Admin: ${result.data.data.user.isAdmin}`);
    return true;
  } else {
    logError('Login failed', result.data);
    return false;
  }
}

async function testGetProfile() {
  logTest(4, 'Get User Profile');
  
  const result = await makeRequest('GET', '/api/auth/profile', {
    headers: { Authorization: `Bearer ${state.userToken}` },
  });
  
  if (result.ok) {
    logSuccess('Profile retrieved');
    logInfo(`Username: ${result.data.data.username}`);
    logInfo(`Email: ${result.data.data.email}`);
    logInfo(`Is Admin: ${result.data.data.isAdmin}`);
    return true;
  } else {
    logError('Get profile failed', result.data);
    return false;
  }
}

async function testCreateCategory() {
  logTest(5, 'Create Category (Admin)');
  
  const result = await makeRequest('POST', '/api/categories', {
    headers: { Authorization: `Bearer ${state.adminToken}` },
    body: {
      name: 'Science',
      description: 'Scientific articles and discoveries',
      color: '#4CAF50',
    },
  });
  
  if (result.ok) {
    state.categoryId = result.data.data.id;
    logSuccess('Category created');
    logInfo(`Category ID: ${state.categoryId}`);
    logInfo(`Name: ${result.data.data.name}`);
    return true;
  } else if (result.data && result.data.message && result.data.message.includes('already exists')) {
    logInfo('Category already exists (will fetch in next step)');
    return true;
  } else {
    logError('Create category failed', result.data);
    logInfo('Note: This requires admin privileges. Update user in DB:');
    logInfo(`UPDATE "User" SET "isAdmin" = true WHERE id = '${state.userId}';`);
    return false;
  }
}

async function testListCategories() {
  logTest(6, 'List All Categories');
  
  const result = await makeRequest('GET', '/api/categories', {
    headers: { Authorization: `Bearer ${state.adminToken}` },
  });
  
  if (result.ok) {
    logSuccess('Categories retrieved');
    logInfo(`Total categories: ${result.data.data.length}`);
    
    // If we don't have a category ID yet, grab the first "Science" category
    if (!state.categoryId && result.data.data.length > 0) {
      const scienceCategory = result.data.data.find(cat => cat.name === 'Science');
      if (scienceCategory) {
        state.categoryId = scienceCategory.id;
        logInfo(`Using existing Science category ID: ${state.categoryId}`);
      }
    }
    
    return true;
  } else {
    logError('List categories failed', result.data);
    return false;
  }
}

async function testGetCategory() {
  logTest(7, 'Get Category by ID');
  
  if (!state.categoryId) {
    logInfo('Skipping: No category ID available');
    return false;
  }
  
  const result = await makeRequest('GET', `/api/categories/${state.categoryId}`, {
    headers: { Authorization: `Bearer ${state.adminToken}` },
  });
  
  if (result.ok) {
    logSuccess('Category retrieved');
    logInfo(`Name: ${result.data.data.name}`);
    logInfo(`Article count: ${result.data.data._count.articles}`);
    return true;
  } else {
    logError('Get category failed', result.data);
    return false;
  }
}

async function testUpdateCategory() {
  logTest(8, 'Update Category');
  
  if (!state.categoryId) {
    logInfo('Skipping: No category ID available');
    return false;
  }
  
  const result = await makeRequest('PUT', `/api/categories/${state.categoryId}`, {
    headers: { Authorization: `Bearer ${state.adminToken}` },
    body: {
      description: 'Updated: Scientific articles, discoveries, and research',
    },
  });
  
  if (result.ok) {
    logSuccess('Category updated');
    logInfo(`New description: ${result.data.data.description}`);
    return true;
  } else {
    logError('Update category failed', result.data);
    return false;
  }
}

async function testCreateArticles() {
  logTest(9, 'Create Articles (Admin)');
  
  if (!state.categoryId) {
    logInfo('Skipping: No category ID available');
    return false;
  }
  
  // Article 1
  const result1 = await makeRequest('POST', '/api/articles', {
    headers: { Authorization: `Bearer ${state.adminToken}` },
    body: {
      title: 'Quantum Computing Basics',
      wikipediaUrl: 'https://en.wikipedia.org/wiki/Quantum_computing',
      aiSummary: 'Quantum computing harnesses quantum states for computation.',
      tags: ['quantum', 'computing', 'physics'],
      publishedDate: '2025-01-01T00:00:00.000Z',
      categoryId: state.categoryId,
    },
  });
  
  if (result1.ok) {
    state.articleId = result1.data.data.id;
    logSuccess(`Article 1 created: ${result1.data.data.title}`);
    logInfo(`Article ID: ${state.articleId}`);
  } else {
    logError('Create article 1 failed', result1.data);
    return false;
  }
  
  // Article 2
  const result2 = await makeRequest('POST', '/api/articles', {
    headers: { Authorization: `Bearer ${state.adminToken}` },
    body: {
      title: 'Artificial Intelligence',
      wikipediaUrl: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
      aiSummary: 'AI is intelligence demonstrated by machines.',
      audioUrl: 'https://example.com/audio/ai.mp3',
      tags: ['AI', 'machine learning'],
      publishedDate: '2025-01-15T00:00:00.000Z',
      categoryId: state.categoryId,
    },
  });
  
  if (result2.ok) {
    state.articleId2 = result2.data.data.id;
    logSuccess(`Article 2 created: ${result2.data.data.title}`);
  }
  
  // Article 3
  const result3 = await makeRequest('POST', '/api/articles', {
    headers: { Authorization: `Bearer ${state.adminToken}` },
    body: {
      title: 'Climate Change',
      wikipediaUrl: 'https://en.wikipedia.org/wiki/Climate_change',
      aiSummary: 'Climate change includes global warming and weather pattern shifts.',
      tags: ['climate', 'environment'],
      publishedDate: '2025-02-01T00:00:00.000Z',
      categoryId: state.categoryId,
    },
  });
  
  if (result3.ok) {
    state.articleId3 = result3.data.data.id;
    logSuccess(`Article 3 created: ${result3.data.data.title}`);
  }
  
  return true;
}

async function testListArticles() {
  logTest(10, 'List Articles with Pagination');
  
  const result = await makeRequest('GET', '/api/articles?page=1&limit=10&sortBy=createdAt&sortOrder=desc', {
    headers: { Authorization: `Bearer ${state.userToken}` },
  });
  
  if (result.ok) {
    logSuccess('Articles retrieved');
    logInfo(`Total articles: ${result.data.data.pagination.total}`);
    logInfo(`Page: ${result.data.data.pagination.page}/${result.data.data.pagination.totalPages}`);
    
    // If we don't have article IDs yet, grab the first 3 from the list
    if (!state.articleId && result.data.data.articles.length > 0) {
      state.articleId = result.data.data.articles[0].id;
      logInfo(`Using existing article ID: ${state.articleId}`);
      
      if (result.data.data.articles.length > 1) {
        state.articleId2 = result.data.data.articles[1].id;
      }
      if (result.data.data.articles.length > 2) {
        state.articleId3 = result.data.data.articles[2].id;
      }
    }
    
    return true;
  } else {
    logError('List articles failed', result.data);
    return false;
  }
}

async function testGetArticle() {
  logTest(11, 'Get Article by ID');
  
  if (!state.articleId) {
    logInfo('Skipping: No article ID available');
    return false;
  }
  
  const result = await makeRequest('GET', `/api/articles/${state.articleId}`, {
    headers: { Authorization: `Bearer ${state.userToken}` },
  });
  
  if (result.ok) {
    logSuccess('Article retrieved');
    logInfo(`Title: ${result.data.data.title}`);
    logInfo(`Category: ${result.data.data.category.name}`);
    return true;
  } else {
    logError('Get article failed', result.data);
    return false;
  }
}

async function testUpdateArticle() {
  logTest(12, 'Update Article (Admin)');
  
  if (!state.articleId) {
    logInfo('Skipping: No article ID available');
    return false;
  }
  
  const result = await makeRequest('PUT', `/api/articles/${state.articleId}`, {
    headers: { Authorization: `Bearer ${state.adminToken}` },
    body: {
      isProcessed: true,
      isActive: true,
    },
  });
  
  if (result.ok) {
    logSuccess('Article updated');
    logInfo(`Processed: ${result.data.data.isProcessed}`);
    logInfo(`Active: ${result.data.data.isActive}`);
    return true;
  } else {
    logError('Update article failed', result.data);
    return false;
  }
}

async function testIncrementViewCount() {
  logTest(13, 'Increment Article View Count');
  
  if (!state.articleId) {
    logInfo('Skipping: No article ID available');
    return false;
  }
  
  const result = await makeRequest('POST', `/api/articles/${state.articleId}/view`, {
    headers: { Authorization: `Bearer ${state.userToken}` },
  });
  
  if (result.ok) {
    logSuccess('View count incremented');
    logInfo(`New view count: ${result.data.data.viewCount}`);
    return true;
  } else {
    logError('Increment view count failed', result.data);
    return false;
  }
}

async function testCreateProfile() {
  logTest(14, 'Create User Profile');
  
  const result = await makeRequest('POST', '/api/profiles/me', {
    headers: { Authorization: `Bearer ${state.userToken}` },
    body: {
      displayName: 'Test User',
      bio: 'I love learning about science and technology!',
      interests: ['science', 'technology', 'quantum physics'],
    },
  });
  
  if (result.ok) {
    logSuccess('Profile created');
    logInfo(`Display name: ${result.data.data.displayName}`);
    logInfo(`Interests: ${result.data.data.interests.join(', ')}`);
    return true;
  } else if (result.status === 403 && result.data.message.includes('already exists')) {
    logInfo('Profile already exists (will fetch in next step)');
    return true; // Don't count as failure
  } else {
    logError('Create profile failed', result.data);
    return false;
  }
}

async function testGetMyProfile() {
  logTest(15, 'Get My Profile');
  
  const result = await makeRequest('GET', '/api/profiles/me', {
    headers: { Authorization: `Bearer ${state.userToken}` },
  });
  
  if (result.ok) {
    logSuccess('Profile retrieved');
    logInfo(`Display name: ${result.data.data.displayName}`);
    logInfo(`Bio: ${result.data.data.bio}`);
    return true;
  } else {
    logError('Get profile failed', result.data);
    return false;
  }
}

async function testUpdateProfile() {
  logTest(16, 'Update My Profile');
  
  const result = await makeRequest('PUT', '/api/profiles/me', {
    headers: { Authorization: `Bearer ${state.userToken}` },
    body: {
      bio: 'Updated: Passionate about quantum computing and AI',
      interests: ['quantum computing', 'AI', 'machine learning'],
    },
  });
  
  if (result.ok) {
    logSuccess('Profile updated');
    logInfo(`New bio: ${result.data.data.bio}`);
    return true;
  } else {
    logError('Update profile failed', result.data);
    return false;
  }
}

async function testCreateInteractions() {
  logTest(17, 'Create Interactions (VIEW, LIKE, SAVE)');
  
  if (!state.articleId) {
    logInfo('Skipping: No article ID available');
    return false;
  }
  
  // VIEW interaction
  const viewResult = await makeRequest('POST', '/api/interactions', {
    headers: { Authorization: `Bearer ${state.userToken}` },
    body: {
      articleId: state.articleId,
      interactionType: 'VIEW',
    },
  });
  
  if (viewResult.ok) {
    logSuccess('VIEW interaction created');
  } else if (viewResult.status === 400) {
    logInfo('VIEW interaction might already exist');
  } else {
    logError('VIEW interaction failed', viewResult.data);
  }
  
  // LIKE interaction
  const likeResult = await makeRequest('POST', '/api/interactions', {
    headers: { Authorization: `Bearer ${state.userToken}` },
    body: {
      articleId: state.articleId,
      interactionType: 'LIKE',
    },
  });
  
  if (likeResult.ok) {
    logSuccess('LIKE interaction created');
  } else if (likeResult.status === 400) {
    logInfo('LIKE interaction already exists');
  } else {
    logError('LIKE interaction failed', likeResult.data);
  }
  
  // SAVE interaction
  const saveResult = await makeRequest('POST', '/api/interactions', {
    headers: { Authorization: `Bearer ${state.userToken}` },
    body: {
      articleId: state.articleId,
      interactionType: 'SAVE',
    },
  });
  
  if (saveResult.ok) {
    logSuccess('SAVE interaction created');
  } else if (saveResult.status === 400) {
    logInfo('SAVE interaction already exists');
  } else {
    logError('SAVE interaction failed', saveResult.data);
  }
  
  return true; // Don't fail if interactions already exist
}

async function testGetMyInteractions() {
  logTest(18, 'Get My Interactions');
  
  const result = await makeRequest('GET', '/api/interactions/me', {
    headers: { Authorization: `Bearer ${state.userToken}` },
  });
  
  if (result.ok) {
    logSuccess('Interactions retrieved');
    logInfo(`Total interactions: ${result.data.data.length}`);
    return true;
  } else {
    logError('Get interactions failed', result.data);
    return false;
  }
}

async function testCheckInteraction() {
  logTest(19, 'Check Interaction Status');
  
  if (!state.articleId) {
    logInfo('Skipping: No article ID available');
    return false;
  }
  
  const result = await makeRequest('GET', `/api/interactions/check/${state.articleId}?type=LIKE`, {
    headers: { Authorization: `Bearer ${state.userToken}` },
  });
  
  if (result.ok) {
    logSuccess('Interaction check completed');
    logInfo(`Has LIKE: ${result.data.data.hasInteraction}`);
    return true;
  } else {
    logError('Check interaction failed', result.data);
    return false;
  }
}

async function testGetMyFeed() {
  logTest(20, 'Get My Feed (Auto-creates)');
  
  const result = await makeRequest('GET', '/api/feeds/me', {
    headers: { Authorization: `Bearer ${state.userToken}` },
  });
  
  if (result.ok) {
    logSuccess('Feed retrieved/created');
    logInfo(`Article IDs in feed: ${result.data.data.articleIds.length}`);
    logInfo(`Current position: ${result.data.data.currentPosition}`);
    return true;
  } else {
    logError('Get feed failed', result.data);
    return false;
  }
}

async function testRegenerateFeed() {
  logTest(21, 'Regenerate Feed');
  
  if (!state.articleId || !state.articleId2 || !state.articleId3) {
    logInfo('Skipping: Not enough article IDs');
    return false;
  }
  
  const result = await makeRequest('POST', '/api/feeds/me/regenerate', {
    headers: { Authorization: `Bearer ${state.userToken}` },
    body: {
      articleIds: [state.articleId, state.articleId2, state.articleId3],
    },
  });
  
  if (result.ok) {
    logSuccess('Feed regenerated');
    logInfo(`Articles in feed: ${result.data.data.articleIds.length}`);
    return true;
  } else {
    logError('Regenerate feed failed', result.data);
    return false;
  }
}

async function testUpdateFeedPosition() {
  logTest(22, 'Update Feed Position');
  
  const result = await makeRequest('PUT', '/api/feeds/me/position', {
    headers: { Authorization: `Bearer ${state.userToken}` },
    body: {
      position: 2,
    },
  });
  
  if (result.ok) {
    logSuccess('Feed position updated');
    logInfo(`New position: ${result.data.data.currentPosition}`);
    return true;
  } else {
    logError('Update feed position failed', result.data);
    return false;
  }
}

// Error tests
async function testUnauthorizedAccess() {
  logTest(23, 'Test Unauthorized Access (No Token)');
  
  const result = await makeRequest('GET', '/api/articles');
  
  if (!result.ok && result.status === 401) {
    logSuccess('Unauthorized access properly blocked');
    return true;
  } else {
    logError('Unauthorized access test failed');
    return false;
  }
}

async function testInvalidToken() {
  logTest(24, 'Test Invalid Token');
  
  const result = await makeRequest('GET', '/api/articles', {
    headers: { Authorization: 'Bearer invalid-token-123' },
  });
  
  if (!result.ok && result.status === 401) {
    logSuccess('Invalid token properly rejected');
    return true;
  } else {
    logError('Invalid token test failed');
    return false;
  }
}

async function testValidationError() {
  logTest(25, 'Test Validation Error');
  
  const result = await makeRequest('POST', '/api/auth/signup', {
    body: {
      username: 'ab', // Too short
      email: 'invalid-email',
      password: 'weak',
    },
  });
  
  if (!result.ok && result.status === 400) {
    logSuccess('Validation errors properly caught');
    logInfo(`Errors: ${result.data.errors?.length || 0}`);
    return true;
  } else {
    logError('Validation error test failed');
    return false;
  }
}

async function testDuplicateEmail() {
  logTest(26, 'Test Duplicate Email');
  
  const result = await makeRequest('POST', '/api/auth/signup', {
    body: {
      username: 'anotheruser',
      email: 'testuser@example.com', // Already exists
      password: 'Test1234',
    },
  });
  
  if (!result.ok && result.status === 409) {
    logSuccess('Duplicate email properly detected');
    return true;
  } else {
    logError('Duplicate email test failed');
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log('\n' + '='.repeat(60), colors.bright);
  log('  WikiScrolls API Complete Test Suite', colors.bright);
  log('='.repeat(60) + '\n', colors.bright);
  
  log('Starting tests...', colors.yellow);
  log(`Base URL: ${BASE_URL}\n`, colors.cyan);
  
  // Core functionality tests
  await testHealthCheck();
  await testUserSignup();
  await testUserLogin();
  await testGetProfile();
  
  // Category tests
  await testCreateCategory();
  await testListCategories();
  await testGetCategory();
  await testUpdateCategory();
  
  // Article tests
  await testCreateArticles();
  await testListArticles();
  await testGetArticle();
  await testUpdateArticle();
  await testIncrementViewCount();
  
  // Profile tests
  await testCreateProfile();
  await testGetMyProfile();
  await testUpdateProfile();
  
  // Interaction tests
  await testCreateInteractions();
  await testGetMyInteractions();
  await testCheckInteraction();
  
  // Feed tests
  await testGetMyFeed();
  await testRegenerateFeed();
  await testUpdateFeedPosition();
  
  // Error tests
  await testUnauthorizedAccess();
  await testInvalidToken();
  await testValidationError();
  await testDuplicateEmail();
  
  // Summary
  log('\n' + '='.repeat(60), colors.bright);
  log('  Test Summary', colors.bright);
  log('='.repeat(60), colors.bright);
  log(`Total Tests: ${state.totalTests}`, colors.cyan);
  log(`Passed: ${state.passedTests}`, colors.green);
  log(`Failed: ${state.failedTests}`, colors.red);
  log(`Success Rate: ${((state.passedTests / state.totalTests) * 100).toFixed(1)}%\n`, colors.yellow);
  
  if (state.failedTests === 0) {
    log('🎉 All tests passed! 🎉\n', colors.green);
  } else {
    log('⚠️  Some tests failed. Check the output above.\n', colors.red);
  }
  
  // Important notes
  log('Important Notes:', colors.yellow);
  log('1. If category/article tests failed, make user admin in DB:', colors.reset);
  log(`   UPDATE "User" SET "isAdmin" = true WHERE id = '${state.userId}';`, colors.cyan);
  log('2. Some tests may fail if they depend on previous tests', colors.reset);
  log('3. Run `pnpm prisma:migrate` if you get database errors\n', colors.reset);
}

// Run tests
runAllTests().catch(error => {
  logError('Test suite crashed', error);
  process.exit(1);
});
