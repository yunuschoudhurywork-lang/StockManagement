/**
 * Factory function: creates a valid test student with optional overrides
 */
function createTestStudent(overrides = {}) {
  return {
    name: 'John Doe',
    email: 'john.doe@example.com',
    course: 'Computer Science',
    phone: '1234567890',
    age: 20,
    ...overrides
  };
}

/**
 * Factory function: creates a valid test course with optional overrides
 */
function createTestCourse(overrides = {}) {
  return {
    name: 'Computer Science',
    description: 'Introduction to programming and algorithms',
    capacity: 50,
    ...overrides
  };
}

/**
 * Returns a valid student object
 */
function createValidStudent() {
  return createTestStudent();
}

/**
 * Returns a student with a specific field made invalid
 */
function createInvalidStudent(field) {
  const invalidValues = {
    name: '',
    email: 'not-an-email',
    course: '',
    phone: '123',          // not 10 digits
    age: 10                // below min age of 16
  };
  return createTestStudent({ [field]: invalidValues[field] });
}

/**
 * Placeholder for future auth token generation
 */
function generateValidToken() {
  return 'placeholder-token-for-future-auth';
}

module.exports = {
  createTestStudent,
  createTestCourse,
  createValidStudent,
  createInvalidStudent,
  generateValidToken
};
