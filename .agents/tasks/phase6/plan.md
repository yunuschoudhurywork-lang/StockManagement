# Implementation Plan: Phase 6 - Sidebar Features

This plan implements 4 new sidebar features for the Student Management System: Reports & Analytics, Export Data, Courses Management, and Notifications. The work is decomposed into 4 independent features (FEAT-001 through FEAT-004) to be implemented sequentially.

## Overview

**Tech Stack:** Express.js, MongoDB Atlas with Mongoose, Vanilla JavaScript, Tailwind CSS CDN  
**Test Framework:** Jest with Supertest and MongoDB Memory Server  
**Architecture:** MVC pattern with asyncHandler wrapper for async routes  
**Worktree:** `c:\stockmgmt\.worktrees\phase6-sidebar-features` on branch `feature/phase6-sidebar-features`  
**Coverage Goal:** >94% (minimum >80%)

## Context Summary

The project follows these patterns:
- **Controllers:** Use `asyncHandler(async (req, res) => {...})` wrapper from `middleware/asyncHandler.js`
- **Routes:** Use `express.Router()` with validation middleware before controllers
- **Models:** Mongoose schemas with `timestamps: true`
- **Tests:** Integration tests in `tests/integration/`, use `require('../setup')` for MongoDB Memory Server initialization, `createTestStudent()` factory from `tests/utils.js`
- **Validation:** express-validator with `validate` middleware from `middleware/validator.js`
- **Error Handling:** Centralized in `middleware/errorHandler.js`
- **Frontend:** Brutalist UI with colors: `#111111` background, `#FFD83D` accent, `#F5F2EA` text

## Feature Implementation Order

The features are **independent** and can be implemented in any order, but the priority order is:

1. **FEAT-001: Reports & Analytics** (Priority 1)
2. **FEAT-002: Export Data** (Priority 2)
3. **FEAT-003: Courses Management** (Priority 3)
4. **FEAT-004: Notifications** (Priority 4)

---

## FEAT-001: Reports & Analytics

### Steps

- [x] 1. Create `controllers/reportController.js` with 4 async handler functions:
      - `getOverview`: Calculate `totalStudents` (count), `totalCourses` (distinct count of course field), `avgAge` (average) using `Student.aggregate()`
      - `getCourseDistribution`: Group by course, calculate count and percentage for each
      - `getAgeDistribution`: Bucket ages into ranges (16-20, 21-25, 26-30, 31+), return count per range
      - `getEnrollmentTrends`: Group by month from `createdAt` for last 6 months, return count per month
      Files: `controllers/reportController.js`
      Verify: Create test data with `Student.create()`, fetch endpoints, verify calculations match expected values

- [x] 2. Create `routes/reportRoutes.js` with 4 GET routes (no validation middleware needed):
      - `GET /api/reports/overview`
      - `GET /api/reports/course-distribution`
      - `GET /api/reports/age-distribution`
      - `GET /api/reports/enrollment-trends`
      Files: `routes/reportRoutes.js`
      Verify: Routes are defined and export router

- [x] 3. Register `reportRoutes` in `app.js` by adding `app.use('/api/reports', reportRoutes)` after existing student routes and before the catch-all SPA route.
      Files: `app.js`
      Verify: `npm start` shows no errors, routes are registered

- [x] 4. Add REPORTS sidebar navigation item in `public/index.html` after STUDENTS, before SETTINGS. Use existing `nav-link` class pattern with `border-2 border-border-color hover:border-accent hover:bg-accent hover:text-primary-bg`.
      Files: `public/index.html`
      Verify: View page, see REPORTS link in sidebar

- [x] 5. Add reports view section in `public/index.html` with:
      - Statistics cards grid for overview data
      - CSS-based bar charts for course distribution (divs with width percentages, `bg-accent`)
      - CSS-based horizontal bars for age distribution
      - Line chart representation using divs for enrollment trends
      Follow Brutalist color scheme: `#111111` bg, `#FFD83D` accents, `#F5F2EA` text, `border-2 border-accent` on cards
      Files: `public/index.html`
      Verify: View shows placeholder structure

- [x] 6. Extend `public/app.js` with:
      - `loadReports()`: Fetch all 4 report endpoints
      - `renderReportsView()`: Display statistics and charts
      - `showReportsView()`: Navigation handler
      - Wire up REPORTS link click to `showReportsView()`
      Files: `public/app.js`
      Verify: Click REPORTS, view loads and displays data

- [x] 7. Create `tests/integration/reports.test.js` following existing test pattern:
      - `require('../setup')` for test database
      - Use `createTestStudent()` from `tests/utils.js`
      - Test each endpoint for 200 status and correct data structure
      - Test aggregation logic with known test data (e.g., create 3 CSE students, 2 EEE, verify course distribution returns correct counts and percentages)
      Files: `tests/integration/reports.test.js`
      Verify: `npm run test:integration -- reports.test.js` passes all tests

- [x] 8. Run full test suite to verify no regressions.
      Files: N/A
      Verify: `npm test` passes all tests with >94% coverage

---

## FEAT-002: Export Data

### Steps

- [x] 1. Create `controllers/exportController.js` with 3 async handler functions:
      - `exportCSV`: Query all students, format as CSV with headers (name,email,course,phone,age), set `Content-Type: text/csv` and `Content-Disposition: attachment; filename=students.csv`
      - `exportJSON`: Query all students, return JSON array with `Content-Disposition: attachment; filename=students.json`
      - `exportFiltered`: Accept POST body with `{format, search, course, minAge, maxAge}`, use same filtering logic as `studentController.getAllStudents`, return CSV or JSON based on `format` field
      Files: `controllers/exportController.js`
      Verify: Create test data, fetch endpoints, verify response headers and content format

- [x] 2. Create `routes/exportRoutes.js` with 3 routes:
      - `GET /api/export/csv`
      - `GET /api/export/json`
      - `POST /api/export/filtered` (with validation middleware: format must be 'csv' or 'json')
      Files: `routes/exportRoutes.js`
      Verify: Routes are defined and export router

- [x] 3. Register `exportRoutes` in `app.js` by adding `app.use('/api/export', exportRoutes)` after reportRoutes.
      Files: `app.js`
      Verify: `npm start` shows no errors

- [x] 4. Add EXPORT DATA sidebar navigation item in `public/index.html` after REPORTS (or after STUDENTS if REPORTS not yet added), before COURSES. Use existing `nav-link` class pattern.
      Files: `public/index.html`
      Verify: View page, see EXPORT DATA link in sidebar

- [x] 5. Add export view section in `public/index.html` with:
      - Format selector radio buttons (CSV/JSON) with `border-2 border-accent` on active format
      - Export all button (`bg-accent text-primary-bg`)
      - Export filtered button (uses current search/filter state)
      - Last-5 export history list with timestamps and download links
      - Feedback messages area
      Files: `public/index.html`
      Verify: View shows export controls

- [x] 6. Extend `public/app.js` with:
      - `exportData(format, filtered)`: Trigger downloads using fetch with blob response
      - `showExportView()`: Navigation handler
      - `updateExportHistory()`: Store exports in localStorage with timestamp and format
      - `renderExportHistory()`: Display last 5 exports
      - Use existing `state` object for current filters
      - Wire up EXPORT DATA link click to `showExportView()`
      Files: `public/app.js`
      Verify: Click EXPORT DATA, select format, click export, file downloads

- [x] 7. Create `tests/integration/export.test.js` following existing test pattern:
      - Test `GET /api/export/csv` returns `text/csv` with correct headers and student data rows
      - Test `GET /api/export/json` returns JSON array
      - Test `POST /api/export/filtered` with search/course/age filters returns only matching students in specified format
      - Test `Content-Disposition` header includes filename
      - Test empty database returns empty CSV/JSON
      Files: `tests/integration/export.test.js`
      Verify: `npm run test:integration -- export.test.js` passes all tests

- [x] 8. Run full test suite to verify no regressions.
      Files: N/A
      Verify: `npm test` passes all tests with >94% coverage

---

## FEAT-003: Courses Management

### Steps

- [x] 1. Create `models/Course.js` with Mongoose schema:
      - `name`: String, required, unique, trim
      - `description`: String, optional, trim
      - `capacity`: Number, optional, min: 1
      - `timestamps: true`
      - Add index on `name` field for efficient lookups
      Files: `models/Course.js`
      Verify: Model exports successfully

- [x] 2. Create `controllers/courseController.js` with 6 async handler functions:
      - `getAllCourses`: List all with student counts via aggregation lookup to Student collection
      - `createCourse`: Validate unique name, trim inputs
      - `updateCourse`: By id, validate unique name if changed
      - `deleteCourse`: Check `Student.countDocuments({course: courseName})`, prevent deletion if count > 0, return 400 error with message
      - `getCourseStudents`: By courseName, return students enrolled in that course
      - `getCourseByName`: Helper for validation
      Files: `controllers/courseController.js`
      Verify: Create courses, verify student counts, test delete prevention

- [x] 3. Create `routes/courseRoutes.js` with 5 routes and validation:
      - `GET /api/courses`
      - `POST /api/courses` (validation: name required 2-100 chars, description optional max 500 chars, capacity optional positive integer)
      - `PUT /api/courses/:id` (same validation as POST)
      - `DELETE /api/courses/:id`
      - `GET /api/courses/:courseName/students`
      Files: `routes/courseRoutes.js`
      Verify: Routes are defined with validation

- [x] 4. Update `controllers/studentController.js` to validate course field:
      - In `createStudent`: Add `await Course.findOne({name: req.body.course})`, return 400 error if not found
      - In `updateStudent`: Same validation if course field is being updated
      - Add comment explaining referential integrity enforcement
      - Import Course model at top
      Files: `controllers/studentController.js`
      Verify: Create student with non-existent course returns 400 error

- [x] 5. Register `courseRoutes` in `app.js` by adding `app.use('/api/courses', courseRoutes)` after exportRoutes.
      Files: `app.js`
      Verify: `npm start` shows no errors

- [x] 6. Add COURSES sidebar navigation item in `public/index.html` after EXPORT DATA, before NOTIFICATIONS. Use existing `nav-link` class pattern.
      Files: `public/index.html`
      Verify: View page, see COURSES link in sidebar

- [x] 7. Add courses view section in `public/index.html` with:
      - Course list table: name, description, capacity, student count, actions (edit/delete buttons)
      - Add course button (`bg-accent text-primary-bg`)
      - Search input for filtering courses
      - Modal form for add/edit with name/description/capacity fields (Brutalist styling)
      - View enrolled students modal
      Files: `public/index.html`
      Verify: View shows course management interface

- [x] 8. Extend `public/app.js` with:
      - `loadCourses()`: Fetch courses
      - `renderCoursesView()`: Display table and modals
      - `addCourse()`, `editCourse()`, `deleteCourse()`: CRUD handlers
      - `viewCourseStudents(courseName)`: Show enrolled students
      - `searchCourses()`: Filter with debounce
      - Update `addStudent`/`editStudent` forms to fetch and display course dropdown from `/api/courses` instead of free text input
      - Wire up COURSES link click to `showCoursesView()`
      Files: `public/app.js`
      Verify: Click COURSES, add course, edit, view students, delete (with prevention if students enrolled)

- [x] 9. Create `tests/integration/courses.test.js` following existing test pattern:
      - Test `GET /api/courses` returns courses with counts
      - Test `POST /api/courses` creates course with valid data
      - Test `POST /api/courses` fails with duplicate name
      - Test `PUT /api/courses/:id` updates course
      - Test `DELETE /api/courses/:id` prevents deletion when students enrolled
      - Test `DELETE /api/courses/:id` succeeds when no students enrolled
      - Test `GET /api/courses/:courseName/students` returns enrolled students
      - Test `POST /api/students` fails with non-existent course
      Files: `tests/integration/courses.test.js`
      Verify: `npm run test:integration -- courses.test.js` passes all tests

- [x] 10. Run full test suite to verify no regressions.
       Files: N/A
       Verify: `npm test` passes all tests with >94% coverage

---

## FEAT-004: Notifications

### Steps

- [x] 1. Create `models/Notification.js` with Mongoose schema:
      - `type`: String, required, enum: ['student_added', 'student_updated', 'student_deleted', 'course_added', 'course_updated', 'course_deleted']
      - `message`: String, required, max 500 chars
      - `isRead`: Boolean, default: false
      - `timestamps: true`
      - Add indexes on `isRead` and `createdAt` for efficient queries
      Files: `models/Notification.js`
      Verify: Model exports successfully

- [x] 2. Create `controllers/notificationController.js` with 4 async handler functions:
      - `getAllNotifications`: GET last 20, sorted by `createdAt` desc
      - `createNotification`: POST, for manual notifications or testing
      - `markAsRead`: PUT by id, sets `isRead` to true
      - `deleteNotification`: DELETE by id
      Files: `controllers/notificationController.js`
      Verify: Test endpoints work with test data

- [x] 3. Create `middleware/notificationLogger.js` with 6 functions:
      - `logStudentAdded(student)`: Creates notification with type 'student_added', message 'Student [name] was added'
      - `logStudentUpdated(student)`: Creates notification with type 'student_updated'
      - `logStudentDeleted(student)`: Creates notification with type 'student_deleted'
      - `logCourseAdded(course)`: Creates notification with type 'course_added'
      - `logCourseUpdated(course)`: Creates notification with type 'course_updated'
      - `logCourseDeleted(course)`: Creates notification with type 'course_deleted'
      Each function creates a Notification document
      Files: `middleware/notificationLogger.js`
      Verify: Call functions, verify notifications created in database

- [x] 4. Update `controllers/studentController.js` to log notifications:
      - After successful `createStudent`: `await notificationLogger.logStudentAdded(student)`
      - After successful `updateStudent`: `await notificationLogger.logStudentUpdated(student)`
      - After successful `deleteStudent`: `await notificationLogger.logStudentDeleted({name: student.name})`
      - Import `notificationLogger` at top
      Files: `controllers/studentController.js`
      Verify: Create/update/delete student, verify notifications created

- [x] 5. Update `controllers/courseController.js` to log notifications:
      - After successful `createCourse`: `await notificationLogger.logCourseAdded(course)`
      - After successful `updateCourse`: `await notificationLogger.logCourseUpdated(course)`
      - After successful `deleteCourse`: `await notificationLogger.logCourseDeleted({name: course.name})`
      - Import `notificationLogger` at top
      Files: `controllers/courseController.js`
      Verify: Create/update/delete course, verify notifications created

- [x] 6. Create `routes/notificationRoutes.js` with 4 routes:
      - `GET /api/notifications`
      - `POST /api/notifications` (validation: type enum, message required)
      - `PUT /api/notifications/:id/read`
      - `DELETE /api/notifications/:id`
      Files: `routes/notificationRoutes.js`
      Verify: Routes are defined with validation

- [x] 7. Register `notificationRoutes` in `app.js` by adding `app.use('/api/notifications', notificationRoutes)` after courseRoutes.
      Files: `app.js`
      Verify: `npm start` shows no errors

- [x] 8. Add NOTIFICATIONS sidebar navigation item in `public/index.html` after COURSES, before SETTINGS:
      - Use existing `nav-link` class pattern
      - Add unread badge `<span id="notificationBadge">` with `bg-error text-white rounded-full` positioned absolute, hidden by default
      Files: `public/index.html`
      Verify: View page, see NOTIFICATIONS link with badge area

- [x] 9. Add notifications view section in `public/index.html` with:
      - Notification list: type icon, message, relative timestamp, mark-as-read button for unread items
      - Clear all button
      - Empty state message
      - Style: unread notifications with `border-accent`, read with `border-border-color`
      Files: `public/index.html`
      Verify: View shows notification interface

- [x] 10. Extend `public/app.js` with:
       - `loadNotifications()`: Fetch notifications
       - `renderNotificationsView()`: Display list with relative timestamps ('2 minutes ago' using helper function)
       - `markNotificationAsRead(id)`: Mark as read
       - `deleteNotification(id)`: Delete notification
       - `updateNotificationBadge()`: Show count of unread
       - `pollNotifications()`: setInterval to refresh every 30 seconds
       - Call `updateNotificationBadge()` on page load and after any student/course operations
       - Wire up NOTIFICATIONS link click to `showNotificationsView()`
       Files: `public/app.js`
       Verify: Click NOTIFICATIONS, see list, mark as read, verify badge updates

- [x] 11. Create `tests/integration/notifications.test.js` following existing test pattern:
       - Test `GET /api/notifications` returns last 20 sorted by date
       - Test `POST /api/notifications` creates notification with valid data
       - Test `PUT /api/notifications/:id/read` marks as read
       - Test `DELETE /api/notifications/:id` removes notification
       - Test notification is auto-created when student created
       - Test notification is auto-created when course deleted
       - Test notifications are auto-created on all CRUD operations
       Files: `tests/integration/notifications.test.js`
       Verify: `npm run test:integration -- notifications.test.js` passes all tests

- [x] 12. Run full test suite to verify no regressions.
       Files: N/A
       Verify: `npm test` passes all tests with >94% coverage

---

## Sidebar Navigation Final State

After all features are implemented, the sidebar should have these items in order:

1. DASHBOARD (existing)
2. STUDENTS (existing)
3. REPORTS (new - FEAT-001)
4. EXPORT DATA (new - FEAT-002)
5. COURSES (new - FEAT-003)
6. NOTIFICATIONS (new - FEAT-004, with unread badge)
7. SETTINGS (existing)

---

## Global Verification

After implementing all features:

1. **Run full test suite:**
   ```bash
   npm test
   ```
   Verify >94% coverage and all tests pass.

2. **Manual testing:**
   ```bash
   npm run dev
   ```
   - Navigate to http://localhost:5000
   - Test each new sidebar item loads its view
   - Test Reports shows statistics and charts
   - Test Export downloads CSV and JSON files
   - Test Courses CRUD operations and student validation
   - Test Notifications appear after operations and badge updates
   - Verify existing Students CRUD still works
   - Verify Brutalist UI styling is consistent

3. **Coverage report:**
   Open `coverage/lcov-report/index.html` to verify coverage >94% for new files.

---

## Notes

- All new routes must be registered in `app.js` before the catch-all SPA route `app.get('*', ...)`
- Use `asyncHandler` wrapper for all async controller functions
- Follow existing validation pattern with express-validator
- Use MongoDB aggregation for reports to minimize queries
- Frontend state management follows existing pattern in `public/app.js`
- Notifications use polling (30s interval) - no WebSockets needed
- Course validation creates referential integrity between Student and Course models

```json
{"planReady": true}
```
