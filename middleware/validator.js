const { body, validationResult } = require('express-validator');

/**
 * Validation rules for creating a student (all fields required)
 */
const validateCreateStudent = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name must contain only letters and spaces'),

  body('email')
    .trim()
    .normalizeEmail()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address'),

  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\d{10}$/).withMessage('Phone number must be exactly 10 digits'),

  body('age')
    .notEmpty().withMessage('Age is required')
    .isInt({ min: 16, max: 100 }).withMessage('Age must be between 16 and 100'),

  body('course')
    .trim()
    .notEmpty().withMessage('Course is required')
    .isLength({ min: 2, max: 100 }).withMessage('Course must be between 2 and 100 characters'),

  body('photo')
    .optional()
    .trim()
];

/**
 * Validation rules for updating a student (all fields optional but validated if present)
 */
const validateUpdateStudent = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name must contain only letters and spaces'),

  body('email')
    .optional()
    .trim()
    .normalizeEmail()
    .isEmail().withMessage('Please enter a valid email address'),

  body('phone')
    .optional()
    .trim()
    .matches(/^\d{10}$/).withMessage('Phone number must be exactly 10 digits'),

  body('age')
    .optional()
    .isInt({ min: 16, max: 100 }).withMessage('Age must be between 16 and 100'),

  body('course')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Course must be between 2 and 100 characters'),

  body('photo')
    .optional()
    .trim()
];

/**
 * Middleware to check validation results and return errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.path,
      message: error.msg
    }));

    return res.status(400).json({
      message: formattedErrors.map((e) => e.message).join(', '),
      errors: formattedErrors
    });
  }

  next();
};

module.exports = { validateCreateStudent, validateUpdateStudent, validate };
