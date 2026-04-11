import pool from '../db.js';
import logger from '../utils/logger.js';
import fs from 'fs';

// ── Helpers ────────────────────────────────────────────────────────────────────

const buildStudentFilter = (types, modes, years) => {
    const conditions = [];
    const params = [];
    let idx = 1;

    // For each dimension: match if the stored array is NULL (= all) OR contains the student's value
    if (types && types.length) {
        conditions.push(`(target_admission_types IS NULL OR $${idx} = ANY(target_admission_types))`);
        params.push(types[0]); // student has exactly one value
        idx++;
    }
    if (modes && modes.length) {
        conditions.push(`(target_admission_modes IS NULL OR $${idx} = ANY(target_admission_modes))`);
        params.push(modes[0]);
        idx++;
    }
    if (years && years.length) {
        conditions.push(`(target_admission_years IS NULL OR $${idx} = ANY(target_admission_years))`);
        params.push(years[0]);
        idx++;
    }

    return { conditions, params };
};

// ── Admin: create notification ─────────────────────────────────────────────────

export const createNotification = async (req, res) => {
    try {
        const { message, admission_types, admission_modes, admission_years } = req.body;
        if (!message || !message.trim())
            return res.status(400).json({ message: 'Notification message is required' });

        const pdfPath = req.file ? req.file.path.replace(/\\/g, '/') : null;

        // Parse arrays sent as JSON strings from multipart form
        const parseArr = (val) => {
            if (!val) return null;
            try {
                const arr = JSON.parse(val);
                return Array.isArray(arr) && arr.length > 0 ? arr : null;
            } catch {
                return null;
            }
        };

        const types = parseArr(admission_types);
        const modes = parseArr(admission_modes);
        const years = parseArr(admission_years)?.map(Number) ?? null;

        const result = await pool.query(
            `INSERT INTO notifications (message, pdf_path, target_admission_types, target_admission_modes, target_admission_years)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [message.trim(), pdfPath, types, modes, years]
        );

        res.status(201).json({ notification: result.rows[0] });
    } catch (err) {
        logger.error(`Error creating notification: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error creating notification' });
    }
};

// ── Admin: list all notifications ─────────────────────────────────────────────

export const getAdminNotifications = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM notifications ORDER BY created_at DESC'
        );
        res.json({ notifications: result.rows });
    } catch (err) {
        logger.error(`Error fetching notifications: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error fetching notifications' });
    }
};

// ── Admin: delete notification ─────────────────────────────────────────────────

export const deleteNotification = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM notifications WHERE id = $1 RETURNING pdf_path', [id]);
        if (result.rows.length === 0)
            return res.status(404).json({ message: 'Notification not found' });

        // Remove PDF from disk if present
        const pdfPath = result.rows[0].pdf_path;
        if (pdfPath && fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
        }

        res.json({ message: 'Notification deleted' });
    } catch (err) {
        logger.error(`Error deleting notification ${id}: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error deleting notification' });
    }
};

// ── Student: get matching notifications ───────────────────────────────────────

export const getStudentNotifications = async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'email query parameter required' });

    try {
        // Fetch student's admission profile
        const studentRes = await pool.query(
            'SELECT admission_type, admission_mode, year_of_admission FROM student_master WHERE email = $1',
            [email]
        );
        if (studentRes.rows.length === 0)
            return res.status(404).json({ message: 'Student not found' });

        const { admission_type, admission_mode, year_of_admission } = studentRes.rows[0];

        // A notification is visible if for each dimension: stored array is NULL OR contains the student's value
        const result = await pool.query(
            `SELECT * FROM notifications
             WHERE (target_admission_types IS NULL OR $1 = ANY(target_admission_types))
               AND (target_admission_modes IS NULL OR $2 = ANY(target_admission_modes))
               AND (target_admission_years IS NULL OR $3 = ANY(target_admission_years))
             ORDER BY created_at DESC`,
            [admission_type, admission_mode, year_of_admission]
        );

        res.json({ notifications: result.rows });
    } catch (err) {
        logger.error(`Error fetching student notifications: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error fetching notifications' });
    }
};

// ── Teacher: get all notifications ────────────────────────────────────────────

export const getTeacherNotifications = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM notifications ORDER BY created_at DESC');
        res.json({ notifications: result.rows });
    } catch (err) {
        logger.error(`Error fetching teacher notifications: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error fetching notifications' });
    }
};

// ── Admin: get distinct filter values from student_master ─────────────────────

export const getNotificationFilterOptions = async (req, res) => {
    try {
        const [typesRes, modesRes, yearsRes] = await Promise.all([
            pool.query('SELECT DISTINCT admission_type FROM student_master ORDER BY admission_type'),
            pool.query('SELECT DISTINCT admission_mode FROM student_master ORDER BY admission_mode'),
            pool.query('SELECT DISTINCT year_of_admission FROM student_master ORDER BY year_of_admission DESC'),
        ]);
        res.json({
            admission_types: typesRes.rows.map(r => r.admission_type),
            admission_modes: modesRes.rows.map(r => r.admission_mode),
            admission_years: yearsRes.rows.map(r => r.year_of_admission),
        });
    } catch (err) {
        logger.error(`Error fetching filter options: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error fetching filter options' });
    }
};
