require('../setup');
const request = require('supertest');
const app = require('../../app');
const Student = require('../../models/Student');
const { createTestStudent } = require('../utils');

describe('PUT /api/students/:id', () => {
  let existingStudent;

  beforeEach(async () => {
    existingStudent = await Student.create(createTestStudent());
  });

  test('should update student with valid data', async () => {
    const res = await request(app)
      .put(`/api/students/${existingStudent._id}`)
      .send({ name: 'Jane Doe' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Jane Doe');
  });

  test('should return 200 status code', async () => {
    const res = await request(app)
      .put(`/api/students/${existingStudent._id}`)
      .send({ course: 'Physics' });
    expect(res.statusCode).toBe(200);
  });

  test('should return updated student', async () => {
    const res = await request(app)
      .put(`/api/students/${existingStudent._id}`)
      .send({ age: 25 });
    expect(res.body.age).toBe(25);
  });

  test('should update only provided fields (partial update)', async () => {
    const res = await request(app)
      .put(`/api/students/${existingStudent._id}`)
      .send({ name: 'Updated Name' });
    expect(res.body.name).toBe('Updated Name');
    expect(res.body.email).toBe(existingStudent.email);
    expect(res.body.course).toBe(existingStudent.course);
  });

  test('should update updatedAt timestamp', async () => {
    await new Promise(r => setTimeout(r, 10));
    const res = await request(app)
      .put(`/api/students/${existingStudent._id}`)
      .send({ name: 'Timestamp Test' });
    expect(new Date(res.body.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(existingStudent.updatedAt).getTime()
    );
  });

  test('should not update createdAt timestamp', async () => {
    const res = await request(app)
      .put(`/api/students/${existingStudent._id}`)
      .send({ name: 'CreatedAt Test' });
    expect(new Date(res.body.createdAt).getTime()).toBe(
      new Date(existingStudent.createdAt).getTime()
    );
  });

  test('should return 404 for non-existent student ID', async () => {
    const fakeId = new (require('mongoose').Types.ObjectId)();
    const res = await request(app)
      .put(`/api/students/${fakeId}`)
      .send({ name: 'Ghost' });
    expect(res.statusCode).toBe(404);
  });

  test('should fail with 400 for invalid student ID format', async () => {
    const res = await request(app)
      .put('/api/students/invalid-id')
      .send({ name: 'Test' });
    expect(res.statusCode).toBe(400);
  });

  test('should fail with 400 for invalid name', async () => {
    const res = await request(app)
      .put(`/api/students/${existingStudent._id}`)
      .send({ name: 'J' });
    expect(res.statusCode).toBe(400);
  });

  test('should fail with 400 for invalid email', async () => {
    const res = await request(app)
      .put(`/api/students/${existingStudent._id}`)
      .send({ email: 'bad-email' });
    expect(res.statusCode).toBe(400);
  });

  test('should fail with 400 for invalid phone', async () => {
    const res = await request(app)
      .put(`/api/students/${existingStudent._id}`)
      .send({ phone: '123' });
    expect(res.statusCode).toBe(400);
  });

  test('should fail with 400 for invalid age', async () => {
    const res = await request(app)
      .put(`/api/students/${existingStudent._id}`)
      .send({ age: 10 });
    expect(res.statusCode).toBe(400);
  });

  test('should fail with 400 for duplicate email', async () => {
    await Student.create(createTestStudent({ email: 'other@example.com' }));
    const res = await request(app)
      .put(`/api/students/${existingStudent._id}`)
      .send({ email: 'other@example.com' });
    expect(res.statusCode).toBe(400);
  });

  test('should run validators on update', async () => {
    const res = await request(app)
      .put(`/api/students/${existingStudent._id}`)
      .send({ age: 200 });
    expect(res.statusCode).toBe(400);
  });
});
