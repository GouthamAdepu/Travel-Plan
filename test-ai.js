import fetch from 'node-fetch';

async function testAISuggestions() {
  try {
    // First, let's login to get a token
    const loginResponse = await fetch('http://localhost:3004/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login Response:', loginData);
    
    if (!loginData.token) {
      console.log('Failed to get authentication token');
      return;
    }
    
    // Now test the AI suggestions
    const aiResponse = await fetch('http://localhost:3004/api/ai/itinerary-suggest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      },
      body: JSON.stringify({
        destination: 'Paris, France',
        dates: {
          start: '2023-06-01',
          end: '2023-06-10'
        },
        preferences: 'art and culture'
      })
    });
    
    const aiData = await aiResponse.json();
    console.log('AI Suggestions Response:', aiData);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAISuggestions();