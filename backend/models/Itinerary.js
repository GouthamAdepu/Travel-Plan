// Mock Itinerary model for development without MongoDB
let itineraries = [];

class Itinerary {
  constructor(data) {
    this.itineraryId = data.itineraryId || Math.random().toString(36).substr(2, 9);
    this.tripId = data.tripId;
    this.day = data.day;
    this.activity = data.activity;
    this.location = data.location;
    this.startTime = data.startTime;
    this.endTime = data.endTime;
    this.costPerNight = data.costPerNight || 0;
    this.notes = data.notes || '';
  }

  save() {
    itineraries.push(this);
    return Promise.resolve(this);
  }

  static find(query) {
    if (query.tripId) {
      return Promise.resolve(itineraries.filter(item => item.tripId === query.tripId));
    }
    return Promise.resolve(itineraries);
  }

  static deleteMany(query) {
    if (query.tripId) {
      itineraries = itineraries.filter(item => item.tripId !== query.tripId);
    }
    return Promise.resolve({ deletedCount: 0 }); // Simplified for mock
  }

  toObject() {
    return this;
  }
}

// Initialize with some sample data
itineraries.push(new Itinerary({
  itineraryId: 'sample-itinerary-1',
  tripId: 'sample-trip-1',
  day: 1,
  activity: 'Arrival and Check-in',
  location: 'Hotel de Paris',
  startTime: '14:00',
  endTime: '17:00',
  costPerNight: 0,
  notes: 'Welcome to Paris!'
}));

export default Itinerary;