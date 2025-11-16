/**
 * Test script for Cloudinary upload endpoints
 * Run with: node test-upload.js
 */

const BASE_URL = 'http://localhost:3000';
let userToken = '';
let adminToken = '';
let userId = '';
let articleId = '';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function logSuccess(msg) {
  console.log(`${colors.green}✓${colors.reset} ${msg}`);
}

function logError(msg, data) {
  console.log(`${colors.red}✗${colors.reset} ${msg}`);
  if (data) console.log('  Error:', data);
}

function logInfo(msg) {
  console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`);
}

function logTest(num, name) {
  console.log(`\n${colors.yellow}[Test ${num}]${colors.reset} ${colors.blue}${name}${colors.reset}`);
}

async function makeRequest(method, path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (options.body && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  } else if (options.body instanceof FormData) {
    delete config.headers['Content-Type']; // Let browser set it with boundary
    config.body = options.body;
  }

  try {
    const res = await fetch(url, config);
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

// State management
const state = {
  userToken: '',
  adminToken: '',
  userId: '',
  articleId: '',
};

/**
 * NOTE: This test requires Node.js 18+ for fetch and FormData support
 * To test with actual files, you'll need to use a library like 'form-data'
 * or test from a browser/frontend application.
 * 
 * Example with form-data (install: npm install form-data):
 * 
 * const FormData = require('form-data');
 * const fs = require('fs');
 * 
 * async function testUploadAvatar() {
 *   const formData = new FormData();
 *   formData.append('image', fs.createReadStream('./test-avatar.jpg'));
 *   
 *   const res = await fetch(`${BASE_URL}/api/upload/avatar`, {
 *     method: 'POST',
 *     headers: {
 *       'Authorization': `Bearer ${state.userToken}`,
 *       ...formData.getHeaders()
 *     },
 *     body: formData
 *   });
 *   
 *   const data = await res.json();
 *   console.log(data);
 * }
 */

async function testLoginUser() {
  logTest(1, 'Login as User');
  
  const result = await makeRequest('POST', '/api/auth/login', {
    body: {
      username: 'testuser',
      password: 'password123',
    },
  });
  
  if (result.ok && result.data.data.token) {
    state.userToken = result.data.data.token;
    state.userId = result.data.data.user.id;
    logSuccess('User logged in successfully');
    logInfo(`Token: ${state.userToken.substring(0, 20)}...`);
    return true;
  } else {
    logError('User login failed', result.data);
    return false;
  }
}

async function testLoginAdmin() {
  logTest(2, 'Login as Admin');
  
  const result = await makeRequest('POST', '/api/auth/login', {
    body: {
      username: 'admin',
      password: 'adminpass123',
    },
  });
  
  if (result.ok && result.data.data.token) {
    state.adminToken = result.data.data.token;
    logSuccess('Admin logged in successfully');
    logInfo(`Token: ${state.adminToken.substring(0, 20)}...`);
    return true;
  } else {
    logError('Admin login failed', result.data);
    return false;
  }
}

async function testCheckProfile() {
  logTest(3, 'Check if User has Profile');
  
  const result = await makeRequest('GET', '/api/profiles/me', {
    headers: { Authorization: `Bearer ${state.userToken}` },
  });
  
  if (result.ok) {
    logSuccess('User profile exists');
    logInfo(`Profile: ${result.data.data.displayName || 'No display name'}`);
    if (result.data.data.avatarUrl) {
      logInfo(`Current avatar: ${result.data.data.avatarUrl}`);
    }
    return true;
  } else if (result.status === 404) {
    logInfo('No profile found - you need to create one first');
    logInfo('Run: POST /api/profiles/me');
    return false;
  } else {
    logError('Failed to check profile', result.data);
    return false;
  }
}

async function testGetArticles() {
  logTest(4, 'Get Articles');
  
  const result = await makeRequest('GET', '/api/articles?limit=1', {
    headers: { Authorization: `Bearer ${state.adminToken}` },
  });
  
  if (result.ok && result.data.data.articles.length > 0) {
    state.articleId = result.data.data.articles[0].id;
    logSuccess('Articles retrieved');
    logInfo(`First article ID: ${state.articleId}`);
    if (result.data.data.articles[0].imageUrl) {
      logInfo(`Current image: ${result.data.data.articles[0].imageUrl}`);
    }
    return true;
  } else {
    logError('No articles found or failed to retrieve');
    return false;
  }
}

console.log(`${colors.cyan}╔════════════════════════════════════════════╗${colors.reset}`);
console.log(`${colors.cyan}║  Cloudinary Upload Test Script            ║${colors.reset}`);
console.log(`${colors.cyan}╚════════════════════════════════════════════╝${colors.reset}`);

console.log('\n📝 Prerequisites:');
console.log('1. Server must be running on http://localhost:3000');
console.log('2. Test user must exist (username: testuser, password: password123)');
console.log('3. Admin user must exist (username: admin, password: adminpass123)');
console.log('4. User must have a profile created');
console.log('5. At least one article must exist\n');

console.log('🧪 To test actual file uploads, use the examples in CLOUDINARY_UPLOAD.md');
console.log('   or implement file upload logic using form-data library.\n');

// Run basic checks
(async () => {
  const userLogin = await testLoginUser();
  if (!userLogin) return;
  
  const adminLogin = await testLoginAdmin();
  if (!adminLogin) return;
  
  await testCheckProfile();
  await testGetArticles();
  
  console.log('\n' + colors.cyan + '═'.repeat(48) + colors.reset);
  console.log('📋 Upload Endpoints Available:');
  console.log('');
  console.log(`${colors.green}POST${colors.reset}   /api/upload/avatar`);
  console.log(`${colors.red}DELETE${colors.reset} /api/upload/avatar`);
  console.log(`${colors.green}POST${colors.reset}   /api/upload/article/:articleId (Admin)`);
  console.log(`${colors.red}DELETE${colors.reset} /api/upload/article/:articleId (Admin)`);
  console.log('');
  console.log('See CLOUDINARY_UPLOAD.md for cURL examples and documentation.');
  console.log(colors.cyan + '═'.repeat(48) + colors.reset);
})();
