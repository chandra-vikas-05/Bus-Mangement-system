#!/usr/bin/env node

/**
 * Bus Booking System - System Verification Script
 * Tests all critical components
 */

const http = require('http');

const checks = [];
let passed = 0;
let failed = 0;

// Helper function to make requests
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    try {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data }));
      });
      req.on('error', (err) => {
        reject(new Error(`Connection error: ${err.message}`));
      });
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      if (options.body) req.write(options.body);
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

// Test functions
async function testFrontendServer() {
  try {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/login.html',
      method: 'GET'
    };
    const result = await makeRequest(options);
    if (result.status === 200) {
      checks.push({ name: 'Frontend Server', status: 'PASS', details: 'http://localhost:3000' });
      passed++;
      return true;
    } else {
      checks.push({ name: 'Frontend Server', status: 'FAIL', details: `Status ${result.status}` });
      failed++;
      return false;
    }
  } catch (e) {
    checks.push({ name: 'Frontend Server', status: 'FAIL', details: e.message });
    failed++;
    return false;
  }
}

async function testBackendServer() {
  try {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/buses',
      method: 'GET'
    };
    const result = await makeRequest(options);
    if (result.status === 200 || result.status === 401) {
      checks.push({ name: 'Backend Server', status: 'PASS', details: 'http://localhost:5000/api' });
      passed++;
      return true;
    } else {
      checks.push({ name: 'Backend Server', status: 'FAIL', details: `Status ${result.status}` });
      failed++;
      return false;
    }
  } catch (e) {
    checks.push({ name: 'Backend Server', status: 'FAIL', details: e.message });
    failed++;
    return false;
  }
}

async function testRegistration() {
  try {
    const body = JSON.stringify({
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'test123456'
    });
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      body: body
    };
    
    const result = await makeRequest(options);
    if (result.status === 201 || result.status === 200) {
      const data = JSON.parse(result.data);
      if (data.token) {
        checks.push({ name: 'User Registration', status: 'PASS', details: 'JWT token generated' });
        passed++;
        return true;
      }
    }
    checks.push({ name: 'User Registration', status: 'FAIL', details: `Status ${result.status}` });
    failed++;
    return false;
  } catch (e) {
    checks.push({ name: 'User Registration', status: 'FAIL', details: e.message });
    failed++;
    return false;
  }
}

async function testAdminLogin() {
  try {
    const body = JSON.stringify({
      email: 'admin@busbooking.com',
      password: 'admin123456'
    });
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      body: body
    };
    
    const result = await makeRequest(options);
    if (result.status === 200) {
      const data = JSON.parse(result.data);
      if (data.user && data.user.role === 'admin') {
        checks.push({ name: 'Admin Login', status: 'PASS', details: `Admin user verified (${data.user.email})` });
        passed++;
        return true;
      }
    }
    checks.push({ name: 'Admin Login', status: 'FAIL', details: `Status ${result.status}` });
    failed++;
    return false;
  } catch (e) {
    checks.push({ name: 'Admin Login', status: 'FAIL', details: e.message });
    failed++;
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 Bus Booking System - System Verification');
  console.log('='.repeat(60) + '\n');

  console.log('Running checks...\n');

  await testFrontendServer();
  await testBackendServer();
  await testRegistration();
  await testAdminLogin();

  // Display results
  console.log('Results:\n');
  checks.forEach(check => {
    const icon = check.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${check.name}`);
    console.log(`   Status: ${check.status}`);
    console.log(`   Details: ${check.details}\n`);
  });

  console.log('='.repeat(60));
  console.log(`Summary: ${passed} PASSED, ${failed} FAILED`);
  console.log('='.repeat(60));

  if (failed === 0) {
    console.log('\n✨ All systems operational! Ready to use.\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some systems need attention.\n');
    process.exit(1);
  }
}

// Run tests
runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
