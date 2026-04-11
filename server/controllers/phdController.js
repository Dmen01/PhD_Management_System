import pool from '../db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ── Multer Configuration ──────────────────────────────────────────────────────
const storagePresentation = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/phd_presentations';
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const { roll_no } = req.body;
        const ext = path.extname(file.originalname);
        cb(null, `${roll_no}_presentation_${Date.now()}${ext}`);
    }
});

const storageLetter = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/phd_letters';
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const { roll_no } = req.body;
        const ext = path.extname(file.originalname);
        cb(null, `${roll_no}_letter_${Date.now()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'), false);
};

export const uploadPresentationMiddleware = multer({ 
    storage: storagePresentation, 
    fileFilter, 
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

export const uploadLetterMiddleware = multer({ 
    storage: storageLetter, 
    fileFilter, 
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});


// ── Controllers ───────────────────────────────────────────────────────────────

export const getEligiblePresentationStudents = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT sm.roll_no, sm.first_name, sm.last_name, sm.email 
            FROM student_master sm
            WHERE (SELECT COUNT(*)::int FROM student_sac_assignments ssa WHERE ssa.student_roll_no = sm.roll_no) > 0
            ORDER BY sm.first_name ASC
        `);
        res.json({ students: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching eligible students' });
    }
};

export const getEligibleLetterStudents = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT sm.roll_no, sm.first_name, sm.last_name, sm.email 
            FROM student_master sm
            JOIN phd_registration_presentations pp ON pp.roll_no = sm.roll_no
            WHERE pp.remark = 'Accepted'
            ORDER BY sm.first_name ASC
        `);
        res.json({ students: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching eligible students for letters' });
    }
};

// PhD Registration Presentation
export const uploadPresentation = async (req, res) => {
    const { roll_no, presentation_date, observation_message, remark } = req.body;
    
    if (!req.file) return res.status(400).json({ message: 'Synopsis PDF is required' });
    if (!roll_no || !presentation_date || !remark) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // Can insert multiple presentations per student 
        const result = await pool.query(
            `INSERT INTO phd_registration_presentations 
            (roll_no, synopsis_pdf_path, presentation_date, observation_message, remark)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [roll_no, req.file.path, presentation_date, observation_message, remark]
        );
        res.status(201).json({ message: 'Presentation uploaded successfully', presentation: result.rows[0] });
    } catch (err) {
        console.error(err);
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Server error uploading presentation' });
    }
};

export const getPresentations = async (req, res) => {
    const { roll_no } = req.query;
    try {
        let query = `
            SELECT pp.*, sm.first_name, sm.last_name 
            FROM phd_registration_presentations pp
            JOIN student_master sm ON sm.roll_no = pp.roll_no
            ORDER BY pp.uploaded_at DESC
        `;
        let params = [];
        
        if (roll_no) {
            query = `
                SELECT pp.*, sm.first_name, sm.last_name 
                FROM phd_registration_presentations pp
                JOIN student_master sm ON sm.roll_no = pp.roll_no
                WHERE pp.roll_no = $1
                ORDER BY pp.uploaded_at DESC
            `;
            params = [roll_no];
        }

        const result = await pool.query(query, params);
        res.json({ presentations: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching presentations' });
    }
};

export const deletePresentation = async (req, res) => {
    const { id } = req.params;
    try {
        const check = await pool.query('SELECT synopsis_pdf_path FROM phd_registration_presentations WHERE id = $1', [id]);
        if (check.rows.length === 0) return res.status(404).json({ message: 'Record not found' });
        
        const path = check.rows[0].synopsis_pdf_path;
        await pool.query('DELETE FROM phd_registration_presentations WHERE id = $1', [id]);
        if (fs.existsSync(path)) fs.unlinkSync(path);
        
        res.json({ message: 'Presentation removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error deleting presentation' });
    }
};

// PhD Registration Letter
export const uploadLetter = async (req, res) => {
    const { roll_no, registration_number } = req.body;
    
    if (!req.file) return res.status(400).json({ message: 'Registration letter PDF is required' });
    if (!roll_no || !registration_number) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'Roll number and registration number are required' });
    }

    try {
        // Only one letter per student. Overwrite or Reject? We'll overwrite or conflict. Let's conflict and force delete first, or upscale.
        const existing = await pool.query('SELECT letter_pdf_path FROM phd_registration_letters WHERE roll_no = $1', [roll_no]);
        if (existing.rows.length > 0) {
            fs.unlinkSync(req.file.path);
            return res.status(409).json({ message: 'A registration letter already exists for this student. Delete it first to re-upload.' });
        }

        const result = await pool.query(
            `INSERT INTO phd_registration_letters (roll_no, letter_pdf_path, registration_number)
             VALUES ($1, $2, $3) RETURNING *`,
            [roll_no, req.file.path, registration_number]
        );
        res.status(201).json({ message: 'Registration letter uploaded successfully', letter: result.rows[0] });
    } catch (err) {
        console.error(err);
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Server error uploading registration letter' });
    }
};

export const getLetters = async (req, res) => {
    const { roll_no } = req.query;
    try {
        let query = `
            SELECT pl.*, sm.first_name, sm.last_name 
            FROM phd_registration_letters pl
            JOIN student_master sm ON sm.roll_no = pl.roll_no
            ORDER BY pl.uploaded_at DESC
        `;
        let params = [];
        
        if (roll_no) {
            query = `
                SELECT pl.*, sm.first_name, sm.last_name 
                FROM phd_registration_letters pl
                JOIN student_master sm ON sm.roll_no = pl.roll_no
                WHERE pl.roll_no = $1
                ORDER BY pl.uploaded_at DESC
            `;
            params = [roll_no];
        }

        const result = await pool.query(query, params);
        res.json({ letters: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching letters' });
    }
};

export const deleteLetter = async (req, res) => {
    const { id } = req.params;
    try {
        const check = await pool.query('SELECT letter_pdf_path FROM phd_registration_letters WHERE id = $1', [id]);
        if (check.rows.length === 0) return res.status(404).json({ message: 'Record not found' });
        
        const path = check.rows[0].letter_pdf_path;
        await pool.query('DELETE FROM phd_registration_letters WHERE id = $1', [id]);
        if (fs.existsSync(path)) fs.unlinkSync(path);
        
        res.json({ message: 'Letter removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error deleting letter' });
    }
};
