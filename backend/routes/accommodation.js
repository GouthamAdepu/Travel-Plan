import express from 'express';
import { body, validationResult } from 'express-validator';
import { randomBytes } from 'crypto';
import Accommodation from '../models/Accommodation.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/',
  authenticate,
  body('tripId').notEmpty(),
  body('hotelName').trim().notEmpty(),
  body('address').trim().notEmpty(),
  body('checkInDate').isISO8601(),
  body('checkOutDate').isISO8601(),
  body('costPerNight').isNumeric(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { tripId, hotelName, address, checkInDate, checkOutDate, costPerNight } = req.body;

      const accommodationId = randomBytes(16).toString('hex');

      const accommodation = new Accommodation({
        accommodationId,
        tripId,
        hotelName,
        address,
        checkInDate: new Date(checkInDate),
        checkOutDate: new Date(checkOutDate),
        costPerNight: parseFloat(costPerNight)
      });

      await accommodation.save();

      res.status(201).json(accommodation);
    } catch (error) {
      console.error('Create accommodation error:', error);
      res.status(500).json({ error: 'Failed to create accommodation' });
    }
  }
);

router.get('/trip/:tripId', authenticate, async (req, res) => {
  try {
    const accommodations = await Accommodation.find({ tripId: req.params.tripId });
    res.json(accommodations);
  } catch (error) {
    console.error('Get accommodation error:', error);
    res.status(500).json({ error: 'Failed to fetch accommodations' });
  }
});

export default router;
