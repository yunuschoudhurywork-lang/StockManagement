const express = require('express');
const { body } = require('express-validator');
const {
  exportCSV,
  exportJSON,
  exportFiltered
} = require('../controllers/exportController');
const { validate } = require('../middleware/validator');

const router = express.Router();

// Validation rules for filtered export
const validateFilteredExport = [
  body('format')
    .notEmpty().withMessage('Format is required')
    .isIn(['csv', 'json']).withMessage('Format must be either "csv" or "json"')
];

// Export routes
router.get('/csv', exportCSV);
router.get('/json', exportJSON);
router.post('/filtered', validateFilteredExport, validate, exportFiltered);

module.exports = router;
