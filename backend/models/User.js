// Mock User model for development without MongoDB
class User {
  constructor(data) {
    this.userId = data.userId || Math.random().toString(36).substr(2, 9);
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.contact = data.contact || '';
    this.createdAt = new Date();
  }

  save() {
    // In development, just return a resolved promise
    return Promise.resolve(this);
  }

  static findOne(query) {
    // In development, return a mock user if email matches a test user
    if (query.email === 'test@example.com') {
      return Promise.resolve({
        userId: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        password: '$2b$10$dummyhashedpassword', // Dummy hashed password
        contact: '',
        createdAt: new Date(),
        toObject: function() { return this; }
      });
    }
    return Promise.resolve(null);
  }

  static findOneAndUpdate(query, updates, options) {
    // In development, return a mock updated user
    return Promise.resolve({
      userId: 'test-user-id',
      name: updates.name || 'Test User',
      email: updates.email || 'test@example.com',
      password: '$2b$10$dummyhashedpassword',
      contact: updates.contact || '',
      createdAt: new Date(),
      toObject: function() { return this; }
    });
  }
}

// Mock compare function for bcrypt
User.compare = (password, hashedPassword) => {
  // In development, just return true for test password
  return password === 'password123';
};

export default User;