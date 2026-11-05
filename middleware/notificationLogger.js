const Notification = require('../models/Notification');

/**
 * Log student added notification
 * @param {Object} student 
 */
const logStudentAdded = async (student) => {
  return await Notification.create({
    type: 'student_added',
    message: `Student ${student.name} was added`
  });
};

/**
 * Log student updated notification
 * @param {Object} student 
 */
const logStudentUpdated = async (student) => {
  return await Notification.create({
    type: 'student_updated',
    message: `Student ${student.name} was updated`
  });
};

/**
 * Log student deleted notification
 * @param {Object} student 
 */
const logStudentDeleted = async (student) => {
  return await Notification.create({
    type: 'student_deleted',
    message: `Student ${student.name} was deleted`
  });
};

/**
 * Log course added notification
 * @param {Object} course 
 */
const logCourseAdded = async (course) => {
  return await Notification.create({
    type: 'course_added',
    message: `Course ${course.name} was added`
  });
};

/**
 * Log course updated notification
 * @param {Object} course 
 */
const logCourseUpdated = async (course) => {
  return await Notification.create({
    type: 'course_updated',
    message: `Course ${course.name} was updated`
  });
};

/**
 * Log course deleted notification
 * @param {Object} course 
 */
const logCourseDeleted = async (course) => {
  return await Notification.create({
    type: 'course_deleted',
    message: `Course ${course.name} was deleted`
  });
};

module.exports = {
  logStudentAdded,
  logStudentUpdated,
  logStudentDeleted,
  logCourseAdded,
  logCourseUpdated,
  logCourseDeleted
};

