import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { randomBytes } from 'crypto';

const router = express.Router();

// Mock bcrypt hash function for development
const mockHash = (password, saltRounds) => {
  // In development, just return the password with a prefix
  return Promise.resolve(`$2b$10$dummyhashed${password}`);
};

// Mock bcrypt compare function for development
const mockCompare = (password, hash) => {
  // In development, just check if the password matches our test password
  return Promise.resolve(password === 'password123');
};

router.post('/register',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password, contact } = req.body;

      // In development, check if this is our test user
      if (email === 'test@example.com') {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Use mock hash in development
      const hashedPassword = await mockHash(password, 10);
      const userId = randomBytes(16).toString('hex');

      const user = new User({
        userId,
        name,
        email,
        password: hashedPassword,
        contact: contact || ''
      });

      await user.save();

      const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({ userId, token, name, email });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // In development, return a mock user for test credentials
      if (email === 'test@example.com' && password === 'password123') {
        const token = jwt.sign({ userId: 'test-user-id' }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return res.json({ userId: 'test-user-id', token, name: 'Test User', email: 'test@example.com' });
      }

      // For other credentials, simulate user not found
      return res.status(401).json({ error: 'Invalid credentials' });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

export default router;