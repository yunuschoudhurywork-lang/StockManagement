# Phase 3 Validation — Test Plan

Generated as part of Phase 3: Enhanced Validation.

## How to Start the Server

```bash
cd c:\stockmgmt\student-management-crud
npm start
```

Open browser: http://localhost:5000

---

## Validation Rules Summary

| Field  | Rule                                      | Error Message                                        |
|--------|-------------------------------------------|------------------------------------------------------|
| name   | Required, 2-100 chars, letters/spaces only | Name must contain only letters and spaces            |
| email  | Required, valid email format              | Please enter a valid email address                   |
| phone  | Required, exactly 10 digits               | Phone number must be exactly 10 digits               |
| age    | Required, integer 16-100                  | Age must be between 16 and 100                       |
| course | Required, 2-100 chars                     | Course must be between 2 and 100 characters          |

---

## Test Cases

### Name Field

| Input          | Expected Result  | Expected Error                                        |
|----------------|------------------|-------------------------------------------------------|
| "Anita Sharma" | Valid            | —                                                     |
| "A"            | Invalid          | Name must be at least 2 characters and contain only letters |
| "John123"      | Invalid          | Name must contain only letters and spaces             |
| ""             | Invalid          | Name must be at least 2 characters and contain only letters |
| "A B C D..." (101 chars) | Invalid | Name must not exceed 100 characters             |

### Email Field

| Input               | Expected Result | Expected Error                          |
|---------------------|-----------------|-----------------------------------------|
| "anita@example.com" | Valid           | —                                       |
| "notanemail"        | Invalid         | Please enter a valid email address      |
| "missing@"          | Invalid         | Please enter a valid email address      |
| ""                  | Invalid         | Email is required                       |

### Phone Field

| Input         | Expected Result | Expected Error                            |
|---------------|-----------------|-------------------------------------------|
| "9876543210"  | Valid           | —                                         |
| "98765"       | Invalid         | Phone number must be exactly 10 digits    |
| "98765abcde"  | Invalid         | Phone number must be exactly 10 digits    |
| "12345678901" | Invalid         | Phone number must be exactly 10 digits    |
| ""            | Invalid         | Phone number is required                  |

### Age Field

| Input | Expected Result | Expected Error                   |
|-------|-----------------|----------------------------------|
| 21    | Valid           | —                                |
| 16    | Valid           | —                                |
| 100   | Valid           | —                                |
| 15    | Invalid         | Age must be between 16 and 100   |
| 101   | Invalid         | Age must be between 16 and 100   |
| 0     | Invalid         | Age must be between 16 and 100   |
| "abc" | Invalid         | Age must be between 16 and 100   |

### Course Field

| Input         | Expected Result | Expected Error                                  |
|---------------|-----------------|-------------------------------------------------|
| "MERN Stack"  | Valid           | —                                               |
| "A"           | Invalid         | Course must be at least 2 characters            |
| ""            | Invalid         | Course must be at least 2 characters            |

---

## Manual Testing Steps

### Test 1: Empty form submission
1. Open http://localhost:5000
2. Click "Save Student" without filling in anything
3. Expected: Browser prevents submission (HTML required attribute)

### Test 2: Invalid name
1. Enter name: "John123"
2. Fill other fields with valid data
3. Click Save Student
4. Expected: Error message "Name must contain only letters and spaces"

### Test 3: Invalid email
1. Enter email: "notanemail"
2. Fill other fields with valid data
3. Click Save Student
4. Expected: Error message "Please enter a valid email address"

### Test 4: Invalid phone
1. Enter phone: "12345"
2. Fill other fields with valid data
3. Click Save Student
4. Expected: Error message "Phone number must be exactly 10 digits"

### Test 5: Age out of range
1. Enter age: 15
2. Fill other fields with valid data
3. Click Save Student
4. Expected: Error message "Age must be between 16 and 100"

### Test 6: Valid student
1. Name: "Anita Sharma", Email: "anita@example.com", Course: "MERN Stack", Phone: "9876543210", Age: 21
2. Click Save Student
3. Expected: Success message, student appears in table

### Test 7: Backend validation via API (curl or Postman)
```bash
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"A\", \"email\": \"bad\", \"phone\": \"123\", \"age\": 5, \"course\": \"X\"}"
```
Expected response (400):
```json
{
  "message": "Name must be between 2 and 100 characters, Please enter a valid email address, Phone number must be exactly 10 digits, Age must be between 16 and 100, Course must be between 2 and 100 characters",
  "errors": [
    { "field": "name", "message": "Name must be between 2 and 100 characters" },
    { "field": "email", "message": "Please enter a valid email address" },
    { "field": "phone", "message": "Phone number must be exactly 10 digits" },
    { "field": "age", "message": "Age must be between 16 and 100" },
    { "field": "course", "message": "Course must be between 2 and 100 characters" }
  ]
}
```
