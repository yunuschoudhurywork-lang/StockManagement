require('../setup');
const request = require('supertest');
const app = require('../../app');

describe('GET /api/health', () => {
  test('should return 200 and API running message', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
  });

  test('should return JSON response', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['content-type']).toMatch(/json/);
  });

  test('should have correct message format', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Student Management API is running');
  });
});
