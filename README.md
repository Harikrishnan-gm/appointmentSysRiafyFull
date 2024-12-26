# appointmentSysRiafyFull
This is appointment system. =>technical test of Riafy


1. Fully Functional Codebase with a Clear Structure
Backend APIs
Folder Structure:
appointment-booking/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── appointments.db
└── frontend/
    ├── appointment-booking.js
    ├── style.css
    └── index.html

Backend Code (server.js): This is the Node.js server using SQLite to handle API requests for available slots and booking appointments.  


const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// API: Get Available Slots
app.get('/available-slots', (req, res) => {
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ error: "Date is required" });
    }

    const startTime = "10:00";
    const endTime = "17:00";
    const breakTime = ["13:00", "13:30"];

    let slots = [];
    let currentTime = startTime;

    // Helper function to increment time by 30 minutes
    function incrementTime(time) {
        const [hours, minutes] = time.split(':').map(Number);
        const newMinutes = minutes + 30;
        const newHours = hours + Math.floor(newMinutes / 60);
        const formattedHours = String(newHours).padStart(2, '0');
        const formattedMinutes = String(newMinutes % 60).padStart(2, '0');
        return `${formattedHours}:${formattedMinutes}`;
    }

    // Generate all slots excluding break time
    while (currentTime < endTime) {
        if (!breakTime.includes(currentTime)) {
            slots.push(currentTime);
        }
        currentTime = incrementTime(currentTime);
    }

    // Fetch booked slots from the database
    db.all(
        `SELECT time_slot FROM appointments WHERE date = ?`,
        [date],
        (err, rows) => {
            if (err) {
                console.error('Database error:', err.message);
                return res.status(500).json({ error: "Internal server error" });
            }

            const bookedSlots = rows.map((row) => row.time_slot);
            const availableSlots = slots.filter((slot) => !bookedSlots.includes(slot));
            res.json(availableSlots);
        }
    );
});

app.post('/book', (req, res) => {
    const { name, phone, date, time_slot } = req.body;

    if (!name || !phone || !date || !time_slot) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const insertQuery = `
        INSERT INTO appointments (name, phone, date, time_slot)
        VALUES (?, ?, ?, ?)
    `;

    db.run(insertQuery, [name, phone, date, time_slot], (err) => {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                // Time slot already booked
                return res.status(400).json({
                    error: 'The selected time slot is already booked. Please choose another slot.',
                });
            }
            console.error('Database error:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }

        res.status(201).json({ message: 'Appointment booked successfully!' });
    });
});




// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
Frontend Plugin Code
Frontend Code (appointment-booking.js):
This JavaScript file creates the booking UI dynamically and handles the interactions (selecting date, time slot, etc.).
(function() {
    const API_BASE_URL = 'http://localhost:5000';

    // Create the HTML elements dynamically
    const createBookingUI = () => {
        const container = document.createElement('div');
        container.setAttribute('id', 'appointment-booking');

        container.innerHTML = `
            <h1>Book an Appointment</h1>
            <form id="booking-form">
                <input type="text" id="name" placeholder="Your Name" required />
                <input type="text" id="phone" placeholder="Your Phone" required />
                <input type="date" id="date" required />
                <select id="time-slot" required></select>
                <button type="submit">Book Appointment</button>
            </form>
            <div id="message"></div>
        `;

        document.body.appendChild(container);

        // Fetch available slots on date change
        document.getElementById('date').addEventListener('change', async (e) => {
            const date = e.target.value;

            if (!date) return;

            // Fetch available slots from the backend
            const response = await fetch(`${API_BASE_URL}/available-slots?date=${date}`);

            if (response.ok) {
                const slots = await response.json();

                // Populate the dropdown with available time slots
                const timeSlotSelect = document.getElementById('time-slot');
                timeSlotSelect.innerHTML = '';

                if (slots.length === 0) {
                    timeSlotSelect.innerHTML = '<option value="">No available slots</option>';
                } else {
                    slots.forEach(slot => {
                        const option = document.createElement('option');
                        option.value = slot;
                        option.textContent = slot;
                        timeSlotSelect.appendChild(option);
                    });
                }
            } else {
                console.error('Failed to fetch available slots');
            }
        });

        // Handle form submission
        document.getElementById('booking-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const date = document.getElementById('date').value;
            const timeSlot = document.getElementById('time-slot').value;

            const response = await fetch(`${API_BASE_URL}/book`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, date, time_slot: timeSlot }),
            });

            const message = await response.json();
            document.getElementById('message').innerText = message.message;
        });
    };

    // When the DOM is ready, initialize the booking UI
    document.addEventListener('DOMContentLoaded', () => {
        createBookingUI();
    });
})();

Styling (style.css):
#appointment-booking {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 8px;
}

#appointment-booking input,
#appointment-booking select {
    width: 100%;
    padding: 10px;
    margin: 10px 0;
    border: 1px solid #ccc;
    border-radius: 4px;
}

#appointment-booking button {
    width: 100%;
    padding: 10px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

#appointment-booking button:hover {
    background-color: #218838;
}

2. Instructions to Run the Project Locally
Backend:
Install Node.js (if not installed): Node.js
Clone the repository or download the project files.
Open a terminal and navigate to the backend/ folder.
Install dependencies:
npm install express sqlite3 cors'
  Start the backend server
node server.js
  The server will run on http://localhost:5000. 
Frontend:
Upload the appointment-booking.js and style.css files to your desired location (local or cloud storage).
Include the appointment-booking.js file in the <script> tag on the website you want to embed the plugin in.
   


3. Script to Embed the Plugin on a Webpage
To embed the plugin on a webpage, simply include the following <script> tag in the HTML of the target webpage:

html
<script src="https://your-server.com/path/to/appointment-booking.js"></script>
<link rel="stylesheet" href="https://your-server.com/path/to/style.css">
Replace the URLs with the actual paths where you have hosted the JavaScript and CSS files

4. Video Demonstrating the Functionality
please find the attachments



Backend API Test Cases

Test Case 1: Fetch Available Slots
Scenario: User fetches available slots for a specific date.

Steps:
Make a GET request to /available-slots with a valid date (e.g., 2024-12-22).
Ensure the break times (13:00 and 13:30) are excluded.
Ensure slots that are already booked on the given date are not returned.
Expected Result: Response contains only unbooked slots, excluding break times.

Test Case 2: Book an Appointment
Scenario: User books a valid slot.
Steps:
Make a POST request to /book with valid data:
json
{
    "name": "John Doe",
    "phone": "1234567890",
    "date": "2024-12-22",
    "time_slot": "10:30"
}
Check if the booking is stored in the database.
Expected Result: Appointment is saved, and the response is:
json
{
    "message": "Appointment booked successfully"
}
Test Case 3: Double Booking
Scenario: User tries to book a slot already booked on the same date.
Steps:
Book the slot 10:30 for 2024-12-22.
Attempt to book the same slot again for the same date.
Expected Result: API responds with an error:
json
{
    "error": "SQLITE_CONSTRAINT: UNIQUE constraint failed: appointments.time_slot"
}
Test Case 4: Booking on Another Day
Scenario: User books the same time slot on a different date.
Steps:
Book 10:30 for 2024-12-22.
Book 10:30 for 2024-12-23.
Expected Result: Both bookings succeed, as the date is different.
Test Case 5: Invalid Input
Scenario: User provides invalid input while booking.
Steps:
Make a POST request to /book with missing fields (e.g., no time_slot).
Make a POST request with an invalid date format (e.g., 2024/12/22).
Expected Result: API returns appropriate error messages:
For missing fields: 400 Bad Request with "error": "Missing required fields."
For invalid date format: "error": "Invalid date format"
Frontend Plugin Test Cases
Test Case 1: Display Available Slots
Scenario: User selects a date and fetches available slots.
Steps:
Load the plugin on the webpage.
Select a date from the date picker.
Check the dropdown for available time slots.
Expected Result: The dropdown shows unbooked slots for the selected date, excluding break times.
Test Case 2: Successful Booking
Scenario: User books an available slot.
Steps:
Fill in all fields (name, phone, date, time slot) in the booking form.
Submit the form.
Check the confirmation message.
Expected Result: Message displays: "Appointment booked successfully".
Test Case 3: Double Booking Error
Scenario: User tries to book a slot that is already booked.
Steps:
Book the slot 11:00 for 2024-12-22.
Try booking the same slot again for the same date.
Expected Result: Error message displays: "SQLITE_CONSTRAINT: UNIQUE constraint failed: appointments.time_slot".
Test Case 4: No Available Slots
Scenario: User selects a date where all slots are booked.
Steps:
Book all slots for 2024-12-22.
Select 2024-12-22 in the frontend.
Expected Result: Dropdown shows a message: "No available slots".
Test Case 5: Validation for Empty Fields
Scenario: User tries to submit the form with missing fields.
Steps:
Leave the name, phone, or time slot fields empty.
Submit the form.
Expected Result: Error messages appear under each empty field (e.g., "Name is required").
Test Case 6: Date Change Updates Slots
Scenario: User selects a new date and fetches available slots.
Steps:
Select 2024-12-22 and note the available slots.
Change the date to 2024-12-23.
Check the dropdown for updated slots.
Expected Result: Slots update dynamically based on the selected date.
Performance Test Cases
Test Case 1: Large Dataset
Scenario: Test the system's ability to handle a large number of bookings.
Steps:
Insert 1,000 bookings into the database.
Fetch available slots for a specific date.
Expected Result: Response time for fetching available slots is under 2 seconds.
Test Case 2: Concurrent Booking
Scenario: Multiple users try to book the same slot simultaneously.
Steps:
Simulate two users booking 10:30 for 2024-12-22 at the same time.
Expected Result: One booking succeeds, and the other fails with a unique constraint error.
End-to-End Test Cases
Test Case 1: Complete Booking Process
Scenario: User completes the booking process successfully.
Steps:
Select a date.
Choose a time slot from the dropdown.
Fill in name and phone number.
Submit the form.
Expected Result: Slot is booked successfully, and the available slots are updated.
Test Case 2: Embedding the Plugin
Scenario: Plugin is embedded on a new website.
Steps:
Embed the plugin using the <script> tag.
Test the booking process on the new site.
Expected Result: Plugin works seamlessly without requiring changes to the embedding website.
