const app = require('./src/server');
const server = app.listen(5001, async () => {
  console.log('Server started for testing');
  
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

  const loginRes = await fetch('http://localhost:5001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@rentalmobil.com', password: 'admin123' })
  });
  
  if (!loginRes.ok) {
    console.log('Login failed:', await loginRes.text());
    process.exit(1);
  }
  const token = (await loginRes.json()).token;

  const updateRes = await fetch('http://localhost:5001/api/cars/15', {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  console.log('STATUS:', updateRes.status);
  console.log('RESPONSE:', await updateRes.text());
  
  server.close();
  process.exit(0);
});
