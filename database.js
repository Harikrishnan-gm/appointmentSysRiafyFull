const sqlite3 = require('sqlite3').verbose();

// Initialize database connection
const db = new sqlite3.Database('./appointments.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    
                // Recreate the table with the correct schema
                db.run(
                    `CREATE TABLE IF NOT EXISTS appointments (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT NOT NULL,
                        phone TEXT NOT NULL,
                        date TEXT NOT NULL,
                        time_slot TEXT NOT NULL,
                        UNIQUE(date, time_slot)
                    )`,
                    (err) => {
                        if (err) {
                            console.error('Error creating table:', err.message);
                        } else {
                            console.log('Appointments table created.');
                        }
                    }
                );
            }
        });
    

module.exports = db;
