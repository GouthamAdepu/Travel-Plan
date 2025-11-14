import express from 'express';
import { body, validationResult } from 'express-validator';
import { randomBytes } from 'crypto';
import Expense from '../models/Expense.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/',
  authenticate,
  body('tripId').notEmpty(),
  body('category').trim().notEmpty(),
  body('amount').isNumeric(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { tripId, category, amount, note } = req.body;

      const expenseId = randomBytes(16).toString('hex');

      const expense = new Expense({
        expenseId,
        tripId,
        category,
        amount: parseFloat(amount),
        note: note || ''
      });

      await expense.save();

      res.status(201).json(expense);
    } catch (error) {
      console.error('Create expense error:', error);
      res.status(500).json({ error: 'Failed to create expense' });
    }
  }
);

router.get('/trip/:tripId', authenticate, async (req, res) => {
  try {
    const expenses = await Expense.find({ tripId: req.params.tripId });
    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

export default router;
