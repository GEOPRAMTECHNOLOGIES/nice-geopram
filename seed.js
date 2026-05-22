// lightweight seed script to add sample services when run manually
require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('./models/Service');
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/nice-geopram';
mongoose.connect(MONGO).then(async ()=>{
  console.log('connected');
  await Service.create({ title: 'Premium Safari Photo', description: 'A curated safari photography service', price: 5000, image: 'https://kenyamycountry.com/lion.png' });
  await Service.create({ title: 'Map Digitization', description: 'Convert paper maps to digital format', price: 3000, image: 'https://github.com/favicon.ico' });
  console.log('seeded');
  process.exit(0);
}).catch(e=>{ console.error(e); process.exit(1); });
