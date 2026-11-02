# Student Management CRUD

A simple full-stack internship demo project using:

- Tailwind CSS CDN
- Plain JavaScript
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose

## Features

- Add a student
- View all students
- Edit student details
- Delete a student
- Store data in MongoDB Atlas

## 1. Prerequisites

Install these before starting:

- Node.js LTS from `https://nodejs.org`
- A MongoDB Atlas account from `https://www.mongodb.com/cloud/atlas`
- VS Code or any code editor

Check Node.js installation:

```bash
node -v
npm -v
```

## 2. Create MongoDB Atlas Database

1. Log in to MongoDB Atlas.
2. Create a new project.
3. Create a free `M0` cluster.
4. Go to `Database Access`.
5. Create a database user with username and password.
6. Go to `Network Access`.
7. Add your current IP address.
8. For a classroom demo only, you may temporarily use `0.0.0.0/0` to allow access from anywhere.
9. Go to `Database`.
10. Click `Connect`.
11. Select `Drivers`.
12. Copy the MongoDB connection string.

The connection string looks like this:

```text
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

Add a database name before the question mark:

```text
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/student_management?retryWrites=true&w=majority
```

Replace `<username>` and `<password>` with your Atlas database user details.

## 3. Set Up Project

Open a terminal in this folder:

```bash
cd student-management-crud
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```bash
copy .env.example .env
```

On macOS or Linux, use:

```bash
cp .env.example .env
```

Open `.env` and paste your MongoDB Atlas connection string:

```env
PORT=5000
MONGODB_URI=mongodb+srv://yourUsername:yourPassword@cluster0.xxxxx.mongodb.net/student_management?retryWrites=true&w=majority
```

## 4. Run Project

For development:

```bash
npm run dev
```

Or run normally:

```bash
npm start
```

Open the app in your browser:

```text
http://localhost:5000
```

## 5. API Routes

| Method | URL | Description |
| --- | --- | --- |
| GET | `/api/health` | Check API status |
| GET | `/api/students` | Get all students |
| POST | `/api/students` | Add a student |
| PUT | `/api/students/:id` | Update a student |
| DELETE | `/api/students/:id` | Delete a student |

## 6. Student Data Format

```json
{
  "name": "Anita Sharma",
  "email": "anita@example.com",
  "course": "MERN Stack",
  "phone": "9876543210",
  "age": 21
}
```

## 7. Project Structure

```text
student-management-crud/
  public/
    index.html
    app.js
  .env.example
  .gitignore
  package.json
  README.md
  server.js
```

## 8. Classroom Demo Flow

1. Explain that the browser sends requests using `fetch`.
2. Show `public/app.js` for frontend JavaScript.
3. Show Express routes in `server.js`.
4. Show the Mongoose schema in `server.js`.
5. Add one student from the UI.
6. Refresh the page and show that data remains because it is stored in MongoDB Atlas.
7. Edit the student.
8. Delete the student.

## 9. Common Issues

### MongoDB connection error

Check that:

- The `.env` file exists.
- `MONGODB_URI` is correct.
- Username and password are correct.
- Your IP address is allowed in MongoDB Atlas Network Access.

### Port already in use

Change the port in `.env`:

```env
PORT=5001
```

Then open:

```text
http://localhost:5001
```

### Tailwind styles not loading

This project uses Tailwind from the CDN:

```html
<script src="https://cdn.tailwindcss.com"></script>
```

An internet connection is required for Tailwind styles to load.

## 10. Validation Rules

All student fields are validated on both the frontend (browser) and the backend (server). The server-side validation uses `express-validator` and always runs even if the client-side check is bypassed.

### Field Rules

| Field  | Rule                                | Example Valid        | Example Invalid     |
|--------|-------------------------------------|----------------------|---------------------|
| Name   | Required, 2-100 characters, letters and spaces only | Anita Sharma | John123, A |
| Email  | Required, valid email format        | anita@example.com    | notanemail, missing@ |
| Phone  | Required, exactly 10 numeric digits | 9876543210           | 98765, 98765abcde   |
| Age    | Required, integer between 16 and 100 | 21                  | 15, 101, abc        |
| Course | Required, 2-100 characters          | MERN Stack           | A (too short)        |

### Error Response Format

When validation fails, the API returns HTTP 400 with:

```json
{
  "message": "Phone number must be exactly 10 digits, Age must be between 16 and 100",
  "errors": [
    { "field": "phone", "message": "Phone number must be exactly 10 digits" },
    { "field": "age",   "message": "Age must be between 16 and 100" }
  ]
}
```

### Dependencies Added

- `express-validator` — middleware-based validation for Express.js

