const Student = require('../models/Student');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Get all students with pagination, search, filtering, and sorting
 * @route   GET /api/students
 * @access  Public
 * @query   page - Page number (default: 1, min: 1)
 * @query   limit - Records per page (default: 10, min: 1, max: 100)
 * @query   search - Search term for name or email (case-insensitive partial match)
 * @query   course - Filter by course (case-insensitive exact match)
 * @query   minAge - Minimum age filter (positive integer)
 * @query   maxAge - Maximum age filter (positive integer)
 * @query   sortBy - Field to sort by (default: 'createdAt', allowed: name, email, course, age, createdAt, updatedAt)
 * @query   order - Sort order: 'asc' or 'desc' (default: 'desc')
 */
const getAllStudents = asyncHandler(async (req, res) => {
  // Extract and validate query parameters
  let page = req.query.page ? parseInt(req.query.page) : 1;
  let limit = req.query.limit ? parseInt(req.query.limit) : 10;
  const search = req.query.search ? req.query.search.trim() : null;
  const course = req.query.course ? req.query.course.trim() : null;
  const minAge = req.query.minAge ? parseInt(req.query.minAge) : null;
  const maxAge = req.query.maxAge ? parseInt(req.query.maxAge) : null;
  const sortBy = req.query.sortBy || 'createdAt';
  const order = req.query.order === 'asc' ? 'asc' : 'desc';

  // Validate and constrain page
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  // Validate and constrain limit
  if (isNaN(limit) || limit < 1) {
    limit = 1;
  }
  if (limit > 100) {
    limit = 100;
  }

  // Validate sortBy field
  const allowedSortFields = ['name', 'email', 'course', 'age', 'createdAt', 'updatedAt'];
  const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

  // Build MongoDB query
  const conditions = [];

  // Search: case-insensitive partial match on name or email
  if (search) {
    conditions.push({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    });
  }

  // Filter by course: case-insensitive exact match
  if (course) {
    conditions.push({ course: { $regex: `^${course}$`, $options: 'i' } });
  }

  // Filter by age range
  if (minAge !== null && minAge > 0) {
    conditions.push({ age: { $gte: minAge } });
  }
  if (maxAge !== null && maxAge > 0) {
    conditions.push({ age: { $lte: maxAge } });
  }

  // Combine all conditions with $and
  const query = conditions.length > 0 ? { $and: conditions } : {};

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Execute queries
  const sortOrder = order === 'asc' ? 1 : -1;
  const students = await Student.find(query)
    .sort({ [validSortBy]: sortOrder })
    .skip(skip)
    .limit(limit);

  const totalStudents = await Student.countDocuments(query);
  const totalPages = Math.ceil(totalStudents / limit);

  // Handle page beyond last page: return empty array with valid metadata
  const currentPage = page > totalPages && totalPages > 0 ? page : page;
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // Return response with pagination metadata
  res.json({
    students,
    pagination: {
      currentPage,
      totalPages,
      totalStudents,
      limit,
      hasNextPage,
      hasPrevPage
    }
  });
});

/**
 * @desc    Create new student
 * @route   POST /api/students
 * @access  Public
 */
const createStudent = asyncHandler(async (req, res) => {
  const student = await Student.create(req.body);
  res.status(201).json(student);
});

/**
 * @desc    Update student by ID
 * @route   PUT /api/students/:id
 * @access  Public
 */
const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  res.json(student);
});

/**
 * @desc    Delete student by ID
 * @route   DELETE /api/students/:id
 * @access  Public
 */
const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndDelete(req.params.id);

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  res.json({ message: 'Student deleted successfully' });
});

module.exports = {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent
};
