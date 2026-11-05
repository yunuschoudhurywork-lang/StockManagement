const Student = require('../models/Student');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Export all students as CSV
 * @route   GET /api/export/csv
 * @access  Public
 */
const exportCSV = asyncHandler(async (req, res) => {
  // Query all students
  const students = await Student.find({}).sort({ createdAt: -1 });

  // Generate CSV content
  const headers = 'name,email,course,phone,age';
  const rows = students.map(student => 
    `${escapeCsvField(student.name)},${escapeCsvField(student.email)},${escapeCsvField(student.course)},${escapeCsvField(student.phone)},${student.age}`
  );
  
  const csvContent = [headers, ...rows].join('\n');

  // Set response headers for file download
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="students_export.csv"');
  
  res.send(csvContent);
});

/**
 * @desc    Export all students as JSON
 * @route   GET /api/export/json
 * @access  Public
 */
const exportJSON = asyncHandler(async (req, res) => {
  // Query all students
  const students = await Student.find({}).sort({ createdAt: -1 });

  // Set response headers for file download
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="students_export.json"');
  
  res.json(students);
});

/**
 * @desc    Export filtered students as CSV or JSON
 * @route   POST /api/export/filtered
 * @access  Public
 * @body    format - 'csv' or 'json'
 * @body    search - Search term for name or email (optional)
 * @body    course - Filter by course (optional)
 * @body    minAge - Minimum age filter (optional)
 * @body    maxAge - Maximum age filter (optional)
 */
const exportFiltered = asyncHandler(async (req, res) => {
  const { format, search, course, minAge, maxAge } = req.body;

  // Build MongoDB query using same logic as studentController.getAllStudents
  const conditions = [];

  // Search: case-insensitive partial match on name or email
  if (search) {
    const trimmedSearch = search.trim();
    conditions.push({
      $or: [
        { name: { $regex: trimmedSearch, $options: 'i' } },
        { email: { $regex: trimmedSearch, $options: 'i' } }
      ]
    });
  }

  // Filter by course: case-insensitive exact match
  if (course) {
    const trimmedCourse = course.trim();
    conditions.push({ course: { $regex: `^${trimmedCourse}$`, $options: 'i' } });
  }

  // Filter by age range
  if (minAge !== null && minAge !== undefined && minAge > 0) {
    conditions.push({ age: { $gte: parseInt(minAge) } });
  }
  if (maxAge !== null && maxAge !== undefined && maxAge > 0) {
    conditions.push({ age: { $lte: parseInt(maxAge) } });
  }

  // Combine all conditions with $and
  const query = conditions.length > 0 ? { $and: conditions } : {};

  // Execute query
  const students = await Student.find(query).sort({ createdAt: -1 });

  // Return in requested format
  if (format === 'csv') {
    // Generate CSV content
    const headers = 'name,email,course,phone,age';
    const rows = students.map(student => 
      `${escapeCsvField(student.name)},${escapeCsvField(student.email)},${escapeCsvField(student.course)},${escapeCsvField(student.phone)},${student.age}`
    );
    
    const csvContent = [headers, ...rows].join('\n');

    // Set response headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="students_filtered_export.csv"');
    
    res.send(csvContent);
  } else {
    // JSON format
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="students_filtered_export.json"');
    
    res.json(students);
  }
});

/**
 * Helper function to escape CSV fields
 * Wraps fields in quotes if they contain commas, quotes, or newlines
 */
function escapeCsvField(field) {
  if (field === null || field === undefined) {
    return '';
  }
  
  const stringField = String(field);
  
  // Check if field contains special characters
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
    // Escape quotes by doubling them and wrap in quotes
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  
  return stringField;
}

module.exports = {
  exportCSV,
  exportJSON,
  exportFiltered
};
