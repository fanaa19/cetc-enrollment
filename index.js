// Data Structures
class Course {
    constructor(name, totalSlots) {
        this.name = name;
        this.totalSlots = totalSlots;
        this.bookedSlots = 0;
        this.appointments = [];
    }

    get availableSlots() {
        return this.totalSlots - this.bookedSlots;
    }

    bookSlot(studentName, date, time) {
        if (this.availableSlots > 0) {
            this.bookedSlots++;
            this.appointments.push({
                studentName,
                date,
                time
            });
            return true;
        }
        return false;
    }

    cancelSlot(studentName, date, time) {
        if (this.bookedSlots > 0) {
            this.bookedSlots--;
            const index = this.appointments.findIndex(
                a => a.studentName === studentName && a.date === date && a.time === time
            );
            if (index !== -1) {
                this.appointments.splice(index, 1);
            }
        }
    }

    getAppointmentsByDate(date) {
        return this.appointments.filter(a => a.date === date);
    }
}

class AppointmentSlot {
    constructor(maxSlots) {
        this.maxSlots = maxSlots;
        this.bookedSlots = 0;
        this.appointments = [];
    }

    get availableSlots() {
        return this.maxSlots - this.bookedSlots;
    }

    bookSlot(studentName) {
        if (this.availableSlots > 0) {
            this.bookedSlots++;
            this.appointments.push(studentName);
            return true;
        }
        return false;
    }

    cancelSlot(studentName) {
        if (this.bookedSlots > 0) {
            this.bookedSlots--;
            const index = this.appointments.indexOf(studentName);
            if (index !== -1) {
                this.appointments.splice(index, 1);
            }
        }
    }
}

class Appointment {
    constructor(id, studentName, course, date, time) {
        this.appointmentId = id;
        this.studentName = studentName;
        this.course = course;
        this.date = date;
        this.time = time;
    }
}

// System Data
const courses = {
    "Information Technology": new Course("Information Technology", 120),
    "Information System": new Course("Information System", 120),
    "Computer Science": new Course("Computer Science", 120),
    "Industrial Technology": new Course("Industrial Technology", 120),
    "Civil Engineering": new Course("Civil Engineering", 120)
};

const dates = [
    "August 11, 2025",
    "August 12, 2025",
    "August 13, 2025",
    "August 14, 2025",
    "August 15, 2025"
];

const times = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];

// Initialize appointments
let appointments = {};
dates.forEach(date => {
    appointments[date] = {};
    times.forEach(time => {
        appointments[date][time] = new AppointmentSlot(20);
    });
});

let allAppointments = [];
let nextId = 1;

// System state
let currentMode = 'student'; // 'student' or 'faculty'
let currentBooking = {
    step: 1,
    name: '',
    course: '',
    date: '',
    time: ''
};

// Helper Functions
function isDateFullyBooked(date) {
    return times.every(time => appointments[date][time].availableSlots <= 0);
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `<i class="fas ${getIconForType(type)}"></i> ${message}`;
    
    const currentSection = document.querySelector('.section:not(.hidden)');
    if (currentSection) {
        currentSection.insertBefore(messageDiv, currentSection.firstChild);
        // Don't auto-remove messages
    }
}

function getIconForType(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

// Side Menu Functions
function toggleSideMenu() {
    const sideMenu = document.getElementById('sideMenu');
    sideMenu.classList.toggle('active');
}

// Mode Selection
function selectStudentMode() {
    currentMode = 'student';
    document.getElementById('sideMenu').classList.remove('active');
    
    // Show student buttons, hide faculty buttons
    document.querySelectorAll('.menu-btn').forEach(btn => {
        // Show all buttons first
        btn.classList.remove('hidden');
    });
    
    // Hide faculty-specific buttons
    document.querySelectorAll('.faculty-only').forEach(el => {
        el.classList.add('hidden');
    });
    
    const modeIndicator = document.getElementById('userModeIndicator');
    modeIndicator.className = 'user-mode student-mode';
    modeIndicator.innerHTML = '<i class="fas fa-user-graduate"></i> Student Mode';
    
    showMainMenu();
    showMessage('Welcome Student! You can book appointments.', 'success');
}

function showFacultyLogin() {
    document.getElementById('sideMenu').classList.remove('active');
    document.getElementById('facultyPassword').value = ''; // Clear password field
    document.getElementById('facultyModal').classList.add('active');
}

function closeFacultyModal() {
    document.getElementById('facultyModal').classList.remove('active');
    document.getElementById('facultyPassword').value = '';
}

function verifyFacultyPassword() {
    const password = document.getElementById('facultyPassword').value;
    const correctPassword = "CETC LIST"; // Nakatago na sa code, hindi na displayed
    
    if (password === correctPassword) {
        currentMode = 'faculty';
        closeFacultyModal();
        
        // HIDE all student buttons, SHOW only faculty buttons
        document.querySelectorAll('.menu-btn').forEach(btn => {
            // Check if button is NOT faculty-only, then hide it
            if (!btn.classList.contains('faculty-only')) {
                btn.classList.add('hidden');
            }
        });
        
        // Show faculty-only buttons
        document.querySelectorAll('.faculty-only').forEach(el => {
            el.classList.remove('hidden');
        });
        
        const modeIndicator = document.getElementById('userModeIndicator');
        modeIndicator.className = 'user-mode faculty-mode';
        modeIndicator.innerHTML = '<i class="fas fa-chalkboard-teacher"></i> Faculty Mode';
        
        showMainMenu();
        showMessage('Welcome Faculty! You can view all appointments and statistics.', 'success');
    } else {
        showMessage('Incorrect password. Please try again.', 'error');
        document.getElementById('facultyPassword').value = ''; // Clear password field
    }
}

// Update showMainMenu function to respect current mode
function showMainMenu() {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById('mainMenu').classList.remove('hidden');
    
    // Ensure correct buttons are shown based on current mode
    if (currentMode === 'faculty') {
        // Hide student buttons, show faculty buttons
        document.querySelectorAll('.menu-btn').forEach(btn => {
            if (!btn.classList.contains('faculty-only')) {
                btn.classList.add('hidden');
            }
        });
        document.querySelectorAll('.faculty-only').forEach(el => {
            el.classList.remove('hidden');
        });
    } else {
        // Show student buttons, hide faculty buttons
        document.querySelectorAll('.menu-btn').forEach(btn => {
            btn.classList.remove('hidden');
        });
        document.querySelectorAll('.faculty-only').forEach(el => {
            el.classList.add('hidden');
        });
    }
}

// Update the initialize function
document.addEventListener('DOMContentLoaded', () => {
    selectStudentMode(); // Start in student mode by default
    
    // Add click outside modal to close
    window.onclick = function(event) {
        const modal = document.getElementById('facultyModal');
        if (event.target === modal) {
            closeFacultyModal();
        }
    };
});

// Navigation Functions
function showMainMenu() {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById('mainMenu').classList.remove('hidden');
}

// View Available Slots
function showViewAvailableSlots() {
    document.getElementById('mainMenu').classList.add('hidden');
    const section = document.getElementById('viewSlotsSection');
    section.classList.remove('hidden');
    
    let html = '<div class="course-card">';
    html += '<div class="course-header"><i class="fas fa-book-open"></i> AVAILABLE COURSES</div>';
    
    for (let [name, course] of Object.entries(courses)) {
        const percentage = (course.availableSlots / course.totalSlots) * 100;
        let statusClass = 'slot-available';
        let statusText = 'Available';
        
        if (course.availableSlots === 0) {
            statusClass = 'slot-full';
            statusText = 'FULL';
        } else if (course.availableSlots < 30) {
            statusClass = 'slot-warning';
            statusText = 'Limited';
        }
        
        html += `<div class="slot-info">
            <span><i class="fas fa-graduation-cap"></i> ${name}</span>
            <span class="${statusClass}">
                ${course.availableSlots}/${course.totalSlots} slots (${Math.round(percentage)}%)
            </span>
        </div>`;
    }
    html += '</div>';
    
    html += '<div class="course-header" style="margin-top: 30px;"><i class="fas fa-clock"></i> AVAILABLE TIME SLOTS</div>';
    
    dates.forEach(date => {
        if (isDateFullyBooked(date)) {
            html += `<div class="date-card">
                <div class="date-header"><i class="fas fa-calendar-times"></i> ${date} - <span style="color: #d03c3c;">FULLY BOOKED</span></div>
            </div>`;
        } else {
            html += `<div class="date-card">
                <div class="date-header"><i class="fas fa-calendar-alt"></i> ${date}</div>`;
            
            times.forEach(time => {
                const available = appointments[date][time].availableSlots;
                if (available > 0) {
                    html += `<div class="slot-info">
                        <span><i class="fas fa-clock"></i> ${time}</span>
                        <span class="slot-available"><i class="fas fa-user"></i> ${available} slots</span>
                    </div>`;
                } else {
                    html += `<div class="slot-info">
                        <span><i class="fas fa-clock"></i> ${time}</span>
                        <span class="slot-full"><i class="fas fa-times"></i> FULL</span>
                    </div>`;
                }
            });
            
            html += '</div>';
        }
    });
    
    document.getElementById('availableSlotsContent').innerHTML = html;
}

// Book Appointment
function showBookAppointment() {
    if (currentMode === 'faculty') {
        showMessage('Please switch to Student mode to book appointments.', 'warning');
        return;
    }
    
    if (dates.every(isDateFullyBooked)) {
        showMessage('All dates are currently fully booked. Please check back later.', 'warning');
        return;
    }
    
    document.getElementById('mainMenu').classList.add('hidden');
    const section = document.getElementById('bookAppointmentSection');
    section.classList.remove('hidden');
    
    // Clear any existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    currentBooking = { step: 1, name: '', course: '', date: '', time: '' };
    showBookingStep1();
}

function showBookingStep1() {
    let html = '<div class="booking-container">';
    html += '<h3><i class="fas fa-user"></i> Step 1: Student Information</h3>';
    html += '<div class="form-group">';
    html += '<label for="studentName">Enter your full name:</label>';
    html += '<input type="text" id="studentName" placeholder="e.g., Juan Dela Cruz" autocomplete="off">';
    html += '</div>';
    html += '<button onclick="submitStep1()" class="primary-btn"><i class="fas fa-arrow-right"></i> Next</button>';
    html += '</div>';
    
    document.getElementById('bookingSteps').innerHTML = html;
}

function submitStep1() {
    const name = document.getElementById('studentName').value.trim();
    if (!name) {
        showMessage('Please enter your name.', 'error');
        return;
    }
    
    currentBooking.name = name;
    currentBooking.step = 2;
    showBookingStep2();
}

function showBookingStep2() {
    let html = '<div class="booking-container">';
    html += '<h3><i class="fas fa-book"></i> Step 2: Select Course</h3>';
    html += '<div class="form-group">';
    html += '<label for="course">Choose your course:</label>';
    html += '<select id="course">';
    html += '<option value="">-- Select a course --</option>';
    
    for (let [name, course] of Object.entries(courses)) {
        if (course.availableSlots > 0) {
            html += `<option value="${name}">${name} (${course.availableSlots} slots available)</option>`;
        }
    }
    
    html += '</select>';
    html += '</div>';
    html += '<button onclick="submitStep2()" class="primary-btn"><i class="fas fa-arrow-right"></i> Next</button>';
    html += '<button onclick="showBookingStep1()" class="secondary-btn"><i class="fas fa-arrow-left"></i> Back</button>';
    html += '</div>';
    
    document.getElementById('bookingSteps').innerHTML = html;
}

function submitStep2() {
    const course = document.getElementById('course').value;
    if (!course) {
        showMessage('Please select a course.', 'error');
        return;
    }
    
    currentBooking.course = course;
    currentBooking.step = 3;
    showBookingStep3();
}

function showBookingStep3() {
    let html = '<div class="booking-container">';
    html += '<h3><i class="fas fa-calendar"></i> Step 3: Select Date</h3>';
    html += '<div class="form-group">';
    html += '<label for="date">Choose appointment date:</label>';
    html += '<select id="date">';
    html += '<option value="">-- Select a date --</option>';
    
    dates.forEach((date, index) => {
        if (!isDateFullyBooked(date)) {
            html += `<option value="${index}">${date}</option>`;
        }
    });
    
    html += '</select>';
    html += '</div>';
    html += '<button onclick="submitStep3()" class="primary-btn"><i class="fas fa-arrow-right"></i> Next</button>';
    html += '<button onclick="showBookingStep2()" class="secondary-btn"><i class="fas fa-arrow-left"></i> Back</button>';
    html += '</div>';
    
    document.getElementById('bookingSteps').innerHTML = html;
}

function submitStep3() {
    const dateIndex = document.getElementById('date').value;
    if (!dateIndex) {
        showMessage('Please select a date.', 'error');
        return;
    }
    
    const selectedDate = dates[dateIndex];
    currentBooking.date = selectedDate;
    currentBooking.step = 4;
    showBookingStep4();
}

function showBookingStep4() {
    let html = '<div class="booking-container">';
    html += '<h3><i class="fas fa-clock"></i> Step 4: Select Time</h3>';
    html += '<div class="form-group">';
    html += '<label for="time">Choose appointment time:</label>';
    html += '<select id="time">';
    html += '<option value="">-- Select a time --</option>';
    
    times.forEach(time => {
        const available = appointments[currentBooking.date][time].availableSlots;
        if (available > 0) {
            html += `<option value="${time}">${time} (${available} slots)</option>`;
        }
    });
    
    html += '</select>';
    html += '</div>';
    html += '<button onclick="submitStep4()" class="primary-btn"><i class="fas fa-arrow-right"></i> Next</button>';
    html += '<button onclick="showBookingStep3()" class="secondary-btn"><i class="fas fa-arrow-left"></i> Back</button>';
    html += '</div>';
    
    document.getElementById('bookingSteps').innerHTML = html;
}

function submitStep4() {
    const time = document.getElementById('time').value;
    if (!time) {
        showMessage('Please select a time.', 'error');
        return;
    }
    
    currentBooking.time = time;
    showBookingSummary();
}

function showBookingSummary() {
    const available = appointments[currentBooking.date][currentBooking.time].availableSlots - 1;
    
    let html = '<div class="booking-container">';
    html += '<h3><i class="fas fa-check-circle"></i> Appointment Summary</h3>';
    html += '<div class="summary-card">';
    html += `<p><i class="fas fa-user"></i> <strong>Student:</strong> ${currentBooking.name}</p>`;
    html += `<p><i class="fas fa-book"></i> <strong>Course:</strong> ${currentBooking.course}</p>`;
    html += `<p><i class="fas fa-calendar"></i> <strong>Date:</strong> ${currentBooking.date}</p>`;
    html += `<p><i class="fas fa-clock"></i> <strong>Time:</strong> ${currentBooking.time}</p>`;
    html += `<p><i class="fas fa-users"></i> <strong>Remaining slots after booking:</strong> ${available}</p>`;
    html += '</div>';
    html += '<button onclick="confirmBooking()" class="primary-btn"><i class="fas fa-check"></i> Confirm Booking</button>';
    html += '<button onclick="showBookingStep4()" class="secondary-btn"><i class="fas fa-arrow-left"></i> Back</button>';
    html += '</div>';
    
    document.getElementById('bookingSteps').innerHTML = html;
}

function confirmBooking() {
    // Book the slots
    courses[currentBooking.course].bookSlot(
        currentBooking.name,
        currentBooking.date,
        currentBooking.time
    );
    appointments[currentBooking.date][currentBooking.time].bookSlot(currentBooking.name);
    
    // Create appointment
    const appointment = new Appointment(
        nextId++,
        currentBooking.name,
        currentBooking.course,
        currentBooking.date,
        currentBooking.time
    );
    allAppointments.push(appointment);
    
    // Clear previous messages and show success
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    showMessage(`✅ Booking confirmed! Your appointment ID is: ${appointment.appointmentId}`, 'success');
    
    if (isDateFullyBooked(currentBooking.date)) {
        showMessage(`Note: ${currentBooking.date} is now fully booked.`, 'warning');
    }
    
    // Stay on the booking confirmation page (don't auto-redirect)
    // User can manually click Back to Menu
}

// Cancel Appointment
function showCancelAppointment() {
    document.getElementById('mainMenu').classList.add('hidden');
    const section = document.getElementById('cancelAppointmentSection');
    section.classList.remove('hidden');
    
    let html = '<div class="cancel-container">';
    html += '<h3><i class="fas fa-search"></i> Find Your Appointment</h3>';
    html += '<div class="form-group">';
    html += '<label for="studentNameCancel">Enter your name:</label>';
    html += '<input type="text" id="studentNameCancel" placeholder="Enter the name you used to book">';
    html += '</div>';
    html += '<button onclick="searchStudentAppointments()" class="primary-btn"><i class="fas fa-search"></i> Search Appointments</button>';
    html += '</div>';
    
    document.getElementById('cancelContent').innerHTML = html;
}

function searchStudentAppointments() {
    const name = document.getElementById('studentNameCancel').value.trim();
    if (!name) {
        showMessage('Please enter your name.', 'error');
        return;
    }
    
    const studentAppointments = allAppointments.filter(a => 
        a.studentName.toLowerCase() === name.toLowerCase()
    );
    
    if (studentAppointments.length === 0) {
        showMessage('No appointments found for this name.', 'warning');
        return;
    }
    
    let html = '<div class="appointments-list">';
    html += '<h3><i class="fas fa-calendar-check"></i> Your Appointments:</h3>';
    
    studentAppointments.forEach(appt => {
        html += `<div class="slot-info">
            <span>
                <i class="fas fa-tag"></i> <strong>ID: ${appt.appointmentId}</strong><br>
                ${appt.course} - ${appt.date} at ${appt.time}
            </span>
            <button onclick="cancelAppointment(${appt.appointmentId}, '${appt.studentName}', '${appt.course}', '${appt.date}', '${appt.time}')" class="secondary-btn">
                <i class="fas fa-times"></i> Cancel
            </button>
        </div>`;
    });
    
    html += '</div>';
    document.getElementById('cancelContent').innerHTML = html;
}

function cancelAppointment(id, studentName, courseName, date, time) {
    if (confirm(`Are you sure you want to cancel your appointment for ${courseName} on ${date} at ${time}?`)) {
        // Cancel in course
        courses[courseName].cancelSlot(studentName, date, time);
        
        // Cancel in time slot
        appointments[date][time].cancelSlot(studentName);
        
        // Remove from allAppointments
        allAppointments = allAppointments.filter(a => a.appointmentId !== id);
        
        showMessage('Appointment cancelled successfully!', 'success');
        showCancelAppointment();
    }
}

// View All Appointments (Faculty only)
function showViewAllAppointments() {
    if (currentMode !== 'faculty') {
        showMessage('This section is for faculty only. Please login as faculty.', 'error');
        return;
    }
    
    document.getElementById('mainMenu').classList.add('hidden');
    const section = document.getElementById('viewAllAppointmentsSection');
    section.classList.remove('hidden');
    
    if (allAppointments.length === 0) {
        document.getElementById('allAppointmentsContent').innerHTML = 
            '<div class="message warning"><i class="fas fa-info-circle"></i> No appointments booked in the system yet.</div>';
        return;
    }
    
    // Sort appointments by date and time
    const sortedAppointments = [...allAppointments].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
    });
    
    let html = '<table class="appointments-table">';
    html += '<thead><tr><th>ID</th><th>Student Name</th><th>Course</th><th>Date</th><th>Time</th></tr></thead>';
    html += '<tbody>';
    
    sortedAppointments.forEach(appt => {
        html += `<tr>
            <td>${appt.appointmentId}</td>
            <td>${appt.studentName}</td>
            <td>${appt.course}</td>
            <td>${appt.date}</td>
            <td>${appt.time}</td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    
    // Summary statistics
    html += '<div class="summary-stats">';
    html += '<div class="stat-box">';
    html += '<h4><i class="fas fa-chart-line"></i> Total Appointments:</h4>';
    html += `<p class="big-number">${allAppointments.length}</p>`;
    html += '</div>';
    
    html += '<div class="stat-box">';
    html += '<h4><i class="fas fa-chart-pie"></i> By Course:</h4>';
    for (let course in courses) {
        const count = allAppointments.filter(a => a.course === course).length;
        const percentage = allAppointments.length > 0 ? (count / allAppointments.length * 100).toFixed(1) : 0;
        html += `<p>${course}: ${count} (${percentage}%)</p>`;
    }
    html += '</div>';
    
    html += '<div class="stat-box">';
    html += '<h4><i class="fas fa-calendar"></i> By Date:</h4>';
    dates.forEach(date => {
        const count = allAppointments.filter(a => a.date === date).length;
        html += `<p>${date}: ${count}</p>`;
    });
    html += '</div>';
    html += '</div>';
    
    document.getElementById('allAppointmentsContent').innerHTML = html;
}

// Course Statistics (Faculty only)
function showCourseStatistics() {
    if (currentMode !== 'faculty') {
        showMessage('This section is for faculty only. Please login as faculty.', 'error');
        return;
    }
    
    document.getElementById('mainMenu').classList.add('hidden');
    const section = document.getElementById('courseStatisticsSection');
    section.classList.remove('hidden');
    
    let html = '<div class="statistics-container">';
    html += '<h3><i class="fas fa-chart-bar"></i> Course Statistics</h3>';
    
    // Course buttons
    html += '<div class="course-buttons">';
    for (let courseName in courses) {
        const course = courses[courseName];
        const totalBooked = allAppointments.filter(a => a.course === courseName).length;
        html += `<button onclick="showCourseDetails('${courseName}')" class="course-stat-btn">
            <i class="fas fa-graduation-cap"></i> ${courseName}<br>
            <small>${totalBooked}/${course.totalSlots} booked</small>
        </button>`;
    }
    html += '</div>';
    
    // Overall statistics
    html += '<div class="summary-stats">';
    html += '<div class="stat-box">';
    html += '<h4><i class="fas fa-users"></i> Total Students</h4>';
    html += `<p>${allAppointments.length}</p>`;
    html += '</div>';
    
    html += '<div class="stat-box">';
    html += '<h4><i class="fas fa-percent"></i> Overall Occupancy</h4>';
    const totalSlots = Object.values(courses).reduce((sum, c) => sum + c.totalSlots, 0);
    const occupancy = (allAppointments.length / totalSlots * 100).toFixed(1);
    html += `<p>${occupancy}%</p>`;
    html += '</div>';
    
    html += '<div class="stat-box">';
    html += '<h4><i class="fas fa-calendar-week"></i> Busiest Day</h4>';
    const dateCounts = dates.map(date => ({
        date,
        count: allAppointments.filter(a => a.date === date).length
    }));
    const busiest = dateCounts.reduce((max, d) => d.count > max.count ? d : max, { count: 0 });
    html += `<p>${busiest.date} (${busiest.count} appointments)</p>`;
    html += '</div>';
    html += '</div>';
    
    // Details container
    html += '<div id="courseDetailsContainer" class="course-details"></div>';
    html += '</div>';
    
    document.getElementById('statisticsContent').innerHTML = html;
}

function showCourseDetails(courseName) {
    const course = courses[courseName];
    const courseAppointments = allAppointments.filter(a => a.course === courseName);
    
    let html = '<div class="course-card">';
    html += `<div class="course-header"><i class="fas fa-graduation-cap"></i> ${courseName} Details</div>`;
    
    // Statistics
    html += '<div class="summary-stats" style="grid-template-columns: repeat(3, 1fr);">';
    html += `<div class="stat-box"><h4>Total Booked</h4><p>${courseAppointments.length}</p></div>`;
    html += `<div class="stat-box"><h4>Available</h4><p>${course.availableSlots}</p></div>`;
    html += `<div class="stat-box"><h4>Occupancy</h4><p>${((courseAppointments.length / course.totalSlots) * 100).toFixed(1)}%</p></div>`;
    html += '</div>';
    
    // Appointments by date
    html += '<h4 style="margin: 20px 0 10px;"><i class="fas fa-calendar-alt"></i> Appointments by Date:</h4>';
    dates.forEach(date => {
        const dateAppointments = courseAppointments.filter(a => a.date === date);
        if (dateAppointments.length > 0) {
            html += `<div class="date-card">`;
            html += `<div class="date-header">${date} (${dateAppointments.length} appointments)</div>`;
            
            dateAppointments.forEach(appt => {
                html += `<div class="slot-info">
                    <span><i class="fas fa-clock"></i> ${appt.time}</span>
                    <span><i class="fas fa-user"></i> ${appt.studentName}</span>
                </div>`;
            });
            
            html += '</div>';
        }
    });
    
    if (courseAppointments.length === 0) {
        html += '<p class="message info"><i class="fas fa-info-circle"></i> No appointments for this course yet.</p>';
    }
    
    html += '</div>';
    
    document.getElementById('courseDetailsContainer').innerHTML = html;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    selectStudentMode(); // Start in student mode by default
});