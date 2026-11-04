const express = require('express');
const {
  getOverview,
  getCourseDistribution,
  getAgeDistribution,
  getEnrollmentTrends
} = require('../controllers/reportController');

const router = express.Router();

// Report routes
router.get('/overview', getOverview);
router.get('/course-distribution', getCourseDistribution);
router.get('/age-distribution', getAgeDistribution);
router.get('/enrollment-trends', getEnrollmentTrends);

module.exports = router;
