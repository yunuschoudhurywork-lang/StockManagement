require('../setup');
const request = require('supertest');
const app = require('../../app');
const Student = require('../../models/Student');
const { createTestStudent } = require('../utils');

describe('GET /api/students - Pagination', () => {
  describe('Default pagination behavior', () => {
    test('should use default page=1 and limit=10', async () => {
      // Create 15 students for pagination testing
      for (let i = 1; i <= 15; i++) {
        await Student.create(createTestStudent({ email: `student${i}@example.com` }));
      }

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
  });

  describe('Custom page and limit', () => {
    beforeEach(async () => {
      // Create 25 students for pagination testing
      for (let i = 1; i <= 25; i++) {
        await Student.create(createTestStudent({ 
          name: `Student ${i}`,
          email: `student${i}@example.com` 
        }));
      }
    });

    test('should paginate with custom page=2&limit=5', async () => {
      const res = await request(app).get('/api/students?page=2&limit=5');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students).toHaveLength(5);
      expect(res.body.pagination.currentPage).toBe(2);
      expect(res.body.pagination.limit).toBe(5);
      expect(res.body.pagination.totalStudents).toBe(25);
      expect(res.body.pagination.totalPages).toBe(5);
      expect(res.body.pagination.hasNextPage).toBe(true);
      expect(res.body.pagination.hasPrevPage).toBe(true);
    });

    test('should return page 3 with limit 10', async () => {
      const res = await request(app).get('/api/students?page=3&limit=10');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students).toHaveLength(5); // Only 5 students left on page 3
      expect(res.body.pagination.currentPage).toBe(3);
      expect(res.body.pagination.limit).toBe(10);
      expect(res.body.pagination.totalStudents).toBe(25);
      expect(res.body.pagination.totalPages).toBe(3);
      expect(res.body.pagination.hasNextPage).toBe(false);
      expect(res.body.pagination.hasPrevPage).toBe(true);
    });
  });

  describe('Edge cases for page parameter', () => {
    beforeEach(async () => {
      // Create 15 students
      for (let i = 1; i <= 15; i++) {
        await Student.create(createTestStudent({ email: `student${i}@example.com` }));
      }
    });

    test('should default page < 1 to page 1', async () => {
      const res = await request(app).get('/api/students?page=-5');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.pagination.currentPage).toBe(1);
      expect(res.body.students).toHaveLength(10);
    });

    test('should default page=0 to page 1', async () => {
      const res = await request(app).get('/api/students?page=0');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.pagination.currentPage).toBe(1);
      expect(res.body.students).toHaveLength(10);
    });

    test('should return empty array when page > totalPages', async () => {
      const res = await request(app).get('/api/students?page=999');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students).toEqual([]);
      expect(res.body.pagination.currentPage).toBe(999);
      expect(res.body.pagination.totalPages).toBe(2);
      expect(res.body.pagination.totalStudents).toBe(15);
      expect(res.body.pagination.hasNextPage).toBe(false);
      expect(res.body.pagination.hasPrevPage).toBe(true);
    });
  });

  describe('Edge cases for limit parameter', () => {
    beforeEach(async () => {
      // Create 20 students
      for (let i = 1; i <= 20; i++) {
        await Student.create(createTestStudent({ email: `student${i}@example.com` }));
      }
    });

    test('should default limit < 1 to limit 1', async () => {
      const res = await request(app).get('/api/students?limit=0');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.pagination.limit).toBe(1);
      expect(res.body.students).toHaveLength(1);
    });

    test('should default limit=-5 to limit 1', async () => {
      const res = await request(app).get('/api/students?limit=-5');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.pagination.limit).toBe(1);
      expect(res.body.students).toHaveLength(1);
    });

    test('should cap limit > 100 to limit 100', async () => {
      const res = await request(app).get('/api/students?limit=200');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.pagination.limit).toBe(100);
      expect(res.body.students).toHaveLength(20); // Only 20 students exist
    });

    test('should cap limit=500 to limit 100', async () => {
      const res = await request(app).get('/api/students?limit=500');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.pagination.limit).toBe(100);
    });
  });

  describe('Empty results', () => {
    test('should handle empty database with correct pagination metadata', async () => {
      const res = await request(app).get('/api/students');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students).toEqual([]);
      expect(res.body.pagination.currentPage).toBe(1);
      expect(res.body.pagination.totalStudents).toBe(0);
      expect(res.body.pagination.totalPages).toBe(0);
      expect(res.body.pagination.limit).toBe(10);
      expect(res.body.pagination.hasNextPage).toBe(false);
      expect(res.body.pagination.hasPrevPage).toBe(false);
    });

    test('should handle empty database with custom page and limit', async () => {
      const res = await request(app).get('/api/students?page=2&limit=5');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.students).toEqual([]);
      expect(res.body.pagination.currentPage).toBe(2);
      expect(res.body.pagination.totalStudents).toBe(0);
      expect(res.body.pagination.totalPages).toBe(0);
      expect(res.body.pagination.limit).toBe(5);
    });
  });

  describe('Pagination metadata structure', () => {
    beforeEach(async () => {
      // Create 30 students
      for (let i = 1; i <= 30; i++) {
        await Student.create(createTestStudent({ email: `student${i}@example.com` }));
      }
    });

    test('should include all required pagination metadata fields', async () => {
      const res = await request(app).get('/api/students?page=2&limit=10');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.pagination).toHaveProperty('currentPage');
      expect(res.body.pagination).toHaveProperty('totalPages');
      expect(res.body.pagination).toHaveProperty('totalStudents');
      expect(res.body.pagination).toHaveProperty('limit');
      expect(res.body.pagination).toHaveProperty('hasNextPage');
      expect(res.body.pagination).toHaveProperty('hasPrevPage');
    });

    test('should correctly calculate hasNextPage on first page', async () => {
      const res = await request(app).get('/api/students?page=1&limit=10');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.pagination.hasNextPage).toBe(true);
      expect(res.body.pagination.hasPrevPage).toBe(false);
    });

    test('should correctly calculate hasNextPage on middle page', async () => {
      const res = await request(app).get('/api/students?page=2&limit=10');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.pagination.hasNextPage).toBe(true);
      expect(res.body.pagination.hasPrevPage).toBe(true);
    });

    test('should correctly calculate hasNextPage on last page', async () => {
      const res = await request(app).get('/api/students?page=3&limit=10');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.pagination.hasNextPage).toBe(false);
      expect(res.body.pagination.hasPrevPage).toBe(true);
    });

    test('should correctly calculate totalPages', async () => {
      const res = await request(app).get('/api/students?page=1&limit=7');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.pagination.totalPages).toBe(5); // 30 students / 7 per page = 5 pages
      expect(res.body.pagination.totalStudents).toBe(30);
    });
  });
});
