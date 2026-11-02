const express = require('express');
const {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');

const router = express.Router();

// Student CRUD routes
router.get('/', getAllStudents);
router.post('/', createStudent);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

module.exports = router;
