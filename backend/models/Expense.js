// Mock Expense model for development without MongoDB
let expenses = [];

class Expense {
  constructor(data) {
    this.expenseId = data.expenseId || Math.random().toString(36).substr(2, 9);
    this.tripId = data.tripId;
    this.category = data.category;
    this.amount = data.amount;
    this.note = data.note || '';
  }

  save() {
    expenses.push(this);
    return Promise.resolve(this);
  }

  static find(query) {
    if (query.tripId) {
      return Promise.resolve(expenses.filter(item => item.tripId === query.tripId));
    }
    return Promise.resolve(expenses);
  }

  static deleteMany(query) {
    if (query.tripId) {
      expenses = expenses.filter(item => item.tripId !== query.tripId);
    }
    return Promise.resolve({ deletedCount: 0 }); // Simplified for mock
  }

  toObject() {
    return this;
  }
}

// Initialize with some sample data
expenses.push(new Expense({
  expenseId: 'sample-expense-1',
  tripId: 'sample-trip-1',
  category: 'Food',
  amount: 25.50,
  note: 'Dinner at Le Jules Verne'
}));

export default Expense;