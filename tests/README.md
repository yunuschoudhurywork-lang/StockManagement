# Testing Infrastructure

This directory contains the complete test suite for the Student Management CRUD application.

## Test Structure

```
tests/
├── setup.js                          # Global test setup with MongoDB Memory Server
├── utils.js                          # Test helper functions and factories
├── unit/                             # Unit tests for individual components
│   ├── student.model.test.js        # Student model tests
│   └── validator.test.js            # Validation middleware tests
└── integration/                      # Integration tests for API endpoints
    ├── health.test.js               # Health check endpoint tests
    ├── students.get.test.js         # GET /api/students tests
    ├── students.post.test.js        # POST /api/students tests
    ├── students.put.test.js         # PUT /api/students/:id tests
    └── students.delete.test.js      # DELETE /api/students/:id tests
```

## Running Tests

### Run all tests with coverage
```bash
npm test
```

### Run tests in watch mode (for development)
```bash
npm run test:watch
```

### Run only unit tests
```bash
npm run test:unit
```

### Run only integration tests
```bash
npm run test:integration
```

## Coverage Goals

We aim for the following minimum code coverage targets:

- **Overall Coverage**: >80%
- **Models**: >90%
- **Controllers**: >85%
- **Middleware**: >80%
- **Routes**: >90%

Coverage reports are automatically generated in the `coverage/` directory when running `npm test`.

## MongoDB Memory Server

All tests use [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server), which provides:

- **Isolated environment**: Each test run uses a fresh in-memory MongoDB instance
- **No external dependencies**: No need for a running MongoDB server
- **Fast execution**: In-memory operations are extremely fast
- **Automatic cleanup**: Database is automatically cleared between tests via `beforeEach` hook

### How it works

1. **beforeAll**: Starts an in-memory MongoDB instance and connects Mongoose
2. **beforeEach**: Clears all collections to ensure test isolation
3. **afterAll**: Drops the database, closes connections, and stops the server

## Writing New Tests

### Follow the AAA Pattern

Structure your tests using the Arrange-Act-Assert pattern:

```javascript
test('should create a new student with valid data', async () => {
  // Arrange: Set up test data
  const studentData = createTestStudent({ email: 'test@example.com' });
  
  // Act: Perform the action
  const res = await request(app).post('/api/students').send(studentData);
  
  // Assert: Verify the results
  expect(res.statusCode).toBe(201);
  expect(res.body).toHaveProperty('_id');
});
```

### Use Test Helper Functions

The `utils.js` file provides factory functions to create test data:

- **createTestStudent(overrides)**: Creates a valid student with optional field overrides
- **createValidStudent()**: Returns a completely valid student object
- **createInvalidStudent(field)**: Returns a student with a specific invalid field
- **generateValidToken()**: Placeholder for future authentication token generation

Example:
```javascript
const { createTestStudent } = require('../utils');

// Create a valid student
const student = createTestStudent();

// Create a student with specific values
const customStudent = createTestStudent({ 
  email: 'custom@example.com', 
  age: 25 
});
```

### Use beforeEach for Test Data Seeding

When tests need existing data, use `beforeEach` to seed the database:

```javascript
describe('PUT /api/students/:id', () => {
  let existingStudent;

  beforeEach(async () => {
    existingStudent = await Student.create(createTestStudent());
  });

  test('should update student with valid data', async () => {
    const res = await request(app)
      .put(`/api/students/${existingStudent._id}`)
      .send({ name: 'Updated Name' });
    expect(res.statusCode).toBe(200);
  });
});
```

### Test Naming Convention

Use descriptive test names that clearly state what is being tested:

```javascript
// Good ✓
test('should return 404 for non-existent student ID', async () => { ... });
test('should fail with 400 for invalid email format', async () => { ... });

// Bad ✗
test('test update', async () => { ... });
test('error case', async () => { ... });
```

## Best Practices

1. **Test in isolation**: Each test should be independent and not rely on the order of execution
2. **Clear database between tests**: The `beforeEach` hook in `setup.js` handles this automatically
3. **Use descriptive assertions**: Make it clear what is being validated
4. **Test both success and failure cases**: Cover happy paths and edge cases
5. **Keep tests focused**: Each test should verify one specific behavior
6. **Use async/await**: All database and HTTP operations are asynchronous
7. **Avoid hardcoded values**: Use factory functions and constants for test data

## Troubleshooting

### Tests timing out
- Increase the Jest timeout in `package.json` (current: 30000ms)
- Check for unclosed database connections

### MongoDB Memory Server issues
- Ensure sufficient memory is available
- Check that no other MongoDB instances are interfering
- Clear the `~/.cache/mongodb-memory-server` directory if needed

### Port conflicts
- The in-memory server doesn't use fixed ports, so conflicts are unlikely
- Ensure no test server is left running from a previous session

## Further Reading

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server Documentation](https://github.com/nodkz/mongodb-memory-server)
- [Mongoose Testing Guide](https://mongoosejs.com/docs/jest.html)
