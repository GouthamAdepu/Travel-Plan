// Mock Accommodation model for development without MongoDB
let accommodations = [];

class Accommodation {
  constructor(data) {
    this.accommodationId = data.accommodationId || Math.random().toString(36).substr(2, 9);
    this.tripId = data.tripId;
    this.hotelName = data.hotelName;
    this.address = data.address;
    this.checkInDate = data.checkInDate;
    this.checkOutDate = data.checkOutDate;
    this.costPerNight = data.costPerNight || 0;
  }

  save() {
    accommodations.push(this);
    return Promise.resolve(this);
  }

  static find(query) {
    if (query.tripId) {
      return Promise.resolve(accommodations.filter(item => item.tripId === query.tripId));
    }
    return Promise.resolve(accommodations);
  }

  static deleteMany(query) {
    if (query.tripId) {
      accommodations = accommodations.filter(item => item.tripId !== query.tripId);
    }
    return Promise.resolve({ deletedCount: 0 }); // Simplified for mock
  }

  toObject() {
    return this;
  }
}

// Initialize with some sample data
accommodations.push(new Accommodation({
  accommodationId: 'sample-accommodation-1',
  tripId: 'sample-trip-1',
  hotelName: 'Hotel de Paris',
  address: '123 Champs-Élysées, Paris, France',
  checkInDate: new Date('2023-06-01'),
  checkOutDate: new Date('2023-06-10'),
  costPerNight: 150
}));

export default Accommodation;