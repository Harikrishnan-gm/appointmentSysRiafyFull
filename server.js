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
