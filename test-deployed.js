/**
 * Test Deployed API
 * 
 * Usage:
 *   node test-deployed.js https://your-app.up.railway.app
 *   node test-deployed.js http://localhost:3000
 */

const BASE_URL = process.argv[2] || 'http://localhost:3000';

console.log('\n============================================================');
console.log('  WikiScrolls API Deployment Test');
console.log('============================================================\n');
console.log(`Testing URL: ${BASE_URL}\n`);

// Helper functions
const makeRequest = async (method, path, options = {}) => {
  const url = `${BASE_URL}${path}`;
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
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

const logTest = (num, name) => {
  console.log(`\nTest ${num}: ${name}`);
};

const logSuccess = (message) => {
  console.log(`\x1b[32m✓\x1b[0m ${message}`);
};

const logError = (message, data) => {
  console.log(`\x1b[31m✗\x1b[0m ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
};

const logInfo = (message) => {
  console.log(`  ${message}`);
};

// State management
const state = {
  userToken: null,
  adminToken: null,
  userId: null,
};

// Test functions
async function testHealth() {
  logTest(1, 'Health Check');
  
  const result = await makeRequest('GET', '/api/health');
  
  if (result.ok) {
    logSuccess('✅ API is healthy and running');
    logInfo(`Status: ${result.data.data?.status}`);
    return true;
  } else {
    logError('❌ Health check failed', result);
    return false;
  }
}

async function testSignup() {
  logTest(2, 'User Signup');
  
  const timestamp = Date.now();
  const result = await makeRequest('POST', '/api/auth/signup', {
    body: {
      username: `testuser_${timestamp}`,
      email: `test_${timestamp}@example.com`,
      password: 'SecurePass123!',
    },
  });
  
  if (result.ok) {
    state.userToken = result.data.data.token;
    state.adminToken = result.data.data.token;
    state.userId = result.data.data.user.id;
    logSuccess('✅ Signup successful');
    logInfo(`User ID: ${state.userId}`);
    return true;
  } else if (result.data?.message?.includes('already exists')) {
    logInfo('User already exists (using existing credentials)');
    return true;
  } else {
    logError('❌ Signup failed', result.data);
    return false;
  }
}

async function testLogin() {
  logTest(3, 'User Login');
  
  const result = await makeRequest('POST', '/api/auth/login', {
    body: {
      email: 'testuser@example.com',
      password: 'SecurePass123!',
    },
  });
  
  if (result.ok) {
    state.userToken = result.data.data.token;
    state.adminToken = result.data.data.token;
    state.userId = result.data.data.user.id;
    logSuccess('✅ Login successful');
    logInfo(`User ID: ${state.userId}`);
    return true;
  } else {
    logError('❌ Login failed - try with the signup user', result.data);
    return false;
  }
}

async function testGetProfile() {
  logTest(4, 'Get User Profile');
  
  if (!state.userToken) {
    logError('No auth token available');
    return false;
  }
  
  const result = await makeRequest('GET', '/api/auth/profile', {
    headers: { Authorization: `Bearer ${state.userToken}` },
  });
  
  if (result.ok) {
    logSuccess('✅ Profile retrieved');
    logInfo(`Username: ${result.data.data.username}`);
    logInfo(`Email: ${result.data.data.email}`);
    return true;
  } else {
    logError('❌ Get profile failed', result.data);
    return false;
  }
}

async function testCreateCategory() {
  logTest(5, 'Create Category (Admin Required)');
  
  if (!state.adminToken) {
    logError('No admin token available');
    return false;
  }
  
  const timestamp = Date.now();
  const result = await makeRequest('POST', '/api/categories', {
    headers: { Authorization: `Bearer ${state.adminToken}` },
    body: {
      name: `TestCategory_${timestamp}`,
      description: 'Test category for deployment verification',
      color: '#4CAF50',
    },
  });
  
  if (result.ok) {
    logSuccess('✅ Category created');
    logInfo(`Category: ${result.data.data.name}`);
    return true;
  } else if (result.status === 403) {
    logInfo('⚠️  User is not admin - update in database:');
    logInfo(`UPDATE "User" SET "isAdmin" = true WHERE id = '${state.userId}';`);
    return false;
  } else {
    logError('❌ Create category failed', result.data);
    return false;
  }
}

async function testUnauthorized() {
  logTest(6, 'Test Authorization (No Token)');
  
  const result = await makeRequest('GET', '/api/auth/profile');
  
  if (!result.ok && result.status === 401) {
    logSuccess('✅ Unauthorized access properly blocked');
    return true;
  } else {
    logError('❌ Authorization not working properly', result.data);
    return false;
  }
}

// Main test execution
async function runTests() {
  const tests = [
    testHealth,
    testSignup,
    testLogin,
    testGetProfile,
    testCreateCategory,
    testUnauthorized,
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test();
      if (result) passed++;
      else failed++;
    } catch (error) {
      console.error(`Error in test: ${error.message}`);
      failed++;
    }
  }

  console.log('\n============================================================');
  console.log('  Test Summary');
  console.log('============================================================');
  console.log(`Total Tests: ${tests.length}`);
  console.log(`\x1b[32mPassed: ${passed}\x1b[0m`);
  console.log(`\x1b[31mFailed: ${failed}\x1b[0m`);
  console.log(`Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Your deployment is working correctly! 🎉\n');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above for details.\n');
  }
}

// Run tests
runTests().catch(console.error);
