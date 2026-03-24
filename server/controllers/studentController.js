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
        const { application_number } = req.body;
        const ext = path.extname(file.originalname);
        cb(null, `${application_number}_result_${Date.now()}${ext}`);
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
        const result = await pool.query(
            'SELECT * FROM student_master WHERE email = $1', [email]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.json({ profile: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Submit student master profile (one-time)
export const createProfile = async (req, res) => {
    const {
        applicationNumber, email,
        firstName, middleName, lastName,
        fatherName, motherName,
        dob, mobileNumber, yearOfAdmission
    } = req.body;

    const required = { applicationNumber, email, firstName, lastName, fatherName, motherName, dob, mobileNumber, yearOfAdmission };
    for (const [field, val] of Object.entries(required)) {
        if (!val) return res.status(400).json({ message: `${field} is required` });
    }

    if (!/^[0-9]{10,15}$/.test(mobileNumber)) {
        return res.status(400).json({ message: 'Mobile number must be 10–15 digits' });
    }

    try {
        await pool.query(
            `INSERT INTO student_master
             (application_number, email, first_name, middle_name, last_name, father_name, mother_name, dob, mobile_number, year_of_admission)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [applicationNumber, email, firstName, middleName || null, lastName,
             fatherName, motherName, dob, mobileNumber, yearOfAdmission]
        );
        res.status(201).json({ message: 'Profile created successfully' });
    } catch (err) {
        console.error(err);
        if (err.code === '23505') {
            return res.status(409).json({ message: 'Application number or email already registered' });
        }
        res.status(500).json({ message: 'Server error creating profile' });
    }
};

// Fetch assigned coursework subjects for the student
export const getMyCoursework = async (req, res) => {
    const { application_number } = req.query;
    if (!application_number) return res.status(400).json({ message: 'application_number is required' });

    try {
        const result = await pool.query(`
            SELECT sca.id, sca.subject_id, cs.subject_name, cs.credits, sca.assigned_at,
                   tm.first_name || ' ' || tm.last_name AS assigned_by
            FROM student_coursework_assignments sca
            JOIN coursework_subjects cs ON cs.id = sca.subject_id
            JOIN teacher_master tm ON tm.teacher_id = sca.assigned_by_teacher_id
            WHERE sca.student_application_number = $1
            ORDER BY cs.subject_name
        `, [application_number]);
        
        res.json({ subjects: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching coursework' });
    }
};

// Fetch assigned mentor and assistance teacher details
export const getMyMentors = async (req, res) => {
    const { application_number } = req.query;
    if (!application_number) return res.status(400).json({ message: 'application_number is required' });

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
            WHERE sta.student_application_number = $1
        `, [application_number]);
        
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
    const { application_number } = req.query;
    if (!application_number) return res.status(400).json({ message: 'application_number is required' });

    try {
        const result = await pool.query(
            'SELECT * FROM pre_phd_results WHERE application_number = $1',
            [application_number]
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
    const { application_number, verified_by_student } = req.body;

    if (!req.file) return res.status(400).json({ message: 'PDF result is required' });
    if (!application_number) return res.status(400).json({ message: 'application_number is required' });
    if (verified_by_student !== 'true') {
        return res.status(400).json({ message: 'You must verify the document before submitting' });
    }

    try {
        const existing = await pool.query(
            'SELECT id FROM pre_phd_results WHERE application_number = $1',
            [application_number]
        );
        
        if (existing.rows.length > 0) {
            fs.unlinkSync(req.file.path);
            return res.status(409).json({ message: 'Result has already been submitted.' });
        }

        await pool.query(
            `INSERT INTO pre_phd_results (application_number, result_pdf_path, verified_by_student)
             VALUES ($1, $2, $3)`,
            [application_number, req.file.path, true]
        );
        
        res.status(201).json({ message: 'Result uploaded successfully' });
    } catch (err) {
        console.error(err);
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Server error uploading result' });
    }
};
