const http = require('http');

console.log('Testing my donations API...');

// First let's try the correct backend endpoint
const donorId = '69b1f8f08412afdb1f176868';

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: `/mydonations/${donorId}`,
  method: 'GET'
}, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Backend API Response:');
    console.log('Status:', res.statusCode);
    console.log('Data:', data);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.end();

