require('../setup');
const request = require('supertest');
const app = require('../../app');
const Student = require('../../models/Student');
const { createTestStudent } = require('../utils');

describe('GET /api/students - Filtering', () => {
  beforeEach(async () => {
    // Create students with varied courses and ages
    await Student.create(createTestStudent({ 
      name: 'Alice Johnson', 
      email: 'alice@example.com',
      course: 'CSE', 
      age: 20 
    }));
    await Student.create(createTestStudent({ 
      name: 'Bob Smith', 
      email: 'bob@example.com',
      course: 'EEE', 
      age: 22 
    }));
    await Student.create(createTestStudent({ 
      name: 'Charlie Brown', 
      email: 'charlie@example.com',
      course: 'CSE', 
      age: 25 
    }));
    await Student.create(createTestStudent({ 
      name: 'David Wilson', 
      email: 'david@example.com',
      course: 'BBA', 
      age: 30 
    }));
    await Student.create(createTestStudent({ 
      name: 'Eve Davis', 
      email: 'eve@example.com',
      course: 'CSE', 
      age: 18 
    }));
    await Student.create(createTestStudent({ 
      name: 'Frank Miller', 
      email: 'frank@example.com',
      course: 'EEE', 
      age: 27 
    }));
    await Student.create(createTestStudent({ 
      name: 'Grace Lee', 
      email: 'grace@example.com',
      course: 'BBA', 
      age: 21 
    }));
    await Student.create(createTestStudent({ 
      name: 'Henry Taylor', 
      email: 'henry@example.com',
      course: 'MBA', 
      age: 35 
    }));
  });

  describe('Filter by course', () => {
    test('should filter by course exact match (case-insensitive)', async () => {
      const res = await request(app).get('/api/students?course=CSE');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(3); // Alice, Charlie, Eve
      expect(res.body.pagination.totalStudents).toBeGreaterThanOrEqual(3);
      
      res.body.students.forEach(student => {
        expect(student.course.toUpperCase()).toBe('CSE');
      });
    });

    test('should filter by course with lowercase query', async () => {
      const res = await request(app).get('/api/students?course=eee');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(2); // Bob, Frank
      
      res.body.students.forEach(student => {
        expect(student.course.toUpperCase()).toBe('EEE');
      });
    });

    test('should filter by course with mixed case', async () => {
      const res = await request(app).get('/api/students?course=BbA');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(2); // David, Grace
      
      res.body.students.forEach(student => {
        expect(student.course.toUpperCase()).toBe('BBA');
      });
    });

    test('should return empty array for non-existent course', async () => {
      const res = await request(app).get('/api/students?course=Physics');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students).toEqual([]);
      expect(res.body.pagination.totalStudents).toBe(0);
    });
  });

  describe('Filter by minAge only', () => {
    test('should filter students with age >= minAge', async () => {
      const res = await request(app).get('/api/students?minAge=25');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(4); // Charlie(25), David(30), Frank(27), Henry(35)
      
      res.body.students.forEach(student => {
        expect(student.age).toBeGreaterThanOrEqual(25);
      });
    });

    test('should filter with minAge=18', async () => {
      const res = await request(app).get('/api/students?minAge=18');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(8); // All students
      
      res.body.students.forEach(student => {
        expect(student.age).toBeGreaterThanOrEqual(18);
      });
    });

    test('should return empty array when minAge is very high', async () => {
      const res = await request(app).get('/api/students?minAge=100');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students).toEqual([]);
      expect(res.body.pagination.totalStudents).toBe(0);
    });
  });

  describe('Filter by maxAge only', () => {
    test('should filter students with age <= maxAge', async () => {
      const res = await request(app).get('/api/students?maxAge=22');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(4); // Alice(20), Bob(22), Eve(18), Grace(21)
      
      res.body.students.forEach(student => {
        expect(student.age).toBeLessThanOrEqual(22);
      });
    });

    test('should filter with maxAge=30', async () => {
      const res = await request(app).get('/api/students?maxAge=30');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(7); // All except Henry(35)
      
      res.body.students.forEach(student => {
        expect(student.age).toBeLessThanOrEqual(30);
      });
    });

    test('should return empty array when maxAge is very low', async () => {
      const res = await request(app).get('/api/students?maxAge=10');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students).toEqual([]);
      expect(res.body.pagination.totalStudents).toBe(0);
    });
  });

  describe('Filter by age range (minAge and maxAge)', () => {
    test('should filter by age range minAge=20&maxAge=25', async () => {
      const res = await request(app).get('/api/students?minAge=20&maxAge=25');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(4); // Alice(20), Bob(22), Charlie(25), Grace(21)
      
      res.body.students.forEach(student => {
        expect(student.age).toBeGreaterThanOrEqual(20);
        expect(student.age).toBeLessThanOrEqual(25);
      });
    });

    test('should filter by narrow age range', async () => {
      const res = await request(app).get('/api/students?minAge=21&maxAge=22');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(2); // Bob(22), Grace(21)
      
      res.body.students.forEach(student => {
        expect(student.age).toBeGreaterThanOrEqual(21);
        expect(student.age).toBeLessThanOrEqual(22);
      });
    });

    test('should handle single age value (minAge=maxAge)', async () => {
      const res = await request(app).get('/api/students?minAge=25&maxAge=25');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(1); // Charlie(25)
      
      res.body.students.forEach(student => {
        expect(student.age).toBe(25);
      });
    });

    test('should return empty when minAge > maxAge', async () => {
      const res = await request(app).get('/api/students?minAge=30&maxAge=20');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students).toEqual([]);
      expect(res.body.pagination.totalStudents).toBe(0);
    });
  });

  describe('Combined filters (course + age range)', () => {
    test('should combine course filter with age range', async () => {
      const res = await request(app).get('/api/students?course=CSE&minAge=20&maxAge=25');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(2); // Alice(20, CSE), Charlie(25, CSE)
      
      res.body.students.forEach(student => {
        expect(student.course.toUpperCase()).toBe('CSE');
        expect(student.age).toBeGreaterThanOrEqual(20);
        expect(student.age).toBeLessThanOrEqual(25);
      });
    });

    test('should combine course with minAge only', async () => {
      const res = await request(app).get('/api/students?course=EEE&minAge=25');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(1); // Frank(27, EEE)
      
      res.body.students.forEach(student => {
        expect(student.course.toUpperCase()).toBe('EEE');
        expect(student.age).toBeGreaterThanOrEqual(25);
      });
    });

    test('should return empty when combined filters have no matches', async () => {
      const res = await request(app).get('/api/students?course=MBA&maxAge=20');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students).toEqual([]);
      expect(res.body.pagination.totalStudents).toBe(0);
    });
  });

  describe('Filter with no results', () => {
    test('should return empty array when course filter has no matches', async () => {
      const res = await request(app).get('/api/students?course=NonExistentCourse');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students).toEqual([]);
      expect(res.body.pagination.totalStudents).toBe(0);
    });

    test('should return empty array when age range has no matches', async () => {
      const res = await request(app).get('/api/students?minAge=50&maxAge=60');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students).toEqual([]);
      expect(res.body.pagination.totalStudents).toBe(0);
    });
  });

  describe('Invalid age values', () => {
    test('should ignore non-numeric minAge', async () => {
      const res = await request(app).get('/api/students?minAge=abc');
      
      expect(res.statusCode).toBe(200);
      // Should return all students, ignoring invalid minAge
      expect(res.body.students.length).toBeGreaterThanOrEqual(8);
    });

    test('should ignore non-numeric maxAge', async () => {
      const res = await request(app).get('/api/students?maxAge=xyz');
      
      expect(res.statusCode).toBe(200);
      // Should return all students, ignoring invalid maxAge
      expect(res.body.students.length).toBeGreaterThanOrEqual(8);
    });

    test('should handle negative age values gracefully', async () => {
      const res = await request(app).get('/api/students?minAge=-5');
      
      expect(res.statusCode).toBe(200);
      // Negative ages should be ignored or handled gracefully
      expect(Array.isArray(res.body.students)).toBe(true);
    });

    test('should handle decimal age values', async () => {
      const res = await request(app).get('/api/students?minAge=20.5&maxAge=25.5');
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.students)).toBe(true);
      // Should parse as integers: 20 and 25
    });
  });

  describe('Filter combined with pagination', () => {
    test('should paginate filtered results', async () => {
      const res = await request(app).get('/api/students?course=CSE&page=1&limit=2');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students).toHaveLength(2);
      expect(res.body.pagination.currentPage).toBe(1);
      expect(res.body.pagination.limit).toBe(2);
      expect(res.body.pagination.totalStudents).toBeGreaterThanOrEqual(3);
      
      res.body.students.forEach(student => {
        expect(student.course.toUpperCase()).toBe('CSE');
      });
    });

    test('should handle filter with pagination on second page', async () => {
      const res = await request(app).get('/api/students?minAge=20&page=2&limit=3');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.pagination.currentPage).toBe(2);
      expect(res.body.pagination.hasPrevPage).toBe(true);
      
      res.body.students.forEach(student => {
        expect(student.age).toBeGreaterThanOrEqual(20);
      });
    });
  });
});
