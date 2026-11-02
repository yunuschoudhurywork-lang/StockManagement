require('../setup');
const request = require('supertest');
const app = require('../../app');
const Student = require('../../models/Student');
const { createTestStudent } = require('../utils');

describe('GET /api/students', () => {
  test('should return empty array when no students exist', async () => {
    const res = await request(app).get('/api/students');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('should return all students', async () => {
    await Student.create(createTestStudent({ email: 'a@example.com' }));
    await Student.create(createTestStudent({ email: 'b@example.com' }));
    const res = await request(app).get('/api/students');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test('should return students sorted by createdAt (newest first)', async () => {
    await Student.create(createTestStudent({ email: 'first@example.com' }));
    await new Promise(r => setTimeout(r, 5));
    await Student.create(createTestStudent({ email: 'second@example.com' }));
    const res = await request(app).get('/api/students');
    expect(res.statusCode).toBe(200);
    const dates = res.body.map(s => new Date(s.createdAt).getTime());
    expect(dates[0]).toBeGreaterThanOrEqual(dates[1]);
  });

  test('should return 200 status code', async () => {
    const res = await request(app).get('/api/students');
    expect(res.statusCode).toBe(200);
  });

  test('should return JSON array', async () => {
    const res = await request(app).get('/api/students');
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('should include all student fields when students exist', async () => {
    await Student.create(createTestStudent());
    const res = await request(app).get('/api/students');
    expect(res.statusCode).toBe(200);
    const student = res.body[0];
    expect(student).toHaveProperty('_id');
    expect(student).toHaveProperty('name');
    expect(student).toHaveProperty('email');
    expect(student).toHaveProperty('course');
    expect(student).toHaveProperty('phone');
    expect(student).toHaveProperty('age');
    expect(student).toHaveProperty('createdAt');
    expect(student).toHaveProperty('updatedAt');
  });
});
