import pool from '../db.js';
import logger from '../utils/logger.js';

// Fetch teacher profile by email
export const getTeacherProfile = async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    try {
        const result = await pool.query(
            'SELECT * FROM teacher_master WHERE email = $1', [email]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.json({ profile: result.rows[0] });
    } catch (err) {
        logger.error(`Error fetching teacher profile for ${email}: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error' });
    }
};

// One-time teacher profile creation
export const createTeacherProfile = async (req, res) => {
    const {
        teacherId, email,
        firstName, middleName, lastName,
        department, designation,
        mobileNumber, yearOfJoining
    } = req.body;

    const required = { teacherId, email, firstName, lastName, department, designation, mobileNumber, yearOfJoining };
    for (const [field, val] of Object.entries(required)) {
        if (!val) return res.status(400).json({ message: `${field} is required` });
    }

    if (!/^[0-9]{10,15}$/.test(mobileNumber)) {
        return res.status(400).json({ message: 'Mobile number must be 10–15 digits' });
    }

    try {
        await pool.query(
            `INSERT INTO teacher_master
             (teacher_id, email, first_name, middle_name, last_name, department, designation, mobile_number, year_of_joining)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [teacherId, email, firstName, middleName || null, lastName,
             department, designation, mobileNumber, parseInt(yearOfJoining)]
        );
        res.status(201).json({ message: 'Profile created successfully' });
    } catch (err) {
        logger.error(`Error creating teacher profile for ${email}: ${err.message}`, { stack: err.stack });
        if (err.code === '23505') {
            return res.status(409).json({ message: 'Teacher ID or email already registered' });
        }
        res.status(500).json({ message: 'Server error creating profile' });
    }
};

export const changeTeacherPassword = async (req, res) => {
    const { email, currentPassword, newPassword } = req.body;
    if (!email || !currentPassword || !newPassword) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    const passwordRules = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRules.test(newPassword)) {
        return res.status(400).json({ message: 'New password must be at least 8 chars with uppercase, lowercase, number, and special character' });
    }
    try {
        const result = await pool.query('SELECT * FROM teacher_login_details WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Account not found' });

        const { default: bcrypt } = await import('bcryptjs');
        const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
        if (!valid) return res.status(401).json({ message: 'Current password is incorrect' });

        const hash = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE teacher_login_details SET password_hash = $1 WHERE email = $2', [hash, email]);
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        logger.error(`Error changing teacher password for ${email}: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error' });
    }
};

// Returns all students assigned to this teacher (as mentor OR assistance), with paired teacher info
export const getAssignedStudents = async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    try {
        const result = await pool.query(`
            SELECT
                sta.id,
                sta.student_roll_no,
                sm.first_name       AS student_first_name,
                sm.last_name        AS student_last_name,
                sm.email            AS student_email,
                sm.mobile_number    AS student_mobile,
                sm.year_of_admission,
                sm.admission_mode,
                sm.admission_type,

                -- Mentor teacher
                tm.teacher_id       AS mentor_teacher_id,
                tm.first_name || ' ' || tm.last_name AS mentor_name,
                tm.email            AS mentor_email,

                -- Assistance teacher (may be null)
                ta.teacher_id       AS assistance_teacher_id,
                ta.first_name || ' ' || ta.last_name AS assistance_name,
                ta.email            AS assistance_email,

                sta.assigned_at,
                (EXISTS (SELECT 1 FROM student_coursework_assignments sca WHERE sca.student_roll_no = sta.student_roll_no)) AS has_coursework
            FROM student_teacher_assignments sta
            JOIN student_master sm ON sm.roll_no = sta.student_roll_no
            JOIN teacher_master tm ON tm.teacher_id = sta.mentor_teacher_id
            LEFT JOIN teacher_master ta ON ta.teacher_id = sta.assistance_teacher_id
            WHERE tm.email = $1 OR ta.email = $1
            ORDER BY sm.last_name, sm.first_name
        `, [email]);

        res.json({ students: result.rows });
    } catch (err) {
        logger.error(`Error fetching assigned students for ${email}: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error' });
    }
};

// All available coursework subjects (added by admin)
export const getCourseworkSubjects = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, subject_name, credits FROM coursework_subjects ORDER BY LOWER(subject_name) ASC'
        );
        res.json({ subjects: result.rows });
    } catch (err) {
        logger.error(`Error fetching coursework subjects: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error' });
    }
};

// Get subjects already assigned to a particular student
export const getStudentCoursework = async (req, res) => {
    const { student_roll_no } = req.query;
    if (!student_roll_no) return res.status(400).json({ message: 'student_roll_no is required' });
    try {
        const result = await pool.query(`
            SELECT sca.id, sca.subject_id, cs.subject_name, cs.credits, sca.assigned_at
            FROM student_coursework_assignments sca
            JOIN coursework_subjects cs ON cs.id = sca.subject_id
            WHERE sca.student_roll_no = $1
            ORDER BY cs.subject_name
        `, [student_roll_no]);
        res.json({ subjects: result.rows });
    } catch (err) {
        logger.error(`Error fetching student coursework: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error' });
    }
};

// Assign exactly 4 subjects to a student (replaces existing assignments for that student)
export const assignCoursework = async (req, res) => {
    const { teacher_email, student_roll_no, subject_ids } = req.body;
    if (!teacher_email || !student_roll_no || !Array.isArray(subject_ids)) {
        return res.status(400).json({ message: 'teacher_email, student_roll_no, and subject_ids array are required' });
    }
    if (subject_ids.length === 0 || subject_ids.length > 4) {
        return res.status(400).json({ message: 'You must select between 1 and 4 subjects' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Resolve teacher_id from email
        const teacherRes = await client.query(
            'SELECT teacher_id FROM teacher_master WHERE email = $1', [teacher_email]
        );
        if (teacherRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(403).json({ message: 'Teacher not found' });
        }
        const teacher_id = teacherRes.rows[0].teacher_id;

        // Delete existing assignments for this student
        await client.query(
            'DELETE FROM student_coursework_assignments WHERE student_roll_no = $1',
            [student_roll_no]
        );

        // Insert new ones
        for (const subject_id of subject_ids) {
            await client.query(
                `INSERT INTO student_coursework_assignments
                 (student_roll_no, subject_id, assigned_by_teacher_id)
                 VALUES ($1, $2, $3)`,
                [student_roll_no, subject_id, teacher_id]
            );
        }

        await client.query('COMMIT');
        res.json({ message: 'Coursework subjects assigned successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        logger.error(`Error assigning coursework for ${student_roll_no}: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
};



