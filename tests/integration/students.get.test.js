require('../setup');
const request = require('supertest');
const app = require('../../app');
const Student = require('../../models/Student');
const { createTestStudent } = require('../utils');

describe('GET /api/students', () => {
  test('should return empty array when no students exist', async () => {
    const res = await request(app).get('/api/students');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('students');
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.students).toEqual([]);
    expect(res.body.pagination.totalStudents).toBe(0);
  });

  test('should return all students with pagination', async () => {
    await Student.create(createTestStudent({ email: 'a@example.com' }));
    await Student.create(createTestStudent({ email: 'b@example.com' }));
    const res = await request(app).get('/api/students');
    expect(res.statusCode).toBe(200);
    expect(res.body.students).toHaveLength(2);
    expect(res.body.pagination.totalStudents).toBe(2);
  });

  test('should return students sorted by createdAt (newest first)', async () => {
    await Student.create(createTestStudent({ email: 'first@example.com' }));
    await new Promise(r => setTimeout(r, 5));
    await Student.create(createTestStudent({ email: 'second@example.com' }));
    const res = await request(app).get('/api/students');
    expect(res.statusCode).toBe(200);
    const dates = res.body.students.map(s => new Date(s.createdAt).getTime());
    expect(dates[0]).toBeGreaterThanOrEqual(dates[1]);
  });

  test('should return 200 status code', async () => {
    const res = await request(app).get('/api/students');
    expect(res.statusCode).toBe(200);
  });

  test('should return JSON object with students array and pagination', async () => {
    const res = await request(app).get('/api/students');
    expect(res.body).toHaveProperty('students');
    expect(res.body).toHaveProperty('pagination');
    expect(Array.isArray(res.body.students)).toBe(true);
  });

  test('should include all student fields when students exist', async () => {
    await Student.create(createTestStudent());
    const res = await request(app).get('/api/students');
    expect(res.statusCode).toBe(200);
    const student = res.body.students[0];
    expect(student).toHaveProperty('_id');
    expect(student).toHaveProperty('name');
    expect(student).toHaveProperty('email');
    expect(student).toHaveProperty('course');
    expect(student).toHaveProperty('phone');
    expect(student).toHaveProperty('age');
    expect(student).toHaveProperty('createdAt');
    expect(student).toHaveProperty('updatedAt');
  });

  describe('Pagination', () => {
    beforeEach(async () => {
      // Create 15 students for pagination tests
      for (let i = 1; i <= 15; i++) {
        await Student.create(createTestStudent({ email: `student${i}@example.com` }));
      }
    });

    test('should paginate with default page=1 and limit=10', async () => {
      const res = await request(app).get('/api/students');
      expect(res.statusCode).toBe(200);
      expect(res.body.students).toHaveLength(10);
      expect(res.body.pagination.currentPage).toBe(1);
      expect(res.body.pagination.limit).toBe(10);
      expect(res.body.pagination.totalStudents).toBe(15);
      expect(res.body.pagination.totalPages).toBe(2);
      expect(res.body.pagination.hasNextPage).toBe(true);
      expect(res.body.pagination.hasPrevPage).toBe(false);
    });

    test('should return page 2 with limit 5', async () => {
      const res = await request(app).get('/api/students?page=2&limit=5');
      expect(res.statusCode).toBe(200);
      expect(res.body.students).toHaveLength(5);
      expect(res.body.pagination.currentPage).toBe(2);
      expect(res.body.pagination.limit).toBe(5);
      expect(res.body.pagination.totalPages).toBe(3);
      expect(res.body.pagination.hasNextPage).toBe(true);
      expect(res.body.pagination.hasPrevPage).toBe(true);
    });

    test('should handle page beyond last page', async () => {
      const res = await request(app).get('/api/students?page=999');
      expect(res.statusCode).toBe(200);
      expect(res.body.students).toHaveLength(0);
      expect(res.body.pagination.currentPage).toBe(999);
      expect(res.body.pagination.totalPages).toBe(2);
    });

    test('should constrain limit to minimum 1', async () => {
      const res = await request(app).get('/api/students?limit=0');
      expect(res.statusCode).toBe(200);
      expect(res.body.pagination.limit).toBe(1);
    });

    test('should constrain limit to maximum 100', async () => {
      const res = await request(app).get('/api/students?limit=200');
      expect(res.statusCode).toBe(200);
      expect(res.body.pagination.limit).toBe(100);
    });

    test('should constrain page to minimum 1', async () => {
      const res = await request(app).get('/api/students?page=-5');
      expect(res.statusCode).toBe(200);
      expect(res.body.pagination.currentPage).toBe(1);
    });
  });

  describe('Search', () => {
    beforeEach(async () => {
      await Student.create(createTestStudent({ name: 'John Doe', email: 'john@example.com' }));
      await Student.create(createTestStudent({ name: 'Jane Smith', email: 'jane@example.com' }));
      await Student.create(createTestStudent({ name: 'Bob Johnson', email: 'bob@example.com' }));
    });

    test('should search by name (case-insensitive partial match)', async () => {
      const res = await request(app).get('/api/students?search=john');
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(2); // John Doe and Bob Johnson
      expect(res.body.pagination.totalStudents).toBeGreaterThanOrEqual(2);
    });

    test('should search by email (case-insensitive partial match)', async () => {
      const res = await request(app).get('/api/students?search=jane');
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(1);
      const student = res.body.students.find(s => s.email === 'jane@example.com');
      expect(student).toBeDefined();
    });

    test('should return empty array when search has no matches', async () => {
      const res = await request(app).get('/api/students?search=nonexistent');
      expect(res.statusCode).toBe(200);
      expect(res.body.students).toHaveLength(0);
      expect(res.body.pagination.totalStudents).toBe(0);
    });
  });

  describe('Filtering', () => {
    beforeEach(async () => {
      await Student.create(createTestStudent({ course: 'CSE', age: 20 }));
      await Student.create(createTestStudent({ course: 'EEE', age: 22, email: 'eee@example.com' }));
      await Student.create(createTestStudent({ course: 'CSE', age: 25, email: 'cse2@example.com' }));
      await Student.create(createTestStudent({ course: 'BBA', age: 30, email: 'bba@example.com' }));
    });

    test('should filter by course (case-insensitive)', async () => {
      const res = await request(app).get('/api/students?course=CSE');
      expect(res.statusCode).toBe(200);
      expect(res.body.students).toHaveLength(2);
      expect(res.body.pagination.totalStudents).toBe(2);
      res.body.students.forEach(s => {
        expect(s.course.toUpperCase()).toBe('CSE');
      });
    });

    test('should filter by minAge', async () => {
      const res = await request(app).get('/api/students?minAge=22');
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(3);
      res.body.students.forEach(s => {
        expect(s.age).toBeGreaterThanOrEqual(22);
      });
    });

    test('should filter by maxAge', async () => {
      const res = await request(app).get('/api/students?maxAge=22');
      expect(res.statusCode).toBe(200);
      res.body.students.forEach(s => {
        expect(s.age).toBeLessThanOrEqual(22);
      });
    });

    test('should filter by age range (minAge and maxAge)', async () => {
      const res = await request(app).get('/api/students?minAge=20&maxAge=25');
      expect(res.statusCode).toBe(200);
      res.body.students.forEach(s => {
        expect(s.age).toBeGreaterThanOrEqual(20);
        expect(s.age).toBeLessThanOrEqual(25);
      });
    });

    test('should combine course filter with search', async () => {
      const res = await request(app).get('/api/students?course=CSE&search=cse2');
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Sorting', () => {
    beforeEach(async () => {
      await Student.create(createTestStudent({ name: 'Charlie', email: 'c@example.com', age: 25 }));
      await Student.create(createTestStudent({ name: 'Alice', email: 'a@example.com', age: 20 }));
      await Student.create(createTestStudent({ name: 'Bob', email: 'b@example.com', age: 22 }));
    });

    test('should sort by name ascending', async () => {
      const res = await request(app).get('/api/students?sortBy=name&order=asc');
      expect(res.statusCode).toBe(200);
      const names = res.body.students.map(s => s.name);
      expect(names[0]).toBe('Alice');
      expect(names[1]).toBe('Bob');
      expect(names[2]).toBe('Charlie');
    });

    test('should sort by name descending', async () => {
      const res = await request(app).get('/api/students?sortBy=name&order=desc');
      expect(res.statusCode).toBe(200);
      const names = res.body.students.map(s => s.name);
      expect(names[0]).toBe('Charlie');
      expect(names[1]).toBe('Bob');
      expect(names[2]).toBe('Alice');
    });

    test('should sort by age ascending', async () => {
      const res = await request(app).get('/api/students?sortBy=age&order=asc');
      expect(res.statusCode).toBe(200);
      const ages = res.body.students.map(s => s.age);
      expect(ages[0]).toBe(20);
      expect(ages[1]).toBe(22);
      expect(ages[2]).toBe(25);
    });

    test('should default to createdAt desc when sortBy is invalid', async () => {
      const res = await request(app).get('/api/students?sortBy=invalidField');
      expect(res.statusCode).toBe(200);
      // Should fall back to createdAt desc (default)
      const dates = res.body.students.map(s => new Date(s.createdAt).getTime());
      expect(dates[0]).toBeGreaterThanOrEqual(dates[1]);
      expect(dates[1]).toBeGreaterThanOrEqual(dates[2]);
    });

    test('should default to desc order when order is invalid', async () => {
      const res = await request(app).get('/api/students?sortBy=name&order=invalid');
      expect(res.statusCode).toBe(200);
      const names = res.body.students.map(s => s.name);
      expect(names[0]).toBe('Charlie');
    });
  });

  describe('Combined queries', () => {
    beforeEach(async () => {
      await Student.create(createTestStudent({ name: 'Alice', course: 'CSE', age: 20, email: 'alice@example.com' }));
      await Student.create(createTestStudent({ name: 'Bob', course: 'CSE', age: 22, email: 'bob@example.com' }));
      await Student.create(createTestStudent({ name: 'Charlie', course: 'EEE', age: 25, email: 'charlie@example.com' }));
      await Student.create(createTestStudent({ name: 'David', course: 'CSE', age: 30, email: 'david@example.com' }));
    });

    test('should combine search, filter, sort, and pagination', async () => {
      const res = await request(app).get('/api/students?search=o&course=CSE&sortBy=age&order=asc&page=1&limit=10');
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(1);
      // Should have Bob (has 'o' in name, course CSE)
      const bob = res.body.students.find(s => s.name === 'Bob');
      expect(bob).toBeDefined();
    });
  });

  describe('GET /api/students/:id (360° Profile)', () => {
    test('should return student by ID with courseInfo', async () => {
      const Course = require('../../models/Course');
      await Course.findOneAndUpdate(
        { name: 'Computer Science' },
        { description: 'CS Degree', capacity: 40 },
        { upsert: true, new: true }
      );
      const student = await Student.create(
        createTestStudent({
          name: 'Priya Sharma',
          email: 'priya.sharma@example.com',
          course: 'Computer Science',
          status: 'Active',
          notes: 'Top performer in class'
        })
      );

      const res = await request(app).get(`/api/students/${student._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id', student._id.toString());
      expect(res.body.name).toBe('Priya Sharma');
      expect(res.body.status).toBe('Active');
      expect(res.body.notes).toBe('Top performer in class');
      expect(res.body).toHaveProperty('courseInfo');
      expect(res.body.courseInfo.name).toBe('Computer Science');
      expect(res.body.courseInfo.description).toBe('CS Degree');
      expect(res.body.courseInfo.enrolledCount).toBe(1);
    });

    test('should return 404 when student does not exist', async () => {
      const mongoose = require('mongoose');
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/students/${fakeId}`);
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Student not found');
    });

    test('should return 400 when student ID is invalid', async () => {
      const res = await request(app).get('/api/students/invalid-id-format');
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Invalid student ID format');
    });
  });
});
