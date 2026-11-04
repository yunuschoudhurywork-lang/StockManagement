require('../setup');
const request = require('supertest');
const app = require('../../app');
const Student = require('../../models/Student');
const { createTestStudent } = require('../utils');

describe('Export API', () => {
  describe('GET /api/export/csv', () => {
    test('should return CSV file with correct headers and Content-Type', async () => {
      // Create test students
      await Student.create(createTestStudent({ name: 'John Doe', email: 'john@example.com', course: 'CSE', phone: '1234567890', age: 20 }));
      await Student.create(createTestStudent({ name: 'Jane Smith', email: 'jane@example.com', course: 'EEE', phone: '0987654321', age: 22 }));

      const res = await request(app).get('/api/export/csv');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toBe('text/csv; charset=utf-8');
      expect(res.headers['content-disposition']).toContain('attachment');
      expect(res.headers['content-disposition']).toContain('filename');

      // Verify CSV content
      const csvContent = res.text;
      const lines = csvContent.split('\n');

      // Check headers
      expect(lines[0]).toBe('name,email,course,phone,age');

      // Check data rows (should have at least 2 students)
      expect(lines.length).toBeGreaterThanOrEqual(3); // headers + 2 students

      // Verify first student data
      expect(csvContent).toContain('John Doe');
      expect(csvContent).toContain('john@example.com');
      expect(csvContent).toContain('CSE');
      expect(csvContent).toContain('1234567890');
      expect(csvContent).toContain('20');
    });

    test('should return empty CSV with only headers when database is empty', async () => {
      const res = await request(app).get('/api/export/csv');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toBe('text/csv; charset=utf-8');
      
      const csvContent = res.text;
      const lines = csvContent.split('\n').filter(line => line.trim() !== '');
      
      // Only header row should exist
      expect(lines.length).toBe(1);
      expect(lines[0]).toBe('name,email,course,phone,age');
    });

    test('should escape CSV fields with special characters', async () => {
      await Student.create(createTestStudent({ 
        name: 'Test, User', 
        email: 'test@example.com', 
        course: 'Advanced "AI" Course',
        phone: '1234567890',
        age: 25 
      }));

      const res = await request(app).get('/api/export/csv');

      expect(res.statusCode).toBe(200);
      const csvContent = res.text;

      // Fields with commas or quotes should be wrapped in quotes
      expect(csvContent).toContain('"Test, User"');
      // Quotes inside fields should be doubled
      expect(csvContent).toContain('"Advanced ""AI"" Course"');
    });
  });

  describe('GET /api/export/json', () => {
    test('should return JSON file with correct Content-Type and Content-Disposition', async () => {
      // Create test students
      await Student.create(createTestStudent({ name: 'John Doe', email: 'john@example.com', course: 'CSE', age: 20 }));
      await Student.create(createTestStudent({ name: 'Jane Smith', email: 'jane@example.com', course: 'EEE', age: 22 }));

      const res = await request(app).get('/api/export/json');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('application/json');
      expect(res.headers['content-disposition']).toContain('attachment');
      expect(res.headers['content-disposition']).toContain('filename');

      // Verify JSON content
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);

      // Check student fields
      const firstStudent = res.body[0];
      expect(firstStudent).toHaveProperty('_id');
      expect(firstStudent).toHaveProperty('name');
      expect(firstStudent).toHaveProperty('email');
      expect(firstStudent).toHaveProperty('course');
      expect(firstStudent).toHaveProperty('phone');
      expect(firstStudent).toHaveProperty('age');
      expect(firstStudent).toHaveProperty('createdAt');
      expect(firstStudent).toHaveProperty('updatedAt');
    });

    test('should return empty JSON array when database is empty', async () => {
      const res = await request(app).get('/api/export/json');

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('application/json');
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });
  });

  describe('POST /api/export/filtered', () => {
    beforeEach(async () => {
      // Create test students with varied data
      await Student.create(createTestStudent({ name: 'John Doe', email: 'john@example.com', course: 'CSE', phone: '1234567890', age: 20 }));
      await Student.create(createTestStudent({ name: 'Jane Smith', email: 'jane@example.com', course: 'EEE', phone: '0987654321', age: 22 }));
      await Student.create(createTestStudent({ name: 'Bob Johnson', email: 'bob@example.com', course: 'CSE', phone: '1112223333', age: 25 }));
      await Student.create(createTestStudent({ name: 'Alice Brown', email: 'alice@example.com', course: 'BBA', phone: '4445556666', age: 30 }));
    });

    test('should export filtered students as CSV with search filter', async () => {
      const res = await request(app)
        .post('/api/export/filtered')
        .send({ format: 'csv', search: 'john' });

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toBe('text/csv; charset=utf-8');
      expect(res.headers['content-disposition']).toContain('attachment');

      const csvContent = res.text;
      const lines = csvContent.split('\n').filter(line => line.trim() !== '');

      // Should have header + matching students (John Doe and Bob Johnson)
      expect(lines.length).toBeGreaterThanOrEqual(2);
      expect(csvContent).toContain('John Doe');
      expect(csvContent).toContain('Bob Johnson');
      expect(csvContent).not.toContain('Alice Brown');
    });

    test('should export filtered students as JSON with course filter', async () => {
      const res = await request(app)
        .post('/api/export/filtered')
        .send({ format: 'json', course: 'CSE' });

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('application/json');
      expect(res.headers['content-disposition']).toContain('attachment');

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2); // John Doe and Bob Johnson

      res.body.forEach(student => {
        expect(student.course.toUpperCase()).toBe('CSE');
      });
    });

    test('should export filtered students with age range filter as CSV', async () => {
      const res = await request(app)
        .post('/api/export/filtered')
        .send({ format: 'csv', minAge: 22, maxAge: 25 });

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toBe('text/csv; charset=utf-8');

      const csvContent = res.text;
      const lines = csvContent.split('\n').filter(line => line.trim() !== '');

      // Should have header + students aged 22-25 (Jane, Bob)
      expect(lines.length).toBeGreaterThanOrEqual(2);
      expect(csvContent).toContain('Jane Smith');
      expect(csvContent).toContain('Bob Johnson');
      expect(csvContent).not.toContain('John Doe'); // age 20
      expect(csvContent).not.toContain('Alice Brown'); // age 30
    });

    test('should export filtered students with combined filters as JSON', async () => {
      const res = await request(app)
        .post('/api/export/filtered')
        .send({ 
          format: 'json', 
          course: 'CSE', 
          minAge: 20, 
          maxAge: 25 
        });

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('application/json');

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2); // John Doe (20) and Bob Johnson (25), both CSE

      res.body.forEach(student => {
        expect(student.course.toUpperCase()).toBe('CSE');
        expect(student.age).toBeGreaterThanOrEqual(20);
        expect(student.age).toBeLessThanOrEqual(25);
      });
    });

    test('should return 400 error if format is missing', async () => {
      const res = await request(app)
        .post('/api/export/filtered')
        .send({ search: 'john' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    test('should return 400 error if format is invalid', async () => {
      const res = await request(app)
        .post('/api/export/filtered')
        .send({ format: 'xml', search: 'john' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('csv');
      expect(res.body.message).toContain('json');
    });

    test('should return empty result when no students match filters', async () => {
      const res = await request(app)
        .post('/api/export/filtered')
        .send({ format: 'csv', search: 'nonexistent' });

      expect(res.statusCode).toBe(200);
      const csvContent = res.text;
      const lines = csvContent.split('\n').filter(line => line.trim() !== '');

      // Only headers should be present
      expect(lines.length).toBe(1);
      expect(lines[0]).toBe('name,email,course,phone,age');
    });

    test('should include filename in Content-Disposition header', async () => {
      const res = await request(app)
        .post('/api/export/filtered')
        .send({ format: 'csv', course: 'CSE' });

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-disposition']).toMatch(/filename=".*\.csv"/);
    });
  });
});
