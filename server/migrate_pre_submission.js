import pool from './db.js';

const migrate = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS phd_pre_submissions (
              id SERIAL PRIMARY KEY,
              roll_no VARCHAR(50) NOT NULL REFERENCES student_master(roll_no) ON DELETE CASCADE,
              synopsis_pdf_path VARCHAR(500),
              presentation_date DATE,
              committee_members JSONB,
              remark VARCHAR(50) CHECK (remark IN ('Accepted', 'Rejected')),
              uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              admin_updated_at TIMESTAMP
            );
        `);
        console.log("Migration successful: phd_pre_submissions created.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
};

migrate();
