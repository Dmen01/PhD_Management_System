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

const storageProgress = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/phd_progress';
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const { roll_no } = req.body;
        const ext = path.extname(file.originalname);
        cb(null, `${roll_no}_progress_${Date.now()}${ext}`);
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

export const uploadProgressReportMiddleware = multer({ 
    storage: storageProgress, 
    fileFilter, 
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

const storagePreSubmission = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/phd_pre_submissions';
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const { roll_no } = req.body;
        const ext = path.extname(file.originalname);
        cb(null, `${roll_no}_presubmission_${Date.now()}${ext}`);
    }
});

export const uploadPreSubmissionMiddleware = multer({ 
    storage: storagePreSubmission, 
    fileFilter, 
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB max
});

const storageFinalSubmission = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/phd_final_submissions';
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const { roll_no } = req.body;
        const ext = path.extname(file.originalname);
        cb(null, `${roll_no}_final_${Date.now()}${ext}`);
    }
});

export const uploadFinalSubmissionMiddleware = multer({ 
    storage: storageFinalSubmission, 
    fileFilter, 
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB max
});



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
        res.status(500).json({ message: 'Server error fetching eligible students for letter' });
    }
};

export const getEligibleProgressStudents = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DISTINCT sm.roll_no, sm.first_name, sm.last_name, sm.email, sm.year_of_admission
            FROM student_master sm
            JOIN phd_registration_presentations pp ON pp.roll_no = sm.roll_no
            WHERE pp.remark = 'Accepted'
            ORDER BY sm.first_name ASC
        `);
        res.json({ students: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching eligible students for progress report' });
    }
};

export const getEligiblePreSubmissionStudents = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DISTINCT sm.roll_no, sm.first_name, sm.last_name, sm.email, sm.year_of_admission
            FROM student_master sm
            JOIN phd_registration_letters prl ON sm.roll_no = prl.roll_no
            ORDER BY sm.first_name ASC
        `);
        res.json({ students: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching eligible students for pre-submission' });
    }
};

// PhD Registration Presentation
export const uploadPresentation = async (req, res) => {
    const { roll_no, presentation_date, observation_message, remark, remarks } = req.body;
    
    if (!req.file) return res.status(400).json({ message: 'Synopsis PDF is required' });
    if (!roll_no || !presentation_date || !remark) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // Can insert multiple presentations per student 
        const result = await pool.query(
            `INSERT INTO phd_registration_presentations 
            (roll_no, synopsis_pdf_path, presentation_date, observation_message, remark, remarks)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [roll_no, req.file.path, presentation_date, observation_message, remark, remarks]
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

// PhD Progress Reports
export const uploadProgressReport = async (req, res) => {
    const { 
        roll_no, from_month, from_year, to_month, to_year, 
        is_present, report_number, presentation_date, verdict, remarks, observations 
    } = req.body;
    
    const present = is_present === 'true' || is_present === true;

    if (present && !req.file) {
        return res.status(400).json({ message: 'Progress report PDF is required for present students' });
    }

    if (!roll_no || !from_month || !from_year || !to_month || !to_year) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO phd_progress_reports 
            (roll_no, from_month, from_year, to_month, to_year, is_present, report_number, presentation_date, report_pdf_path, verdict, remarks, observations)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [
                roll_no, from_month, from_year, to_month, to_year, present, 
                present ? report_number : null, 
                present ? presentation_date : null, 
                present ? req.file.path : null, 
                present ? verdict : null, 
                remarks, 
                present ? observations : null
            ]
        );
        res.status(201).json({ message: 'Progress report uploaded successfully', report: result.rows[0] });
    } catch (err) {
        console.error(err);
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Server error uploading progress report' });
    }
};

export const getProgressReports = async (req, res) => {
    const { roll_no } = req.query;
    try {
        let query = `
            SELECT pr.*, sm.first_name, sm.last_name 
            FROM phd_progress_reports pr
            JOIN student_master sm ON sm.roll_no = pr.roll_no
            ORDER BY pr.uploaded_at DESC
        `;
        let params = [];
        
        if (roll_no) {
            query = `
                SELECT pr.*, sm.first_name, sm.last_name 
                FROM phd_progress_reports pr
                JOIN student_master sm ON sm.roll_no = pr.roll_no
                WHERE pr.roll_no = $1
                ORDER BY pr.uploaded_at DESC
            `;
            params = [roll_no];
        }

        const result = await pool.query(query, params);
        res.json({ reports: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching progress reports' });
    }
};

export const deleteProgressReport = async (req, res) => {
    const { id } = req.params;
    try {
        const check = await pool.query('SELECT report_pdf_path FROM phd_progress_reports WHERE id = $1', [id]);
        if (check.rows.length === 0) return res.status(404).json({ message: 'Record not found' });
        
        const path = check.rows[0].report_pdf_path;
        await pool.query('DELETE FROM phd_progress_reports WHERE id = $1', [id]);
        if (path && fs.existsSync(path)) fs.unlinkSync(path);
        
        res.json({ message: 'Progress report removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error deleting progress report' });
    }
};

// ── Pre-Submission Presentations ─────────────────────────────────────────────

export const uploadExtendedSynopsis = async (req, res) => {
    const { roll_no } = req.body;
    if (!req.file) return res.status(400).json({ message: 'Extended synopsis PDF is required' });
    if (!roll_no) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'Roll number is required' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO phd_extended_synopses (roll_no, file_path) VALUES ($1, $2) RETURNING *`,
            [roll_no, req.file.path]
        );
        res.status(201).json({ message: 'Extended synopsis uploaded successfully', synopsis: result.rows[0] });
    } catch (err) {
        console.error(err);
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Server error uploading extended synopsis' });
    }
};

export const getExtendedSynopsis = async (req, res) => {
    const { roll_no } = req.query;
    try {
        if (!roll_no) return res.status(400).json({ message: 'Roll number is required' });
        const result = await pool.query(`SELECT * FROM phd_extended_synopses WHERE roll_no = $1 ORDER BY uploaded_at DESC`, [roll_no]);
        res.json({ synopses: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching extended synopsis' });
    }
};

export const adminCreatePreSubmission = async (req, res) => {
    const { roll_no, presentation_date, committee_members, remark } = req.body;
    
    if (!req.file) return res.status(400).json({ message: 'Extended synopsis PDF is required' });
    if (!roll_no || !presentation_date || !remark) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'Roll number, presentation date, and remark are required' });
    }

    try {
        let parsedCommittee = [];
        try {
            parsedCommittee = committee_members ? JSON.parse(committee_members) : [];
        } catch (e) {
            console.error('Error parsing committee_members', e);
        }

        const result = await pool.query(
            `INSERT INTO phd_pre_submissions (roll_no, synopsis_pdf_path, presentation_date, committee_members, remark, admin_updated_at)
             VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING *`,
            [roll_no, req.file.path, presentation_date, JSON.stringify(parsedCommittee), remark]
        );
        res.status(201).json({ message: 'Pre-submission recorded successfully', preSubmission: result.rows[0] });
    } catch (err) {
        console.error(err);
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Server error creating pre-submission' });
    }
};

export const updatePreSubmissionAdmin = async (req, res) => {
    const { id } = req.params;
    const { presentation_date, committee_members, remark } = req.body;
    
    if (!presentation_date || !remark) {
        return res.status(400).json({ message: 'Presentation date and remark are required' });
    }

    try {
        const result = await pool.query(
            `UPDATE phd_pre_submissions 
             SET presentation_date = $1, committee_members = $2, remark = $3, admin_updated_at = CURRENT_TIMESTAMP
             WHERE id = $4 RETURNING *`,
            [presentation_date, JSON.stringify(committee_members || []), remark, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Pre-submission record not found' });
        }
        
        res.json({ message: 'Pre-submission updated successfully', preSubmission: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating pre-submission' });
    }
};

export const getPreSubmissions = async (req, res) => {
    const { roll_no } = req.query;
    try {
        let query = `
            SELECT pps.*, sm.first_name, sm.last_name 
            FROM phd_pre_submissions pps
            JOIN student_master sm ON sm.roll_no = pps.roll_no
            ORDER BY pps.uploaded_at DESC
        `;
        let params = [];
        
        if (roll_no) {
            query = `
                SELECT pps.*, sm.first_name, sm.last_name 
                FROM phd_pre_submissions pps
                JOIN student_master sm ON sm.roll_no = pps.roll_no
                WHERE pps.roll_no = $1
                ORDER BY pps.uploaded_at DESC
            `;
            params = [roll_no];
        }

        const result = await pool.query(query, params);
        res.json({ preSubmissions: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching pre-submissions' });
    }
};

export const getApprovedProgressCount = async (req, res) => {
    const { roll_no } = req.params;
    try {
        const result = await pool.query(
            `SELECT COUNT(*)::int as count FROM phd_progress_reports WHERE roll_no = $1 AND verdict = 'Accepted'`,
            [roll_no]
        );
        res.json({ count: result.rows[0].count });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching progress count' });
    }
};

// ── Final Submissions ─────────────────────────────────────────────────────────

export const getEligibleFinalSubmissionStudents = async (req, res) => {
    try {
        // Students who have an accepted pre-submission presentation
        const result = await pool.query(`
            SELECT DISTINCT sm.roll_no, sm.first_name, sm.last_name, sm.email, sm.year_of_admission
            FROM student_master sm
            JOIN phd_pre_submissions pps ON pps.roll_no = sm.roll_no
            WHERE pps.remark = 'Accepted'
            ORDER BY sm.first_name ASC
        `);
        res.json({ students: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching eligible students for final submission' });
    }
};

export const getApprovedPreSubmissionDate = async (req, res) => {
    const { roll_no } = req.params;
    try {
        const result = await pool.query(
            `SELECT presentation_date FROM phd_pre_submissions WHERE roll_no = $1 AND remark = 'Accepted' ORDER BY admin_updated_at DESC LIMIT 1`,
            [roll_no]
        );
        const date = result.rows[0]?.presentation_date || null;
        res.json({ presentation_date: date });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching pre-submission date' });
    }
};

export const adminCreateFinalSubmission = async (req, res) => {
    const { roll_no, final_presentation_date } = req.body;
    if (!req.file) return res.status(400).json({ message: 'Final notification PDF is required' });
    if (!roll_no || !final_presentation_date) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'Roll number and final presentation date are required' });
    }
    try {
        const result = await pool.query(
            `INSERT INTO phd_final_submissions (roll_no, final_presentation_date, notification_pdf_path)
             VALUES ($1, $2, $3) RETURNING *`,
            [roll_no, final_presentation_date, req.file.path]
        );
        res.status(201).json({ message: 'Final submission recorded successfully', finalSubmission: result.rows[0] });
    } catch (err) {
        console.error(err);
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Server error creating final submission' });
    }
};

export const getFinalSubmissions = async (req, res) => {
    const { roll_no } = req.query;
    try {
        let query = `
            SELECT pfs.*, sm.first_name, sm.last_name
            FROM phd_final_submissions pfs
            JOIN student_master sm ON sm.roll_no = pfs.roll_no
            ORDER BY pfs.uploaded_at DESC
        `;
        let params = [];
        if (roll_no) {
            query = `
                SELECT pfs.*, sm.first_name, sm.last_name
                FROM phd_final_submissions pfs
                JOIN student_master sm ON sm.roll_no = pfs.roll_no
                WHERE pfs.roll_no = $1
                ORDER BY pfs.uploaded_at DESC
            `;
            params = [roll_no];
        }
        const result = await pool.query(query, params);
        res.json({ finalSubmissions: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching final submissions' });
    }
};
