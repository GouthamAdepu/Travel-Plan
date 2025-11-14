import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import tripRoutes from './routes/trips.js';
import itineraryRoutes from './routes/itinerary.js';
import accommodationRoutes from './routes/accommodation.js';
import expenseRoutes from './routes/expenses.js';
import adminRoutes from './routes/admin.js';
import aiRoutes from './routes/ai.js';
import contactRoutes from './routes/contact.js';
import Trip from './models/Trip.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// In development mode, skip MongoDB connection
if (process.env.NODE_ENV !== 'development') {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
      console.error('MongoDB connection error:', err);
      console.log('Running in limited mode without database connection');
    });
} else {
  console.log('Running in development mode with mock models');
}

app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many requests from this IP, please try again later'
});

app.use('/api/auth/register', authLimiter);
app.use('/api/auth/login', authLimiter);

app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/itinerary', itineraryRoutes);
app.use('/api/accommodation', accommodationRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api', contactRoutes);

app.get('/sitemap.xml', async (req, res) => {
  const baseUrl = `http://localhost:${PORT}`;
  const pages = [
    '/',
    '/features.html',
    '/pricing.html',
    '/about.html',
    '/blog/index.html',
    '/docs/index.html',
    '/faq.html',
    '/careers.html',
    '/contact.html',
    '/privacy.html',
    '/terms.html'
  ];

  let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const page of pages) {
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}${page}</loc>\n`;
    sitemap += '    <changefreq>weekly</changefreq>\n';
    sitemap += '    <priority>0.8</priority>\n';
    sitemap += '  </url>\n';
  }

  sitemap += '</urlset>';

  res.header('Content-Type', 'application/xml');
  res.send(sitemap);
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nSitemap: http://localhost:${PORT}/sitemap.xml`);
});

app.get('/manifest.json', (req, res) => {
  res.json({
    name: 'Travel Planner Dashboard',
    short_name: 'TravelPlan',
    description: 'AI-powered travel planning application',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/assets/icon-192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/assets/icon-512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  });
});

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
