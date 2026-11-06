require('../setup');
const request = require('supertest');
const app = require('../../app');
const { createTestStudent } = require('../utils');

describe('POST /api/students', () => {
  test('should create a new student with valid data', async () => {
    const res = await request(app).post('/api/students').send(createTestStudent());
    expect(res.statusCode).toBe(201);
  });

  test('should return 201 status code', async () => {
    const res = await request(app).post('/api/students').send(createTestStudent({ email: 'new201@example.com' }));
    expect(res.statusCode).toBe(201);
  });

  test('should return created student with _id', async () => {
    const res = await request(app).post('/api/students').send(createTestStudent({ email: 'id@example.com' }));
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe('John Doe');
  });

  test('should fail with 400 for missing name', async () => {
    const { name, ...rest } = createTestStudent();
    const res = await request(app).post('/api/students').send(rest);
    expect(res.statusCode).toBe(400);
  });

  test('should fail with 400 for missing email', async () => {
    const { email, ...rest } = createTestStudent();
    const res = await request(app).post('/api/students').send(rest);
    expect(res.statusCode).toBe(400);
  });

  test('should fail with 400 for missing course', async () => {
    const { course, ...rest } = createTestStudent();
    const res = await request(app).post('/api/students').send(rest);
    expect(res.statusCode).toBe(400);
  });

  test('should fail with 400 for missing phone', async () => {
    const { phone, ...rest } = createTestStudent();
    const res = await request(app).post('/api/students').send(rest);
    expect(res.statusCode).toBe(400);
  });

  test('should fail with 400 for missing age', async () => {
    const { age, ...rest } = createTestStudent();
    const res = await request(app).post('/api/students').send(rest);
    expect(res.statusCode).toBe(400);
  });

  test('should fail with 400 for invalid email format', async () => {
    const res = await request(app).post('/api/students').send(createTestStudent({ email: 'invalid-email' }));
    expect(res.statusCode).toBe(400);
  });

  test('should fail with 400 for invalid phone format (not 10 digits)', async () => {
    const res = await request(app).post('/api/students').send(createTestStudent({ phone: '12345' }));
    expect(res.statusCode).toBe(400);
  });

  test('should fail with 400 for invalid name (contains numbers)', async () => {
    const res = await request(app).post('/api/students').send(createTestStudent({ name: 'John123' }));
    expect(res.statusCode).toBe(400);
  });

  test('should fail with 400 for age < 16', async () => {
    const res = await request(app).post('/api/students').send(createTestStudent({ age: 15 }));
    expect(res.statusCode).toBe(400);
  });

  test('should fail with 400 for age > 100', async () => {
    const res = await request(app).post('/api/students').send(createTestStudent({ age: 101 }));
    expect(res.statusCode).toBe(400);
  });

  test('should fail with 400 for duplicate email (unique constraint)', async () => {
    await request(app).post('/api/students').send(createTestStudent({ email: 'dup@example.com' }));
    const res = await request(app).post('/api/students').send(createTestStudent({ email: 'dup@example.com' }));
    expect(res.statusCode).toBe(400);
  });

  test('should trim whitespace from inputs', async () => {
    const res = await request(app).post('/api/students').send(createTestStudent({
      email: 'trim@example.com',
      name: '  Jane Doe  '
    }));
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Jane Doe');
  });

  test('should convert email to lowercase', async () => {
    const res = await request(app).post('/api/students').send(createTestStudent({
      email: 'LOWERCASE@EXAMPLE.COM'
    }));
    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe('lowercase@example.com');
  });

  test('should create student with profile photo', async () => {
    const res = await request(app).post('/api/students').send(createTestStudent({
      email: 'photo@example.com',
      photo: 'https://example.com/avatar.jpg'
    }));
    expect(res.statusCode).toBe(201);
    expect(res.body.photo).toBe('https://example.com/avatar.jpg');
  });

  test('should default photo to empty string when omitted', async () => {
    const res = await request(app).post('/api/students').send(createTestStudent({
      email: 'nophoto@example.com'
    }));
    expect(res.statusCode).toBe(201);
    expect(res.body.photo).toBe('');
  });
});
