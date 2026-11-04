# 📦 Stock Management System

A modern Stock Management System designed to simplify inventory tracking, product management, and stock analytics for businesses.

> 🚧 **Project Status:** Under Development

---

## 📖 Overview

The Stock Management System helps businesses efficiently manage their inventory by providing real-time stock tracking, product management, sales and purchase records, and insightful analytics.

This project aims to build a scalable, secure, and user-friendly inventory management platform using modern web technologies.

---

## 🎓 Student Management Module (Demo Implementation)

This repository currently contains a **Student Management CRUD application** as a demonstration/learning module that showcases the architecture and patterns that will be used in the full Stock Management System.

### Current Implementation Stack:
- **Frontend:** Tailwind CSS CDN, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas with Mongoose ORM
- **Architecture:** MVC Pattern with separation of concerns

### ✅ Completed Features

- ✅ **Phase 1: Security & Cleanup**
  - Environment variable management (.env)
  - Helmet security headers
  - Proper CORS configuration
  - Security documentation

- ✅ **Phase 2: MVC Architecture**
  - Modular code structure (config/, models/, controllers/, routes/, middleware/)
  - Centralized error handling
  - Async error wrapper utilities
  - Clean separation of concerns

- ✅ **Phase 3: Enhanced Validation**
  - Backend validation with express-validator
  - Frontend client-side validation
  - HTML5 form validation attributes
  - Comprehensive validation rules (email, phone, age, name, course)

- ✅ **Phase 5: Additional Features & UI Enhancement**
  - Server-side pagination (customizable page and limit)
  - Advanced search functionality (by name or email)
  - Multi-field filtering (by course and age range)
  - Sortable table columns (name, email, course, age, createdAt, updatedAt)
  - HTTP request logging with Morgan middleware
  - Brutalist UI design (Black #111111, Yellow #FFD83D, Off-white #F5F2EA palette)
  - Modern dashboard with sidebar navigation
  - Student statistics cards (total students, total courses, average age)
  - Interactive search/filter controls with debouncing
  - Pagination controls with records-per-page selector
  - Responsive design (desktop, tablet, mobile)

### Student Management Features

- Create new students with modal form
- View all students with pagination
- Edit student details
- Delete students with confirmation
- Search students by name or email
- Filter students by course and age range
- Sort students by multiple columns (ascending/descending)
- Navigate through paginated results
- View student statistics and analytics
- MongoDB Atlas integration
- Input validation (client & server)
- Error handling with user-friendly messages
- HTTP request logging for monitoring

---

## ✨ Planned Features (Full Stock Management System)

- 📊 Dashboard with inventory overview
- 📦 Product Management (CRUD)
- 🏷️ Category Management
- 📥 Stock In Management
- 📤 Stock Out Management
- 📈 Analytics and Reporting
- 👥 User Authentication & Authorization
- 🔔 Low Stock Alerts
- 📱 Responsive Design
- 🔒 Role-based Access Control

---

## 🚀 Getting Started

### 1. Prerequisites

Install these before starting:

- **Node.js LTS** from [https://nodejs.org](https://nodejs.org)
- **MongoDB Atlas account** from [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- **Git** for version control
- **VS Code** or any code editor

Check Node.js installation:

```bash
node -v
npm -v
```

### 2. Create MongoDB Atlas Database

1. Log in to MongoDB Atlas
2. Create a new project
3. Create a free `M0` cluster
4. Go to `Database Access`
5. Create a database user with username and password
6. Go to `Network Access`
7. Add your current IP address
   - ⚠️ For development only: You may use `0.0.0.0/0` (not recommended for production)
8. Go to `Database`
9. Click `Connect`
10. Select `Drivers`
11. Copy the MongoDB connection string

### 3. Clone Repository

```bash
git clone https://github.com/yunuschoudhurywork-lang/StockManagement.git
cd StockManagement/student-management-crud
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Configure Environment Variables

Create a `.env` file in the project root (use `.env.example` as template):

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string_here
CORS_ORIGIN=http://localhost:5000
```

Replace `your_mongodb_connection_string_here` with your actual MongoDB Atlas connection string.

⚠️ **Security Note:** Never commit the `.env` file to version control. It's already in `.gitignore`.

### 6. Start the Application

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start at `http://localhost:5000`

---

## 📁 Project Structure

```
student-management-crud/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   └── studentController.js # Business logic and request handlers
├── middleware/
│   ├── asyncHandler.js      # Async error wrapper utility
│   ├── errorHandler.js      # Centralized error handling
│   └── validator.js         # Input validation rules
├── models/
│   └── Student.js           # Mongoose schema and model
├── routes/
│   └── studentRoutes.js     # API route definitions
├── public/
│   ├── index.html           # Frontend UI
│   └── app.js               # Frontend JavaScript logic
├── .env                     # Environment variables (not in git)
├── .env.example             # Environment template
├── server.js                # Application entry point
├── package.json             # Dependencies and scripts
└── README.md                # Documentation
```

---

## 🔒 Validation Rules

All student data is validated on multiple levels (HTML5, client-side JS, server-side):

| Field | Rules |
|-------|-------|
| **Name** | Required, 2-100 characters, letters and spaces only |
| **Email** | Required, valid email format, unique |
| **Phone** | Required, exactly 10 digits, numeric only |
| **Age** | Required, number between 16-100 |
| **Course** | Required, 2-100 characters |

---

## 🛠️ API Endpoints

### Health Check
- `GET /api/health` - Check if API is running

### Student Management

#### Get All Students (with Pagination, Search, Filtering, and Sorting)
- `GET /api/students` - Get all students with optional query parameters

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Current page number (min: 1) |
| `limit` | number | 10 | Records per page (min: 1, max: 100) |
| `search` | string | - | Search by student name or email (case-insensitive partial match) |
| `course` | string | - | Filter by course name (case-insensitive exact match) |
| `minAge` | number | - | Filter students with age >= minAge |
| `maxAge` | number | - | Filter students with age <= maxAge |
| `sortBy` | string | createdAt | Sort field: `name`, `email`, `course`, `age`, `createdAt`, `updatedAt` |
| `order` | string | desc | Sort order: `asc` (ascending) or `desc` (descending) |

**Examples:**

```bash
# Basic pagination
GET /api/students?page=1&limit=10

# Search by name or email
GET /api/students?search=john

# Filter by course
GET /api/students?course=CSE

# Filter by age range
GET /api/students?minAge=20&maxAge=25

# Sort by name ascending
GET /api/students?sortBy=name&order=asc

# Combined query: search, filter, sort, and paginate
GET /api/students?page=1&limit=10&search=yunus&course=CSE&sortBy=name&order=asc

# Filter by course and age, sorted by age
GET /api/students?course=EEE&minAge=22&sortBy=age&order=desc
```

**Response Format:**
```json
{
  "students": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "course": "MERN Stack",
      "phone": "9876543210",
      "age": 21,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalStudents": 50,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### Create Student
- `POST /api/students` - Create a new student

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "course": "MERN Stack",
  "phone": "9876543210",
  "age": 21
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "course": "MERN Stack",
  "phone": "9876543210",
  "age": 21,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

#### Update Student
- `PUT /api/students/:id` - Update student by ID

#### Delete Student
- `DELETE /api/students/:id` - Delete student by ID

---

## 🎨 Phase 5 Brutalist Dashboard UI

The application features a modern **Brutalist design** with a bold, high-contrast aesthetic:

### Design Principles

- **Dark Theme:** Primary background `#111111` with secondary `#1A1A1A` for depth
- **Bold Yellow Accents:** `#FFD83D` for buttons, active states, and highlights
- **High Contrast:** Off-white text `#F5F2EA` on dark backgrounds for optimal readability
- **Strong Borders:** Bold `#E8E4DA` borders separating content sections
- **Minimal Rounding:** Rectangular cards with subtle corner rounding
- **Oversized Typography:** Bold, uppercase headings for visual hierarchy

### Dashboard Components

1. **Sidebar Navigation**
   - Dark background with yellow highlights for active items
   - Links to Dashboard, Students, Settings sections
   - Collapsible hamburger menu on mobile

2. **Statistics Cards**
   - Total Students count
   - Total Courses count
   - Average Age calculation
   - Dark backgrounds with yellow borders

3. **Search & Filter Controls**
   - Debounced search input (300ms delay)
   - Course filter dropdown (dynamically populated)
   - Age range inputs (minAge, maxAge)
   - Clear filters button
   - Yellow "Add Student" button

4. **Sortable Student Table**
   - Click column headers to sort (name, email, course, age)
   - Visual sort indicators (up/down arrows)
   - Hover states with yellow highlights
   - Edit and Delete action buttons

5. **Pagination Controls**
   - Previous/Next navigation buttons
   - Current page indicator (Page X of Y)
   - Records-per-page selector (10, 25, 50, 100)
   - Total records display (Showing X-Y of Z students)

6. **Modal Form**
   - Add/Edit student form in modal overlay
   - Dark background with yellow accents
   - Client-side and server-side validation
   - Toast notifications for success/error

### Responsive Behavior

- **Desktop (1920px+):** Full sidebar, statistics in row, expanded table
- **Tablet (768px-1919px):** Collapsible sidebar, stacked statistics
- **Mobile (<768px):** Hamburger menu, vertical layout, horizontal table scroll

---

## 🧪 Manual Testing

To test the validation:

1. Start the server: `npm start`
2. Open `http://localhost:5000` in browser
3. Try these test cases:

**Invalid Email:**
- Input: `john@` → Error: "Please enter a valid email address"

**Invalid Phone:**
- Input: `123` → Error: "Phone number must be exactly 10 digits"

**Invalid Age:**
- Input: `15` → Error: "Age must be between 16 and 100"

**Invalid Name:**
- Input: `John123` → Error: "Name must contain only letters"

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Generate coverage report
npm test
```

### Coverage Goal

- **Target:** >80% overall code coverage
- **View Report:** After running tests, open `coverage/lcov-report/index.html` in your browser

### Test Configuration

- **Framework:** Jest
- **API Testing:** Supertest
- **Database:** MongoDB Memory Server (in-memory for tests)
- **Test Files:** Located in `__tests__/` directory

---

## 🔐 Security Features

- ✅ **Helmet.js** - Security headers (XSS, clickjacking protection)
- ✅ **CORS** - Environment-based origin whitelisting
- ✅ **Input Validation** - express-validator with comprehensive rules
- ✅ **Environment Variables** - Sensitive data not in code
- ✅ **Error Handling** - Safe error messages (no sensitive data exposure)
- ⚠️ **Authentication** - Coming in Phase 9

---

## 🐛 Troubleshooting

### Server won't start
- Check if MongoDB URI is correct in `.env`
- Verify MongoDB Atlas network access allows your IP
- Check if port 5000 is available: `netstat -ano | findstr :5000`

### Database connection fails
- Verify username/password in connection string
- Check MongoDB Atlas cluster is running
- Ensure IP whitelist includes your address

### CORS errors in browser
- Check `CORS_ORIGIN` in `.env` matches your frontend URL
- Clear browser cache
- Check browser console for specific error messages

---

## 📚 Dependencies

### Production Dependencies:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `dotenv` - Environment variable management
- `cors` - Cross-Origin Resource Sharing
- `helmet` - Security headers
- `express-validator` - Input validation
- `morgan` - HTTP request logger middleware

### Development Dependencies:
- `nodemon` - Auto-restart server on file changes
- `jest` - Testing framework
- `supertest` - HTTP integration testing
- `mongodb-memory-server` - In-memory MongoDB for testing

### Morgan Logging

Morgan is configured to log all HTTP requests in development format:

```
GET /api/students?page=1&limit=10 200 15.234 ms - 1024
POST /api/students 201 45.123 ms - 256
PUT /api/students/507f1f77bcf86cd799439011 200 23.456 ms - 256
DELETE /api/students/507f1f77bcf86cd799439011 200 12.789 ms - 32
```

**Log Format:** `METHOD URL STATUS TIME - SIZE`

Logs appear in the console when running the server with `npm start` or `npm run dev`.

---

## 🤝 Contributing

This is currently a learning/development project. Contributions and suggestions are welcome!

---

## 📄 License

MIT License

---

## 👨‍💻 Author

**Yunus Choudhury**
- GitHub: [@yunuschoudhurywork-lang](https://github.com/yunuschoudhurywork-lang)

---

## 📝 Project Roadmap

- [x] Phase 1: Security & Cleanup
- [x] Phase 2: MVC Architecture Refactoring  
- [x] Phase 3: Enhanced Validation
- [ ] Phase 4: Testing Infrastructure
- [x] Phase 5: Additional Features (Pagination, Search, Filtering, Sorting, Morgan Logging, Brutalist UI)
- [ ] Phase 6: Production Readiness
- [ ] Phase 7: Database Migration (Optional)
- [ ] Phase 8: DevOps & Deployment
- [ ] Phase 9: Authentication & Authorization
- [ ] Phase 10: Full Stock Management Features

---

**Last Updated:** November 2026
