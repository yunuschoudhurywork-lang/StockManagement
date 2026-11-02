const express = require('express');
const {
  getHealth,
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');

const router = express.Router();

// Health check
router.get('/health', getHealth);

// Student CRUD routes
router.get('/', getAllStudents);
router.post('/', createStudent);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

module.exports = router;
