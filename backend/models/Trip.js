// Mock Trip model for development without MongoDB
let trips = [];

class Trip {
  constructor(data) {
    this.tripId = data.tripId || Math.random().toString(36).substr(2, 9);
    this.userId = data.userId || 'test-user-id';
    this.title = data.title;
    this.destination = data.destination;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.totalBudget = data.totalBudget || 0;
    this.notes = data.notes || '';
    this.createdAt = data.createdAt || new Date();
  }

  save() {
    trips.push(this);
    return Promise.resolve(this);
  }

  static find(query) {
    if (query.userId) {
      return Promise.resolve(trips.filter(trip => trip.userId === query.userId));
    }
    if (query.tripId) {
      return Promise.resolve(trips.filter(trip => trip.tripId === query.tripId));
    }
    return Promise.resolve(trips);
  }

  static findOne(query) {
    if (query.tripId) {
      const trip = trips.find(t => t.tripId === query.tripId);
      return Promise.resolve(trip || null);
    }
    return Promise.resolve(trips.find(t => t.tripId === query.tripId) || null);
  }

  static findOneAndUpdate(query, updates, options) {
    const tripIndex = trips.findIndex(t => t.tripId === query.tripId);
    if (tripIndex === -1) {
      return Promise.resolve(null);
    }
    
    const updatedTrip = { ...trips[tripIndex], ...updates };
    trips[tripIndex] = updatedTrip;
    
    return Promise.resolve(updatedTrip);
  }

  static findOneAndDelete(query) {
    const tripIndex = trips.findIndex(t => t.tripId === query.tripId);
    if (tripIndex === -1) {
      return Promise.resolve(null);
    }
    
    const deletedTrip = trips.splice(tripIndex, 1)[0];
    return Promise.resolve(deletedTrip);
  }

  toObject() {
    return this;
  }
}

// Initialize with some sample data
trips.push(new Trip({
  tripId: 'sample-trip-1',
  userId: 'test-user-id',
  title: 'Sample Trip to Paris',
  destination: 'Paris, France',
  startDate: new Date('2023-06-01'),
  endDate: new Date('2023-06-10'),
  totalBudget: 2500,
  createdAt: new Date('2023-05-01')
}));

export default Trip;