const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Course name is required'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    capacity: {
      type: Number,
      min: [1, 'Capacity must be at least 1']
    }
  },
  { timestamps: true }
);

// Index is automatically created by unique: true
// courseSchema.index({ name: 1 });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
