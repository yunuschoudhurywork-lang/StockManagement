require('../setup');
const request = require('supertest');
const app = require('../../app');
const Course = require('../../models/Course');
const Student = require('../../models/Student');
const { createTestStudent } = require('../utils');

// Helper function to create a test course
function createTestCourse(overrides = {}) {
  return {
    name: 'Computer Science',
    description: 'Introduction to programming and algorithms',
    capacity: 50,
    ...overrides
  };
}

describe('Course API Integration Tests', () => {
  // Remove the default seeded course for these tests
  beforeEach(async () => {
    await Course.deleteMany({});
  });

  describe('GET /api/courses', () => {
    test('should return empty array when no courses exist', async () => {
      const res = await request(app).get('/api/courses');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    test('should return all courses with student counts', async () => {
      // Create courses
      await Course.create(createTestCourse({ name: 'CSE' }));
      await Course.create(createTestCourse({ name: 'EEE', description: 'Electrical Engineering' }));
      
      // Create students enrolled in CSE
      await Student.create(createTestStudent({ email: 's1@test.com', course: 'CSE' }));
      await Student.create(createTestStudent({ email: 's2@test.com', course: 'CSE' }));
      
      const res = await request(app).get('/api/courses');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('studentCount');
      
      const cseCourse = res.body.find(c => c.name === 'CSE');
      expect(cseCourse.studentCount).toBe(2);
      
      const eeeCourse = res.body.find(c => c.name === 'EEE');
      expect(eeeCourse.studentCount).toBe(0);
    });
  });

  describe('POST /api/courses', () => {
    test('should create a new course with valid data', async () => {
      const courseData = createTestCourse();
      const res = await request(app).post('/api/courses').send(courseData);
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe(courseData.name);
      expect(res.body.description).toBe(courseData.description);
      expect(res.body.capacity).toBe(courseData.capacity);
    });

    test('should create course with only required name field', async () => {
      const res = await request(app).post('/api/courses').send({ name: 'Mathematics' });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe('Mathematics');
      expect(res.body.description).toBeUndefined();
      expect(res.body.capacity).toBeUndefined();
    });

    test('should fail with 400 when name is missing', async () => {
      const res = await request(app).post('/api/courses').send({
        description: 'Test description',
        capacity: 30
      });
      
      expect(res.statusCode).toBe(400);
    });

    test('should fail with 400 when name is too short', async () => {
      const res = await request(app).post('/api/courses').send({ name: 'A' });
      
      expect(res.statusCode).toBe(400);
    });

    test('should fail with 400 when name exceeds 100 characters', async () => {
      const longName = 'A'.repeat(101);
      const res = await request(app).post('/api/courses').send({ name: longName });
      
      expect(res.statusCode).toBe(400);
    });

    test('should fail with 400 when duplicate course name exists', async () => {
      const courseData = createTestCourse({ name: 'Physics' });
      
      await request(app).post('/api/courses').send(courseData);
      const res = await request(app).post('/api/courses').send(courseData);
      
      expect(res.statusCode).toBe(400);
    });

    test('should fail with 400 when description exceeds 500 characters', async () => {
      const longDescription = 'A'.repeat(501);
      const res = await request(app).post('/api/courses').send({
        name: 'Biology',
        description: longDescription
      });
      
      expect(res.statusCode).toBe(400);
    });

    test('should fail with 400 when capacity is not a positive integer', async () => {
      const res = await request(app).post('/api/courses').send({
        name: 'Chemistry',
        capacity: -5
      });
      
      expect(res.statusCode).toBe(400);
    });

    test('should trim whitespace from name and description', async () => {
      const res = await request(app).post('/api/courses').send({
        name: '  Data Science  ',
        description: '  Machine Learning course  '
      });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe('Data Science');
      expect(res.body.description).toBe('Machine Learning course');
    });
  });

  describe('PUT /api/courses/:id', () => {
    test('should update course name', async () => {
      const course = await Course.create(createTestCourse({ name: 'Old Name' }));
      
      const res = await request(app)
        .put(`/api/courses/${course._id}`)
        .send({ name: 'New Name' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('New Name');
    });

    test('should update course description', async () => {
      const course = await Course.create(createTestCourse());
      
      const res = await request(app)
        .put(`/api/courses/${course._id}`)
        .send({ description: 'Updated description' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.description).toBe('Updated description');
    });

    test('should update course capacity', async () => {
      const course = await Course.create(createTestCourse());
      
      const res = await request(app)
        .put(`/api/courses/${course._id}`)
        .send({ capacity: 100 });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.capacity).toBe(100);
    });

    test('should return 404 when course not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .put(`/api/courses/${fakeId}`)
        .send({ name: 'Test' });
      
      expect(res.statusCode).toBe(404);
    });

    test('should fail with 400 when updating to duplicate name', async () => {
      await Course.create(createTestCourse({ name: 'Course A' }));
      const courseB = await Course.create(createTestCourse({ name: 'Course B' }));
      
      const res = await request(app)
        .put(`/api/courses/${courseB._id}`)
        .send({ name: 'Course A' });
      
      expect(res.statusCode).toBe(400);
    });
  });

  describe('DELETE /api/courses/:id', () => {
    test('should delete course when no students enrolled', async () => {
      const course = await Course.create(createTestCourse({ name: 'Empty Course' }));
      
      const res = await request(app).delete(`/api/courses/${course._id}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('deleted successfully');
      
      // Verify course was deleted
      const deleted = await Course.findById(course._id);
      expect(deleted).toBeNull();
    });

    test('should prevent deletion when students are enrolled', async () => {
      const course = await Course.create(createTestCourse({ name: 'Popular Course' }));
      
      // Create students enrolled in this course
      await Student.create(createTestStudent({ email: 'st1@test.com', course: 'Popular Course' }));
      await Student.create(createTestStudent({ email: 'st2@test.com', course: 'Popular Course' }));
      
      const res = await request(app).delete(`/api/courses/${course._id}`);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Cannot delete course');
      expect(res.body.message).toContain('2 student(s)');
      
      // Verify course still exists
      const stillExists = await Course.findById(course._id);
      expect(stillExists).not.toBeNull();
    });

    test('should return 404 when course not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app).delete(`/api/courses/${fakeId}`);
      
      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/courses/:courseName/students', () => {
    test('should return students enrolled in a course', async () => {
      await Course.create(createTestCourse({ name: 'Web Development' }));
      
      await Student.create(createTestStudent({ email: 'student1@test.com', course: 'Web Development' }));
      await Student.create(createTestStudent({ email: 'student2@test.com', course: 'Web Development' }));
      await Student.create(createTestStudent({ email: 'student3@test.com', course: 'Other Course' }));
      
      const res = await request(app).get('/api/courses/Web Development/students');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.course).toBe('Web Development');
      expect(res.body.studentCount).toBe(2);
      expect(res.body.students.length).toBe(2);
      expect(res.body.students[0]).toHaveProperty('name');
      expect(res.body.students[0]).toHaveProperty('email');
    });

    test('should return empty array when no students enrolled', async () => {
      await Course.create(createTestCourse({ name: 'New Course' }));
      
      const res = await request(app).get('/api/courses/New Course/students');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.studentCount).toBe(0);
      expect(res.body.students.length).toBe(0);
    });

    test('should return 404 when course does not exist', async () => {
      const res = await request(app).get('/api/courses/Nonexistent Course/students');
      
      expect(res.statusCode).toBe(404);
    });
  });

  describe('Student creation with course validation', () => {
    test('should create student when course exists', async () => {
      await Course.create(createTestCourse({ name: 'Valid Course' }));
      
      const studentData = createTestStudent({ email: 'valid@test.com', course: 'Valid Course' });
      const res = await request(app).post('/api/students').send(studentData);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.course).toBe('Valid Course');
    });

    test('should fail with 400 when course does not exist', async () => {
      const studentData = createTestStudent({ email: 'invalid@test.com', course: 'Nonexistent Course' });
      const res = await request(app).post('/api/students').send(studentData);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Course does not exist');
    });
  });

  describe('Student update with course validation', () => {
    test('should update student when new course exists', async () => {
      await Course.create(createTestCourse({ name: 'Initial Course' }));
      await Course.create(createTestCourse({ name: 'New Course' }));
      
      const student = await Student.create(createTestStudent({ email: 'update@test.com', course: 'Initial Course' }));
      
      const res = await request(app)
        .put(`/api/students/${student._id}`)
        .send({ course: 'New Course' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.course).toBe('New Course');
    });

    test('should fail with 400 when updating to nonexistent course', async () => {
      await Course.create(createTestCourse({ name: 'Initial Course' }));
      
      const student = await Student.create(createTestStudent({ email: 'update2@test.com', course: 'Initial Course' }));
      
      const res = await request(app)
        .put(`/api/students/${student._id}`)
        .send({ course: 'Invalid Course' });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Course does not exist');
    });
  });
});
