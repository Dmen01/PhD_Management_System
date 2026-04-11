import pool from '../db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ── Multer setup for Pre-PhD Results ─────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/results';
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const { roll_no } = req.body;
        const ext = path.extname(file.originalname);
        cb(null, `${roll_no}_result_${Date.now()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'), false);
};

export const uploadResultMiddleware = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB max

// Check if student has filled their master profile
export const getProfile = async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    try {
        // First check if fully registered
        let result = await pool.query(
            `SELECT sm.*, 
             COALESCE((SELECT verified_by_admin FROM pre_phd_results pr WHERE pr.roll_no = sm.roll_no), FALSE) AS pre_phd_verified_by_admin
             FROM student_master sm WHERE sm.email = $1`, [email]
        );
        if (result.rows.length > 0) {
            return res.json({ profile: result.rows[0] });
        }

        // Then check if pending
        result = await pool.query(
            'SELECT * FROM pending_student_registrations WHERE email = $1', [email]
        );
        if (result.rows.length > 0) {
            return res.json({ pendingProfile: result.rows[0] });
        }

        return res.status(404).json({ message: 'Profile not found' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Submit student master profile (one-time)
export const createProfile = async (req, res) => {
    const {
        rollNo, email,
        firstName, middleName, lastName,
        fatherName, motherName,
        dob, mobileNumber, yearOfAdmission,
        admissionMode, admissionType
    } = req.body;

    const required = { rollNo, email, firstName, lastName, fatherName, motherName, dob, mobileNumber, yearOfAdmission, admissionMode, admissionType };
    for (const [field, val] of Object.entries(required)) {
        if (!val) return res.status(400).json({ message: `${field} is required` });
    }

    if (!/^[0-9]{10,15}$/.test(mobileNumber)) {
        return res.status(400).json({ message: 'Mobile number must be 10–15 digits' });
    }

    try {
        const checkMaster = await pool.query(
            'SELECT roll_no FROM student_master WHERE roll_no = $1 OR email = $2',
            [rollNo, email]
        );
        if (checkMaster.rows.length > 0) {
            return res.status(409).json({ message: 'Roll number or email already fully registered' });
        }

        await pool.query(
            `INSERT INTO pending_student_registrations
             (roll_no, email, first_name, middle_name, last_name, father_name, mother_name, dob, mobile_number, year_of_admission, admission_mode, admission_type)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
            [rollNo, email, firstName, middleName || null, lastName,
             fatherName, motherName, dob, mobileNumber, yearOfAdmission, admissionMode, admissionType]
        );
        res.status(201).json({ message: 'Registration request submitted and pending verification' });
    } catch (err) {
        console.error(err);
        if (err.code === '23505') {
            return res.status(409).json({ message: 'Email is already in pending requests' });
        }
        res.status(500).json({ message: 'Server error creating profile' });
    }
};

// Fetch assigned coursework subjects for the student
export const getMyCoursework = async (req, res) => {
    const { roll_no } = req.query;
    if (!roll_no) return res.status(400).json({ message: 'roll_no is required' });

    try {
        const result = await pool.query(`
            SELECT sca.id, sca.subject_id, cs.subject_name, cs.credits, cs.syllabus_pdf_path, sca.assigned_at,
                   tm.first_name || ' ' || tm.last_name AS assigned_by
            FROM student_coursework_assignments sca
            JOIN coursework_subjects cs ON cs.id = sca.subject_id
            JOIN teacher_master tm ON tm.teacher_id = sca.assigned_by_teacher_id
            WHERE sca.student_roll_no = $1
            ORDER BY cs.subject_name
        `, [roll_no]);
        
        res.json({ subjects: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching coursework' });
    }
};

// Fetch assigned mentor and assistance teacher details
export const getMyMentors = async (req, res) => {
    const { roll_no } = req.query;
    if (!roll_no) return res.status(400).json({ message: 'roll_no is required' });

    try {
        const result = await pool.query(`
            SELECT 
                tm.first_name || ' ' || tm.last_name AS mentor_name,
                tm.email                             AS mentor_email,
                tm.mobile_number                     AS mentor_mobile,
                tm.department                        AS mentor_department,
                
                ta.first_name || ' ' || ta.last_name AS assistance_name,
                ta.email                             AS assistance_email,
                ta.mobile_number                     AS assistance_mobile,
                ta.department                        AS assistance_department,
                
                sta.assigned_at
            FROM student_teacher_assignments sta
            JOIN teacher_master tm ON tm.teacher_id = sta.mentor_teacher_id
            LEFT JOIN teacher_master ta ON ta.teacher_id = sta.assistance_teacher_id
            WHERE sta.student_roll_no = $1
        `, [roll_no]);
        
        if (result.rows.length === 0) {
            return res.json({ mentors: null });
        }
        res.json({ mentors: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching mentors' });
    }
};

// Fetch student's pre-phd result
export const getMyResult = async (req, res) => {
    const { roll_no } = req.query;
    if (!roll_no) return res.status(400).json({ message: 'roll_no is required' });

    try {
        const result = await pool.query(
            'SELECT * FROM pre_phd_results WHERE roll_no = $1',
            [roll_no]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'No result found' });
        res.json({ result: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching result' });
    }
};

// Upload student's pre-phd result
export const uploadResult = async (req, res) => {
    const { roll_no, verified_by_student } = req.body;

    if (!req.file) return res.status(400).json({ message: 'PDF result is required' });
    if (!roll_no) return res.status(400).json({ message: 'roll_no is required' });
    if (verified_by_student !== 'true') {
        return res.status(400).json({ message: 'You must verify the document before submitting' });
    }

    try {
        const existing = await pool.query(
            'SELECT id FROM pre_phd_results WHERE roll_no = $1',
            [roll_no]
        );
        
        if (existing.rows.length > 0) {
            fs.unlinkSync(req.file.path);
            return res.status(409).json({ message: 'Result has already been submitted.' });
        }

        await pool.query(
            `INSERT INTO pre_phd_results (roll_no, result_pdf_path, verified_by_student)
             VALUES ($1, $2, $3)`,
            [roll_no, req.file.path, true]
        );
        
        res.status(201).json({ message: 'Result uploaded successfully' });
    } catch (err) {
        console.error(err);
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Server error uploading result' });
    }
};
