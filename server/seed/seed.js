import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Hospital from '../models/Hospital.js';
import Alert from '../models/Alert.js';
import Incident from '../models/Incident.js';

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/idmrs';

const hospitals = [
  // Pune Hospitals (Primary - Near your location)
  { name: 'Ruby Hall Clinic', address: '40, Sassoon Road, Pune - 411001', contact: '+91-20-2613-5555', lat: 18.5089, lng: 73.8553 },
  { name: 'Jehangir Hospital', address: '32, Sassoon Road, Pune - 411001', contact: '+91-20-2605-5000', lat: 18.5065, lng: 73.8530 },
  { name: 'KEM Hospital', address: 'Rasta Peth, Pune - 411011', contact: '+91-20-2612-9801', lat: 18.5157, lng: 73.8507 },
  { name: 'Deenanath Mangeshkar Hospital', address: 'Erandwane, Pune - 411004', contact: '+91-20-2560-3000', lat: 18.5089, lng: 73.8361 },
  { name: 'Aditya Birla Memorial Hospital', address: 'Chinchwad, Pune - 411033', contact: '+91-20-3985-8500', lat: 18.6298, lng: 73.8131 },
  { name: 'Pune Institute of Medical Sciences', address: 'Bibwewadi, Pune - 411037', contact: '+91-20-2426-1600', lat: 18.4793, lng: 73.8567 },
  { name: 'Sancheti Hospital', address: 'Thube Park, Shivajinagar, Pune - 411005', contact: '+91-20-2553-3333', lat: 18.5314, lng: 73.8479 },
  { name: 'Noble Hospital', address: 'Magarpatta City, Pune - 411013', contact: '+91-20-3097-1000', lat: 18.5196, lng: 73.9300 },
  
  // Major Hospitals in Other Cities (Secondary)
  { name: 'Apollo Hospital', address: 'Kolkata', contact: '+91-33-2320-3040', lat: 22.5726, lng: 88.3639 },
  { name: 'Fortis Hospital', address: 'Delhi', contact: '+91-11-4277-6222', lat: 28.6139, lng: 77.2090 },
  { name: 'AIIMS', address: 'Delhi', contact: '+91-11-2658-8500', lat: 28.5672, lng: 77.2100 },
  { name: 'SSKM Hospital', address: '244, AJC Bose Road, Kolkata', contact: '+91-33-2223-5555', lat: 22.5354, lng: 88.3645 },
  
  // Mumbai Hospitals (Nearby major city)
  { name: 'Kokilaben Dhirubhai Ambani Hospital', address: 'Andheri West, Mumbai - 400053', contact: '+91-22-4269-6969', lat: 19.1136, lng: 72.8697 },
  { name: 'Lilavati Hospital', address: 'Bandra West, Mumbai - 400050', contact: '+91-22-2675-1000', lat: 19.0596, lng: 72.8295 },
  { name: 'Breach Candy Hospital', address: 'Bhulabhai Desai Road, Mumbai - 400026', contact: '+91-22-2367-8888', lat: 18.9747, lng: 72.8106 }
];

const alerts = [
  {
    type: 'flood',
    severity: 'high',
    region: 'Kolkata, West Bengal',
    description: 'Severe flooding in low-lying areas due to heavy rainfall. Roads waterlogged, transport disrupted.',
    location: { lat: 22.5726, lng: 88.3639, address: 'Kolkata, West Bengal' },
    affectedRadius: 8000,
    evacuationRequired: true,
    isActive: true,
    emergencyContacts: [
      { name: 'Kolkata Disaster Management', phone: '+91-33-2214-5555', role: 'Emergency Coordinator' }
    ]
  },
  {
    type: 'cyclone',
    severity: 'critical',
    region: 'Odisha Coast',
    description: 'Severe cyclonic storm approaching coastal districts. Wind speed 120+ kmph expected.',
    location: { lat: 20.2961, lng: 85.8245, address: 'Bhubaneswar, Odisha' },
    affectedRadius: 15000,
    evacuationRequired: true,
    isActive: true,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // expires in 24 hours
    emergencyContacts: [
      { name: 'Odisha Emergency Response', phone: '+91-674-233-9999', role: 'State Coordinator' }
    ]
  },
  {
    type: 'landslide',
    severity: 'medium',
    region: 'Darjeeling Hills',
    description: 'Landslide risk due to continuous rainfall in hill areas. Avoid steep slopes.',
    location: { lat: 27.0238, lng: 88.2663, address: 'Darjeeling, West Bengal' },
    affectedRadius: 5000,
    evacuationRequired: false,
    isActive: true,
    emergencyContacts: [
      { name: 'Hill Station Emergency', phone: '+91-354-225-4444', role: 'Local Coordinator' }
    ]
  },
  {
    type: 'heatwave',
    severity: 'medium',
    region: 'Delhi NCR',
    description: 'Extreme heat conditions (45°C+). Stay hydrated, avoid outdoor activities during peak hours.',
    location: { lat: 28.6139, lng: 77.2090, address: 'New Delhi' },
    affectedRadius: 25000,
    evacuationRequired: false,
    isActive: true,
    emergencyContacts: [
      { name: 'Delhi Health Emergency', phone: '+91-11-2333-7777', role: 'Health Coordinator' }
    ]
  }
];

const incidents = [
  {
    type: 'flood',
    description: 'Road completely submerged, vehicles stranded',
    location: { lat: 22.5426, lng: 88.3439 }
  },
  {
    type: 'landslide',
    description: 'Small landslide blocking mountain road',
    location: { lat: 27.0338, lng: 88.2563 }
  }
];

async function run() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Hospital.deleteMany({});
    await Alert.deleteMany({});
    await Incident.deleteMany({});

    // Insert seed data
    await Hospital.insertMany(hospitals);
    console.log(`Seeded ${hospitals.length} hospitals`);

    await Alert.insertMany(alerts);
    console.log(`Seeded ${alerts.length} alerts`);

    await Incident.insertMany(incidents);
    console.log(`Seeded ${incidents.length} incidents`);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});


