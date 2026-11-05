const express = require('express');
const { body } = require('express-validator');
const {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStudents
} = require('../controllers/courseController');
const { validate } = require('../middleware/validator');

const router = express.Router();

// Validation rules for creating a course
const validateCreateCourse = [
  body('name')
    .trim()
    .notEmpty().withMessage('Course name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Course name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  
  body('capacity')
    .optional()
    .isInt({ min: 1 }).withMessage('Capacity must be a positive integer')
];

// Validation rules for updating a course
const validateUpdateCourse = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Course name must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  
  body('capacity')
    .optional()
    .isInt({ min: 1 }).withMessage('Capacity must be a positive integer')
];

// Course CRUD routes
router.get('/', getAllCourses);
router.post('/', validateCreateCourse, validate, createCourse);
router.put('/:id', validateUpdateCourse, validate, updateCourse);
router.delete('/:id', deleteCourse);
router.get('/:courseName/students', getCourseStudents);

module.exports = router;
