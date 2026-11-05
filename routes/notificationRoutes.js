const express = require('express');
const { body } = require('express-validator');
const {
  getAllNotifications,
  createNotification,
  markAsRead,
  deleteNotification,
  clearAllNotifications
} = require('../controllers/notificationController');
const { validate } = require('../middleware/validator');

const router = express.Router();

const validTypes = [
  'student_added',
  'student_updated',
  'student_deleted',
  'course_added',
  'course_updated',
  'course_deleted'
];

const validateCreateNotification = [
  body('type')
    .notEmpty().withMessage('Notification type is required')
    .isIn(validTypes).withMessage(`Notification type must be one of: ${validTypes.join(', ')}`),
  body('message')
    .trim()
    .notEmpty().withMessage('Notification message is required')
    .isLength({ max: 500 }).withMessage('Message must not exceed 500 characters')
];

router.get('/', getAllNotifications);
router.post('/', validateCreateNotification, validate, createNotification);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);
router.delete('/', clearAllNotifications);

module.exports = router;

