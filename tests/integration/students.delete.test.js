require('../setup');
const request = require('supertest');
const app = require('../../app');
const Student = require('../../models/Student');
const { createTestStudent } = require('../utils');

describe('DELETE /api/students/:id', () => {
  let existingStudent;

  beforeEach(async () => {
    existingStudent = await Student.create(createTestStudent());
  });

  test('should delete student with valid ID', async () => {
    const res = await request(app).delete(`/api/students/${existingStudent._id}`);
    expect(res.statusCode).toBe(200);
  });

  test('should return 200 status code', async () => {
    const res = await request(app).delete(`/api/students/${existingStudent._id}`);
    expect(res.statusCode).toBe(200);
  });

  test('should return success message', async () => {
    const res = await request(app).delete(`/api/students/${existingStudent._id}`);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Student deleted successfully');
  });

  test('should remove student from database', async () => {
    await request(app).delete(`/api/students/${existingStudent._id}`);
    const found = await Student.findById(existingStudent._id);
    expect(found).toBeNull();
  });

  test('should return 404 for non-existent student ID', async () => {
    const fakeId = new (require('mongoose').Types.ObjectId)();
    const res = await request(app).delete(`/api/students/${fakeId}`);
    expect(res.statusCode).toBe(404);
  });

  test('should fail with 400 for invalid student ID format', async () => {
    const res = await request(app).delete('/api/students/invalid-id');
    expect(res.statusCode).toBe(400);
  });
});
