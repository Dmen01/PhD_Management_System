import pool from '../db.js';
import logger from '../utils/logger.js';
import fs from 'fs';

export const getStudents = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                sm.roll_no,
                sm.first_name,
                sm.middle_name,
                sm.last_name,
                sm.email,
                sm.father_name,
                sm.mother_name,
                sm.dob,
                sm.mobile_number,
                sm.year_of_admission,
                sm.admission_mode,
                sm.admission_type,
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
                tm.created_at,
                (
                    SELECT COUNT(*) FROM student_teacher_assignments sta
                    WHERE sta.mentor_teacher_id = tm.teacher_id
                       OR sta.assistance_teacher_id = tm.teacher_id
                )::int AS assigned_student_count
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
            'SELECT id, subject_name, credits, syllabus_pdf_path, created_at FROM coursework_subjects ORDER BY created_at DESC'
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
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'Subject name and credits are required' });
    }
    if (!req.file) {
        return res.status(400).json({ message: 'Syllabus PDF is required' });
    }
    const parsedCredits = parseInt(credits, 10);
    if (isNaN(parsedCredits) || parsedCredits <= 0) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'Credits must be a positive number' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO coursework_subjects (subject_name, credits, syllabus_pdf_path) VALUES ($1, $2, $3) RETURNING *',
            [subject_name.trim(), parsedCredits, req.file.path]
        );
        res.status(201).json({ subject: result.rows[0] });
    } catch (err) {
        if (req.file) fs.unlinkSync(req.file.path);
        if (err.code === '23505') {
            return res.status(409).json({ message: 'A subject with this name already exists' });
        }
        logger.error(`Error adding subject: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error adding subject' });
    }
};

export const deleteSubject = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM coursework_subjects WHERE id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        const subject = result.rows[0];
        if (subject.syllabus_pdf_path) {
            try {
                fs.unlinkSync(subject.syllabus_pdf_path);
            } catch (err) {
                logger.error(`Failed to delete syllabus file ${subject.syllabus_pdf_path}`, { stack: err.stack });
            }
        }
        res.json({ message: 'Subject deleted successfully' });
    } catch (err) {
        if (err.code === '23503') { // foreign_key_violation
            return res.status(409).json({ message: 'Cannot delete subject because it is already assigned to one or more students.' });
        }
        logger.error(`Error deleting subject ${id}: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error deleting subject' });
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
                sta.student_roll_no,
                sm.first_name || ' ' || sm.last_name AS student_name,
                sta.mentor_teacher_id,
                tm.first_name || ' ' || tm.last_name AS mentor_name,
                sta.assistance_teacher_id,
                ta.first_name || ' ' || ta.last_name AS assistance_name,
                sta.assigned_at
            FROM student_teacher_assignments sta
            JOIN student_master sm ON sm.roll_no = sta.student_roll_no
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

// Accepts { mentor_teacher_id, assistance_teacher_id (optional), student_roll_nos: [...] }
export const assignStudents = async (req, res) => {
    const { mentor_teacher_id, assistance_teacher_id, student_roll_nos } = req.body;

    if (!mentor_teacher_id || !student_roll_nos?.length) {
        return res.status(400).json({ message: 'Mentor teacher and at least one student are required' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const results = [];
        for (const appNum of student_roll_nos) {
            const r = await client.query(`
                INSERT INTO student_teacher_assignments
                    (student_roll_no, mentor_teacher_id, assistance_teacher_id)
                VALUES ($1, $2, $3)
                ON CONFLICT (student_roll_no)
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

export const getUnverifiedStudents = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                sm.id,
                sm.roll_no,
                sm.first_name,
                sm.middle_name,
                sm.last_name,
                sm.email,
                sm.father_name,
                sm.mother_name,
                sm.dob,
                sm.mobile_number,
                sm.year_of_admission,
                sm.admission_mode,
                sm.admission_type,
                sm.created_at
            FROM pending_student_registrations sm
            ORDER BY sm.created_at DESC
        `);
        res.json({ students: result.rows });
    } catch (err) {
        logger.error(`Error fetching unverified students: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error fetching unverified students' });
    }
};

export const verifyStudent = async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Fetch from pending
        const pendingRes = await client.query(
            'SELECT * FROM pending_student_registrations WHERE id = $1',
            [id]
        );
        if (pendingRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Pending verification request not found' });
        }

        const s = pendingRes.rows[0];

        // Insert into master
        const insertRes = await client.query(
            `INSERT INTO student_master (roll_no, email, first_name, middle_name, last_name, father_name, mother_name, dob, mobile_number, year_of_admission, admission_mode, admission_type)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [s.roll_no, s.email, s.first_name, s.middle_name, s.last_name, s.father_name, s.mother_name, s.dob, s.mobile_number, s.year_of_admission, s.admission_mode, s.admission_type]
        );

        // Delete from pending
        await client.query(
            'DELETE FROM pending_student_registrations WHERE id = $1',
            [id]
        );

        await client.query('COMMIT');
        res.json({ message: 'Student verified and fully registered', student: insertRes.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        logger.error(`Error verifying student request ${id}: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error verifying student' });
    } finally {
        client.release();
    }
};

export const rejectStudent = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM pending_student_registrations WHERE id = $1 RETURNING id',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Pending request not found' });
        }
        res.json({ message: 'Student registration request rejected' });
    } catch (err) {
        logger.error(`Error rejecting student request ${id}: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error rejecting student request' });
    }
};

// Reassign all student assignments from one teacher to another (no deletion)
export const reassignTeacher = async (req, res) => {
    const { old_teacher_id, new_teacher_id } = req.body;
    if (!old_teacher_id || !new_teacher_id)
        return res.status(400).json({ message: 'old_teacher_id and new_teacher_id are required' });
    if (old_teacher_id === new_teacher_id)
        return res.status(400).json({ message: 'Cannot reassign to the same teacher' });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Check source teacher exists
        const check = await client.query('SELECT teacher_id FROM teacher_master WHERE teacher_id = $1', [old_teacher_id]);
        if (check.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Source teacher not found' });
        }

        // Transfer all mentor assignments
        await client.query(
            'UPDATE student_teacher_assignments SET mentor_teacher_id = $1 WHERE mentor_teacher_id = $2',
            [new_teacher_id, old_teacher_id]
        );

        // Transfer all assistant mentor assignments
        await client.query(
            'UPDATE student_teacher_assignments SET assistance_teacher_id = $1 WHERE assistance_teacher_id = $2',
            [new_teacher_id, old_teacher_id]
        );

        // Transfer coursework ownership
        await client.query(
            'UPDATE student_coursework_assignments SET assigned_by_teacher_id = $1 WHERE assigned_by_teacher_id = $2',
            [new_teacher_id, old_teacher_id]
        );

        await client.query('COMMIT');
        res.json({ message: 'All assignments transferred successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        logger.error(`Error in reassignTeacher: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error during reassignment' });
    } finally {
        client.release();
    }
};

// Permanently delete a teacher — only allowed if they have no active student assignments
export const deleteTeacher = async (req, res) => {
    const { teacher_id } = req.params;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Guard: reject if teacher still has assigned students
        const assignmentCheck = await client.query(
            `SELECT COUNT(*)::int AS total FROM student_teacher_assignments
             WHERE mentor_teacher_id = $1 OR assistance_teacher_id = $1`,
            [teacher_id]
        );
        if (assignmentCheck.rows[0].total > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({ message: 'Teacher still has assigned students. Reassign them before removing.' });
        }

        // Fetch email for cascading cleanup
        const emailRes = await client.query('SELECT email FROM teacher_master WHERE teacher_id = $1', [teacher_id]);
        if (emailRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Teacher not found' });
        }
        const email = emailRes.rows[0].email;

        await client.query('DELETE FROM teacher_master WHERE teacher_id = $1', [teacher_id]);
        await client.query('DELETE FROM teacher_login_details WHERE email = $1', [email]);
        await client.query('DELETE FROM pre_approved_teachers WHERE email = $1', [email]);

        await client.query('COMMIT');
        res.json({ message: 'Teacher permanently removed from the system' });
    } catch (err) {
        await client.query('ROLLBACK');
        logger.error(`Error in deleteTeacher: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error deleting teacher' });
    } finally {
        client.release();
    }
};
