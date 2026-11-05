const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Get recent notifications (up to 20, latest first)
 * @route   GET /api/notifications
 * @access  Public
 */
const getAllNotifications = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.unread === 'true') {
    query.isRead = false;
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(20);

  res.json(notifications);
});

/**
 * @desc    Create manual notification (testing or manual triggers)
 * @route   POST /api/notifications
 * @access  Public
 */
const createNotification = asyncHandler(async (req, res) => {
  const { type, message } = req.body;

  const notification = await Notification.create({
    type,
    message: message?.trim()
  });

  res.status(201).json(notification);
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Public
 */
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    { new: true, runValidators: true }
  );

  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  res.json(notification);
});

/**
 * @desc    Delete notification by ID
 * @route   DELETE /api/notifications/:id
 * @access  Public
 */
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndDelete(req.params.id);

  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  res.json({ message: 'Notification deleted successfully' });
});

/**
 * @desc    Clear all notifications
 * @route   DELETE /api/notifications
 * @access  Public
 */
const clearAllNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({});
  res.json({ message: 'All notifications cleared successfully' });
});

module.exports = {
  getAllNotifications,
  createNotification,
  markAsRead,
  deleteNotification,
  clearAllNotifications
};

