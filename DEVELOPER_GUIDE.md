# Travel Planner - Developer Guide

## Architecture Overview

### Frontend Architecture
- **Plain HTML + Vanilla JavaScript** - No frameworks, minimal dependencies
- **Tailwind CSS** for styling
- **Client-side routing** via URL parameters
- **LocalStorage** for auth token persistence
- **Fetch API** for HTTP requests

### Backend Architecture
- **Node.js + Express** - ES modules
- **MongoDB + Mongoose** - Data persistence
- **JWT** authentication
- **Gemini AI** integration for itinerary suggestions

### Security Best Practices
- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens with 7-day expiration
- Rate limiting on auth endpoints
- Input validation with express-validator
- Helmet security headers
- CORS configuration

## Extending the Codebase

### Adding a New Page

1. Create HTML file in `frontend/`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <link rel="stylesheet" href="/styles/output.css">
</head>
<body>
  <script src="/js/common.js"></script>
</body>
</html>
```

2. Add route to sitemap generation in `server.js`

### Adding a New API Endpoint

1. Create route file in `backend/routes/`:
```javascript
import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/endpoint', authenticate, async (req, res) => {
  // Implementation
});

export default router;
```

2. Import and use in `server.js`:
```javascript
import newRoutes from './routes/newroutes.js';
app.use('/api/new', newRoutes);
```

### Adding a New Model

1. Create model in `backend/models/`:
```javascript
import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  field: { type: String, required: true }
});

export default mongoose.model('ModelName', schema);
```

2. Update seed script if needed

## Deployment Guide

### Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=your-mongo-uri
heroku config:set JWT_SECRET=your-secret
heroku config:set GEMINI_API_KEY=your-key

# Deploy
git push heroku main

# Scale dynos
heroku ps:scale web=1
```

### Render

1. Create new Web Service
2. Connect GitHub repository
3. Build command: `npm install && npm run build:css`
4. Start command: `npm start`
5. Add environment variables in dashboard

### Oracle Cloud

1. Create Compute Instance (Always Free tier available)
2. Install Node.js and MongoDB
3. Clone repository
4. Set up environment variables
5. Use PM2 for process management:

```bash
npm install -g pm2
pm2 start backend/server.js --name travel-planner
pm2 startup
pm2 save
```

### AWS EC2

1. Launch t2.micro instance (Free tier)
2. Install Node.js, MongoDB
3. Clone and configure
4. Set up Nginx as reverse proxy
5. Use PM2 for process management

## Performance Optimization

- Enable gzip compression
- Implement caching headers
- Use CDN for static assets
- Database indexing on frequently queried fields
- Lazy loading for images

## Monitoring & Logging

Recommended tools:
- PM2 for process monitoring
- Winston for logging
- Sentry for error tracking
- MongoDB Atlas monitoring

## CI/CD

See `.github/workflows/node.yml` for automated testing on push.

## Environment Variables

Required:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `GEMINI_API_KEY` - Gemini AI API key

Optional:
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Email configuration
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## Troubleshooting

**Issue**: Tailwind CSS not updating
**Solution**: Run `npm run build:css` to regenerate

**Issue**: MongoDB connection failed
**Solution**: Check MONGODB_URI format and network access

**Issue**: JWT token invalid
**Solution**: Verify JWT_SECRET matches across restarts

**Issue**: Gemini API errors
**Solution**: Verify API key and check quota limits

## Testing Strategy

- Unit tests for authentication
- Integration tests for API endpoints
- Budget calculation tests
- Frontend accessibility tests

Run tests: `npm test`

## Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License - See LICENSE file for details
