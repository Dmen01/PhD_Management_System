import pool from './db.js';

const sql = `
CREATE TABLE IF NOT EXISTS phd_registration_presentations (
  id SERIAL PRIMARY KEY,
  roll_no VARCHAR(50) NOT NULL REFERENCES student_master(roll_no) ON DELETE CASCADE,
  synopsis_pdf_path VARCHAR(500) NOT NULL,
  presentation_date DATE NOT NULL,
  observation_message TEXT,
  remark VARCHAR(50) NOT NULL CHECK (remark IN ('Accepted', 'Rejected')),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS phd_registration_letters (
  id SERIAL PRIMARY KEY,
  roll_no VARCHAR(50) UNIQUE NOT NULL REFERENCES student_master(roll_no) ON DELETE CASCADE,
  letter_pdf_path VARCHAR(500) NOT NULL,
  registration_number VARCHAR(100) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const runMigration = async () => {
    try {
        await pool.query(sql);
        console.log("Migration successful");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
};

runMigration();
