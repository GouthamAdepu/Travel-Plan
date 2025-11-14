import express from 'express';
import { body, validationResult } from 'express-validator';
import { randomBytes } from 'crypto';
import Itinerary from '../models/Itinerary.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/',
  authenticate,
  body('tripId').notEmpty(),
  body('activity').trim().notEmpty(),
  body('location').trim().notEmpty(),
  body('date').isISO8601(),
  body('startTime').notEmpty(),
  body('endTime').notEmpty(),
  body('estimatedCost').isNumeric(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { tripId, activity, location, date, startTime, endTime, estimatedCost, notes } = req.body;

      const itineraryId = randomBytes(16).toString('hex');

      const itinerary = new Itinerary({
        itineraryId,
        tripId,
        day: 1, // Default day, should be calculated based on date
        activity,
        location,
        startTime,
        endTime,
        costPerNight: parseFloat(estimatedCost),
        notes: notes || ''
      });

      await itinerary.save();

      res.status(201).json(itinerary);
    } catch (error) {
      console.error('Create itinerary error:', error);
      res.status(500).json({ error: 'Failed to create itinerary entry' });
    }
  }
);

router.get('/trip/:tripId', authenticate, async (req, res) => {
  try {
    const itinerary = await Itinerary.find({ tripId: req.params.tripId });
    res.json(itinerary);
  } catch (error) {
    console.error('Get itinerary error:', error);
    res.status(500).json({ error: 'Failed to fetch itinerary' });
  }
});

export default router;