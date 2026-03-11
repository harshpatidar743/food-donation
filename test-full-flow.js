const http = require('http');

console.log('=== Testing Complete Food Donation Flow ===\n');

// Test data
const testDonor = {
  name: 'Test User',
  email: 'test' + Date.now() + '@example.com',
  password: 'test123',
  phone: '1234567890'
};

let donorId = null;

// Step 1: Register
function register() {
  console.log('1. Testing Registration...');
  const data = JSON.stringify(testDonor);
  
  const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  }, (res) => {
    let response = '';
    res.on('data', (chunk) => { response += chunk; });
    res.on('end', () => {
      console.log('   Status:', res.statusCode);
      const result = JSON.parse(response);
      console.log('   Response:', result.message || result.error);
      if (res.statusCode === 200) {
        console.log('   ✓ Registration successful!\n');
        login();
      } else {
        console.log('   ✗ Registration failed!\n');
      }
    });
  });
  
  req.on('error', (e) => console.error('   Error:', e.message));
  req.write(data);
  req.end();
}

// Step 2: Login
function login() {
  console.log('2. Testing Login...');
  const data = JSON.stringify({ email: testDonor.email, password: testDonor.password });
  
  const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  }, (res) => {
    let response = '';
    res.on('data', (chunk) => { response += chunk; });
    res.on('end', () => {
      console.log('   Status:', res.statusCode);
      const result = JSON.parse(response);
      console.log('   Response:', result.message || result.error);
      if (result.donorId) {
        donorId = result.donorId;
        console.log('   ✓ Login successful! Donor ID:', donorId, '\n');
        donateFood();
      } else {
        console.log('   ✗ Login failed!\n');
      }
    });
  });
  
  req.on('error', (e) => console.error('   Error:', e.message));
  req.write(data);
  req.end();
}

// Step 3: Donate Food
function donateFood() {
  console.log('3. Testing Food Donation...');
  const donation = {
    donorId: donorId,
    foodType: 'Rice and Curry',
    quantity: 10,
    location: 'New York'
  };
  const data = JSON.stringify(donation);
  
  const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/donate',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  }, (res) => {
    let response = '';
    res.on('data', (chunk) => { response += chunk; });
    res.on('end', () => {
      console.log('   Status:', res.statusCode);
      const result = JSON.parse(response);
      console.log('   Response:', result.message || result.error);
      if (res.statusCode === 200) {
        console.log('   ✓ Donation successful!\n');
        getMyDonations();
      } else {
        console.log('   ✗ Donation failed!\n');
      }
    });
  });
  
  req.on('error', (e) => console.error('   Error:', e.message));
  req.write(data);
  req.end();
}

// Step 4: Get My Donations
function getMyDonations() {
  console.log('4. Testing Get My Donations...');
  
  const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/mydonations/' + donorId,
    method: 'GET'
  }, (res) => {
    let response = '';
    res.on('data', (chunk) => { response += chunk; });
    res.on('end', () => {
      console.log('   Status:', res.statusCode);
      const donations = JSON.parse(response);
      console.log('   Response: Found', donations.length, 'donation(s)');
      if (res.statusCode === 200 && donations.length > 0) {
        console.log('   ✓ Get My Donations successful!\n');
        getAllDonations();
      } else {
        console.log('   ✗ Get My Donations failed!\n');
      }
    });
  });
  
  req.on('error', (e) => console.error('   Error:', e.message));
  req.end();
}

// Step 5: Get All Donations (for Get Food page)
function getAllDonations() {
  console.log('5. Testing Get All Donations...');
  
  const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/donations',
    method: 'GET'
  }, (res) => {
    let response = '';
    res.on('data', (chunk) => { response += chunk; });
    res.on('end', () => {
      console.log('   Status:', res.statusCode);
      const donations = JSON.parse(response);
      console.log('   Response: Found', donations.length, 'total donation(s)');
      if (res.statusCode === 200) {
        console.log('   ✓ Get All Donations successful!\n');
        console.log('=== All Tests Passed! ===');
      } else {
        console.log('   ✗ Get All Donations failed!\n');
      }
    });
  });
  
  req.on('error', (e) => console.error('   Error:', e.message));
  req.end();
}

// Start the test
register();

