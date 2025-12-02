/**
 * Test script for new API endpoints
 * Run with: node test-new-endpoints.js
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3000/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.yellow}━━━ ${msg} ━━━${colors.reset}`),
  dim: (msg) => console.log(`${colors.dim}  ${msg}${colors.reset}`),
};

let authToken = null;
let testUserId = null;
let testArticleId = null;
let secondUserId = null;

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  tests: [],
};

async function request(method, endpoint, body = null, expectStatus = 200) {
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (authToken) {
    options.headers['Authorization'] = `Bearer ${authToken}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));

    return {
      status: response.status,
      ok: response.status === expectStatus,
      data,
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      data: { error: error.message },
    };
  }
}

function test(name, passed, details = '') {
  if (passed) {
    log.success(name);
    results.passed++;
  } else {
    log.error(`${name} ${details ? `- ${details}` : ''}`);
    results.failed++;
  }
  results.tests.push({ name, passed, details });
}

async function setup() {
  log.section('SETUP');
  log.info('Creating test users and data...');

  // Register first test user (using /signup endpoint)
  const timestamp = Date.now();
  const registerRes = await request('POST', '/auth/signup', {
    username: `testuser_${timestamp}`,
    email: `test_${timestamp}@example.com`,
    password: 'TestPassword123!',
  }, 201);

  if (registerRes.ok && registerRes.data.data?.token) {
    authToken = registerRes.data.data.token;
    testUserId = registerRes.data.data.user?.id;
    log.success(`Created test user: testuser_${timestamp}`);
  } else {
    // Try login if user exists
    const loginRes = await request('POST', '/auth/login', {
      email: `test_${timestamp}@example.com`,
      password: 'TestPassword123!',
    });
    if (loginRes.ok && loginRes.data.data?.token) {
      authToken = loginRes.data.data.token;
      testUserId = loginRes.data.data.user?.id;
      log.success('Logged in with existing user');
    } else {
      log.error('Failed to create/login test user');
      log.dim(JSON.stringify(registerRes.data));
      return false;
    }
  }

  // Create profile for test user
  await request('POST', '/profiles/me', {
    displayName: 'Test User',
    bio: 'This is a test user for API testing',
    interests: ['science', 'technology'],
  }, 201);

  // Register second test user for public profile/likes tests
  const register2Res = await request('POST', '/auth/signup', {
    username: `testuser2_${timestamp}`,
    email: `test2_${timestamp}@example.com`,
    password: 'TestPassword123!',
  }, 201);

  if (register2Res.ok) {
    // Temporarily switch to second user to create profile and like something
    const tempToken = authToken;
    authToken = register2Res.data.data.token;
    secondUserId = register2Res.data.data.user?.id;

    await request('POST', '/profiles/me', {
      displayName: 'Second Test User',
      bio: 'Another test user',
    }, 201);

    authToken = tempToken; // Switch back
    log.success(`Created second test user: testuser2_${timestamp}`);
  }

  // Get an article to test with
  const articlesRes = await request('GET', '/articles?limit=1');
  if (articlesRes.ok && articlesRes.data.data?.articles?.length > 0) {
    testArticleId = articlesRes.data.data.articles[0].id;
    log.success(`Found test article: ${testArticleId}`);
  } else {
    log.error('No articles found for testing - some tests will fail');
    log.dim('Create at least one article to test interaction endpoints');
  }

  return true;
}

async function testInteractionEndpoints() {
  log.section('INTERACTION ENDPOINTS');

  if (!testArticleId) {
    log.error('Skipping interaction tests - no article available');
    return;
  }

  // Test: Create LIKE interaction
  const likeRes = await request('POST', '/interactions', {
    articleId: testArticleId,
    interactionType: 'LIKE',
  }, 201);
  test('POST /interactions (LIKE)', likeRes.ok, likeRes.data.message);

  // Test: Create SAVE interaction
  const saveRes = await request('POST', '/interactions', {
    articleId: testArticleId,
    interactionType: 'SAVE',
  }, 201);
  test('POST /interactions (SAVE)', saveRes.ok, saveRes.data.message);

  // Test: Check all interactions for article
  const checkRes = await request('GET', `/interactions/check/${testArticleId}`);
  const checkData = checkRes.data.data;
  test(
    'GET /interactions/check/:articleId',
    checkRes.ok && checkData?.liked === true && checkData?.saved === true,
    checkRes.ok ? `liked: ${checkData?.liked}, saved: ${checkData?.saved}` : checkRes.data.message
  );

  // Test: Get my liked articles
  const likedRes = await request('GET', '/interactions/me/liked');
  test(
    'GET /interactions/me/liked',
    likedRes.ok && Array.isArray(likedRes.data.data?.articles),
    likedRes.ok ? `Found ${likedRes.data.data?.articles?.length} liked articles` : likedRes.data.message
  );

  // Test: Get my liked articles with pagination
  const likedPagRes = await request('GET', '/interactions/me/liked?page=1&limit=5');
  test(
    'GET /interactions/me/liked (paginated)',
    likedPagRes.ok && likedPagRes.data.data?.pagination?.limit === 5,
    likedPagRes.ok ? `Page ${likedPagRes.data.data?.pagination?.page}` : likedPagRes.data.message
  );

  // Test: Get my saved articles
  const savedRes = await request('GET', '/interactions/me/saved');
  test(
    'GET /interactions/me/saved',
    savedRes.ok && Array.isArray(savedRes.data.data?.articles),
    savedRes.ok ? `Found ${savedRes.data.data?.articles?.length} saved articles` : savedRes.data.message
  );

  // Test: Get another user's liked articles
  if (secondUserId) {
    const userLikedRes = await request('GET', `/interactions/users/${secondUserId}/liked`);
    test(
      'GET /interactions/users/:userId/liked',
      userLikedRes.ok && Array.isArray(userLikedRes.data.data?.articles),
      userLikedRes.ok ? `Found ${userLikedRes.data.data?.articles?.length} articles` : userLikedRes.data.message
    );
  }

  // Test: Delete LIKE interaction
  const unlikeRes = await request('DELETE', '/interactions', {
    articleId: testArticleId,
    interactionType: 'LIKE',
  }, 204);
  test('DELETE /interactions (LIKE)', unlikeRes.status === 204);

  // Verify like was removed
  const checkAfterRes = await request('GET', `/interactions/check/${testArticleId}`);
  test(
    'Verify LIKE removed',
    checkAfterRes.ok && checkAfterRes.data.data?.liked === false,
    `liked: ${checkAfterRes.data.data?.liked}`
  );

  // Delete SAVE interaction
  await request('DELETE', '/interactions', {
    articleId: testArticleId,
    interactionType: 'SAVE',
  }, 204);
}

async function testProfileEndpoints() {
  log.section('PROFILE ENDPOINTS');

  // Test: Get my stats
  const statsRes = await request('GET', '/profiles/me/stats');
  const statsData = statsRes.data.data;
  test(
    'GET /profiles/me/stats',
    statsRes.ok &&
      typeof statsData?.totalLikes === 'number' &&
      typeof statsData?.totalSaves === 'number' &&
      typeof statsData?.totalViews === 'number' &&
      statsData?.joinDate !== undefined,
    statsRes.ok
      ? `Likes: ${statsData?.totalLikes}, Saves: ${statsData?.totalSaves}, Views: ${statsData?.totalViews}`
      : statsRes.data.message
  );

  // Test: Get public profile of another user
  if (secondUserId) {
    const publicProfileRes = await request('GET', `/profiles/public/${secondUserId}`);
    const profileData = publicProfileRes.data.data;
    test(
      'GET /profiles/public/:userId',
      publicProfileRes.ok &&
        profileData?.user?.username !== undefined &&
        profileData?.user?.email === undefined, // Should NOT expose email
      publicProfileRes.ok
        ? `Found profile for: ${profileData?.user?.username}`
        : publicProfileRes.data.message
    );
  }

  // Test: Public profile returns 404 for non-existent user
  const fakeUserId = '00000000-0000-0000-0000-000000000000';
  const notFoundRes = await request('GET', `/profiles/public/${fakeUserId}`, null, 404);
  test(
    'GET /profiles/public/:userId (not found)',
    notFoundRes.status === 404,
    `Status: ${notFoundRes.status}`
  );
}

async function testSearchEndpoints() {
  log.section('SEARCH ENDPOINTS');

  // Test: Search articles
  const articleSearchRes = await request('GET', '/articles/search?q=test');
  test(
    'GET /articles/search?q=test',
    articleSearchRes.ok && Array.isArray(articleSearchRes.data.data?.articles),
    articleSearchRes.ok
      ? `Found ${articleSearchRes.data.data?.articles?.length} articles`
      : articleSearchRes.data.message
  );

  // Test: Search articles with pagination and sorting
  const articleSearchPagRes = await request(
    'GET',
    '/articles/search?q=a&page=1&limit=5&sortBy=likeCount&sortOrder=desc'
  );
  test(
    'GET /articles/search (with params)',
    articleSearchPagRes.ok &&
      articleSearchPagRes.data.data?.pagination?.limit === 5,
    articleSearchPagRes.ok
      ? `Page ${articleSearchPagRes.data.data?.pagination?.page}, limit ${articleSearchPagRes.data.data?.pagination?.limit}`
      : articleSearchPagRes.data.message
  );

  // Test: Search articles - empty query should fail
  const emptySearchRes = await request('GET', '/articles/search?q=', null, 400);
  test(
    'GET /articles/search (empty query - should fail)',
    emptySearchRes.status === 400,
    `Status: ${emptySearchRes.status}`
  );

  // Test: Search users
  const userSearchRes = await request('GET', '/users/search?q=test');
  test(
    'GET /users/search?q=test',
    userSearchRes.ok && Array.isArray(userSearchRes.data.data?.users),
    userSearchRes.ok
      ? `Found ${userSearchRes.data.data?.users?.length} users`
      : userSearchRes.data.message
  );

  // Test: Search users with pagination
  const userSearchPagRes = await request('GET', '/users/search?q=test&page=1&limit=5');
  test(
    'GET /users/search (with pagination)',
    userSearchPagRes.ok && userSearchPagRes.data.data?.pagination?.limit === 5,
    userSearchPagRes.ok
      ? `Found ${userSearchPagRes.data.data?.users?.length} users`
      : userSearchPagRes.data.message
  );

  // Test: Search users - verify no email exposed
  if (userSearchRes.ok && userSearchRes.data.data?.users?.length > 0) {
    const firstUser = userSearchRes.data.data.users[0];
    test(
      'User search does not expose email',
      firstUser.email === undefined,
      firstUser.email ? 'Email was exposed!' : 'Email hidden correctly'
    );
  }
}

async function testValidation() {
  log.section('VALIDATION TESTS');

  // Test: Invalid article ID format
  const invalidIdRes = await request('GET', '/interactions/check/not-a-uuid', null, 400);
  test(
    'Invalid UUID rejected',
    invalidIdRes.status === 400,
    `Status: ${invalidIdRes.status}`
  );

  // Test: Missing required fields
  const missingFieldsRes = await request('POST', '/interactions', {}, 400);
  test(
    'Missing fields rejected',
    missingFieldsRes.status === 400,
    `Status: ${missingFieldsRes.status}`
  );

  // Test: Invalid interaction type
  const invalidTypeRes = await request('POST', '/interactions', {
    articleId: testArticleId || '00000000-0000-0000-0000-000000000000',
    interactionType: 'INVALID',
  }, 400);
  test(
    'Invalid interaction type rejected',
    invalidTypeRes.status === 400,
    `Status: ${invalidTypeRes.status}`
  );

  // Test: Pagination limits
  const overLimitRes = await request('GET', '/interactions/me/liked?limit=999', null, 400);
  test(
    'Pagination limit > 100 rejected',
    overLimitRes.status === 400,
    `Status: ${overLimitRes.status}`
  );
}

async function testAuthentication() {
  log.section('AUTHENTICATION TESTS');

  const savedToken = authToken;
  authToken = null;

  // Test: Endpoints require auth
  const noAuthRes = await request('GET', '/interactions/me/liked', null, 401);
  test(
    'Endpoints require authentication',
    noAuthRes.status === 401,
    `Status: ${noAuthRes.status}`
  );

  authToken = 'invalid-token';
  const invalidTokenRes = await request('GET', '/profiles/me/stats', null, 401);
  test(
    'Invalid token rejected',
    invalidTokenRes.status === 401,
    `Status: ${invalidTokenRes.status}`
  );

  authToken = savedToken;
}

async function printSummary() {
  log.section('TEST SUMMARY');
  console.log(`
  ${colors.green}Passed: ${results.passed}${colors.reset}
  ${colors.red}Failed: ${results.failed}${colors.reset}
  Total:  ${results.passed + results.failed}
  `);

  if (results.failed > 0) {
    console.log(`${colors.red}Failed tests:${colors.reset}`);
    results.tests
      .filter((t) => !t.passed)
      .forEach((t) => console.log(`  - ${t.name} ${t.details ? `(${t.details})` : ''}`));
  }

  return results.failed === 0;
}

async function main() {
  console.log(`
${colors.cyan}╔════════════════════════════════════════╗
║   WikiScrolls New Endpoints Test Suite  ║
╚════════════════════════════════════════╝${colors.reset}
  `);
  log.info(`Testing against: ${BASE_URL}`);

  const setupOk = await setup();
  if (!setupOk) {
    log.error('Setup failed - aborting tests');
    process.exit(1);
  }

  await testInteractionEndpoints();
  await testProfileEndpoints();
  await testSearchEndpoints();
  await testValidation();
  await testAuthentication();

  const allPassed = await printSummary();
  process.exit(allPassed ? 0 : 1);
}

main().catch((err) => {
  console.error('Test script error:', err);
  process.exit(1);
});
