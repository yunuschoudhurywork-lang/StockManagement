const Student = require('../models/Student');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Get overview statistics
 * @route   GET /api/reports/overview
 * @access  Public
 */
const getOverview = asyncHandler(async (req, res) => {
  const overview = await Student.aggregate([
    {
      $group: {
        _id: null,
        totalStudents: { $sum: 1 },
        avgAge: { $avg: '$age' }
      }
    }
  ]);

  // Get unique courses count
  const courses = await Student.distinct('course');
  const totalCourses = courses.length;

  const result = {
    totalStudents: overview.length > 0 ? overview[0].totalStudents : 0,
    totalCourses,
    avgAge: overview.length > 0 ? Math.round(overview[0].avgAge * 10) / 10 : 0
  };

  res.json(result);
});

/**
 * @desc    Get course distribution with count and percentage
 * @route   GET /api/reports/course-distribution
 * @access  Public
 */
const getCourseDistribution = asyncHandler(async (req, res) => {
  const distribution = await Student.aggregate([
    {
      $group: {
        _id: '$course',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  const totalStudents = await Student.countDocuments();

  const result = distribution.map(item => ({
    course: item._id,
    count: item.count,
    percentage: totalStudents > 0 ? Math.round((item.count / totalStudents) * 100 * 10) / 10 : 0
  }));

  res.json(result);
});

/**
 * @desc    Get age distribution by ranges
 * @route   GET /api/reports/age-distribution
 * @access  Public
 */
const getAgeDistribution = asyncHandler(async (req, res) => {
  const distribution = await Student.aggregate([
    {
      $bucket: {
        groupBy: '$age',
        boundaries: [16, 21, 26, 31, 101],
        default: 'Other',
        output: {
          count: { $sum: 1 }
        }
      }
    }
  ]);

  const ranges = {
    16: '16-20',
    21: '21-25',
    26: '26-30',
    31: '31+'
  };

  const result = distribution.map(item => ({
    range: ranges[item._id] || 'Other',
    count: item.count
  }));

  res.json(result);
});

/**
 * @desc    Get enrollment trends for last 6 months
 * @route   GET /api/reports/enrollment-trends
 * @access  Public
 */
const getEnrollmentTrends = asyncHandler(async (req, res) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const trends = await Student.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const result = trends.map(item => ({
    month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
    count: item.count
  }));

  res.json(result);
});

module.exports = {
  getOverview,
  getCourseDistribution,
  getAgeDistribution,
  getEnrollmentTrends
};
