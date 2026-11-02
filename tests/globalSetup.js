const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async () => {
  // This will download the MongoDB binary if not already cached
  // Run once before all test suites
  const instance = await MongoMemoryServer.create();
  await instance.stop();
};
