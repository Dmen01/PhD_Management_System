import pool from '../db.js';
import logger from '../utils/logger.js';

export const getStudents = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                sm.application_number,
                sm.first_name,
                sm.middle_name,
                sm.last_name,
                sm.email,
                sm.father_name,
                sm.mother_name,
                sm.dob,
                sm.mobile_number,
                sm.year_of_admission,
                sm.created_at
            FROM student_master sm
            ORDER BY sm.created_at DESC
        `);
        res.json({ students: result.rows });
    } catch (err) {
        logger.error(`Error fetching students: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error fetching students' });
    }
};

export const getTeachers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                tm.teacher_id,
                tm.first_name,
                tm.middle_name,
                tm.last_name,
                tm.email,
                tm.department,
                tm.designation,
                tm.mobile_number,
                tm.year_of_joining,
                tm.created_at
            FROM teacher_master tm
            ORDER BY tm.created_at DESC
        `);
        res.json({ teachers: result.rows });
    } catch (err) {
        logger.error(`Error fetching teachers: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error fetching teachers' });
    }
};

export const getSubjects = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, subject_name, credits, created_at FROM coursework_subjects ORDER BY created_at DESC'
        );
        res.json({ subjects: result.rows });
    } catch (err) {
        logger.error(`Error fetching subjects: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error fetching subjects' });
    }
};

export const addSubject = async (req, res) => {
    const { subject_name, credits } = req.body;

    if (!subject_name || !credits) {
        return res.status(400).json({ message: 'Subject name and credits are required' });
    }
    const parsedCredits = parseInt(credits, 10);
    if (isNaN(parsedCredits) || parsedCredits <= 0) {
        return res.status(400).json({ message: 'Credits must be a positive number' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO coursework_subjects (subject_name, credits) VALUES ($1, $2) RETURNING *',
            [subject_name.trim(), parsedCredits]
        );
        res.status(201).json({ subject: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ message: 'A subject with this name already exists' });
        }
        logger.error(`Error adding subject: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error adding subject' });
    }
};

export const getApprovedTeachers = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, email, created_at FROM pre_approved_teachers ORDER BY created_at DESC'
        );
        res.json({ teachers: result.rows });
    } catch (err) {
        logger.error(`Error fetching approved teachers: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error fetching approved teachers' });
    }
};

export const addApprovedTeacher = async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required' });
    }
    try {
        const result = await pool.query(
            'INSERT INTO pre_approved_teachers (name, email) VALUES ($1, $2) RETURNING *',
            [name.trim(), email.trim().toLowerCase()]
        );
        res.status(201).json({ teacher: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ message: 'This email is already in the approved list' });
        }
        logger.error(`Error adding approved teacher: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error adding teacher' });
    }
};

export const updateApprovedTeacher = async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required' });
    }
    try {
        const result = await pool.query(
            'UPDATE pre_approved_teachers SET name = $1, email = $2 WHERE id = $3 RETURNING *',
            [name.trim(), email.trim().toLowerCase(), id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.json({ teacher: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ message: 'Another entry already has this email' });
        }
        logger.error(`Error updating approved teacher ${id}: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error updating teacher' });
    }
};

export const deleteApprovedTeacher = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM pre_approved_teachers WHERE id = $1 RETURNING id',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.json({ message: 'Teacher removed from approved list' });
    } catch (err) {
        logger.error(`Error deleting approved teacher ${id}: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error deleting teacher' });
    }
};

export const getAssignments = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                sta.id,
                sta.student_application_number,
                sm.first_name || ' ' || sm.last_name AS student_name,
                sta.mentor_teacher_id,
                tm.first_name || ' ' || tm.last_name AS mentor_name,
                sta.assistance_teacher_id,
                ta.first_name || ' ' || ta.last_name AS assistance_name,
                sta.assigned_at
            FROM student_teacher_assignments sta
            JOIN student_master sm ON sm.application_number = sta.student_application_number
            JOIN teacher_master tm ON tm.teacher_id = sta.mentor_teacher_id
            LEFT JOIN teacher_master ta ON ta.teacher_id = sta.assistance_teacher_id
            ORDER BY sta.assigned_at DESC
        `);
        res.json({ assignments: result.rows });
    } catch (err) {
        logger.error(`Error fetching assignments: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error fetching assignments' });
    }
};

// Accepts { mentor_teacher_id, assistance_teacher_id (optional), student_application_numbers: [...] }
export const assignStudents = async (req, res) => {
    const { mentor_teacher_id, assistance_teacher_id, student_application_numbers } = req.body;

    if (!mentor_teacher_id || !student_application_numbers?.length) {
        return res.status(400).json({ message: 'Mentor teacher and at least one student are required' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const results = [];
        for (const appNum of student_application_numbers) {
            const r = await client.query(`
                INSERT INTO student_teacher_assignments
                    (student_application_number, mentor_teacher_id, assistance_teacher_id)
                VALUES ($1, $2, $3)
                ON CONFLICT (student_application_number)
                DO UPDATE SET
                    mentor_teacher_id = EXCLUDED.mentor_teacher_id,
                    assistance_teacher_id = EXCLUDED.assistance_teacher_id,
                    assigned_at = CURRENT_TIMESTAMP
                RETURNING *
            `, [appNum, mentor_teacher_id, assistance_teacher_id || null]);
            results.push(r.rows[0]);
        }

        await client.query('COMMIT');
        res.status(201).json({ message: 'Students assigned successfully', assignments: results });
    } catch (err) {
        await client.query('ROLLBACK');
        logger.error(`Error assigning students: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error during assignment' });
    } finally {
        client.release();
    }
};

export const removeAssignment = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM student_teacher_assignments WHERE id = $1 RETURNING id',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Assignment not found' });
        }
        res.json({ message: 'Assignment removed' });
    } catch (err) {
        logger.error(`Error removing assignment ${id}: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error removing assignment' });
    }
};



