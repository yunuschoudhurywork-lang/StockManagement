require('../setup');
const request = require('supertest');
const app = require('../../app');
const Student = require('../../models/Student');
const { createTestStudent } = require('../utils');

describe('Reports API', () => {
  describe('GET /api/reports/overview', () => {
    test('should return overview with zero values when no students exist', async () => {
      const res = await request(app).get('/api/reports/overview');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('totalStudents', 0);
      expect(res.body).toHaveProperty('totalCourses', 0);
      expect(res.body).toHaveProperty('avgAge', 0);
    });

    test('should return correct overview statistics with students', async () => {
      await Student.create(createTestStudent({ course: 'CSE', age: 20 }));
      await Student.create(createTestStudent({ course: 'EEE', age: 22, email: 'eee@example.com' }));
      await Student.create(createTestStudent({ course: 'CSE', age: 24, email: 'cse2@example.com' }));

      const res = await request(app).get('/api/reports/overview');
      expect(res.statusCode).toBe(200);
      expect(res.body.totalStudents).toBe(3);
      expect(res.body.totalCourses).toBe(2); // CSE and EEE
      expect(res.body.avgAge).toBe(22); // (20 + 22 + 24) / 3 = 22
    });
  });

  describe('GET /api/reports/course-distribution', () => {
    test('should return empty array when no students exist', async () => {
      const res = await request(app).get('/api/reports/course-distribution');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);
    });

    test('should return course distribution with counts and percentages', async () => {
      await Student.create(createTestStudent({ course: 'CSE', email: 'cse1@example.com' }));
      await Student.create(createTestStudent({ course: 'CSE', email: 'cse2@example.com' }));
      await Student.create(createTestStudent({ course: 'EEE', email: 'eee1@example.com' }));
      await Student.create(createTestStudent({ course: 'BBA', email: 'bba1@example.com' }));

      const res = await request(app).get('/api/reports/course-distribution');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(3);

      // CSE should be first (2 students = 50%)
      const cseData = res.body.find(item => item.course === 'CSE');
      expect(cseData).toBeDefined();
      expect(cseData.count).toBe(2);
      expect(cseData.percentage).toBe(50);

      // Verify all items have required properties
      res.body.forEach(item => {
        expect(item).toHaveProperty('course');
        expect(item).toHaveProperty('count');
        expect(item).toHaveProperty('percentage');
      });
    });
  });

  describe('GET /api/reports/age-distribution', () => {
    test('should return empty array when no students exist', async () => {
      const res = await request(app).get('/api/reports/age-distribution');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);
    });

    test('should return age distribution in correct ranges', async () => {
      // Create students in different age ranges
      await Student.create(createTestStudent({ age: 18, email: 's1@example.com' })); // 16-20
      await Student.create(createTestStudent({ age: 20, email: 's2@example.com' })); // 16-20
      await Student.create(createTestStudent({ age: 23, email: 's3@example.com' })); // 21-25
      await Student.create(createTestStudent({ age: 28, email: 's4@example.com' })); // 26-30
      await Student.create(createTestStudent({ age: 35, email: 's5@example.com' })); // 31+

      const res = await request(app).get('/api/reports/age-distribution');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);

      // Verify ranges exist
      const range1620 = res.body.find(item => item.range === '16-20');
      const range2125 = res.body.find(item => item.range === '21-25');
      const range2630 = res.body.find(item => item.range === '26-30');
      const range31plus = res.body.find(item => item.range === '31+');

      expect(range1620).toBeDefined();
      expect(range1620.count).toBe(2);

      expect(range2125).toBeDefined();
      expect(range2125.count).toBe(1);

      expect(range2630).toBeDefined();
      expect(range2630.count).toBe(1);

      expect(range31plus).toBeDefined();
      expect(range31plus.count).toBe(1);
    });
  });

  describe('GET /api/reports/enrollment-trends', () => {
    test('should return empty array when no students exist', async () => {
      const res = await request(app).get('/api/reports/enrollment-trends');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);
    });

    test('should return enrollment trends for last 6 months', async () => {
      const now = new Date();
      
      // Create student from 1 month ago
      const student1 = createTestStudent({ email: 's1@example.com' });
      const doc1 = await Student.create(student1);
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      doc1.createdAt = oneMonthAgo;
      await doc1.save();

      // Create student from current month
      await Student.create(createTestStudent({ email: 's2@example.com' }));

      const res = await request(app).get('/api/reports/enrollment-trends');
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);

      // Verify data structure
      res.body.forEach(item => {
        expect(item).toHaveProperty('month');
        expect(item).toHaveProperty('count');
        expect(typeof item.month).toBe('string');
        expect(typeof item.count).toBe('number');
      });
    });

    test('should not include students older than 6 months', async () => {
      const now = new Date();
      
      // Create student from 7 months ago (should not be included)
      const sevenMonthsAgo = new Date(now);
      sevenMonthsAgo.setMonth(sevenMonthsAgo.getMonth() - 7);
      const student1 = createTestStudent({ email: 'old@example.com' });
      const doc1 = new Student(student1);
      doc1.createdAt = sevenMonthsAgo;
      doc1.updatedAt = sevenMonthsAgo;
      await doc1.save({ timestamps: false });

      // Create student from current month (should be included)
      await Student.create(createTestStudent({ email: 'new@example.com' }));

      const res = await request(app).get('/api/reports/enrollment-trends');
      expect(res.statusCode).toBe(200);
      
      // Total count should be 1 (only the recent student)
      const totalCount = res.body.reduce((sum, item) => sum + item.count, 0);
      expect(totalCount).toBe(1);
    });
  });
});
