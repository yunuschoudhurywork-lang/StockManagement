# 📦 Stock & Student Record Management System

[![Node.js](https://img.shields.io/badge/Node.js-v18+-68a063?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.21.2-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-v8.0.37-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/cloud/atlas)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3.x-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-259%20Passed-10B981?style=flat-square&logo=jest&logoColor=white)](https://jestjs.io/)
[![Coverage](https://img.shields.io/badge/Coverage-97.13%25-brightgreen?style=flat-square)](https://jestjs.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

A high-performance, full-stack web application designed for enterprise record tracking, student administration, and inventory logistics. Built strictly upon the **Model-View-Controller (MVC)** architectural pattern, the platform combines a robust Express/MongoDB Atlas backend with a distinctive, accessible **Neo-Brutalist** user interface featuring physical button physics, real-time activity auditing, multi-tier validation, and 100% route/model test coverage.

> 🚀 **Current Status:** Production Ready (Phase 1 through Phase 6 Fully Implemented & Tested)

---

## 📖 Overview

The **Stock Management System** repository hosts an operational, enterprise-grade management engine. Originally developed as the operational foundation for warehouse inventory tracking, it currently features a complete **Student Management & Institutional Operations Module** that implements all enterprise patterns:

- **Entity & Curriculum Management:** Comprehensive CRUD operations for students and academic courses.
- **Advanced Query Engine:** Server-side pagination, regular expression-escaped search, multi-attribute demographic filters, and bidirectional column sorting.
- **360-Degree Profile View:** Detailed student modal with circular avatars, dynamic enrollment status indicators, and persistent administrator remarks/audit notes.
- **Real-Time Executive Analytics:** Native CSS distribution graphs and age demographic bucketing powered by MongoDB Atlas aggregation pipelines.
- **Streaming Data Export:** On-the-fly streaming of RFC 4180-compliant CSV and structured JSON files with faceted filtering.
- **Event-Driven Activity Auditing:** Automated audit notifications triggered by state-modifying actions, synchronized in real time with an interactive header bell badge.
- **Defensive Engineering & Quality Assurance:** Hardened with Helmet HTTP headers, CORS whitelisting, multi-tier express-validator schemas, and an automated regression test suite of **259 test cases across 16 suites (97.13% statement coverage)**.

---

## ✅ Completed Features & Sprints

### 🛡️ Phase 1: Security & Cleanup
- Environment variable abstraction (`.env` & `.env.example`).
- Automated injection of 15 HTTP security headers via **Helmet**.
- Configured Cross-Origin Resource Sharing (**CORS**) origin whitelisting.
- Git credential auditing and repository scrubbing guidelines (`SECURITY_NOTES.md`).

### 🏗️ Phase 2: Layered MVC Architecture
- Modular codebase structure (`config/`, `models/`, `controllers/`, `routes/`, `middleware/`).
- Higher-order asynchronous exception wrapper (`asyncHandler`) preventing unhandled promise rejections.
- Centralized error-handling middleware (`errorHandler.js`) with Mongoose duplicate key (`E11000`) and CastError normalization.
- Strict separation of business logic from routing and presentation markup.

### 🔒 Phase 3: Multi-Tier Validation Pipeline
- **Tier 1 (Client HTML5):** Form-level native constraints (`required`, `min`, `max`, `pattern`).
- **Tier 2 (Client JavaScript):** Pre-flight DOM regex validation and instant visual error styling.
- **Tier 3 (Server express-validator):** Strict server-side validation chains for name, email (RFC 5322), phone (10 digits), age (16-100), and course length.

### 🧪 Phase 4: Automated Testing Infrastructure
- Automated test framework using **Jest v30.5.2** and **Supertest v7.3.1**.
- Zero-side-effect in-memory database execution using **mongodb-memory-server v11.3.0**.
- **259 automated test cases across 16 test suites** with a 100% pass rate.
- **97.13% Statement Coverage** and **100% Route & Model Coverage**.

### ⚡ Phase 5: Advanced Query Engine & Neo-Brutalism
- Server-side pagination with customizable boundaries (page index and records-per-page limit).
- Debounced partial search (300ms) with character escaping against ReDoS and NoSQL selector injection.
- Multi-field demographic filtering (course department match + age range bounds).
- Bidirectional column sorting (`name`, `email`, `course`, `age`, `createdAt`, `updatedAt`).
- Structured HTTP request logging with **Morgan** (`METHOD URL STATUS LATENCY - SIZE`).
- Neo-Brutalist design tokens (Charcoal `#111111`, Yellow `#FFD83D`, Bone `#F5F2EA`, Border `#333333`).

### 🚀 Phase 6: Enterprise Modules & UI Polish
- 📊 **Reports & Real-Time Analytics:** MongoDB `$facet` and `$group` aggregations calculating overview metrics, course distribution percentages, age demographic brackets (16-20, 21-25, 26-30, 31+), and 6-month enrollment trends.
- 📥 **Streaming Data Export Engine:** On-demand RFC 4180 CSV and formatted JSON stream downloads with faceted filtering support (`Content-Disposition: attachment`).
- 📚 **Course Management System:** Standalone curriculum directory with code, department, credit hours, seat capacity, status tracking, and direct student filtering.
- 🔔 **Activity Notifications & Auditing:** Automated audit trail tracking all student/course CRUD actions with live unread badge counters.
- 👁️ **360-Degree Profile View Modal:** Comprehensive inspection modal featuring circular avatars, status pill tags (`Active`, `Inactive`, `On-Leave`, `Graduated`), and persistent administrator remarks/notes.
- 🔔 **Quick Action Header:** Clickable Notification Bell (`#headerNotificationBtn`) with dynamic badge (`#headerNotificationBadge`) + Administrator Profile capsule (`#adminProfileBtn`) with live "🟢 Super Admin Active" indicator.
- 🎛️ **Tactile Button Physics:** Custom Neo-Brutalist offset shadows (`4px 4px 0px #000000`), hover translations (`-1px, -1px`), and physical active click depression (`translate(2px, 2px)` with `1px` shadow).

---

## 📁 Project Structure

```
student-management-crud/
├── config/
│   └── database.js               # MongoDB Atlas connection pooling & TLS config
├── controllers/
│   ├── courseController.js       # Course curriculum business logic & CRUD
│   ├── exportController.js       # Streaming CSV & JSON serialization handlers
│   ├── notificationController.js # Activity notifications & audit trail handlers
│   ├── reportController.js       # MongoDB aggregation pipelines for analytics
│   └── studentController.js      # Student CRUD, search, filter, sort & pagination
├── middleware/
│   ├── asyncHandler.js           # Async higher-order wrapper preventing server crashes
│   ├── errorHandler.js           # Centralized exception handler & HTTP status mapper
│   ├── notificationLogger.js     # Interceptor creating audit notifications on CRUD
│   └── validator.js              # express-validator sanitization & validation rules
├── models/
│   ├── Course.js                 # Course schema with unique code index & capacity limits
│   ├── Notification.js           # Notification schema with audit event metadata
│   └── Student.js                # Student schema with validation rules & timestamps
├── public/
│   ├── index.html                # Neo-Brutalist single-page interface & modal views
│   └── app.js                    # Client-side state manager, DOM handlers & API client
├── routes/
│   ├── courseRoutes.js           # Routes for /api/courses
│   ├── exportRoutes.js           # Routes for /api/export
│   ├── notificationRoutes.js     # Routes for /api/notifications
│   ├── reportRoutes.js           # Routes for /api/reports
│   └── studentRoutes.js          # Routes for /api/students
├── tests/
│   ├── globalSetup.js            # Jest global configuration
│   ├── setup.js                  # In-memory MongoDB lifecycle hooks
│   ├── utils.js                  # Test fixtures and factory generators
│   ├── integration/              # 13 Integration test suites (237 tests)
│   │   ├── courses.test.js
│   │   ├── export.test.js
│   │   ├── health.test.js
│   │   ├── notifications.test.js
│   │   ├── reports.test.js
│   │   ├── students.delete.test.js
│   │   ├── students.filter.test.js
│   │   ├── students.get.test.js
│   │   ├── students.pagination.test.js
│   │   ├── students.post.test.js
│   │   ├── students.put.test.js
│   │   ├── students.search.test.js
│   │   └── students.sort.test.js
│   └── unit/                     # 3 Unit test suites (22 tests)
│       ├── errorHandler.test.js
│       ├── student.model.test.js
│       └── validator.test.js
├── .env.example                  # Environment configuration template
├── app.js                        # Express application & middleware assembly
├── package.json                  # Dependencies, scripts & Jest coverage config
├── server.js                     # Application entry point with database connection
├── start-server.js               # Development daemon entry point
└── README.md                     # Master documentation
```

---

## 🛠️ API Reference

### 🏥 System Health Probe
| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `GET` | `/api/health` | Verifies server uptime and API responsiveness | `200 OK` |

---

### 👨‍🎓 Student Management Endpoints (`/api/students`)

| Method | Endpoint | Description | Query Parameters / Payload |
|---|---|---|---|
| `GET` | `/api/students` | Get paginated, filtered, and sorted students | `page`, `limit`, `search`, `course`, `minAge`, `maxAge`, `sortBy`, `order` |
| `GET` | `/api/students/:id` | Get student details by ID | Route parameter `:id` (valid MongoDB ObjectId) |
| `POST` | `/api/students` | Register a new student | `{ name, email, course, phone, age }` |
| `PUT` | `/api/students/:id` | Update student demographics | `{ name, email, course, phone, age }` |
| `PUT` | `/api/students/:id/profile` | Update status and administrator remarks | `{ status, notes }` |
| `DELETE` | `/api/students/:id` | Remove a student record | Route parameter `:id` |

#### Query Parameters Reference:
```bash
# Full-Text Search
GET /api/students?search=john

# Department & Demographic Filter
GET /api/students?course=Computer%20Science&minAge=20&maxAge=25

# Multi-Column Sorting
GET /api/students?sortBy=name&order=asc
GET /api/students?sortBy=createdAt&order=desc

# Server-Side Pagination
GET /api/students?page=1&limit=10

# Combined Query Example
GET /api/students?page=1&limit=10&search=doe&course=CSE&sortBy=name&order=asc
```

---

### 📚 Course Management Endpoints (`/api/courses`)

| Method | Endpoint | Description | Body Payload |
|---|---|---|---|
| `GET` | `/api/courses` | Retrieve all academic courses | Optional `?status=active` |
| `GET` | `/api/courses/:id` | Retrieve single course details | Route parameter `:id` |
| `POST` | `/api/courses` | Create new course entry | `{ code, name, department, credits, capacity, status }` |
| `PUT` | `/api/courses/:id` | Update course information | `{ code, name, department, credits, capacity, status }` |
| `DELETE` | `/api/courses/:id` | Delete course curriculum | Route parameter `:id` |

---

### 📊 Reports & Analytics Endpoints (`/api/reports`)

| Method | Endpoint | Description | Output Structure |
|---|---|---|---|
| `GET` | `/api/reports/overview` | Total students, distinct courses, average age | `{ totalStudents, totalCourses, avgAge }` |
| `GET` | `/api/reports/course-distribution` | Student count & percentage per department | `[{ course, count, percentage }]` |
| `GET` | `/api/reports/age-distribution` | Demographic bucket distributions | `[{ range: '16-20', count, percentage }, ...]` |
| `GET` | `/api/reports/enrollment-trends` | 6-month historical enrollment trajectories | `[{ month: 'YYYY-MM', count }]` |

---

### 📥 Data Export Endpoints (`/api/export`)

| Method | Endpoint | Format | Description |
|---|---|---|---|
| `GET` | `/api/export/csv` | RFC 4180 CSV | Streams all students with headers as `students.csv` attachment |
| `GET` | `/api/export/json` | Formatted JSON | Streams all students as downloadable `students.json` |
| `POST` | `/api/export/filtered` | CSV or JSON | Exports filtered subset `{ format: 'csv'|'json', search, course, minAge, maxAge }` |

---

### 🔔 Activity & Notification Endpoints (`/api/notifications`)

| Method | Endpoint | Description | Output / Action |
|---|---|---|---|
| `GET` | `/api/notifications` | Get recent activity notifications | Array of notification objects with `isRead` flag |
| `POST` | `/api/notifications` | Manually log an activity notification | `{ title, message, type: 'info'|'success'|'warning'|'error' }` |
| `PUT` | `/api/notifications/:id/read` | Mark a notification as read | Updates `isRead: true` |
| `DELETE` | `/api/notifications/:id` | Delete specific notification | Removes document from collection |
| `DELETE` | `/api/notifications` | Clear all notifications | Purges entire notification history |

---

## 🔒 Multi-Tier Validation Rules

| Attribute | Validation Rules & Invariants | Error Response Message |
|---|---|---|
| **Name** | Required, 2-100 characters, letters and whitespace only | `"Name must be 2-100 characters and contain only letters and spaces"` |
| **Email** | Required, valid RFC 5322 email syntax, unique index | `"Please provide a valid email address"` |
| **Phone** | Required, exactly 10 numeric digits (`^[0-9]{10}$`) | `"Phone must be exactly 10 digits"` |
| **Age** | Required, integer between 16 and 100 inclusive | `"Age must be an integer between 16 and 100"` |
| **Course** | Required, length between 2 and 100 characters | `"Course must be between 2 and 100 characters"` |
| **Course Code** | Required, unique, uppercase string (e.g. `CSE-101`) | `"Course code already exists"` |
| **Credits** | Required, integer between 1 and 6 | `"Credits must be between 1 and 6"` |
| **Capacity** | Required, integer between 1 and 500 | `"Capacity must be between 1 and 500"` |

---

## 🎨 Tactile Neo-Brutalist User Interface

The frontend avoids standard, flat web designs in favor of an intentional **Neo-Brutalist** aesthetic that maximizes clarity, accessibility, and physical feedback:

### Core Palette:
- **Primary Background (`#111111`):** Deep charcoal canvas minimizing eye fatigue.
- **Secondary Surface (`#1E1E1E`):** Elevated container cards.
- **Accent Industrial Yellow (`#FFD83D`):** High-visibility buttons, active indicators, and focus states.
- **Primary Text (`#F5F2EA`):** Warm bone off-white offering optimal contrast.
- **Border Stroke (`#333333`):** High-contrast 2px solid boundary dividers.

### Tactile Physical Shadows:
Interactive buttons implement custom CSS offset shadows that physically compress when pressed:
```css
/* Tactile Neo-Brutalist Physics */
.brutal-btn {
  box-shadow: 4px 4px 0px #000000;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
.brutal-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 5px 5px 0px #000000;
}
.brutal-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0px #000000;
}
```

---

## 🧪 Automated Testing & Verification

The test suite runs against an isolated in-memory MongoDB server, guaranteeing zero side-effects and lightning-fast execution:

```bash
# Run complete test suite with coverage report
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests in watch mode
npm run test:watch
```

### Verified Coverage Report (November 2026):
```
-------------------------------------|---------|----------|---------|---------|-------------------
File                                 | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------------------------|---------|----------|---------|---------|-------------------
All files                            |   97.13 |     90.6 |   95.83 |   97.07 |                   
 student-management-crud             |   85.36 |       50 |      75 |   85.36 |                   
  app.js                             |   94.59 |       50 |      75 |   94.59 | 53,85             
  start-server.js                    |       0 |      100 |     100 |       0 | 6-15              
 student-management-crud/controllers |   98.25 |    92.68 |   96.66 |    98.2 |                   
  courseController.js                |   97.91 |      100 |   85.71 |   97.77 | 137               
  exportController.js                |   97.95 |    92.59 |     100 |   97.95 | 121               
  notificationController.js          |   96.15 |    83.33 |     100 |   96.15 | 12                
  reportController.js                |     100 |       75 |     100 |     100 | 56-89             
  studentController.js               |    98.7 |    94.11 |     100 |    98.7 | 201               
 student-management-crud/middleware  |   97.82 |       90 |     100 |   97.72 |                   
  asyncHandler.js                    |     100 |      100 |     100 |     100 |                   
  errorHandler.js                    |   93.75 |    88.88 |     100 |   93.75 | 13                
  notificationLogger.js              |     100 |      100 |     100 |     100 |                   
  validator.js                       |     100 |      100 |     100 |     100 |                   
 student-management-crud/models      |     100 |      100 |     100 |     100 |                   
  Course.js                          |     100 |      100 |     100 |     100 |                   
  Notification.js                    |     100 |      100 |     100 |     100 |                   
  Student.js                         |     100 |      100 |     100 |     100 |                   
 student-management-crud/routes      |     100 |      100 |     100 |     100 |                   
  courseRoutes.js                    |     100 |      100 |     100 |     100 |                   
  exportRoutes.js                    |     100 |      100 |     100 |     100 |                   
  notificationRoutes.js              |     100 |      100 |     100 |     100 |                   
  reportRoutes.js                    |     100 |      100 |     100 |     100 |                   
  studentRoutes.js                   |     100 |      100 |     100 |     100 |                   
-------------------------------------|---------|----------|---------|---------|-------------------
Test Suites: 16 passed, 16 total
Tests:       259 passed, 259 total
Duration:    ~18.5 seconds
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js LTS** (v18.x or v20.x+)
- **MongoDB Atlas account** (Free M0 or dedicated cluster)
- **Git**

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/yunuschoudhurywork-lang/StockManagement.git

# Navigate to project directory
cd StockManagement/student-management-crud

# Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory (based on `.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/student_management?retryWrites=true&w=majority
CORS_ORIGIN=http://localhost:5000
NODE_ENV=development
```

### 4. Running the Application
```bash
# Start server in production mode
npm start

# Start server in development mode (with auto-reload)
npm run dev
```
Open **`http://localhost:5000`** in any browser.

---

## 🗺️ Project Roadmap

- [x] **Phase 1: Security & Cleanup** (Helmet, CORS, .env configuration)
- [x] **Phase 2: Layered MVC Architecture** (Decoupled modules, asyncHandler, errorHandler)
- [x] **Phase 3: Multi-Tier Validation** (express-validator, HTML5, regex constraints)
- [x] **Phase 4: Automated Testing Infrastructure** (Jest, Supertest, 259/259 tests passing, 97.13% coverage)
- [x] **Phase 5: Advanced Query Engine & Neo-Brutalism** (Pagination, search, filtering, sorting, Morgan logging)
- [x] **Phase 6: Enterprise Sidebar Modules & UI Polish** (Reports, CSV/JSON export, Courses, Notifications, 360° Profile View, Quick Action Header, tactile button physics)
- [ ] **Phase 7: User Authentication & Role-Based Access Control (RBAC)** (JWT tokens, bcrypt password hashing, Super Admin vs Manager roles)
- [ ] **Phase 8: Full Stock & Inventory Module** (Product catalog, SKU barcode generation, stock-in/stock-out transaction logs, low-stock webhook alerts)
- [ ] **Phase 9: Cloud CI/CD & Production Containerization** (Docker, GitHub Actions, AWS ECS/Fargate deployment)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Yunus Choudhury**  
GitHub: [@yunuschoudhurywork-lang](https://github.com/yunuschoudhurywork-lang)  
Project Repository: [StockManagement](https://github.com/yunuschoudhurywork-lang/StockManagement)
