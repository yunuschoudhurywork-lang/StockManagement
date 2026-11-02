require('../setup');
const mongoose = require('mongoose');
const Student = require('../../models/Student');

describe('Student Model', () => {
  test('should create a valid student with all required fields', async () => {
    const student = await Student.create({
      name: 'Alice Smith',
      email: 'alice@example.com',
      course: 'Mathematics',
      phone: '9876543210',
      age: 22
    });
    expect(student._id).toBeDefined();
    expect(student.name).toBe('Alice Smith');
    expect(student.email).toBe('alice@example.com');
  });

  test('should fail without name (required field)', async () => {
    const student = new Student({ email: 'a@b.com', course: 'CS', phone: '1234567890', age: 20 });
    await expect(student.save()).rejects.toThrow();
  });

  test('should fail without email (required field)', async () => {
    const student = new Student({ name: 'Alice', course: 'CS', phone: '1234567890', age: 20 });
    await expect(student.save()).rejects.toThrow();
  });

  test('should fail without course (required field)', async () => {
    const student = new Student({ name: 'Alice', email: 'a@b.com', phone: '1234567890', age: 20 });
    await expect(student.save()).rejects.toThrow();
  });

  test('should fail without phone (required field)', async () => {
    const student = new Student({ name: 'Alice', email: 'a@b.com', course: 'CS', age: 20 });
    await expect(student.save()).rejects.toThrow();
  });

  test('should fail without age (required field)', async () => {
    const student = new Student({ name: 'Alice', email: 'a@b.com', course: 'CS', phone: '1234567890' });
    await expect(student.save()).rejects.toThrow();
  });

  test('should enforce unique email constraint', async () => {
    await Student.create({ name: 'Alice', email: 'unique@example.com', course: 'CS', phone: '1234567890', age: 20 });
    const duplicate = new Student({ name: 'Bob', email: 'unique@example.com', course: 'Math', phone: '0987654321', age: 21 });
    await expect(duplicate.save()).rejects.toThrow();
  });

  test('should trim whitespace from name', async () => {
    const student = await Student.create({
      name: '  Alice Smith  ',
      email: 'trim@example.com',
      course: 'CS',
      phone: '1234567890',
      age: 20
    });
    expect(student.name).toBe('Alice Smith');
  });

  test('should trim whitespace from email', async () => {
    const student = await Student.create({
      name: 'Alice',
      email: '  trimmed@example.com  ',
      course: 'CS',
      phone: '1234567890',
      age: 20
    });
    expect(student.email).toBe('trimmed@example.com');
  });

  test('should convert email to lowercase', async () => {
    const student = await Student.create({
      name: 'Alice',
      email: 'UPPER@EXAMPLE.COM',
      course: 'CS',
      phone: '1234567890',
      age: 20
    });
    expect(student.email).toBe('upper@example.com');
  });

  test('should enforce minimum age of 1', async () => {
    const student = new Student({
      name: 'Alice',
      email: 'age@example.com',
      course: 'CS',
      phone: '1234567890',
      age: 0
    });
    await expect(student.save()).rejects.toThrow();
  });

  test('should create timestamps (createdAt, updatedAt)', async () => {
    const student = await Student.create({
      name: 'Alice',
      email: 'ts@example.com',
      course: 'CS',
      phone: '1234567890',
      age: 20
    });
    expect(student.createdAt).toBeDefined();
    expect(student.updatedAt).toBeDefined();
  });

  test('should update updatedAt on modification', async () => {
    const student = await Student.create({
      name: 'Alice',
      email: 'update@example.com',
      course: 'CS',
      phone: '1234567890',
      age: 20
    });
    const originalUpdatedAt = student.updatedAt;
    // Wait 10ms to ensure time difference
    await new Promise(resolve => setTimeout(resolve, 10));
    const updated = await Student.findByIdAndUpdate(
      student._id,
      { name: 'Alice Updated' },
      { new: true }
    );
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
  });
});
