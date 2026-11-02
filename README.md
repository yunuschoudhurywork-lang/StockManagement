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

### Student Management Features

- Create new students
- View all students (sorted by newest first)
- Edit student details
- Delete students
- MongoDB Atlas integration
- Input validation (client & server)
- Error handling with user-friendly messages

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
- `GET /api/students` - Get all students (sorted by newest)
- `POST /api/students` - Create a new student
- `PUT /api/students/:id` - Update student by ID
- `DELETE /api/students/:id` - Delete student by ID

### Request/Response Examples

**Create Student:**
```json
POST /api/students
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

---

## 🧪 Testing

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

### Development Dependencies:
- `nodemon` - Auto-restart server on file changes

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
- [ ] Phase 5: Additional Features (Pagination, Search, Filtering)
- [ ] Phase 6: Production Readiness
- [ ] Phase 7: Database Migration (Optional)
- [ ] Phase 8: DevOps & Deployment
- [ ] Phase 9: Authentication & Authorization
- [ ] Phase 10: Full Stock Management Features

---

**Last Updated:** November 2026
