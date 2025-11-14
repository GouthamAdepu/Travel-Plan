import express from 'express';
import User from '../models/User.js';
import Trip from '../models/Trip.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

const ADMIN_EMAILS = ['admin@travelplanner.com'];

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ userId: req.userId });
    if (!user || (!ADMIN_EMAILS.includes(user.email) && !user.isAdmin)) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authorization failed' });
  }
};

router.get('/stats', authenticate, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTrips = await Trip.countDocuments();

    const destinationCounts = await Trip.aggregate([
      { $group: { _id: '$destination', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]);

    const commonDestinations = destinationCounts.map(d => d._id);

    res.json({
      totalTrips,
      totalUsers,
      commonDestinations
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/users', authenticate, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ _id: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/trips', authenticate, isAdmin, async (req, res) => {
  try {
    const trips = await Trip.find().sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    console.error('Get all trips error:', error);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

export default router;
