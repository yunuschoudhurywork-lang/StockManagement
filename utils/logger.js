/**
 * Simple console-based logger utility
 * Future: Can be replaced with Winston or similar logging library
 */

/**
 * Get formatted timestamp
 * @returns {string} Formatted timestamp
 */
const getTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Log info message
 * @param {string} message - Message to log
 */
const info = (message) => {
  console.log(`[${getTimestamp()}] [INFO] ${message}`);
};

/**
 * Log warning message
 * @param {string} message - Message to log
 */
const warn = (message) => {
  console.warn(`[${getTimestamp()}] [WARN] ${message}`);
};

/**
 * Log error message
 * @param {string} message - Message to log
 */
const error = (message) => {
  console.error(`[${getTimestamp()}] [ERROR] ${message}`);
};

module.exports = {
  info,
  warn,
  error
};
