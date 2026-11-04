require('../setup');
const request = require('supertest');
const app = require('../../app');
const Student = require('../../models/Student');
const { createTestStudent } = require('../utils');

describe('GET /api/students - Sorting', () => {
  beforeEach(async () => {
    // Create test data with varied fields for sorting
    // Wait between creates to ensure distinct createdAt timestamps
    await Student.create(createTestStudent({ 
      name: 'Charlie Brown', 
      email: 'charlie@example.com',
      course: 'CSE',
      age: 25
    }));
    await new Promise(r => setTimeout(r, 5));
    
    await Student.create(createTestStudent({ 
      name: 'Alice Johnson', 
      email: 'alice@example.com',
      course: 'EEE',
      age: 20
    }));
    await new Promise(r => setTimeout(r, 5));
    
    await Student.create(createTestStudent({ 
      name: 'Bob Smith', 
      email: 'bob@example.com',
      course: 'BBA',
      age: 22
    }));
    await new Promise(r => setTimeout(r, 5));
    
    await Student.create(createTestStudent({ 
      name: 'David Wilson', 
      email: 'david@example.com',
      course: 'CSE',
      age: 30
    }));
    await new Promise(r => setTimeout(r, 5));
    
    await Student.create(createTestStudent({ 
      name: 'Eve Davis', 
      email: 'eve@example.com',
      course: 'MBA',
      age: 18
    }));
  });

  describe('Sort by name', () => {
    test('should sort by name ascending', async () => {
      const res = await request(app).get('/api/students?sortBy=name&order=asc');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(5);
      
      const names = res.body.students.map(s => s.name);
      expect(names[0]).toBe('Alice Johnson');
      expect(names[1]).toBe('Bob Smith');
      expect(names[2]).toBe('Charlie Brown');
      expect(names[3]).toBe('David Wilson');
      expect(names[4]).toBe('Eve Davis');
    });

    test('should sort by name descending', async () => {
      const res = await request(app).get('/api/students?sortBy=name&order=desc');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(5);
      
      const names = res.body.students.map(s => s.name);
      expect(names[0]).toBe('Eve Davis');
      expect(names[1]).toBe('David Wilson');
      expect(names[2]).toBe('Charlie Brown');
      expect(names[3]).toBe('Bob Smith');
      expect(names[4]).toBe('Alice Johnson');
    });
  });

  describe('Sort by email', () => {
    test('should sort by email ascending', async () => {
      const res = await request(app).get('/api/students?sortBy=email&order=asc');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(5);
      
      const emails = res.body.students.map(s => s.email);
      // Verify alphabetical order
      for (let i = 0; i < emails.length - 1; i++) {
        expect(emails[i].localeCompare(emails[i + 1])).toBeLessThanOrEqual(0);
      }
      
      expect(emails[0]).toBe('alice@example.com');
      expect(emails[1]).toBe('bob@example.com');
    });

    test('should sort by email descending', async () => {
      const res = await request(app).get('/api/students?sortBy=email&order=desc');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(5);
      
      const emails = res.body.students.map(s => s.email);
      // Verify reverse alphabetical order
      for (let i = 0; i < emails.length - 1; i++) {
        expect(emails[i].localeCompare(emails[i + 1])).toBeGreaterThanOrEqual(0);
      }
      
      expect(emails[0]).toBe('eve@example.com');
    });
  });

  describe('Sort by course', () => {
    test('should sort by course ascending', async () => {
      const res = await request(app).get('/api/students?sortBy=course&order=asc');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(5);
      
      const courses = res.body.students.map(s => s.course);
      // Verify alphabetical order
      for (let i = 0; i < courses.length - 1; i++) {
        expect(courses[i].localeCompare(courses[i + 1])).toBeLessThanOrEqual(0);
      }
      
      expect(courses[0]).toBe('BBA');
    });

    test('should sort by course descending', async () => {
      const res = await request(app).get('/api/students?sortBy=course&order=desc');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(5);
      
      const courses = res.body.students.map(s => s.course);
      // Verify reverse alphabetical order
      for (let i = 0; i < courses.length - 1; i++) {
        expect(courses[i].localeCompare(courses[i + 1])).toBeGreaterThanOrEqual(0);
      }
      
      expect(courses[0]).toBe('MBA');
    });
  });

  describe('Sort by age', () => {
    test('should sort by age ascending', async () => {
      const res = await request(app).get('/api/students?sortBy=age&order=asc');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(5);
      
      const ages = res.body.students.map(s => s.age);
      expect(ages[0]).toBe(18); // Eve
      expect(ages[1]).toBe(20); // Alice
      expect(ages[2]).toBe(22); // Bob
      expect(ages[3]).toBe(25); // Charlie
      expect(ages[4]).toBe(30); // David
    });

    test('should sort by age descending', async () => {
      const res = await request(app).get('/api/students?sortBy=age&order=desc');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(5);
      
      const ages = res.body.students.map(s => s.age);
      expect(ages[0]).toBe(30); // David
      expect(ages[1]).toBe(25); // Charlie
      expect(ages[2]).toBe(22); // Bob
      expect(ages[3]).toBe(20); // Alice
      expect(ages[4]).toBe(18); // Eve
    });
  });

  describe('Sort by createdAt (default)', () => {
    test('should sort by createdAt descending (default)', async () => {
      const res = await request(app).get('/api/students');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(5);
      
      const dates = res.body.students.map(s => new Date(s.createdAt).getTime());
      // Verify descending order (newest first)
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
      }
      
      // Eve was created last, should be first
      expect(res.body.students[0].name).toBe('Eve Davis');
    });

    test('should sort by createdAt ascending when specified', async () => {
      const res = await request(app).get('/api/students?sortBy=createdAt&order=asc');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(5);
      
      const dates = res.body.students.map(s => new Date(s.createdAt).getTime());
      // Verify ascending order (oldest first)
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i]).toBeLessThanOrEqual(dates[i + 1]);
      }
      
      // Charlie was created first, should be first
      expect(res.body.students[0].name).toBe('Charlie Brown');
    });

    test('should sort by createdAt descending when explicitly specified', async () => {
      const res = await request(app).get('/api/students?sortBy=createdAt&order=desc');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(5);
      
      const dates = res.body.students.map(s => new Date(s.createdAt).getTime());
      // Verify descending order
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
      }
    });
  });

  describe('Sort by updatedAt', () => {
    test('should sort by updatedAt ascending', async () => {
      const res = await request(app).get('/api/students?sortBy=updatedAt&order=asc');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(5);
      
      const dates = res.body.students.map(s => new Date(s.updatedAt).getTime());
      // Verify ascending order
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i]).toBeLessThanOrEqual(dates[i + 1]);
      }
    });

    test('should sort by updatedAt descending', async () => {
      const res = await request(app).get('/api/students?sortBy=updatedAt&order=desc');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(5);
      
      const dates = res.body.students.map(s => new Date(s.updatedAt).getTime());
      // Verify descending order
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
      }
    });
  });

  describe('Invalid sortBy field', () => {
    test('should default to createdAt when sortBy is invalid', async () => {
      const res = await request(app).get('/api/students?sortBy=invalidField');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(5);
      
      // Should fall back to createdAt desc (default)
      const dates = res.body.students.map(s => new Date(s.createdAt).getTime());
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
      }
    });

    test('should default to createdAt desc when sortBy is empty', async () => {
      const res = await request(app).get('/api/students?sortBy=');
      
      expect(res.statusCode).toBe(200);
      const dates = res.body.students.map(s => new Date(s.createdAt).getTime());
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
      }
    });
  });

  describe('Invalid order parameter', () => {
    test('should default to desc when order is invalid', async () => {
      const res = await request(app).get('/api/students?sortBy=name&order=invalid');
      
      expect(res.statusCode).toBe(200);
      const names = res.body.students.map(s => s.name);
      // Should sort descending (Z to A)
      expect(names[0]).toBe('Eve Davis');
      expect(names[4]).toBe('Alice Johnson');
    });

    test('should default to desc when order is uppercase ASC (case-sensitive check)', async () => {
      const res = await request(app).get('/api/students?sortBy=name&order=ASC');
      
      expect(res.statusCode).toBe(200);
      const names = res.body.students.map(s => s.name);
      // Order check is case-sensitive, so ASC defaults to desc
      expect(names[0]).toBe('Eve Davis');
      expect(names[4]).toBe('Alice Johnson');
    });
  });

  describe('Sort combined with pagination and search', () => {
    test('should combine sortBy with pagination', async () => {
      const res = await request(app).get('/api/students?sortBy=name&order=asc&page=1&limit=3');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students).toHaveLength(3);
      expect(res.body.pagination.currentPage).toBe(1);
      expect(res.body.pagination.limit).toBe(3);
      
      const names = res.body.students.map(s => s.name);
      expect(names[0]).toBe('Alice Johnson');
      expect(names[1]).toBe('Bob Smith');
      expect(names[2]).toBe('Charlie Brown');
    });

    test('should combine sortBy with search', async () => {
      const res = await request(app).get('/api/students?sortBy=name&order=asc&search=son');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(2); // Alice Johnson, Bob Smith/David Wilson
      
      const names = res.body.students.map(s => s.name);
      // Verify sorted order among search results
      for (let i = 0; i < names.length - 1; i++) {
        expect(names[i].localeCompare(names[i + 1])).toBeLessThanOrEqual(0);
      }
    });

    test('should combine sortBy with filters', async () => {
      const res = await request(app).get('/api/students?sortBy=age&order=asc&course=CSE');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(2); // Charlie(25), David(30)
      
      res.body.students.forEach(student => {
        expect(student.course).toBe('CSE');
      });
      
      const ages = res.body.students.map(s => s.age);
      expect(ages[0]).toBe(25); // Charlie
      expect(ages[1]).toBe(30); // David
    });

    test('should combine sortBy, search, filters, and pagination', async () => {
      // Add more CSE students for better testing
      await Student.create(createTestStudent({ 
        name: 'Frank Test', 
        email: 'frank@example.com',
        course: 'CSE',
        age: 19
      }));
      
      const res = await request(app).get('/api/students?sortBy=age&order=asc&course=CSE&search=example&page=1&limit=5');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.pagination.currentPage).toBe(1);
      expect(res.body.pagination.limit).toBe(5);
      
      res.body.students.forEach(student => {
        expect(student.course).toBe('CSE');
        const matchesName = student.name.toLowerCase().includes('example');
        const matchesEmail = student.email.toLowerCase().includes('example');
        expect(matchesName || matchesEmail).toBe(true);
      });
      
      // Verify sorted by age ascending
      const ages = res.body.students.map(s => s.age);
      for (let i = 0; i < ages.length - 1; i++) {
        expect(ages[i]).toBeLessThanOrEqual(ages[i + 1]);
      }
    });
  });

  describe('Sort order stability', () => {
    test('should maintain consistent order for same values', async () => {
      // Create students with same age
      await Student.create(createTestStudent({ 
        name: 'Same Age 1', 
        email: 'same1@example.com',
        age: 24
      }));
      await Student.create(createTestStudent({ 
        name: 'Same Age 2', 
        email: 'same2@example.com',
        age: 24
      }));
      
      const res = await request(app).get('/api/students?sortBy=age&order=asc');
      
      expect(res.statusCode).toBe(200);
      
      // Find students with age 24
      const age24Students = res.body.students.filter(s => s.age === 24);
      expect(age24Students.length).toBeGreaterThanOrEqual(2);
    });
  });
});
