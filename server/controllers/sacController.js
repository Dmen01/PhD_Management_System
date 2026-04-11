import pool from '../db.js';
import logger from '../utils/logger.js';
import fs from 'fs';

// ── SAC Members CRUD ──────────────────────────────────────────────────────────

export const getSacMembers = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM sac_members ORDER BY name ASC');
        res.json({ members: result.rows });
    } catch (err) {
        logger.error(`getSacMembers: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error fetching SAC members' });
    }
};

export const addSacMember = async (req, res) => {
    const { name, designation, phone_number, email, affiliation } = req.body;
    if (!name || !designation || !phone_number || !email || !affiliation)
        return res.status(400).json({ message: 'All fields are required: name, designation, phone_number, email, affiliation' });

    try {
        const result = await pool.query(
            `INSERT INTO sac_members (name, designation, phone_number, email, affiliation)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [name.trim(), designation.trim(), phone_number.trim(), email.trim().toLowerCase(), affiliation.trim()]
        );
        res.status(201).json({ member: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ message: 'A SAC member with this email already exists' });
        logger.error(`addSacMember: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error adding SAC member' });
    }
};

export const deleteSacMember = async (req, res) => {
    const { id } = req.params;
    try {
        // Guard: prevent deletion if member is assigned to any student
        const check = await pool.query('SELECT COUNT(*)::int AS total FROM student_sac_assignments WHERE sac_member_id = $1', [id]);
        if (check.rows[0].total > 0)
            return res.status(409).json({ message: `Cannot delete — this member is assigned to ${check.rows[0].total} student(s)` });

        const result = await pool.query('DELETE FROM sac_members WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'SAC member not found' });
        res.json({ message: 'SAC member removed' });
    } catch (err) {
        logger.error(`deleteSacMember: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error deleting SAC member' });
    }
};

// ── Result Validation ─────────────────────────────────────────────────────────

// All students who have uploaded a pre-PhD result (for admin review)
export const getResultsForValidation = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                pr.id,
                pr.roll_no,
                pr.result_pdf_path,
                pr.verified_by_student,
                pr.verified_by_admin,
                pr.admin_verified_at,
                pr.submitted_at,
                sm.first_name,
                sm.last_name,
                sm.email,
                sm.admission_type,
                sm.year_of_admission,
                -- count of SAC members already assigned
                (SELECT COUNT(*)::int FROM student_sac_assignments ssa WHERE ssa.student_roll_no = pr.roll_no) AS sac_count
            FROM pre_phd_results pr
            JOIN student_master sm ON sm.roll_no = pr.roll_no
            ORDER BY pr.submitted_at DESC
        `);
        res.json({ results: result.rows });
    } catch (err) {
        logger.error(`getResultsForValidation: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error fetching results' });
    }
};

// Admin approves a student's result
export const verifyResult = async (req, res) => {
    const { roll_no } = req.params;
    try {
        const result = await pool.query(
            `UPDATE pre_phd_results
             SET verified_by_admin = TRUE, admin_verified_at = NOW()
             WHERE roll_no = $1 RETURNING *`,
            [roll_no]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Result not found' });
        res.json({ result: result.rows[0] });
    } catch (err) {
        logger.error(`verifyResult: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error verifying result' });
    }
};

// Admin rejects a student's result — deletes the record so student can re-upload
export const rejectResult = async (req, res) => {
    const { roll_no } = req.params;
    try {
        const pdfRes = await pool.query('SELECT result_pdf_path FROM pre_phd_results WHERE roll_no = $1', [roll_no]);
        if (pdfRes.rows.length === 0) return res.status(404).json({ message: 'Result not found' });

        const pdfPath = pdfRes.rows[0].result_pdf_path;

        // Remove the DB record so student can re-upload
        await pool.query('DELETE FROM pre_phd_results WHERE roll_no = $1', [roll_no]);

        // Remove PDF from disk
        if (pdfPath && fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);

        res.json({ message: 'Result rejected and deleted — student may re-upload' });
    } catch (err) {
        logger.error(`rejectResult: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error rejecting result' });
    }
};

// ── SAC Assignments ───────────────────────────────────────────────────────────

export const getSacAssignments = async (req, res) => {
    const { roll_no } = req.params;
    try {
        const result = await pool.query(`
            SELECT sm.*, ssa.assigned_at
            FROM student_sac_assignments ssa
            JOIN sac_members sm ON sm.id = ssa.sac_member_id
            WHERE ssa.student_roll_no = $1
            ORDER BY sm.name ASC
        `, [roll_no]);
        res.json({ assignments: result.rows });
    } catch (err) {
        logger.error(`getSacAssignments: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error fetching SAC assignments' });
    }
};

// Replace (overwrite) SAC assignment for a student — max 5 members
export const assignSacMembers = async (req, res) => {
    const { roll_no } = req.params;
    const { sac_member_ids } = req.body; // array of integers

    if (!Array.isArray(sac_member_ids))
        return res.status(400).json({ message: 'sac_member_ids must be an array' });
    if (sac_member_ids.length > 5)
        return res.status(400).json({ message: 'Maximum 5 SAC members can be assigned to a student' });

    // Verify result is approved before allowing SAC assignment
    const verified = await pool.query(
        'SELECT verified_by_admin FROM pre_phd_results WHERE roll_no = $1', [roll_no]
    );
    if (verified.rows.length === 0 || !verified.rows[0].verified_by_admin)
        return res.status(400).json({ message: 'Result must be verified by admin before assigning SAC members' });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Clear existing assignments
        await client.query('DELETE FROM student_sac_assignments WHERE student_roll_no = $1', [roll_no]);
        // Insert new ones
        for (const memberId of sac_member_ids) {
            await client.query(
                'INSERT INTO student_sac_assignments (student_roll_no, sac_member_id) VALUES ($1, $2)',
                [roll_no, memberId]
            );
        }
        await client.query('COMMIT');
        res.json({ message: `${sac_member_ids.length} SAC member(s) assigned to ${roll_no}` });
    } catch (err) {
        await client.query('ROLLBACK');
        logger.error(`assignSacMembers: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error assigning SAC members' });
    } finally {
        client.release();
    }
};

// Get all students with their SAC assignment status (for the "Assign SAC" sub-tab)
export const getStudentsWithSacStatus = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                sm.roll_no,
                sm.first_name,
                sm.last_name,
                sm.email,
                sm.year_of_admission,
                pr.verified_by_admin,
                pr.admin_verified_at,
                (SELECT COUNT(*)::int FROM student_sac_assignments ssa WHERE ssa.student_roll_no = sm.roll_no) AS sac_count
            FROM student_master sm
            JOIN pre_phd_results pr ON pr.roll_no = sm.roll_no
            WHERE pr.verified_by_admin = TRUE
            ORDER BY sm.first_name ASC
        `);
        res.json({ students: result.rows });
    } catch (err) {
        logger.error(`getStudentsWithSacStatus: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error' });
    }
};
