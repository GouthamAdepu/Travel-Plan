import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../backend/server.js';
import User from '../backend/models/User.js';
import Trip from '../backend/models/Trip.js';
import Itinerary from '../backend/models/Itinerary.js';
import Accommodation from '../backend/models/Accommodation.js';
import Expense from '../backend/models/Expense.js';

let server;
let authToken;
let userId;
let tripId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-test');
  await User.deleteMany({});
  await Trip.deleteMany({});
  await Itinerary.deleteMany({});
  await Accommodation.deleteMany({});
  await Expense.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
  if (server) server.close();
});

describe('Auth API', () => {
  test('POST /api/auth/register - successful registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        contact: '+1-555-0000'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('userId');
    expect(res.body.email).toBe('test@example.com');

    authToken = res.body.token;
    userId = res.body.userId;
  });

  test('POST /api/auth/register - duplicate email fails', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User 2',
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.status).toBe(400);
  });

  test('POST /api/auth/login - successful login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.userId).toBe(userId);
  });

  test('POST /api/auth/login - invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

    expect(res.status).toBe(401);
  });
});

describe('Trips API', () => {
  test('POST /api/trips - create trip successfully', async () => {
    const res = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Tokyo Adventure',
        destination: 'Tokyo, Japan',
        startDate: '2024-06-01',
        endDate: '2024-06-10',
        totalBudget: 3000
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Tokyo Adventure');
    expect(res.body.destination).toBe('Tokyo, Japan');
    expect(res.body).toHaveProperty('tripId');

    tripId = res.body.tripId;
  });

  test('POST /api/trips - date validation (start > end)', async () => {
    const res = await request(app)
      .post('/api/trips')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Invalid Trip',
        destination: 'Somewhere',
        startDate: '2024-12-31',
        endDate: '2024-01-01',
        totalBudget: 1000
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Start date');
  });

  test('GET /api/trips/user/:userId - get user trips', async () => {
    const res = await request(app)
      .get(`/api/trips/user/${userId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('GET /api/trips/:id - get trip by id', async () => {
    const res = await request(app)
      .get(`/api/trips/${tripId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.tripId).toBe(tripId);
    expect(res.body).toHaveProperty('itinerary');
    expect(res.body).toHaveProperty('accommodation');
  });
});

describe('Budget Calculation', () => {
  beforeAll(async () => {
    await Itinerary.create({
      itineraryId: 'itin1',
      tripId: tripId,
      hotelName: 'Activity 1',
      address: 'Address 1',
      checkInDate: new Date('2024-06-02'),
      checkOutDate: new Date('2024-06-02'),
      costPerNight: 50
    });

    await Itinerary.create({
      itineraryId: 'itin2',
      tripId: tripId,
      hotelName: 'Activity 2',
      address: 'Address 2',
      checkInDate: new Date('2024-06-05'),
      checkOutDate: new Date('2024-06-05'),
      costPerNight: 120
    });

    await Accommodation.create({
      accommodationId: 'acc1',
      tripId: tripId,
      hotelName: 'Tokyo Hotel',
      address: 'Tokyo Address',
      checkInDate: new Date('2024-06-01'),
      checkOutDate: new Date('2024-06-10'),
      costPerNight: 150
    });

    await Expense.create({
      expenseId: 'exp1',
      tripId: tripId,
      category: 'Food',
      amount: 500,
      note: 'Meals'
    });

    await Expense.create({
      expenseId: 'exp2',
      tripId: tripId,
      category: 'Transportation',
      amount: 200,
      note: 'Trains'
    });
  });

  test('GET /api/trips/:id/budget - calculate budget correctly', async () => {
    const res = await request(app)
      .get(`/api/trips/${tripId}/budget`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.activitiesTotal).toBe(170); // 50 + 120
    expect(res.body.accommodationTotal).toBe(1350); // 150 * 9 nights
    expect(res.body.expensesTotal).toBe(700); // 500 + 200
    expect(res.body.totalBudget).toBe(2220); // 170 + 1350 + 700
  });
});
