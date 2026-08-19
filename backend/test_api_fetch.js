const http = require('http');

async function testApi() {
  const payload = {
    name: 'Daihatsu Ayla 1.2 R',
    brand: 'Daihatsu',
    type: 'City Car',
    year: 2023,
    capacity: 5,
    transmission: 'Manual',
    fuel: 'Bensin',
    pricePerDay: 300000,
    driverCostPerDay: 150000,
    available: true,
    priority: 0,
    description: 'Pilihan hemat dan lincah untuk menemani aktivitas perkotaan.',
    color: null,
    plateNumber: null,
    image: 'https://images.unsplash.com/photo-1612825173281-9a193378527e?w=800&q=80',
    features: ['Lampu Depan LED', 'AC Digital', 'Akses Tanpa Kunci'],
    specs: {},
    imageFile: null,
    imagePreview: ''
  };

  // We need to get a token first
  const loginRes = await fetch('http://localhost:5001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@rentalmobil.com', password: 'password123' })
  });
  
  if (!loginRes.ok) {
    console.log('Login failed:', await loginRes.text());
    process.exit(1);
  }
  const loginData = await loginRes.json();
  const token = loginData.token;

  console.log('Got token, sending PUT request...');
  
  const updateRes = await fetch('http://localhost:5001/api/cars/15', {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const text = await updateRes.text();
  console.log('STATUS:', updateRes.status);
  console.log('RESPONSE:', text);
  process.exit(0);
}

testApi();
