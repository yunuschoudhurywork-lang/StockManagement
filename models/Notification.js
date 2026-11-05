const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: [
        'student_added',
        'student_updated',
        'student_deleted',
        'course_added',
        'course_updated',
        'course_deleted'
      ]
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      maxlength: [500, 'Message cannot exceed 500 characters'],
      trim: true
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Add index on isRead and createdAt for efficient queries
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

