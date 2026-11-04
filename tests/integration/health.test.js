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

describe('Morgan Middleware', () => {
  test('should have Morgan middleware registered in middleware stack', () => {
    // Check that app has middleware stack
    expect(app._router).toBeDefined();
    expect(app._router.stack).toBeDefined();
    expect(Array.isArray(app._router.stack)).toBe(true);
    
    // Check that Morgan middleware exists in the stack
    const hasMorganMiddleware = app._router.stack.some(layer => {
      return layer && layer.name === 'logger';
    });
    
    expect(hasMorganMiddleware).toBe(true);
  });

  test('should not break requests when Morgan middleware is active', async () => {
    // Morgan logs but should not interfere with normal request flow
    const res = await request(app).get('/api/health');
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  test('should handle API requests without errors', async () => {
    // Test multiple requests to ensure Morgan doesn't break anything
    const res1 = await request(app).get('/api/health');
    const res2 = await request(app).get('/api/students');
    
    expect(res1.statusCode).toBe(200);
    expect(res2.statusCode).toBe(200);
  });
});
