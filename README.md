# Travel Planner Dashboard

AI-powered travel planning application with intelligent itinerary suggestions, budget management, and comprehensive trip organization.

## Features

- **AI Itinerary Suggestions**: Powered by Gemini AI for personalized travel recommendations
- **Budget Management**: Track accommodations, activities, and expenses
- **Trip Organization**: Create, edit, and manage multiple trips
- **Printable Itineraries**: Export trip details for offline access
- **Admin Dashboard**: Analytics and user management (admin only)
- **Dark Mode**: Full dark mode support
- **Multi-language**: English and Spanish (skeleton)
- **PWA Ready**: Install as progressive web app

## Tech Stack

**Frontend**: Plain HTML + Vanilla JavaScript + Tailwind CSS (no frameworks, no build steps except Tailwind CLI)

**Backend**: Node.js + Express (ES modules)

**Database**: MongoDB + Mongoose

**Authentication**: JWT + bcrypt

**AI**: Gemini API integration

**Tests**: Jest

## Data Models

**Use only the data model as specified. Do NOT add or remove fields.**

```javascript
Users: { userId, name, email, password, contact }
Trips: { tripId, userId, title, destination, startDate, endDate, totalBudget, createdAt }
Itinerary: { itineraryId, tripId, hotelName, address, checkInDate, checkOutDate, costPerNight }
Accommodation: { accommodationId, tripId, hotelName, address, checkInDate, checkOutDate, costPerNight }
Expenses: { expenseId, tripId, category, amount, note }
```

## Installation

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Setup

1. **Clone and install dependencies**

```bash
npm install
```

2. **Configure environment**

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env`:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/travel-planner
JWT_SECRET=your-super-secret-jwt-key-change-in-production
GEMINI_API_KEY=your-gemini-api-key-here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password
PORT=3000
```

3. **Generate Tailwind CSS**

```bash
npm run build:css
```

4. **Seed database**

```bash
npm run seed
```

This creates:
- 3 users (1 admin: admin@travelplanner.com, 2 regular users)
- 5 sample trips
- Itinerary, accommodation, and expense entries

**Test credentials:**
- Admin: `admin@travelplanner.com` / `password123`
- User 1: `john@example.com` / `password123`
- User 2: `jane@example.com` / `password123`

5. **Start development server**

```bash
npm run dev
```

Visit http://localhost:3000

## Production Deployment

```bash
npm run build:css
NODE_ENV=production npm start
```

## API Endpoints

### Authentication

**Register**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","contact":"+1-555-0000"}'
```

Response:
```json
{"userId":"abc123","token":"jwt-token","name":"John Doe","email":"john@example.com"}
```

**Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Trips

**Create Trip**
```bash
curl -X POST http://localhost:3000/api/trips \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Tokyo Adventure","destination":"Tokyo, Japan","startDate":"2024-06-01","endDate":"2024-06-10","totalBudget":3000}'
```

**Get User Trips**
```bash
curl http://localhost:3000/api/trips/user/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get Trip by ID (with embedded itinerary and accommodation)**
```bash
curl http://localhost:3000/api/trips/TRIP_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Update Trip**
```bash
curl -X PUT http://localhost:3000/api/trips/TRIP_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Updated Title","totalBudget":3500}'
```

**Delete Trip**
```bash
curl -X DELETE http://localhost:3000/api/trips/TRIP_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Budget

**Calculate Trip Budget**
```bash
curl http://localhost:3000/api/trips/TRIP_ID/budget \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response:
```json
{
  "activitiesTotal": 170,
  "accommodationTotal": 1350,
  "expensesTotal": 700,
  "totalBudget": 2220
}
```

### AI Itinerary Suggestion

**AI itinerary suggestion must call Gemini AI using the provided key.**

```bash
curl -X POST http://localhost:3000/api/ai/itinerary-suggest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"destination":"Paris, France","dates":{"start":"2024-08-15","end":"2024-08-22"},"preferences":"Art museums and French cuisine"}'
```

Response:
```json
{
  "suggestions": [
    {"name":"Louvre Museum Tour","location":"Rue de Rivoli, Paris","date":"2024-08-16","estimatedCost":25},
    {"name":"Eiffel Tower Visit","location":"Champ de Mars, Paris","date":"2024-08-17","estimatedCost":30}
  ]
}
```

### Admin

**Get Stats** (Admin only)
```bash
curl http://localhost:3000/api/admin/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

Response:
```json
{
  "totalTrips": 5,
  "totalUsers": 3,
  "commonDestinations": ["Tokyo, Japan", "Paris, France", "New York, USA"]
}
```

## Testing

Run tests:

```bash
npm test
```

Tests cover:
- User registration and login
- Trip creation with date validation
- Budget calculation

## Gemini AI Feature

**All frontend logic is client-side JS and HTML. No frameworks like React—only plain JS, Tailwind, and minimal dependencies.**

The AI suggestion feature uses Gemini API server-side:

1. User clicks "AI Suggest" in trip detail page
2. Frontend calls `/api/ai/itinerary-suggest` with destination, dates, preferences
3. Backend calls Gemini API with structured prompt
4. Gemini returns activity suggestions
5. User can add suggestions directly to itinerary

Example request:
```json
{
  "destination": "Rome, Italy",
  "dates": {"start": "2024-09-01", "end": "2024-09-07"},
  "preferences": "Historical sites and Italian food"
}
```

Example response:
```json
{
  "suggestions": [
    {"name":"Colosseum Tour","location":"Piazza del Colosseo, Rome","date":"2024-09-02","estimatedCost":35},
    {"name":"Vatican Museums","location":"Vatican City","date":"2024-09-03","estimatedCost":40},
    {"name":"Pasta Making Class","location":"Trastevere, Rome","date":"2024-09-04","estimatedCost":75}
  ]
}
```

## Admin Access

The seed script creates an admin user with `isAdmin` flag (seed-only data, not in canonical model).

Admin email: `admin@travelplanner.com`

Admin routes check for either:
- `isAdmin` flag in user document (from seed)
- Email in ADMIN_EMAILS list in backend/routes/admin.js

Admin dashboard accessible at `/app/admin/dashboard.html` includes:
- User list
- Trip analytics
- Top destinations chart (Chart.js)

## Project Structure

```
├── backend/
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── server.js        # Express server
│   └── seed.js          # Database seeder
├── frontend/
│   ├── app/             # Protected app pages
│   ├── blog/            # Blog pages
│   ├── docs/            # Documentation
│   ├── js/              # JavaScript modules
│   ├── styles/          # Tailwind CSS
│   └── *.html           # Public pages
├── tests/               # Jest tests
├── content/             # Blog markdown
├── .env.example
├── package.json
├── tailwind.config.js
└── README.md
```

## Deployment

### Heroku

```bash
heroku create your-app-name
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-secret
heroku config:set GEMINI_API_KEY=your-key
git push heroku main
```

### Render

1. Create new Web Service
2. Connect repository
3. Build: `npm install && npm run build:css`
4. Start: `npm start`
5. Add environment variables

### Oracle Cloud / AWS

See `DEVELOPER_GUIDE.md` for detailed deployment instructions.

## Security

- Passwords hashed with bcrypt (salt rounds: 10)
- JWT tokens with 7-day expiry
- Rate limiting on auth endpoints
- Helmet security headers
- Input validation with express-validator
- CORS configured
- HTTPS recommended in production

## Accessibility

Full accessibility support:
- ARIA labels on interactive elements
- Keyboard navigation
- Focus states
- Screen reader compatibility
- Color contrast compliance

See `ACCESSIBILITY.md` for details.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## License

MIT

## Support

For issues or questions:
- GitHub Issues
- Email: support@travelplanner.com
- Documentation: http://localhost:3000/docs/

---

**Built with ❤️ for travelers worldwide**
