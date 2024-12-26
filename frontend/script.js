const API_BASE_URL = 'http://localhost:5000';

// Event Listener: Populate available slots when a date is selected
document.getElementById('date').addEventListener('change', async (e) => {
    const date = e.target.value;

    if (!date) return; // Exit if no date is selected

    try {
        // Fetch available slots
        const response = await fetch(`${API_BASE_URL}/available-slots?date=${date}`);
        if (response.ok) {
            const slots = await response.json();
            populateTimeSlots(slots);
        } else {
            console.error('Error fetching available slots');
            showErrorMessage('Failed to load available slots. Try again later.');
        }
    } catch (error) {
        console.error('Error fetching available slots:', error);
        showErrorMessage('Unable to connect to the server.');
    }
});

// Populate the dropdown with available time slots
function populateTimeSlots(slots) {
    const timeSlotSelect = document.getElementById('time-slot');
    timeSlotSelect.innerHTML = ''; // Clear existing options

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
}

// Event Listener: Handle booking submission
document.getElementById('booking-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const date = document.getElementById('date').value;
    const timeSlot = document.getElementById('time-slot').value;

    if (!name || !phone || !date || !timeSlot) {
        showErrorMessage('All fields are required.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/book`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, date, time_slot: timeSlot }),
        });

        const result = await response.json();
        if (response.ok) {
            alert('Appointment booked successfully!')
            showSuccessMessage(`Congrats ${name}`);
            document.getElementById('booking-form').reset();
            populateTimeSlots([]); // Clear dropdown
        } else {
            showErrorMessage(result.error || 'Failed to book the appointment.');
        }
    } catch (error) {
        console.error('Error booking slot:', error);
        showErrorMessage('Unable to connect to the server.');
    }
});


// Utility: Show error message
function showErrorMessage(message) {
    const messageDiv = document.getElementById('message');
    messageDiv.innerText = message;
    messageDiv.style.color = 'red';
}

// Utility: Show success message
function showSuccessMessage(message) {
    const messageDiv = document.getElementById('message');
    messageDiv.innerText = message;
    messageDiv.style.color = 'green';
    setTimeout(()=>{
        messageDiv.innerText = '';
    },3000)
}
