const { validationResult } = require('express-validator');
const { validateCreateStudent, validateUpdateStudent, validate } = require('../../middleware/validator');

// Helper: run validators against a mock request
async function runValidation(validators, body) {
  const req = { body, headers: {}, params: {}, query: {} };
  const res = {};
  for (const validator of validators) {
    await validator(req, res, () => {});
  }
  return validationResult(req);
}

// Helper: run the validate middleware
function runValidateMiddleware(errors) {
  const req = {
    body: {},
    headers: {},
    params: {},
    query: {}
  };
  // Manually inject errors
  req._validationErrors = errors;
  const result = { isEmpty: () => errors.length === 0, array: () => errors.map(e => ({ path: e.field, msg: e.message })) };
  // Patch validationResult to return our result
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
  const next = jest.fn();
  return { req, res, next, result };
}

describe('Validation Middleware', () => {
  describe('validateCreateStudent', () => {
    test('should pass with valid data', async () => {
      const result = await runValidation(validateCreateStudent, {
        name: 'John Doe',
        email: 'john@example.com',
        course: 'CS',
        phone: '1234567890',
        age: 20
      });
      expect(result.isEmpty()).toBe(true);
    });

    test('should fail with name < 2 characters', async () => {
      const result = await runValidation(validateCreateStudent, {
        name: 'J',
        email: 'john@example.com',
        course: 'CS',
        phone: '1234567890',
        age: 20
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'name')).toBe(true);
    });

    test('should fail with name > 100 characters', async () => {
      const result = await runValidation(validateCreateStudent, {
        name: 'A'.repeat(101),
        email: 'john@example.com',
        course: 'CS',
        phone: '1234567890',
        age: 20
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'name')).toBe(true);
    });

    test('should fail with name containing numbers', async () => {
      const result = await runValidation(validateCreateStudent, {
        name: 'John123',
        email: 'john@example.com',
        course: 'CS',
        phone: '1234567890',
        age: 20
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'name')).toBe(true);
    });

    test('should fail with invalid email format', async () => {
      const result = await runValidation(validateCreateStudent, {
        name: 'John Doe',
        email: 'not-an-email',
        course: 'CS',
        phone: '1234567890',
        age: 20
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'email')).toBe(true);
    });

    test('should fail with phone not 10 digits', async () => {
      const result = await runValidation(validateCreateStudent, {
        name: 'John Doe',
        email: 'john@example.com',
        course: 'CS',
        phone: '12345',
        age: 20
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'phone')).toBe(true);
    });

    test('should fail with phone containing letters', async () => {
      const result = await runValidation(validateCreateStudent, {
        name: 'John Doe',
        email: 'john@example.com',
        course: 'CS',
        phone: 'abcd123456',
        age: 20
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'phone')).toBe(true);
    });

    test('should fail with age < 16', async () => {
      const result = await runValidation(validateCreateStudent, {
        name: 'John Doe',
        email: 'john@example.com',
        course: 'CS',
        phone: '1234567890',
        age: 15
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'age')).toBe(true);
    });

    test('should fail with age > 100', async () => {
      const result = await runValidation(validateCreateStudent, {
        name: 'John Doe',
        email: 'john@example.com',
        course: 'CS',
        phone: '1234567890',
        age: 101
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors.some(e => e.path === 'age')).toBe(true);
    });

    test('should fail with missing required fields', async () => {
      const result = await runValidation(validateCreateStudent, {});
      expect(result.isEmpty()).toBe(false);
    });
  });

  describe('validateUpdateStudent', () => {
    test('should allow optional fields (empty body passes)', async () => {
      const result = await runValidation(validateUpdateStudent, {});
      expect(result.isEmpty()).toBe(true);
    });

    test('should validate name if provided', async () => {
      const result = await runValidation(validateUpdateStudent, { name: 'J' });
      expect(result.isEmpty()).toBe(false);
    });

    test('should validate email if provided', async () => {
      const result = await runValidation(validateUpdateStudent, { email: 'bad-email' });
      expect(result.isEmpty()).toBe(false);
    });
  });

  describe('validate middleware', () => {
    test('should call next() when no validation errors', async () => {
      // Run validators first so validationResult works on req
      const req = { body: { name: 'John Doe', email: 'john@example.com', course: 'CS', phone: '1234567890', age: 20 }, headers: {}, params: {}, query: {} };
      for (const v of validateCreateStudent) {
        await v(req, {}, () => {});
      }
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      validate(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should return 400 and formatted errors when validation fails', async () => {
      const req = { body: { name: 'J' }, headers: {}, params: {}, query: {} };
      for (const v of validateCreateStudent) {
        await v(req, {}, () => {});
      }
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const next = jest.fn();
      validate(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
      const body = res.json.mock.calls[0][0];
      expect(body).toHaveProperty('errors');
      expect(Array.isArray(body.errors)).toBe(true);
      expect(body.errors[0]).toHaveProperty('field');
      expect(body.errors[0]).toHaveProperty('message');
    });
  });
});
