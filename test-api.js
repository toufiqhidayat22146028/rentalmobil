const BASE_URL = 'https://rentalmobil-seven.vercel.app/api';

async function runTests() {
  console.log('--- STARTING E2E TESTS ---');
  let token = '';
  
  // 1. Fetch Cars
  console.log('\n[1] GET /cars');
  let res = await fetch(`${BASE_URL}/cars`);
  let data = await res.json();
  console.log(`Status: ${res.status}, Cars count: ${data.data?.length}`);

  // 2. Register
  console.log('\n[2] POST /auth/register');
  const testEmail = `test${Date.now()}@test.com`;
  res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email: testEmail, password: 'password', phone: '08123456789' })
  });
  data = await res.json();
  console.log(`Status: ${res.status}, Success: ${data.success}, Message: ${data.message || 'OK'}`);
  if (data.token) {
    token = data.token;
  }

  // 3. Login
  console.log('\n[3] POST /auth/login');
  res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'password' })
  });
  data = await res.json();
  console.log(`Status: ${res.status}, Success: ${data.success}`);
  
  // 4. Fetch Profile
  console.log('\n[4] GET /auth/me');
  res = await fetch(`${BASE_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  data = await res.json();
  console.log(`Status: ${res.status}, Name: ${data.user?.name}`);

  // 5. Test Chat
  console.log('\n[5] POST /chat');
  res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  data = await res.json();
  console.log(`Status: ${res.status}, Success: ${data.success}`);

}

runTests().catch(console.error);
