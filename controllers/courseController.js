const Course = require('../models/Course');
const Student = require('../models/Student');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Get all courses with student counts
 * @route   GET /api/courses
 * @access  Public
 */
const getAllCourses = asyncHandler(async (req, res) => {
  // Fetch all courses
  const courses = await Course.find().sort({ name: 1 });
  
  // Get student count for each course using aggregation
  const coursesWithCounts = await Promise.all(
    courses.map(async (course) => {
      const studentCount = await Student.countDocuments({ course: course.name });
      return {
        _id: course._id,
        name: course.name,
        description: course.description,
        capacity: course.capacity,
        studentCount,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt
      };
    })
  );
  
  res.json(coursesWithCounts);
});

/**
 * @desc    Create new course
 * @route   POST /api/courses
 * @access  Public
 */
const createCourse = asyncHandler(async (req, res) => {
  // Trim inputs
  const courseData = {
    name: req.body.name?.trim(),
    description: req.body.description?.trim(),
    capacity: req.body.capacity
  };
  
  const course = await Course.create(courseData);
  res.status(201).json(course);
});

/**
 * @desc    Update course by ID
 * @route   PUT /api/courses/:id
 * @access  Public
 */
const updateCourse = asyncHandler(async (req, res) => {
  // Trim inputs
  const updateData = {};
  if (req.body.name !== undefined) updateData.name = req.body.name.trim();
  if (req.body.description !== undefined) updateData.description = req.body.description.trim();
  if (req.body.capacity !== undefined) updateData.capacity = req.body.capacity;
  
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  );
  
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }
  
  res.json(course);
});

/**
 * @desc    Delete course by ID (prevent if students enrolled)
 * @route   DELETE /api/courses/:id
 * @access  Public
 */
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }
  
  // Check if any students are enrolled in this course
  const enrolledStudents = await Student.countDocuments({ course: course.name });
  
  if (enrolledStudents > 0) {
    return res.status(400).json({
      message: `Cannot delete course. ${enrolledStudents} student(s) are currently enrolled in this course.`
    });
  }
  
  await Course.findByIdAndDelete(req.params.id);
  res.json({ message: 'Course deleted successfully' });
});

/**
 * @desc    Get students enrolled in a specific course
 * @route   GET /api/courses/:courseName/students
 * @access  Public
 */
const getCourseStudents = asyncHandler(async (req, res) => {
  const courseName = req.params.courseName;
  
  // Verify course exists
  const course = await Course.findOne({ name: courseName });
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }
  
  // Get all students enrolled in this course
  const students = await Student.find({ course: courseName }).sort({ name: 1 });
  
  res.json({
    course: courseName,
    studentCount: students.length,
    students
  });
});

/**
 * @desc    Get course by name (helper for validation)
 * @route   Internal helper function
 * @access  Internal
 */
const getCourseByName = async (courseName) => {
  return await Course.findOne({ name: courseName });
};

module.exports = {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStudents,
  getCourseByName
};
