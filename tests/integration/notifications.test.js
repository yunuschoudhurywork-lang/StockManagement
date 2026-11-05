require('../setup');
const request = require('supertest');
const app = require('../../app');
const Notification = require('../../models/Notification');
const Course = require('../../models/Course');
const Student = require('../../models/Student');
const { createTestStudent } = require('../utils');

describe('Notification API Integration Tests', () => {
  beforeEach(async () => {
    await Notification.deleteMany({});
  });

  describe('GET /api/notifications', () => {
    test('should return empty array when no notifications exist', async () => {
      const res = await request(app).get('/api/notifications');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    test('should return last 20 notifications sorted by createdAt desc', async () => {
      // Create 25 notifications
      for (let i = 1; i <= 25; i++) {
        await Notification.create({
          type: 'student_added',
          message: `Notification ${i}`,
          createdAt: new Date(Date.now() + i * 1000)
        });
      }

      const res = await request(app).get('/api/notifications');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(20);
      // Newest should be first
      expect(res.body[0].message).toBe('Notification 25');
      expect(res.body[19].message).toBe('Notification 6');
    });
  });

  describe('POST /api/notifications', () => {
    test('should create a notification with valid data', async () => {
      const res = await request(app)
        .post('/api/notifications')
        .send({
          type: 'student_added',
          message: 'Student Alice was added'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.type).toBe('student_added');
      expect(res.body.message).toBe('Student Alice was added');
      expect(res.body.isRead).toBe(false);
    });

    test('should fail with 400 when type is missing', async () => {
      const res = await request(app)
        .post('/api/notifications')
        .send({
          message: 'Some notification'
        });

      expect(res.statusCode).toBe(400);
    });

    test('should fail with 400 when type is invalid enum value', async () => {
      const res = await request(app)
        .post('/api/notifications')
        .send({
          type: 'invalid_type',
          message: 'Some notification'
        });

      expect(res.statusCode).toBe(400);
    });

    test('should fail with 400 when message is missing', async () => {
      const res = await request(app)
        .post('/api/notifications')
        .send({
          type: 'student_added'
        });

      expect(res.statusCode).toBe(400);
    });

    test('should fail with 400 when message exceeds 500 characters', async () => {
      const longMessage = 'a'.repeat(501);
      const res = await request(app)
        .post('/api/notifications')
        .send({
          type: 'student_added',
          message: longMessage
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('PUT /api/notifications/:id/read', () => {
    test('should mark notification as read', async () => {
      const notification = await Notification.create({
        type: 'course_added',
        message: 'Course Robotics was added'
      });

      const res = await request(app).put(`/api/notifications/${notification._id}/read`);
      expect(res.statusCode).toBe(200);
      expect(res.body.isRead).toBe(true);

      const updated = await Notification.findById(notification._id);
      expect(updated.isRead).toBe(true);
    });

    test('should return 404 when notification not found', async () => {
      const res = await request(app).put('/api/notifications/507f1f77bcf86cd799439011/read');
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Notification not found');
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    test('should delete notification by id', async () => {
      const notification = await Notification.create({
        type: 'course_deleted',
        message: 'Course Robotics was deleted'
      });

      const res = await request(app).delete(`/api/notifications/${notification._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Notification deleted successfully');

      const found = await Notification.findById(notification._id);
      expect(found).toBeNull();
    });

    test('should return 404 when notification to delete does not exist', async () => {
      const res = await request(app).delete('/api/notifications/507f1f77bcf86cd799439011');
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Notification not found');
    });
  });

  describe('DELETE /api/notifications (clear all)', () => {
    test('should clear all notifications', async () => {
      await Notification.create({ type: 'student_added', message: 'Note 1' });
      await Notification.create({ type: 'student_updated', message: 'Note 2' });

      const res = await request(app).delete('/api/notifications');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('All notifications cleared successfully');

      const count = await Notification.countDocuments();
      expect(count).toBe(0);
    });
  });

  describe('Automatic notification logging for Student operations', () => {
    test('should auto-create notification when student is created', async () => {
      const res = await request(app)
        .post('/api/students')
        .send(createTestStudent({ name: 'David Smith', course: 'Computer Science' }));

      expect(res.statusCode).toBe(201);

      const notification = await Notification.findOne({ type: 'student_added' });
      expect(notification).not.toBeNull();
      expect(notification.message).toBe('Student David Smith was added');
      expect(notification.isRead).toBe(false);
    });

    test('should auto-create notification when student is updated', async () => {
      const student = await Student.create(createTestStudent({ name: 'Emily Clark', course: 'Computer Science' }));
      await Notification.deleteMany({}); // Clear creation notification

      const res = await request(app)
        .put(`/api/students/${student._id}`)
        .send({ name: 'Emily Watson' });

      expect(res.statusCode).toBe(200);

      const notification = await Notification.findOne({ type: 'student_updated' });
      expect(notification).not.toBeNull();
      expect(notification.message).toBe('Student Emily Watson was updated');
    });

    test('should auto-create notification when student is deleted', async () => {
      const student = await Student.create(createTestStudent({ name: 'Frank Miller', course: 'Computer Science' }));
      await Notification.deleteMany({}); // Clear creation notification

      const res = await request(app).delete(`/api/students/${student._id}`);
      expect(res.statusCode).toBe(200);

      const notification = await Notification.findOne({ type: 'student_deleted' });
      expect(notification).not.toBeNull();
      expect(notification.message).toBe('Student Frank Miller was deleted');
    });
  });

  describe('Automatic notification logging for Course operations', () => {
    test('should auto-create notification when course is created', async () => {
      const res = await request(app)
        .post('/api/courses')
        .send({
          name: 'Artificial Intelligence',
          description: 'AI & Machine Learning fundamentals',
          capacity: 40
        });

      expect(res.statusCode).toBe(201);

      const notification = await Notification.findOne({ type: 'course_added' });
      expect(notification).not.toBeNull();
      expect(notification.message).toBe('Course Artificial Intelligence was added');
    });

    test('should auto-create notification when course is updated', async () => {
      const course = await Course.create({
        name: 'Data Science',
        description: 'Big data analytics'
      });
      await Notification.deleteMany({}); // Clear creation notification

      const res = await request(app)
        .put(`/api/courses/${course._id}`)
        .send({
          name: 'Advanced Data Science'
        });

      expect(res.statusCode).toBe(200);

      const notification = await Notification.findOne({ type: 'course_updated' });
      expect(notification).not.toBeNull();
      expect(notification.message).toBe('Course Advanced Data Science was updated');
    });

    test('should auto-create notification when course is deleted', async () => {
      const course = await Course.create({
        name: 'Philosophy',
        description: 'Introduction to ethics'
      });
      await Notification.deleteMany({}); // Clear creation notification

      const res = await request(app).delete(`/api/courses/${course._id}`);
      expect(res.statusCode).toBe(200);

      const notification = await Notification.findOne({ type: 'course_deleted' });
      expect(notification).not.toBeNull();
      expect(notification.message).toBe('Course Philosophy was deleted');
    });
  });
});

