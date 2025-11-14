import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Mock AI suggestions for development
const mockSuggestions = [
  { name: 'City Walking Tour', location: 'Downtown Area', date: '', estimatedCost: 0 },
  { name: 'Local Museum Visit', location: 'Central Museum', date: '', estimatedCost: 25 },
  { name: 'Scenic Park Exploration', location: 'Central Park', date: '', estimatedCost: 0 },
  { name: 'Historic Landmark Tour', location: 'Old Town', date: '', estimatedCost: 15 },
  { name: 'Local Cuisine Experience', location: 'Popular Restaurant District', date: '', estimatedCost: 40 }
];

async function callGeminiAPI(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  // In development mode, return mock suggestions
  if (process.env.NODE_ENV === 'development') {
    // Add a small delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return JSON.stringify(mockSuggestions);
  }
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  // Updated to use the correct Gemini API endpoint with gemini-pro model
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

router.post('/itinerary-suggest',
  authenticate,
  body('destination').trim().notEmpty(),
  body('dates').isObject(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { destination, dates, preferences } = req.body;

      // In development mode, customize mock suggestions with destination
      if (process.env.NODE_ENV === 'development') {
        const customizedSuggestions = mockSuggestions.map(suggestion => ({
          ...suggestion,
          location: `${suggestion.location}, ${destination}`,
          date: dates.start
        }));
        
        return res.json({ suggestions: customizedSuggestions });
      }

      const prompt = `Create a detailed travel itinerary for ${destination} from ${dates.start} to ${dates.end}. 
Preferences: ${preferences || 'General tourism'}. 
Return a JSON array of activities with fields: name (activity name), location (specific address), date (YYYY-MM-DD), estimatedCost (number).
Return ONLY valid JSON, no markdown or extra text.`;

      const geminiResponse = await callGeminiAPI(prompt);

      let suggestions = [];
      try {
        // Better JSON parsing
        const jsonMatch = geminiResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          suggestions = JSON.parse(jsonMatch[0]);
        } else {
          // If no JSON array found, try to parse as lines
          const lines = geminiResponse.split('\n').filter(l => l.trim());
          suggestions = lines.slice(0, 5).map((line, idx) => ({
            name: line.trim(),
            location: destination,
            date: dates.start,
            estimatedCost: 50
          }));
        }
      } catch (parseError) {
        console.error('Parse error:', parseError);
        suggestions = [
          { name: 'City Tour', location: destination, date: dates.start, estimatedCost: 50 },
          { name: 'Local Cuisine Experience', location: destination, date: dates.start, estimatedCost: 40 },
          { name: 'Museum Visit', location: destination, date: dates.start, estimatedCost: 30 }
        ];
      }

      res.json({ suggestions });
    } catch (error) {
      console.error('AI suggestion error:', error);
      res.status(500).json({ error: 'Failed to generate suggestions', message: error.message });
    }
  }
);

export default router;