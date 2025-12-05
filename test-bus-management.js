#!/usr/bin/env node

/**
 * Bus Management System - Test Script (Using axios alternative)
 * Tests all bus CRUD operations
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
let adminToken = '';
let testRouteId = '';
let testBusId = '';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    // Build full URL reliably: ensure BASE_URL and path are combined correctly
    const base = BASE_URL.replace(/\/$/, '');
    const fullPath = path.startsWith('http') ? path : (base + (path.startsWith('/') ? path : '/' + path));
    const url = new URL(fullPath);
    const isHttps = url.protocol === 'https:';
    const httpModule = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = httpModule.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: parsed,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      const body = JSON.stringify(data);
      req.write(body);
    }

    req.end();
  });
}

// Test functions
async function testHealthCheck() {
  console.log('\n📋 Test 1: Health Check');
  try {
    const response = await makeRequest('GET', '/health');
    if (response.status === 200) {
      console.log('✅ Server is healthy');
      return true;
    }
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return false;
  }
}

async function registerAdmin() {
  console.log('\n📋 Test 2: Register Admin User');
  try {
    const adminData = {
      name: 'Test Admin',
      email: 'testadmin@example.com',
      password: 'testpass123',
      phone: '9999999999',
      role: 'admin'
    };

    const response = await makeRequest('POST', '/auth/register', adminData);
    console.log(`Status: ${response.status}`);
    
    if (response.status === 201 || response.status === 400) {
      // 400 might mean user already exists, which is fine
      console.log('✅ Admin registration completed');
      return true;
    }
    console.log('❌ Admin registration failed');
    return false;
  } catch (error) {
    console.log('❌ Registration error:', error.message);
    return false;
  }
}

async function loginAdmin() {
  console.log('\n📋 Test 3: Admin Login');
  try {
    const loginData = {
      email: 'testadmin@example.com',
      password: 'testpass123'
    };

    const response = await makeRequest('POST', '/auth/login', loginData);
    console.log(`Status: ${response.status}`);

    if (response.status === 200 && response.data.token) {
      adminToken = response.data.token;
      console.log('✅ Admin login successful');
      console.log('Token:', adminToken.substring(0, 20) + '...');
      return true;
    }
    console.log('❌ Admin login failed');
    return false;
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return false;
  }
}

async function createRoute() {
  console.log('\n📋 Test 4: Create Route (Required for Bus)');
  try {
    const routeData = {
      routeName: 'Delhi to Jaipur',
      source: 'Delhi',
      destination: 'Jaipur',
      distance: 240,
      duration: 300
    };

    const response = await makeRequest('POST', '/admin/routes', routeData, {
      'Authorization': `Bearer ${adminToken}`
    });

    console.log(`Status: ${response.status}`);

    if (response.status === 201 && response.data.route) {
      testRouteId = response.data.route._id;
      console.log('✅ Route created successfully');
      console.log('Route ID:', testRouteId);
      return true;
    }
    console.log('❌ Route creation failed');
    return false;
  } catch (error) {
    console.log('❌ Route creation error:', error.message);
    return false;
  }
}

async function createBus() {
  console.log('\n📋 Test 5: Create Bus');
  try {
    const busData = {
      busNumber: `TEST-BUS-${Date.now()}`,
      busName: 'Test Express Bus',
      totalSeats: 45,
      busType: 'AC',
      pricePerSeat: 800,
      route: testRouteId,
      departureTime: '08:00',
      arrivalTime: '14:00',
      departureDate: new Date().toISOString(),
      amenities: ['WiFi', 'Charging']
    };

    const response = await makeRequest('POST', '/admin/buses', busData, {
      'Authorization': `Bearer ${adminToken}`
    });

    console.log(`Status: ${response.status}`);

    if (response.status === 201 && response.data.bus) {
      testBusId = response.data.bus._id;
      console.log('✅ Bus created successfully');
      console.log('Bus ID:', testBusId);
      console.log('Bus Number:', response.data.bus.busNumber);
      console.log('Total Seats:', response.data.bus.totalSeats);
      return true;
    }
    console.log('❌ Bus creation failed');
    console.log('Response:', response.data);
    return false;
  } catch (error) {
    console.log('❌ Bus creation error:', error.message);
    return false;
  }
}

async function getAllBuses() {
  console.log('\n📋 Test 6: Get All Buses (Admin)');
  try {
    const response = await makeRequest('GET', '/admin/buses', null, {
      'Authorization': `Bearer ${adminToken}`
    });

    console.log(`Status: ${response.status}`);

    if (response.status === 200 && Array.isArray(response.data.buses)) {
      console.log('✅ Buses retrieved successfully');
      console.log(`Total buses: ${response.data.count}`);
      if (response.data.buses.length > 0) {
        console.log('Sample bus:', response.data.buses[0].busNumber);
      }
      return true;
    }
    console.log('❌ Failed to get buses');
    return false;
  } catch (error) {
    console.log('❌ Get buses error:', error.message);
    return false;
  }
}

async function updateBus() {
  console.log('\n📋 Test 7: Update Bus');
  try {
    const updateData = {
      pricePerSeat: 900,
      busName: 'Test Express Bus Premium',
      amenities: ['WiFi', 'Charging', 'Meals']
    };

    const response = await makeRequest('PUT', `/admin/buses/${testBusId}`, updateData, {
      'Authorization': `Bearer ${adminToken}`
    });

    console.log(`Status: ${response.status}`);

    if (response.status === 200 && response.data.bus) {
      console.log('✅ Bus updated successfully');
      console.log('New Price:', response.data.bus.pricePerSeat);
      console.log('New Name:', response.data.bus.busName);
      return true;
    }
    console.log('❌ Bus update failed');
    return false;
  } catch (error) {
    console.log('❌ Bus update error:', error.message);
    return false;
  }
}

async function getBusById() {
  console.log('\n📋 Test 8: Get Bus by ID (Public)');
  try {
    const response = await makeRequest('GET', `/buses/${testBusId}`);

    console.log(`Status: ${response.status}`);

    if (response.status === 200 && response.data.bus) {
      console.log('✅ Bus retrieved successfully');
      console.log('Bus:', response.data.bus.busName);
      console.log('Price:', response.data.bus.pricePerSeat);
      return true;
    }
    console.log('❌ Failed to get bus by ID');
    return false;
  } catch (error) {
    console.log('❌ Get bus error:', error.message);
    return false;
  }
}

async function deleteBus() {
  console.log('\n📋 Test 9: Delete Bus');
  try {
    const response = await makeRequest('DELETE', `/admin/buses/${testBusId}`, null, {
      'Authorization': `Bearer ${adminToken}`
    });

    console.log(`Status: ${response.status}`);

    if (response.status === 200) {
      console.log('✅ Bus deleted successfully');
      return true;
    }
    console.log('❌ Bus deletion failed');
    return false;
  } catch (error) {
    console.log('❌ Bus deletion error:', error.message);
    return false;
  }
}

async function verifyBusDeleted() {
  console.log('\n📋 Test 10: Verify Bus Deleted');
  try {
    const response = await makeRequest('GET', `/buses/${testBusId}`);

    console.log(`Status: ${response.status}`);

    if (response.status === 404) {
      console.log('✅ Bus is properly deleted (404 as expected)');
      return true;
    }
    console.log('⚠️ Bus still exists or error occurred');
    return false;
  } catch (error) {
    console.log('❌ Verification error:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║     BUS MANAGEMENT SYSTEM - COMPREHENSIVE TEST SUITE      ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  const results = [];

  // Run tests in sequence
  results.push({
    test: 'Health Check',
    passed: await testHealthCheck()
  });

  results.push({
    test: 'Register Admin',
    passed: await registerAdmin()
  });

  results.push({
    test: 'Admin Login',
    passed: await loginAdmin()
  });

  if (!adminToken) {
    console.log('\n❌ Cannot continue without admin token!');
    console.log('\nPlease ensure:');
    console.log('1. Server is running: node backend/server.js');
    console.log('2. MongoDB is running and connected');
    console.log('3. Port 5000 is accessible');
    return;
  }

  results.push({
    test: 'Create Route',
    passed: await createRoute()
  });

  if (!testRouteId) {
    console.log('\n❌ Cannot continue without route!');
    return;
  }

  results.push({
    test: 'Create Bus',
    passed: await createBus()
  });

  results.push({
    test: 'Get All Buses',
    passed: await getAllBuses()
  });

  results.push({
    test: 'Update Bus',
    passed: await updateBus()
  });

  results.push({
    test: 'Get Bus by ID',
    passed: await getBusById()
  });

  results.push({
    test: 'Delete Bus',
    passed: await deleteBus()
  });

  results.push({
    test: 'Verify Bus Deleted',
    passed: await verifyBusDeleted()
  });

  // Summary
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║                      TEST SUMMARY                        ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  let passed = 0;
  let failed = 0;

  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} | ${result.test}`);
    if (result.passed) passed++;
    else failed++;
  });

  console.log('───────────────────────────────────────────────────────────');
  console.log(`📊 Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Bus Management System is working perfectly!');
    console.log('\n✨ You can now:');
    console.log('   1. Access admin panel at http://localhost:3000/admin.html');
    console.log('   2. Use the API at http://localhost:5000/api');
    console.log('   3. Manage buses through the frontend');
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed. Check the details above.`);
  }

  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
