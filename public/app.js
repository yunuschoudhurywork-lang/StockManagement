const API_URL = '/api/students';

// State management
const state = {
  currentPage: 1,
  limit: 10,
  search: '',
  courseFilter: '',
  minAge: '',
  maxAge: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  allStudents: [] // Store all students for course filter population
};

// DOM elements
const elements = {
  // Search & Filters
  searchInput: document.getElementById('searchInput'),
  courseFilter: document.getElementById('courseFilter'),
  minAgeInput: document.getElementById('minAgeInput'),
  maxAgeInput: document.getElementById('maxAgeInput'),
  clearFiltersBtn: document.getElementById('clearFiltersBtn'),
  perPageSelect: document.getElementById('perPageSelect'),
  
  // Statistics
  totalStudents: document.getElementById('totalStudents'),
  totalCourses: document.getElementById('totalCourses'),
  averageAge: document.getElementById('averageAge'),
  
  // Table
  studentsTable: document.getElementById('studentsTable'),
  tableContainer: document.getElementById('tableContainer'),
  loadingState: document.getElementById('loadingState'),
  emptyState: document.getElementById('emptyState'),
  
  // Pagination
  paginationContainer: document.getElementById('paginationContainer'),
  prevPageBtn: document.getElementById('prevPageBtn'),
  nextPageBtn: document.getElementById('nextPageBtn'),
  currentPageNum: document.getElementById('currentPageNum'),
  totalPagesNum: document.getElementById('totalPagesNum'),
  showingStart: document.getElementById('showingStart'),
  showingEnd: document.getElementById('showingEnd'),
  totalCount: document.getElementById('totalCount'),
  
  // Modal
  modalOverlay: document.getElementById('modalOverlay'),
  modalTitle: document.getElementById('modalTitle'),
  studentForm: document.getElementById('studentForm'),
  studentId: document.getElementById('studentId'),
  nameInput: document.getElementById('name'),
  emailInput: document.getElementById('email'),
  courseInput: document.getElementById('course'),
  phoneInput: document.getElementById('phone'),
  ageInput: document.getElementById('age'),
  modalMessage: document.getElementById('modalMessage'),
  submitBtn: document.getElementById('submitBtn'),
  addStudentBtn: document.getElementById('addStudentBtn'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  cancelModalBtn: document.getElementById('cancelModalBtn'),
  
  // Sidebar
  menuToggle: document.getElementById('menuToggle'),
  sidebar: document.getElementById('sidebar'),
  
  // Toast
  toast: document.getElementById('toast')
};

// Debounce helper
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// Reset to page one helper
function resetToPageOne() {
  state.currentPage = 1;
}

// Build query string from state
function buildQueryString() {
  const params = new URLSearchParams();
  
  params.append('page', state.currentPage);
  params.append('limit', state.limit);
  
  if (state.search) params.append('search', state.search);
  if (state.courseFilter) params.append('course', state.courseFilter);
  if (state.minAge) params.append('minAge', state.minAge);
  if (state.maxAge) params.append('maxAge', state.maxAge);
  
  params.append('sortBy', state.sortBy);
  params.append('order', state.sortOrder);
  
  return params.toString();
}

// Load students from API
async function loadStudents() {
  try {
    // Show loading state
    showLoading(true);
    
    const queryString = buildQueryString();
    const response = await fetch(`${API_URL}?${queryString}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to load students');
    }

    // Store students for course filter population
    state.allStudents = data.students || [];
    
    // Update UI
    renderStudents(data.students || []);
    updatePaginationUI(data.pagination);
    updateStatistics(data.pagination.totalStudents, data.students || []);
    populateCourseFilter(data.students || []);
    
    // Hide loading state
    showLoading(false);
    
    // Show empty state if no students
    const hasStudents = data.students && data.students.length > 0;
    elements.emptyState.classList.toggle('hidden', hasStudents);
    elements.tableContainer.classList.toggle('hidden', !hasStudents);
    elements.paginationContainer.classList.toggle('hidden', !hasStudents);
    
  } catch (error) {
    showLoading(false);
    showToast(error.message, 'error');
    
    // Show empty state on error
    elements.emptyState.classList.remove('hidden');
    elements.tableContainer.classList.add('hidden');
    elements.paginationContainer.classList.add('hidden');
  }
}

// Show/hide loading state
function showLoading(isLoading) {
  elements.loadingState.classList.toggle('hidden', !isLoading);
  if (isLoading) {
    elements.tableContainer.classList.add('hidden');
    elements.emptyState.classList.add('hidden');
    elements.paginationContainer.classList.add('hidden');
  }
}

// Render students table
function renderStudents(students) {
  elements.studentsTable.innerHTML = '';
  
  students.forEach((student) => {
    const row = document.createElement('tr');
    row.className = 'border-b-2 border-border-color hover:bg-primary-bg transition-colors duration-200';

    row.innerHTML = `
      <td class="px-4 py-4 font-medium text-primary-text">${escapeHtml(student.name)}</td>
      <td class="px-4 py-4 text-secondary-text">${escapeHtml(student.email)}</td>
      <td class="px-4 py-4 text-secondary-text">${escapeHtml(student.course)}</td>
      <td class="px-4 py-4 text-secondary-text">${student.age}</td>
      <td class="px-4 py-4">
        <div class="flex justify-end gap-2">
          <button
            class="rounded-sm border-2 border-border-color px-3 py-2 font-bold uppercase text-xs text-primary-text hover:border-accent hover:bg-accent hover:text-primary-bg transition-colors duration-200"
            type="button"
            data-action="edit"
            data-id="${student._id}"
          >
            Edit
          </button>
          <button
            class="rounded-sm border-2 border-error px-3 py-2 font-bold uppercase text-xs text-error hover:bg-error hover:text-primary-bg transition-colors duration-200"
            type="button"
            data-action="delete"
            data-id="${student._id}"
          >
            Delete
          </button>
        </div>
      </td>
    `;

    elements.studentsTable.appendChild(row);
  });
}

// Update pagination UI
function updatePaginationUI(pagination) {
  if (!pagination) return;
  
  const { currentPage, totalPages, totalStudents, limit, hasPrevPage, hasNextPage } = pagination;
  
  // Update page numbers
  elements.currentPageNum.textContent = currentPage;
  elements.totalPagesNum.textContent = totalPages;
  
  // Update showing range
  const start = totalStudents === 0 ? 0 : (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, totalStudents);
  elements.showingStart.textContent = start;
  elements.showingEnd.textContent = end;
  elements.totalCount.textContent = totalStudents;
  
  // Update button states
  elements.prevPageBtn.disabled = !hasPrevPage;
  elements.nextPageBtn.disabled = !hasNextPage;
}

// Update statistics cards
function updateStatistics(totalStudents, students) {
  // Total students
  elements.totalStudents.textContent = totalStudents || 0;
  
  // Total unique courses
  const uniqueCourses = new Set(students.map(s => s.course));
  elements.totalCourses.textContent = uniqueCourses.size || 0;
  
  // Average age
  if (students.length > 0) {
    const avgAge = students.reduce((sum, s) => sum + s.age, 0) / students.length;
    elements.averageAge.textContent = avgAge.toFixed(1);
  } else {
    elements.averageAge.textContent = 'N/A';
  }
}

// Populate course filter dropdown
function populateCourseFilter(students) {
  // Get unique courses
  const uniqueCourses = [...new Set(students.map(s => s.course))].sort();
  
  // Keep "All Courses" option and current selection
  const currentValue = elements.courseFilter.value;
  elements.courseFilter.innerHTML = '<option value="">All Courses</option>';
  
  uniqueCourses.forEach(course => {
    const option = document.createElement('option');
    option.value = course;
    option.textContent = course;
    elements.courseFilter.appendChild(option);
  });
  
  // Restore selection if it still exists
  if (currentValue && uniqueCourses.includes(currentValue)) {
    elements.courseFilter.value = currentValue;
  }
}

// Handle sorting
function handleSort(column) {
  if (state.sortBy === column) {
    // Toggle order if same column
    state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    // New column, default to ascending
    state.sortBy = column;
    state.sortOrder = 'asc';
  }
  
  updateSortIndicators();
  loadStudents();
}

// Update sort indicators in table headers
function updateSortIndicators() {
  // Remove all active indicators
  document.querySelectorAll('th[data-sort]').forEach(th => {
    const indicator = th.querySelector('.sort-indicator');
    indicator.style.opacity = '0';
    indicator.textContent = '↓';
  });
  
  // Add active indicator to current sort column
  const activeTh = document.querySelector(`th[data-sort="${state.sortBy}"]`);
  if (activeTh) {
    const indicator = activeTh.querySelector('.sort-indicator');
    indicator.style.opacity = '1';
    indicator.textContent = state.sortOrder === 'asc' ? '↑' : '↓';
  }
}

// Modal functions
function openModal(mode = 'add', student = null) {
  elements.modalOverlay.classList.remove('hidden');
  
  if (mode === 'edit' && student) {
    elements.modalTitle.textContent = 'Edit Student';
    elements.submitBtn.textContent = 'Update Student';
    
    // Populate form
    elements.studentId.value = student._id;
    elements.nameInput.value = student.name;
    elements.emailInput.value = student.email;
    elements.courseInput.value = student.course;
    elements.phoneInput.value = student.phone;
    elements.ageInput.value = student.age;
  } else {
    elements.modalTitle.textContent = 'Add Student';
    elements.submitBtn.textContent = 'Save Student';
    
    // Clear form
    elements.studentForm.reset();
    elements.studentId.value = '';
  }
  
  // Clear message
  elements.modalMessage.classList.add('hidden');
  
  // Focus first input
  setTimeout(() => elements.nameInput.focus(), 100);
}

function closeModal() {
  elements.modalOverlay.classList.add('hidden');
  elements.studentForm.reset();
  elements.studentId.value = '';
  elements.modalMessage.classList.add('hidden');
}

// Validate student data
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

// Handle form submission
async function handleFormSubmit(event) {
  event.preventDefault();

  const student = {
    name: elements.nameInput.value.trim(),
    email: elements.emailInput.value.trim(),
    course: elements.courseInput.value.trim(),
    phone: elements.phoneInput.value.trim(),
    age: Number(elements.ageInput.value)
  };

  // Client-side validation
  const validationError = validateStudent(student);
  if (validationError) {
    showModalMessage(validationError, 'error');
    return;
  }

  const studentId = elements.studentId.value;
  const isEditing = Boolean(studentId);

  try {
    elements.submitBtn.disabled = true;
    elements.submitBtn.textContent = isEditing ? 'Updating...' : 'Saving...';

    const response = await fetch(isEditing ? `${API_URL}/${studentId}` : API_URL, {
      method: isEditing ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(student)
    });

    const result = await response.json();

    if (!response.ok) {
      // Handle backend validation errors
      if (response.status === 400 && result.errors && result.errors.length > 0) {
        const errorMessages = result.errors.map((e) => e.message).join(', ');
        throw new Error(`Validation Error: ${errorMessages}`);
      }
      throw new Error(result.message || 'Unable to save student');
    }

    showToast(isEditing ? 'Student updated successfully' : 'Student added successfully', 'success');
    closeModal();
    await loadStudents();
  } catch (error) {
    showModalMessage(error.message, 'error');
  } finally {
    elements.submitBtn.disabled = false;
    elements.submitBtn.textContent = elements.studentId.value ? 'Update Student' : 'Save Student';
  }
}

// Edit student
function editStudent(studentId) {
  const student = state.allStudents.find((item) => item._id === studentId);
  if (!student) {
    showToast('Student not found', 'error');
    return;
  }
  openModal('edit', student);
}

// Delete student
async function deleteStudent(studentId) {
  const confirmed = confirm('Are you sure you want to delete this student? This action cannot be undone.');
  if (!confirmed) return;

  try {
    const response = await fetch(`${API_URL}/${studentId}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Unable to delete student');
    }

    showToast('Student deleted successfully', 'success');
    
    // If current page becomes empty after deletion, go to previous page
    if (state.allStudents.length === 1 && state.currentPage > 1) {
      state.currentPage--;
    }
    
    await loadStudents();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Show modal message
function showModalMessage(message, type) {
  elements.modalMessage.textContent = message;
  elements.modalMessage.className = type === 'success'
    ? 'mb-4 rounded-sm border-2 border-success bg-success bg-opacity-20 px-4 py-3 text-sm font-bold text-success'
    : 'mb-4 rounded-sm border-2 border-error bg-error bg-opacity-20 px-4 py-3 text-sm font-bold text-error';
  elements.modalMessage.classList.remove('hidden');
}

// Show toast notification
function showToast(message, type) {
  elements.toast.textContent = message;
  elements.toast.className = type === 'success'
    ? 'fixed bottom-6 right-6 z-50 rounded-sm border-2 border-success bg-success bg-opacity-20 px-6 py-4 font-bold text-sm shadow-lg min-w-[300px] text-success'
    : 'fixed bottom-6 right-6 z-50 rounded-sm border-2 border-error bg-error bg-opacity-20 px-6 py-4 font-bold text-sm shadow-lg min-w-[300px] text-error';
  
  elements.toast.classList.remove('hidden');
  
  setTimeout(() => {
    elements.toast.classList.add('hidden');
  }, 4000);
}

// Escape HTML
function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// Event Listeners

// Search input with debounce
elements.searchInput.addEventListener('input', debounce((event) => {
  state.search = event.target.value.trim();
  resetToPageOne();
  loadStudents();
}, 300));

// Course filter
elements.courseFilter.addEventListener('change', (event) => {
  state.courseFilter = event.target.value;
  resetToPageOne();
  loadStudents();
});

// Min age filter
elements.minAgeInput.addEventListener('change', (event) => {
  state.minAge = event.target.value;
  resetToPageOne();
  loadStudents();
});

// Max age filter
elements.maxAgeInput.addEventListener('change', (event) => {
  state.maxAge = event.target.value;
  resetToPageOne();
  loadStudents();
});

// Clear filters
elements.clearFiltersBtn.addEventListener('click', () => {
  state.search = '';
  state.courseFilter = '';
  state.minAge = '';
  state.maxAge = '';
  
  elements.searchInput.value = '';
  elements.courseFilter.value = '';
  elements.minAgeInput.value = '';
  elements.maxAgeInput.value = '';
  
  resetToPageOne();
  loadStudents();
});

// Per page selector
elements.perPageSelect.addEventListener('change', (event) => {
  state.limit = Number(event.target.value);
  resetToPageOne();
  loadStudents();
});

// Pagination buttons
elements.prevPageBtn.addEventListener('click', () => {
  if (state.currentPage > 1) {
    state.currentPage--;
    loadStudents();
  }
});

elements.nextPageBtn.addEventListener('click', () => {
  state.currentPage++;
  loadStudents();
});

// Table sorting
document.querySelectorAll('th[data-sort]').forEach(th => {
  th.addEventListener('click', () => {
    const column = th.dataset.sort;
    handleSort(column);
  });
});

// Table row actions (edit/delete)
elements.studentsTable.addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const studentId = button.dataset.id;
  const action = button.dataset.action;

  if (action === 'edit') {
    editStudent(studentId);
  }

  if (action === 'delete') {
    await deleteStudent(studentId);
  }
});

// Modal controls
elements.addStudentBtn.addEventListener('click', () => openModal('add'));
elements.closeModalBtn.addEventListener('click', closeModal);
elements.cancelModalBtn.addEventListener('click', closeModal);
elements.studentForm.addEventListener('submit', handleFormSubmit);

// Close modal on overlay click
elements.modalOverlay.addEventListener('click', (event) => {
  if (event.target === elements.modalOverlay) {
    closeModal();
  }
});

// Mobile menu toggle
elements.menuToggle.addEventListener('click', () => {
  elements.sidebar.classList.toggle('-translate-x-full');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (event) => {
  const isMenuButton = elements.menuToggle.contains(event.target);
  const isSidebar = elements.sidebar.contains(event.target);
  
  if (!isMenuButton && !isSidebar && !elements.sidebar.classList.contains('-translate-x-full')) {
    elements.sidebar.classList.add('-translate-x-full');
  }
});

// Navigation handling
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Remove active class from all links
    document.querySelectorAll('.nav-link').forEach(l => {
      l.classList.remove('active', 'bg-accent', 'border-accent', 'text-primary-bg');
      l.classList.add('border-border-color', 'text-primary-text');
    });
    
    // Add active class to clicked link
    link.classList.add('active', 'bg-accent', 'border-accent', 'text-primary-bg');
    link.classList.remove('border-border-color', 'text-primary-text');
    
    // Get the navigation target
    const target = link.querySelector('span').textContent.toLowerCase();
    
    // Close mobile menu
    elements.sidebar.classList.add('-translate-x-full');
    
    // Handle navigation
    if (target === 'dashboard') {
      // Scroll to top to show dashboard
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (target === 'students') {
      // Scroll to student table
      elements.tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (target === 'settings') {
      // Show settings info
      alert('⚙️ Settings Panel\n\nComing Soon!\n\n• User preferences\n• System configuration\n• Export/Import data\n• Theme customization\n\nFor now, all student management features are available in the Dashboard view.');
    }
  });
});

// Initialize
loadStudents();
