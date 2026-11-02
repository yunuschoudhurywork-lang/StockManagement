/**
 * Extract validation message from Mongoose ValidationError
 * @param {Error} error - Mongoose error object
 * @returns {string} Formatted error message
 */
function getValidationMessage(error) {
  if (error.name === 'ValidationError') {
    return Object.values(error.errors)
      .map((item) => item.message)
      .join(', ');
  }

  return 'Something went wrong';
}

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', err.message);

  // express-validator errors (already handled in validate middleware, but guard here too)
  if (err.type === 'validation') {
    return res.status(400).json({
      message: err.message,
      errors: err.errors || []
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: getValidationMessage(err)
    });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid student id'
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      message: 'A student with this email already exists'
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    message: err.message || 'Something went wrong'
  });
};

module.exports = errorHandler;
