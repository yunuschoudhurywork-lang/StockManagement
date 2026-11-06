const express = require('express');
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');
const { validateCreateStudent, validateUpdateStudent, validate } = require('../middleware/validator');

const router = express.Router();

// Student CRUD routes
router.get('/', getAllStudents);
router.get('/:id', getStudentById);
router.post('/', validateCreateStudent, validate, createStudent);
router.put('/:id', validateUpdateStudent, validate, updateStudent);
router.delete('/:id', deleteStudent);

module.exports = router;
