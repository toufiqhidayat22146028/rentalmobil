const app = require('./src/server.js');
const request = require('supertest');

async function run() {
  try {
    const res = await request(app)
      .put('/api/cars/15') // Daihatsu Ayla is ID 15
      .send({
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
        specs: {}
      });
    console.log('STATUS:', res.status);
    console.log('BODY:', res.body);
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}
run();
