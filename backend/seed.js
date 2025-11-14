import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { randomBytes } from 'crypto';

import User from './models/User.js';
import Trip from './models/Trip.js';
import Itinerary from './models/Itinerary.js';
import Accommodation from './models/Accommodation.js';
import Expense from './models/Expense.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Trip.deleteMany({});
    await Itinerary.deleteMany({});
    await Accommodation.deleteMany({});
    await Expense.deleteMany({});

    console.log('Cleared existing data');

    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
      {
        userId: randomBytes(16).toString('hex'),
        name: 'Admin User',
        email: 'admin@travelplanner.com',
        password: hashedPassword,
        contact: '+1-555-0100',
        isAdmin: true
      },
      {
        userId: randomBytes(16).toString('hex'),
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        contact: '+1-555-0101'
      },
      {
        userId: randomBytes(16).toString('hex'),
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: hashedPassword,
        contact: '+1-555-0102'
      }
    ];

    await User.insertMany(users);
    console.log('Created 3 users (including 1 admin)');

    const trips = [
      {
        tripId: randomBytes(16).toString('hex'),
        userId: users[1].userId,
        title: 'Tokyo Adventure',
        destination: 'Tokyo, Japan',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-10'),
        totalBudget: 3000,
        createdAt: new Date('2024-01-15')
      },
      {
        tripId: randomBytes(16).toString('hex'),
        userId: users[1].userId,
        title: 'Paris Romance',
        destination: 'Paris, France',
        startDate: new Date('2024-08-15'),
        endDate: new Date('2024-08-22'),
        totalBudget: 4000,
        createdAt: new Date('2024-02-20')
      },
      {
        tripId: randomBytes(16).toString('hex'),
        userId: users[2].userId,
        title: 'New York Business Trip',
        destination: 'New York, USA',
        startDate: new Date('2024-05-10'),
        endDate: new Date('2024-05-15'),
        totalBudget: 2500,
        createdAt: new Date('2024-03-01')
      },
      {
        tripId: randomBytes(16).toString('hex'),
        userId: users[2].userId,
        title: 'Bali Retreat',
        destination: 'Bali, Indonesia',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-09-14'),
        totalBudget: 3500,
        createdAt: new Date('2024-03-15')
      },
      {
        tripId: randomBytes(16).toString('hex'),
        userId: users[1].userId,
        title: 'London Cultural Tour',
        destination: 'London, UK',
        startDate: new Date('2024-07-05'),
        endDate: new Date('2024-07-12'),
        totalBudget: 3200,
        createdAt: new Date('2024-04-01')
      }
    ];

    await Trip.insertMany(trips);
    console.log('Created 5 trips');

    const itineraries = [
      {
        itineraryId: randomBytes(16).toString('hex'),
        tripId: trips[0].tripId,
        hotelName: 'Shibuya Crossing Tour',
        address: 'Shibuya, Tokyo',
        checkInDate: new Date('2024-06-02'),
        checkOutDate: new Date('2024-06-02'),
        costPerNight: 50
      },
      {
        itineraryId: randomBytes(16).toString('hex'),
        tripId: trips[0].tripId,
        hotelName: 'Mount Fuji Day Trip',
        address: 'Mount Fuji',
        checkInDate: new Date('2024-06-05'),
        checkOutDate: new Date('2024-06-05'),
        costPerNight: 120
      },
      {
        itineraryId: randomBytes(16).toString('hex'),
        tripId: trips[1].tripId,
        hotelName: 'Eiffel Tower Visit',
        address: 'Champ de Mars, Paris',
        checkInDate: new Date('2024-08-16'),
        checkOutDate: new Date('2024-08-16'),
        costPerNight: 30
      },
      {
        itineraryId: randomBytes(16).toString('hex'),
        tripId: trips[1].tripId,
        hotelName: 'Louvre Museum',
        address: 'Rue de Rivoli, Paris',
        checkInDate: new Date('2024-08-17'),
        checkOutDate: new Date('2024-08-17'),
        costPerNight: 25
      }
    ];

    await Itinerary.insertMany(itineraries);
    console.log('Created itinerary entries');

    const accommodations = [
      {
        accommodationId: randomBytes(16).toString('hex'),
        tripId: trips[0].tripId,
        hotelName: 'Shinjuku Prince Hotel',
        address: '1-30-1 Kabukicho, Shinjuku, Tokyo',
        checkInDate: new Date('2024-06-01'),
        checkOutDate: new Date('2024-06-10'),
        costPerNight: 150
      },
      {
        accommodationId: randomBytes(16).toString('hex'),
        tripId: trips[1].tripId,
        hotelName: 'Hotel de Paris',
        address: '15 Rue de la Paix, Paris',
        checkInDate: new Date('2024-08-15'),
        checkOutDate: new Date('2024-08-22'),
        costPerNight: 200
      },
      {
        accommodationId: randomBytes(16).toString('hex'),
        tripId: trips[2].tripId,
        hotelName: 'Manhattan Plaza Hotel',
        address: '123 Broadway, New York',
        checkInDate: new Date('2024-05-10'),
        checkOutDate: new Date('2024-05-15'),
        costPerNight: 250
      }
    ];

    await Accommodation.insertMany(accommodations);
    console.log('Created accommodation entries');

    const expenses = [
      {
        expenseId: randomBytes(16).toString('hex'),
        tripId: trips[0].tripId,
        category: 'Food',
        amount: 500,
        note: 'Restaurants and street food'
      },
      {
        expenseId: randomBytes(16).toString('hex'),
        tripId: trips[0].tripId,
        category: 'Transportation',
        amount: 200,
        note: 'Subway passes and taxis'
      },
      {
        expenseId: randomBytes(16).toString('hex'),
        tripId: trips[1].tripId,
        category: 'Food',
        amount: 600,
        note: 'Fine dining'
      },
      {
        expenseId: randomBytes(16).toString('hex'),
        tripId: trips[1].tripId,
        category: 'Shopping',
        amount: 300,
        note: 'Souvenirs'
      }
    ];

    await Expense.insertMany(expenses);
    console.log('Created expense entries');

    console.log('\nSeed data summary:');
    console.log('- 3 users (1 admin, 2 regular)');
    console.log('- 5 trips across different destinations');
    console.log('- Multiple itinerary and accommodation entries');
    console.log('- Sample expenses');
    console.log('\nUse only the data model as specified. Do NOT add or remove fields.');
    console.log('\nTest credentials:');
    console.log('Admin: admin@travelplanner.com / password123');
    console.log('User 1: john@example.com / password123');
    console.log('User 2: jane@example.com / password123');

    await mongoose.connection.close();
    console.log('\nDatabase seeded successfully!');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
