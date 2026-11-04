require('../setup');
const request = require('supertest');
const app = require('../../app');
const Student = require('../../models/Student');
const { createTestStudent } = require('../utils');

describe('GET /api/students - Search', () => {
  beforeEach(async () => {
    // Create diverse test data with different names and emails
    await Student.create(createTestStudent({ 
      name: 'John Doe', 
      email: 'john.doe@example.com',
      course: 'CSE'
    }));
    await Student.create(createTestStudent({ 
      name: 'Jane Smith', 
      email: 'jane.smith@example.com',
      course: 'EEE'
    }));
    await Student.create(createTestStudent({ 
      name: 'Bob Johnson', 
      email: 'bob.johnson@example.com',
      course: 'CSE'
    }));
    await Student.create(createTestStudent({ 
      name: 'Alice Williams', 
      email: 'alice@test.com',
      course: 'BBA'
    }));
    await Student.create(createTestStudent({ 
      name: 'Charlie Brown', 
      email: 'charlie@example.org',
      course: 'CSE'
    }));
    await Student.create(createTestStudent({ 
      name: 'David Miller', 
      email: 'david.miller@test.org',
      course: 'EEE'
    }));
  });

  describe('Search by name', () => {
    test('should search by name partial match (case-insensitive)', async () => {
      const res = await request(app).get('/api/students?search=john');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(2); // John Doe and Bob Johnson
      
      const names = res.body.students.map(s => s.name.toLowerCase());
      names.forEach(name => {
        expect(name).toContain('john');
      });
    });

    test('should search by name with uppercase query (case-insensitive)', async () => {
      const res = await request(app).get('/api/students?search=ALICE');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(1);
      
      const found = res.body.students.find(s => s.name === 'Alice Williams');
      expect(found).toBeDefined();
    });

    test('should search by name with mixed case query', async () => {
      const res = await request(app).get('/api/students?search=BrOwN');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(1);
      
      const found = res.body.students.find(s => s.name === 'Charlie Brown');
      expect(found).toBeDefined();
    });
  });

  describe('Search by email', () => {
    test('should search by email partial match (case-insensitive)', async () => {
      const res = await request(app).get('/api/students?search=jane');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(1);
      
      const found = res.body.students.find(s => s.email === 'jane.smith@example.com');
      expect(found).toBeDefined();
    });

    test('should search by email domain', async () => {
      const res = await request(app).get('/api/students?search=test.com');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(1);
      
      res.body.students.forEach(student => {
        expect(student.email.toLowerCase()).toContain('test.com');
      });
    });

    test('should search by email with uppercase (case-insensitive)', async () => {
      const res = await request(app).get('/api/students?search=EXAMPLE.ORG');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(1);
      
      res.body.students.forEach(student => {
        expect(student.email.toLowerCase()).toContain('example.org');
      });
    });
  });

  describe('Search with no results', () => {
    test('should return empty array when search has no matches', async () => {
      const res = await request(app).get('/api/students?search=nonexistent12345');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students).toEqual([]);
      expect(res.body.pagination.totalStudents).toBe(0);
      expect(res.body.pagination.totalPages).toBe(0);
    });

    test('should return empty array for very specific non-matching search', async () => {
      const res = await request(app).get('/api/students?search=xyz@notfound.com');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students).toEqual([]);
      expect(res.body.pagination.totalStudents).toBe(0);
    });
  });

  describe('Search combined with pagination', () => {
    test('should combine search with pagination', async () => {
      const res = await request(app).get('/api/students?search=john&page=1&limit=5');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeLessThanOrEqual(5);
      expect(res.body.pagination.currentPage).toBe(1);
      expect(res.body.pagination.limit).toBe(5);
      
      res.body.students.forEach(student => {
        const matchesName = student.name.toLowerCase().includes('john');
        const matchesEmail = student.email.toLowerCase().includes('john');
        expect(matchesName || matchesEmail).toBe(true);
      });
    });

    test('should paginate search results correctly', async () => {
      // Add more students with common search term
      for (let i = 1; i <= 10; i++) {
        await Student.create(createTestStudent({ 
          name: `Test Student ${i}`,
          email: `test${i}@example.com`
        }));
      }

      const res = await request(app).get('/api/students?search=test&page=1&limit=5');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students).toHaveLength(5);
      expect(res.body.pagination.currentPage).toBe(1);
      expect(res.body.pagination.totalStudents).toBeGreaterThanOrEqual(10);
      expect(res.body.pagination.hasNextPage).toBe(true);
    });
  });

  describe('Search with special characters', () => {
    test('should handle search with dots (email addresses)', async () => {
      const res = await request(app).get('/api/students?search=john.doe');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(1);
      
      const found = res.body.students.find(s => s.email === 'john.doe@example.com');
      expect(found).toBeDefined();
    });

    test('should handle search with @ symbol', async () => {
      const res = await request(app).get('/api/students?search=@example.com');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(1);
      
      res.body.students.forEach(student => {
        expect(student.email).toContain('@example.com');
      });
    });

    test('should escape regex special characters safely', async () => {
      // Test that regex special chars don't break the search
      const res = await request(app).get('/api/students?search=(test)');
      
      expect(res.statusCode).toBe(200);
      // Should not throw an error and should return results (likely empty)
      expect(Array.isArray(res.body.students)).toBe(true);
    });

    test('should handle search with brackets', async () => {
      const res = await request(app).get('/api/students?search=[abc]');
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.students)).toBe(true);
    });
  });

  describe('Empty search parameter', () => {
    test('should return all students when search param is empty string', async () => {
      const res = await request(app).get('/api/students?search=');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(6); // All seeded students
      expect(res.body.pagination.totalStudents).toBeGreaterThanOrEqual(6);
    });

    test('should return all students when search param is whitespace', async () => {
      const res = await request(app).get('/api/students?search=%20'); // URL encoded space
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe('Search matches in both name and email', () => {
    test('should return results matching either name or email', async () => {
      const res = await request(app).get('/api/students?search=miller');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students.length).toBeGreaterThanOrEqual(1);
      
      // Should match "David Miller" by name and "david.miller@test.org" by email
      const found = res.body.students.find(s => 
        s.name === 'David Miller' || s.email === 'david.miller@test.org'
      );
      expect(found).toBeDefined();
    });

    test('should search across multiple fields with OR logic', async () => {
      const res = await request(app).get('/api/students?search=alice');
      
      expect(res.statusCode).toBe(200);
      
      // Should match Alice Williams by name OR alice@test.com by email
      res.body.students.forEach(student => {
        const matchesName = student.name.toLowerCase().includes('alice');
        const matchesEmail = student.email.toLowerCase().includes('alice');
        expect(matchesName || matchesEmail).toBe(true);
      });
    });
  });
});
