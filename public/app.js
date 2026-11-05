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
    elements.phoneInput.value = student.phone;
    elements.ageInput.value = student.age;
    populateCourseDropdown(student.course);
  } else {
    elements.modalTitle.textContent = 'Add Student';
    elements.submitBtn.textContent = 'Save Student';
    
    // Clear form
    elements.studentForm.reset();
    elements.studentId.value = '';
    populateCourseDropdown('');
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
      showDashboardView();
    } else if (target === 'students') {
      showDashboardView();
      // Scroll to student table
      elements.tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (target === 'reports') {
      showReportsView();
    } else if (target === 'export data') {
      showExportView();
    } else if (target === 'courses') {
      showCoursesView();
    } else if (target === 'settings') {
      // Show settings info
      alert('⚙️ Settings Panel\n\nComing Soon!\n\n• User preferences\n• System configuration\n• Export/Import data\n• Theme customization\n\nFor now, all student management features are available in the Dashboard view.');
    }
  });
});

// Initialize
loadStudents();

// ========== Reports & Analytics Functions ==========

// Load reports data from API
async function loadReports() {
  try {
    const [overview, courseDistribution, ageDistribution, enrollmentTrends] = await Promise.all([
      fetch('/api/reports/overview').then(res => res.json()),
      fetch('/api/reports/course-distribution').then(res => res.json()),
      fetch('/api/reports/age-distribution').then(res => res.json()),
      fetch('/api/reports/enrollment-trends').then(res => res.json())
    ]);

    return {
      overview,
      courseDistribution,
      ageDistribution,
      enrollmentTrends
    };
  } catch (error) {
    showToast('Failed to load reports data', 'error');
    throw error;
  }
}

// Show dashboard view
function showDashboardView() {
  const dashboardView = document.querySelector('#reportsView').previousElementSibling;
  dashboardView.classList.remove('hidden');
  document.getElementById('reportsView').classList.add('hidden');
  document.getElementById('exportView').classList.add('hidden');
  document.getElementById('coursesView')?.classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show reports view
async function showReportsView() {
  // Hide dashboard view and show reports view
  const dashboardView = document.querySelector('#reportsView').previousElementSibling;
  dashboardView.classList.add('hidden');
  document.getElementById('reportsView').classList.remove('hidden');
  document.getElementById('exportView')?.classList.add('hidden');
  document.getElementById('coursesView')?.classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Load and render reports
  try {
    const reports = await loadReports();
    renderReportsView(reports);
  } catch (error) {
    console.error('Error loading reports:', error);
  }
}

// Render reports view with data
function renderReportsView(reports) {
  // Update overview statistics
  document.getElementById('reportTotalStudents').textContent = reports.overview.totalStudents;
  document.getElementById('reportTotalCourses').textContent = reports.overview.totalCourses;
  document.getElementById('reportAverageAge').textContent = reports.overview.avgAge;

  // Render course distribution chart
  const courseChart = document.getElementById('courseDistributionChart');
  if (reports.courseDistribution.length === 0) {
    courseChart.innerHTML = '<p class="text-secondary-text text-sm">No course data available</p>';
  } else {
    courseChart.innerHTML = reports.courseDistribution.map(item => `
      <div>
        <div class="flex justify-between mb-2">
          <span class="text-primary-text font-bold text-sm">${escapeHtml(item.course)}</span>
          <span class="text-secondary-text text-sm">${item.count} students (${item.percentage}%)</span>
        </div>
        <div class="h-8 rounded-sm border-2 border-border-color bg-primary-bg overflow-hidden">
          <div class="h-full bg-accent transition-all duration-500" style="width: ${item.percentage}%"></div>
        </div>
      </div>
    `).join('');
  }

  // Render age distribution chart
  const ageChart = document.getElementById('ageDistributionChart');
  if (reports.ageDistribution.length === 0) {
    ageChart.innerHTML = '<p class="text-secondary-text text-sm">No age data available</p>';
  } else {
    const maxCount = Math.max(...reports.ageDistribution.map(item => item.count));
    ageChart.innerHTML = reports.ageDistribution.map(item => {
      const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
      return `
        <div>
          <div class="flex justify-between mb-2">
            <span class="text-primary-text font-bold text-sm">${escapeHtml(item.range)} years</span>
            <span class="text-secondary-text text-sm">${item.count} students</span>
          </div>
          <div class="h-8 rounded-sm border-2 border-border-color bg-primary-bg overflow-hidden">
            <div class="h-full bg-accent transition-all duration-500" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render enrollment trends chart
  const trendsChart = document.getElementById('enrollmentTrendsChart');
  if (reports.enrollmentTrends.length === 0) {
    trendsChart.innerHTML = '<p class="text-secondary-text text-sm">No enrollment data available for the last 6 months</p>';
  } else {
    const maxCount = Math.max(...reports.enrollmentTrends.map(item => item.count));
    trendsChart.innerHTML = reports.enrollmentTrends.map(item => {
      const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
      return `
        <div>
          <div class="flex justify-between mb-2">
            <span class="text-primary-text font-bold text-sm">${escapeHtml(item.month)}</span>
            <span class="text-secondary-text text-sm">${item.count} enrollments</span>
          </div>
          <div class="h-8 rounded-sm border-2 border-border-color bg-primary-bg overflow-hidden">
            <div class="h-full bg-accent transition-all duration-500" style="width: ${percentage}%"></div>
          </div>
        </div>
      `;
    }).join('');
  }
}

// ========== Export Data Functions ==========

// Show export view
function showExportView() {
  // Hide dashboard and reports views, show export view
  const dashboardView = document.querySelector('#reportsView').previousElementSibling;
  dashboardView.classList.add('hidden');
  document.getElementById('reportsView').classList.add('hidden');
  document.getElementById('exportView').classList.remove('hidden');
  document.getElementById('coursesView')?.classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Render export history
  renderExportHistory();

  // Setup format selector handlers
  setupExportFormatHandlers();
}

// Setup export format selector handlers
function setupExportFormatHandlers() {
  const formatRadios = document.querySelectorAll('input[name="exportFormat"]');
  
  formatRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      // Update UI for selected format
      document.querySelectorAll('.export-format-option').forEach(option => {
        option.classList.remove('bg-accent', 'text-primary-bg', 'border-accent');
        option.classList.add('border-border-color', 'text-primary-text');
      });
      
      const selectedOption = e.target.parentElement.querySelector('.export-format-option');
      selectedOption.classList.add('bg-accent', 'text-primary-bg', 'border-accent');
      selectedOption.classList.remove('border-border-color', 'text-primary-text');
    });
  });
}

// Export data function
async function exportData(format, filtered = false) {
  const exportMessage = document.getElementById('exportMessage');
  
  try {
    // Show loading message
    exportMessage.textContent = 'Preparing export...';
    exportMessage.className = 'mt-4 rounded-sm px-4 py-3 text-sm font-bold bg-secondary-bg border-2 border-accent text-accent';
    exportMessage.classList.remove('hidden');

    let response;

    if (filtered) {
      // Export filtered data using POST /api/export/filtered
      const body = {
        format,
        search: state.search || undefined,
        course: state.courseFilter || undefined,
        minAge: state.minAge || undefined,
        maxAge: state.maxAge || undefined
      };

      response = await fetch('/api/export/filtered', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
    } else {
      // Export all data using GET /api/export/csv or /api/export/json
      response = await fetch(`/api/export/${format}`);
    }

    if (!response.ok) {
      throw new Error('Export failed');
    }

    // Get the blob from response
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_export_${Date.now()}.${format === 'csv' ? 'csv' : 'json'}`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    // Show success message
    exportMessage.textContent = `✓ Export successful! File downloaded as ${format.toUpperCase()}`;
    exportMessage.className = 'mt-4 rounded-sm px-4 py-3 text-sm font-bold bg-success border-2 border-success text-primary-bg';
    
    // Update export history
    updateExportHistory(format, filtered);
    renderExportHistory();

    // Hide message after 3 seconds
    setTimeout(() => {
      exportMessage.classList.add('hidden');
    }, 3000);

  } catch (error) {
    // Show error message
    exportMessage.textContent = '✗ Export failed. Please try again.';
    exportMessage.className = 'mt-4 rounded-sm px-4 py-3 text-sm font-bold bg-error border-2 border-error text-primary-bg';
    
    console.error('Export error:', error);
  }
}

// Update export history in localStorage
function updateExportHistory(format, filtered) {
  const history = JSON.parse(localStorage.getItem('exportHistory') || '[]');
  
  const newEntry = {
    format: format.toUpperCase(),
    type: filtered ? 'Filtered' : 'All Students',
    timestamp: Date.now()
  };
  
  // Add to beginning and keep only last 5
  history.unshift(newEntry);
  if (history.length > 5) {
    history.pop();
  }
  
  localStorage.setItem('exportHistory', JSON.stringify(history));
}

// Render export history
function renderExportHistory() {
  const historyList = document.getElementById('exportHistoryList');
  const history = JSON.parse(localStorage.getItem('exportHistory') || '[]');
  
  if (history.length === 0) {
    historyList.innerHTML = '<p class="text-secondary-text text-sm">No export history yet.</p>';
    return;
  }
  
  historyList.innerHTML = history.map(entry => {
    const relativeTime = getRelativeTime(entry.timestamp);
    return `
      <div class="flex items-center justify-between rounded-sm border-2 border-border-color bg-primary-bg px-4 py-3">
        <div>
          <p class="text-primary-text font-bold text-sm">${escapeHtml(entry.type)} - ${escapeHtml(entry.format)}</p>
          <p class="text-secondary-text text-xs">${relativeTime}</p>
        </div>
        <span class="text-accent font-bold text-xs uppercase">Downloaded</span>
      </div>
    `;
  }).join('');
}

// Get relative time string
function getRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

// Setup export button handlers
document.getElementById('exportAllBtn')?.addEventListener('click', () => {
  const format = document.querySelector('input[name="exportFormat"]:checked').value;
  exportData(format, false);
});

document.getElementById('exportFilteredBtn')?.addEventListener('click', () => {
  const format = document.querySelector('input[name="exportFormat"]:checked').value;
  exportData(format, true);
});

// ========== Course Management Functions ==========

// State for courses
const courseState = {
  allCourses: [],
  filteredCourses: []
};

// Course DOM elements
const courseElements = {
  coursesView: document.getElementById('coursesView'),
  courseSearchInput: document.getElementById('courseSearchInput'),
  addCourseBtn: document.getElementById('addCourseBtn'),
  coursesLoadingState: document.getElementById('coursesLoadingState'),
  coursesEmptyState: document.getElementById('coursesEmptyState'),
  coursesTableContainer: document.getElementById('coursesTableContainer'),
  coursesTableBody: document.getElementById('coursesTableBody'),
  
  // Course Modal
  courseModalOverlay: document.getElementById('courseModalOverlay'),
  courseModalTitle: document.getElementById('courseModalTitle'),
  courseForm: document.getElementById('courseForm'),
  courseId: document.getElementById('courseId'),
  courseName: document.getElementById('courseName'),
  courseDescription: document.getElementById('courseDescription'),
  courseCapacity: document.getElementById('courseCapacity'),
  courseModalMessage: document.getElementById('courseModalMessage'),
  submitCourseBtn: document.getElementById('submitCourseBtn'),
  closeCourseModalBtn: document.getElementById('closeCourseModalBtn'),
  cancelCourseModalBtn: document.getElementById('cancelCourseModalBtn'),
  
  // Course Students Modal
  courseStudentsModalOverlay: document.getElementById('courseStudentsModalOverlay'),
  courseStudentsCourseName: document.getElementById('courseStudentsCourseName'),
  courseStudentsLoadingState: document.getElementById('courseStudentsLoadingState'),
  courseStudentsEmptyState: document.getElementById('courseStudentsEmptyState'),
  courseStudentsList: document.getElementById('courseStudentsList'),
  closeCourseStudentsModalBtn: document.getElementById('closeCourseStudentsModalBtn'),
  closeCourseStudentsBtn: document.getElementById('closeCourseStudentsBtn')
};

// Load courses from API
async function loadCourses() {
  try {
    courseElements.coursesLoadingState.classList.remove('hidden');
    courseElements.coursesEmptyState.classList.add('hidden');
    courseElements.coursesTableContainer.classList.add('hidden');
    
    const response = await fetch('/api/courses');
    if (!response.ok) throw new Error('Failed to fetch courses');
    
    const courses = await response.json();
    courseState.allCourses = courses;
    courseState.filteredCourses = courses;
    
    renderCoursesView();
  } catch (error) {
    console.error('Error loading courses:', error);
    showToast('Failed to load courses', 'error');
  } finally {
    courseElements.coursesLoadingState.classList.add('hidden');
  }
}

// Render courses table
function renderCoursesView() {
  const courses = courseState.filteredCourses;
  
  if (courses.length === 0) {
    courseElements.coursesEmptyState.classList.remove('hidden');
    courseElements.coursesTableContainer.classList.add('hidden');
    return;
  }
  
  courseElements.coursesEmptyState.classList.add('hidden');
  courseElements.coursesTableContainer.classList.remove('hidden');
  
  courseElements.coursesTableBody.innerHTML = courses.map(course => `
    <tr class="border-b-2 border-border-color hover:bg-primary-bg transition-colors duration-200">
      <td class="px-4 py-4 font-bold text-primary-text">${escapeHtml(course.name)}</td>
      <td class="px-4 py-4 text-secondary-text">${escapeHtml(course.description || 'N/A')}</td>
      <td class="px-4 py-4 text-secondary-text">${course.capacity || 'N/A'}</td>
      <td class="px-4 py-4">
        <span class="inline-block rounded-sm bg-accent px-3 py-1 text-xs font-bold text-primary-bg">
          ${course.studentCount}
        </span>
      </td>
      <td class="px-4 py-4 text-right">
        <div class="flex justify-end gap-2">
          <button 
            onclick="viewCourseStudents('${escapeHtml(course.name)}')"
            class="rounded-sm border-2 border-border-color px-3 py-1 text-xs font-bold uppercase text-primary-text hover:border-accent hover:text-accent transition-colors duration-200"
          >
            View Students
          </button>
          <button 
            onclick="editCourse('${course._id}')"
            class="rounded-sm border-2 border-border-color px-3 py-1 text-xs font-bold uppercase text-primary-text hover:border-accent hover:text-accent transition-colors duration-200"
          >
            Edit
          </button>
          <button 
            onclick="deleteCourse('${course._id}')"
            class="rounded-sm border-2 border-error px-3 py-1 text-xs font-bold uppercase text-error hover:bg-error hover:text-primary-bg transition-colors duration-200"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Show courses view
function showCoursesView() {
  // Hide other views
  const dashboardView = document.querySelector('#reportsView').previousElementSibling;
  dashboardView.classList.add('hidden');
  document.getElementById('reportsView').classList.add('hidden');
  document.getElementById('exportView')?.classList.add('hidden');
  
  // Show courses view
  courseElements.coursesView.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  loadCourses();
}

// Search courses
const searchCourses = debounce(() => {
  const searchTerm = courseElements.courseSearchInput.value.toLowerCase().trim();
  
  if (searchTerm === '') {
    courseState.filteredCourses = courseState.allCourses;
  } else {
    courseState.filteredCourses = courseState.allCourses.filter(course =>
      course.name.toLowerCase().includes(searchTerm)
    );
  }
  
  renderCoursesView();
}, 300);

// Open course modal for adding
function openAddCourseModal() {
  courseElements.courseModalTitle.textContent = 'Add Course';
  courseElements.courseForm.reset();
  courseElements.courseId.value = '';
  courseElements.courseModalMessage.classList.add('hidden');
  courseElements.submitCourseBtn.textContent = 'Save Course';
  courseElements.courseModalOverlay.classList.remove('hidden');
}

// Open course modal for editing
async function editCourse(courseId) {
  try {
    const course = courseState.allCourses.find(c => c._id === courseId);
    if (!course) throw new Error('Course not found');
    
    courseElements.courseModalTitle.textContent = 'Edit Course';
    courseElements.courseId.value = course._id;
    courseElements.courseName.value = course.name;
    courseElements.courseDescription.value = course.description || '';
    courseElements.courseCapacity.value = course.capacity || '';
    courseElements.courseModalMessage.classList.add('hidden');
    courseElements.submitCourseBtn.textContent = 'Update Course';
    courseElements.courseModalOverlay.classList.remove('hidden');
  } catch (error) {
    console.error('Error editing course:', error);
    showToast('Failed to load course data', 'error');
  }
}

// Close course modal
function closeCourseModal() {
  courseElements.courseModalOverlay.classList.add('hidden');
  courseElements.courseForm.reset();
  courseElements.courseModalMessage.classList.add('hidden');
}

// Add/Update course
async function saveCourse(event) {
  event.preventDefault();
  
  const courseId = courseElements.courseId.value;
  const courseData = {
    name: courseElements.courseName.value.trim(),
    description: courseElements.courseDescription.value.trim(),
    capacity: courseElements.courseCapacity.value ? parseInt(courseElements.courseCapacity.value) : undefined
  };
  
  try {
    const url = courseId ? `/api/courses/${courseId}` : '/api/courses';
    const method = courseId ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to save course');
    }
    
    showToast(courseId ? 'Course updated successfully' : 'Course added successfully', 'success');
    closeCourseModal();
    await loadCourses();
    
    // Refresh course filter options in student form
    await populateCourseDropdown();
  } catch (error) {
    console.error('Error saving course:', error);
    courseElements.courseModalMessage.textContent = error.message;
    courseElements.courseModalMessage.className = 'mb-4 rounded-sm px-4 py-3 text-sm font-bold bg-error border-2 border-error text-primary-bg';
    courseElements.courseModalMessage.classList.remove('hidden');
  }
}

// Delete course
async function deleteCourse(courseId) {
  const course = courseState.allCourses.find(c => c._id === courseId);
  if (!course) return;
  
  if (!confirm(`Are you sure you want to delete the course "${course.name}"?`)) {
    return;
  }
  
  try {
    const response = await fetch(`/api/courses/${courseId}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete course');
    }
    
    showToast('Course deleted successfully', 'success');
    await loadCourses();
    
    // Refresh course filter options in student form
    await populateCourseDropdown();
  } catch (error) {
    console.error('Error deleting course:', error);
    showToast(error.message, 'error');
  }
}

// View course students
async function viewCourseStudents(courseName) {
  try {
    courseElements.courseStudentsCourseName.textContent = `Course: ${courseName}`;
    courseElements.courseStudentsLoadingState.classList.remove('hidden');
    courseElements.courseStudentsEmptyState.classList.add('hidden');
    courseElements.courseStudentsList.classList.add('hidden');
    courseElements.courseStudentsModalOverlay.classList.remove('hidden');
    
    const response = await fetch(`/api/courses/${encodeURIComponent(courseName)}/students`);
    if (!response.ok) throw new Error('Failed to fetch students');
    
    const data = await response.json();
    const students = data.students;
    
    courseElements.courseStudentsLoadingState.classList.add('hidden');
    
    if (students.length === 0) {
      courseElements.courseStudentsEmptyState.classList.remove('hidden');
    } else {
      courseElements.courseStudentsList.classList.remove('hidden');
      courseElements.courseStudentsList.innerHTML = students.map(student => `
        <div class="rounded-sm border-2 border-border-color bg-primary-bg px-4 py-3">
          <p class="font-bold text-primary-text">${escapeHtml(student.name)}</p>
          <p class="text-xs text-secondary-text">${escapeHtml(student.email)} • Age: ${student.age} • Phone: ${escapeHtml(student.phone)}</p>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading course students:', error);
    showToast('Failed to load students', 'error');
    closeCourseStudentsModal();
  }
}

// Close course students modal
function closeCourseStudentsModal() {
  courseElements.courseStudentsModalOverlay.classList.add('hidden');
  courseElements.courseStudentsList.innerHTML = '';
}

// Populate course dropdown in student form
async function populateCourseDropdown(selectedCourse = '') {
  try {
    const response = await fetch('/api/courses');
    if (!response.ok) throw new Error('Failed to fetch courses');
    
    const courses = await response.json();
    const courseSelect = document.getElementById('course');
    if (courseSelect) {
      const currentValue = selectedCourse !== undefined && selectedCourse !== '' ? selectedCourse : courseSelect.value;
      courseSelect.innerHTML = '<option value="">Select a course</option>' +
        courses.map(course => 
          `<option value="${escapeHtml(course.name)}" ${course.name === currentValue ? 'selected' : ''}>
            ${escapeHtml(course.name)}
          </option>`
        ).join('');
      elements.courseInput = courseSelect;
    }
  } catch (error) {
    console.error('Error populating course dropdown:', error);
  }
}

// Setup course event listeners
if (courseElements.courseSearchInput) {
  courseElements.courseSearchInput.addEventListener('input', searchCourses);
}

if (courseElements.addCourseBtn) {
  courseElements.addCourseBtn.addEventListener('click', openAddCourseModal);
}

if (courseElements.closeCourseModalBtn) {
  courseElements.closeCourseModalBtn.addEventListener('click', closeCourseModal);
}

if (courseElements.cancelCourseModalBtn) {
  courseElements.cancelCourseModalBtn.addEventListener('click', closeCourseModal);
}

if (courseElements.courseForm) {
  courseElements.courseForm.addEventListener('submit', saveCourse);
}

if (courseElements.closeCourseStudentsModalBtn) {
  courseElements.closeCourseStudentsModalBtn.addEventListener('click', closeCourseStudentsModal);
}

if (courseElements.closeCourseStudentsBtn) {
  courseElements.closeCourseStudentsBtn.addEventListener('click', closeCourseStudentsModal);
}

// Populate course dropdown on page load
populateCourseDropdown();
