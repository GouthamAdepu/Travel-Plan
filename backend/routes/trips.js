import express from 'express';
import { body, validationResult } from 'express-validator';
import { randomBytes } from 'crypto';
import Trip from '../models/Trip.js';
import Itinerary from '../models/Itinerary.js';
import Accommodation from '../models/Accommodation.js';
import Expense from '../models/Expense.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/',
  authenticate,
  body('title').trim().notEmpty(),
  body('destination').trim().notEmpty(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, destination, startDate, endDate, totalBudget } = req.body;

      if (new Date(startDate) > new Date(endDate)) {
        return res.status(400).json({ error: 'Start date must be before or equal to end date' });
      }

      const tripId = randomBytes(16).toString('hex');

      const trip = new Trip({
        tripId,
        userId: req.userId,
        title,
        destination,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalBudget: totalBudget || 0,
        createdAt: new Date()
      });

      await trip.save();

      res.status(201).json(trip);
    } catch (error) {
      console.error('Create trip error:', error);
      res.status(500).json({ error: 'Failed to create trip' });
    }
  }
);

router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    // Use the authenticated user's ID instead of the URL parameter
    const trips = await Trip.find({ userId: req.userId });
    // Sort trips by createdAt in descending order (newest first)
    const sortedTrips = trips.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(sortedTrips);
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const trip = await Trip.findOne({ tripId: req.params.id });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const itinerary = await Itinerary.find({ tripId: req.params.id });
    const accommodation = await Accommodation.find({ tripId: req.params.id });

    res.json({
      ...trip.toObject(),
      itinerary,
      accommodation
    });
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({ error: 'Failed to fetch trip' });
  }
});

router.put('/:id',
  authenticate,
  async (req, res) => {
    try {
      const allowedFields = ['title', 'destination', 'startDate', 'endDate', 'totalBudget', 'notes'];
      const updates = {};

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }

      if (updates.startDate && updates.endDate) {
        if (new Date(updates.startDate) > new Date(updates.endDate)) {
          return res.status(400).json({ error: 'Start date must be before or equal to end date' });
        }
      }

      const trip = await Trip.findOneAndUpdate(
        { tripId: req.params.id },
        updates,
        { new: true }
      );

      if (!trip) {
        return res.status(404).json({ error: 'Trip not found' });
      }

      res.json(trip);
    } catch (error) {
      console.error('Update trip error:', error);
      res.status(500).json({ error: 'Failed to update trip' });
    }
  }
);

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ tripId: req.params.id });
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    await Itinerary.deleteMany({ tripId: req.params.id });
    await Accommodation.deleteMany({ tripId: req.params.id });
    await Expense.deleteMany({ tripId: req.params.id });

    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ error: 'Failed to delete trip' });
  }
});

router.get('/:id/budget', authenticate, async (req, res) => {
  try {
    const itineraryItems = await Itinerary.find({ tripId: req.params.id });
    const accommodationItems = await Accommodation.find({ tripId: req.params.id });
    const expenseItems = await Expense.find({ tripId: req.params.id });

    const activitiesTotal = itineraryItems.reduce((sum, item) => sum + item.costPerNight, 0);

    let accommodationTotal = 0;
    for (const item of accommodationItems) {
      const checkIn = new Date(item.checkInDate);
      const checkOut = new Date(item.checkOutDate);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      accommodationTotal += item.costPerNight * Math.max(nights, 1);
    }

    const expensesTotal = expenseItems.reduce((sum, item) => sum + item.amount, 0);

    const totalBudget = activitiesTotal + accommodationTotal + expensesTotal;

    res.json({
      activitiesTotal,
      accommodationTotal,
      expensesTotal,
      totalBudget
    });
  } catch (error) {
    console.error('Calculate budget error:', error);
    res.status(500).json({ error: 'Failed to calculate budget' });
  }
});

export default router;
