const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

// Start in-memory MongoDB before all tests
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  // Configure Mongoose with longer timeout
  mongoose.set('bufferTimeoutMS', 60000);
  
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 60000,
  });
}, 90000); // 90 second timeout for MongoDB Memory Server download/start

// Clear all collections before each test
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  
  // Seed a default course for student tests to use
  // This ensures existing student tests don't break when course validation is enforced
  const Course = require('../models/Course');
  await Course.create({
    name: 'Computer Science',
    description: 'Default test course',
    capacity: 100
  });
});

// Stop MongoDB and close connections after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
});
