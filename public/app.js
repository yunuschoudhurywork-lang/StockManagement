const API_URL = '/api/students';

const form = document.getElementById('studentForm');
const studentIdInput = document.getElementById('studentId');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const courseInput = document.getElementById('course');
const phoneInput = document.getElementById('phone');
const ageInput = document.getElementById('age');
const messageBox = document.getElementById('message');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const refreshBtn = document.getElementById('refreshBtn');
const studentsTable = document.getElementById('studentsTable');
const emptyState = document.getElementById('emptyState');
const studentCount = document.getElementById('studentCount');

let students = [];

form.addEventListener('submit', saveStudent);
cancelEditBtn.addEventListener('click', resetForm);
refreshBtn.addEventListener('click', loadStudents);

loadStudents();

async function loadStudents() {
  try {
    const response = await fetch(API_URL);
    students = await response.json();

    if (!response.ok) {
      throw new Error(students.message || 'Failed to load students');
    }

    renderStudents();
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

/**
 * Validates student form data on the client side.
 * Returns null if valid, or an error message string if invalid.
 * @param {Object} student - The student data object
 * @returns {string|null}
 */
function validateStudent(student) {
  const namePattern = /^[a-zA-Z\s]+$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^\d{10}$/;

  if (!student.name || student.name.length < 2) {
    return 'Name must be at least 2 characters and contain only letters';
  }
  if (!namePattern.test(student.name)) {
    return 'Name must contain only letters and spaces';
  }
  if (student.name.length > 100) {
    return 'Name must not exceed 100 characters';
  }

  if (!student.email) {
    return 'Email is required';
  }
  if (!emailPattern.test(student.email)) {
    return 'Please enter a valid email address';
  }

  if (!student.phone) {
    return 'Phone number is required';
  }
  if (!phonePattern.test(student.phone)) {
    return 'Phone number must be exactly 10 digits';
  }

  const age = Number(student.age);
  if (!student.age && student.age !== 0) {
    return 'Age is required';
  }
  if (isNaN(age) || age < 16 || age > 100) {
    return 'Age must be between 16 and 100';
  }

  if (!student.course || student.course.length < 2) {
    return 'Course must be at least 2 characters';
  }
  if (student.course.length > 100) {
    return 'Course must not exceed 100 characters';
  }

  return null;
}

async function saveStudent(event) {
  event.preventDefault();

  const student = {
    name: nameInput.value.trim(),
    email: emailInput.value.trim(),
    course: courseInput.value.trim(),
    phone: phoneInput.value.trim(),
    age: Number(ageInput.value)
  };

  // Client-side validation before making API call
  const validationError = validateStudent(student);
  if (validationError) {
    showMessage(validationError, 'error');
    return;
  }

  const studentId = studentIdInput.value;
  const isEditing = Boolean(studentId);

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = isEditing ? 'Updating...' : 'Saving...';

    const response = await fetch(isEditing ? `${API_URL}/${studentId}` : API_URL, {
      method: isEditing ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(student)
    });

    const result = await response.json();

    if (!response.ok) {
      // If the backend returned structured validation errors, display them all
      if (response.status === 400 && result.errors && result.errors.length > 0) {
        const errorMessages = result.errors.map((e) => e.message).join(', ');
        throw new Error(`Validation Error: ${errorMessages}`);
      }
      throw new Error(result.message || 'Unable to save student');
    }

    showMessage(isEditing ? 'Student updated successfully' : 'Student added successfully', 'success');
    resetForm();
    await loadStudents();
  } catch (error) {
    showMessage(error.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = studentIdInput.value ? 'Update Student' : 'Save Student';
  }
}

function renderStudents() {
  studentsTable.innerHTML = '';
  emptyState.classList.toggle('hidden', students.length > 0);
  studentCount.textContent = `${students.length} student${students.length === 1 ? '' : 's'} found`;

  students.forEach((student) => {
    const row = document.createElement('tr');
    row.className = 'border-b border-slate-100 hover:bg-slate-50';

    row.innerHTML = `
      <td class="px-3 py-3 font-medium text-slate-900">${escapeHtml(student.name)}</td>
      <td class="px-3 py-3 text-slate-600">${escapeHtml(student.email)}</td>
      <td class="px-3 py-3 text-slate-600">${escapeHtml(student.course)}</td>
      <td class="px-3 py-3 text-slate-600">${escapeHtml(student.phone)}</td>
      <td class="px-3 py-3 text-slate-600">${student.age}</td>
      <td class="px-3 py-3">
        <div class="flex justify-end gap-2">
          <button
            class="rounded-md border border-blue-200 px-3 py-1.5 font-medium text-blue-700 hover:bg-blue-50"
            type="button"
            data-action="edit"
            data-id="${student._id}"
          >
            Edit
          </button>
          <button
            class="rounded-md border border-red-200 px-3 py-1.5 font-medium text-red-700 hover:bg-red-50"
            type="button"
            data-action="delete"
            data-id="${student._id}"
          >
            Delete
          </button>
        </div>
      </td>
    `;

    studentsTable.appendChild(row);
  });
}

studentsTable.addEventListener('click', async (event) => {
  const button = event.target.closest('button');

  if (!button) {
    return;
  }

  const studentId = button.dataset.id;
  const action = button.dataset.action;

  if (action === 'edit') {
    editStudent(studentId);
  }

  if (action === 'delete') {
    await deleteStudent(studentId);
  }
});

function editStudent(studentId) {
  const student = students.find((item) => item._id === studentId);

  if (!student) {
    return;
  }

  studentIdInput.value = student._id;
  nameInput.value = student.name;
  emailInput.value = student.email;
  courseInput.value = student.course;
  phoneInput.value = student.phone;
  ageInput.value = student.age;

  formTitle.textContent = 'Edit Student';
  submitBtn.textContent = 'Update Student';
  cancelEditBtn.classList.remove('hidden');
  nameInput.focus();
}

async function deleteStudent(studentId) {
  const confirmed = confirm('Delete this student?');

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${studentId}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Unable to delete student');
    }

    showMessage('Student deleted successfully', 'success');
    await loadStudents();
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

function resetForm() {
  form.reset();
  studentIdInput.value = '';
  formTitle.textContent = 'Add Student';
  submitBtn.textContent = 'Save Student';
  cancelEditBtn.classList.add('hidden');
}

function showMessage(message, type) {
  messageBox.textContent = message;
  messageBox.className =
    type === 'success'
      ? 'mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700'
      : 'mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700';
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
