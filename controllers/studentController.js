const Student = require('../models/Student');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Health check endpoint
 * @route   GET /api/health
 * @access  Public
 */
const getHealth = asyncHandler(async (req, res) => {
  res.json({ message: 'Student Management API is running' });
});

/**
 * @desc    Get all students
 * @route   GET /api/students
 * @access  Public
 */
const getAllStudents = asyncHandler(async (req, res) => {
  const students = await Student.find().sort({ createdAt: -1 });
  res.json(students);
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
  getHealth,
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent
};
