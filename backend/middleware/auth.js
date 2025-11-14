import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  // In development mode, allow bypassing authentication when MongoDB is not available
  if (process.env.NODE_ENV === 'development') {
    // Check if this is a request that should be bypassed
    const bypassPaths = [
      '/api/trips',
      '/api/itinerary',
      '/api/accommodation',
      '/api/expenses'
    ];
    
    // For trips, we need to check the full original URL since the middleware
    // is applied to the router which has a base path
    const fullPath = req.originalUrl || req.url;
    const shouldBypass = bypassPaths.some(path => fullPath.startsWith(path));
    
    if (shouldBypass) {
      // Set the same userId as used in the login route for test credentials
      req.userId = 'test-user-id';
      return next();
    }
  }
  
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};