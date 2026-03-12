import pool from '../db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ── Multer setup ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/fee';
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const { applicationNumber, semester } = req.body;
        const ext = path.extname(file.originalname);
        cb(null, `${applicationNumber}_sem${semester}_${Date.now()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'), false);
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB max

// ── Get fee detail for a specific semester ───────────────────────────────────
export const getFeeDetail = async (req, res) => {
    const { applicationNumber, semester } = req.query;
    if (!applicationNumber || !semester) {
        return res.status(400).json({ message: 'applicationNumber and semester are required' });
    }
    try {
        const result = await pool.query(
            'SELECT * FROM fee_details WHERE application_number = $1 AND semester = $2',
            [applicationNumber, parseInt(semester)]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'No fee record found' });
        res.json({ fee: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// ── Upload fee receipt (student — one time per semester) ─────────────────────
export const uploadFeeReceipt = async (req, res) => {
    const { applicationNumber, semester, paymentDate, verifiedByStudent } = req.body;

    if (!req.file) return res.status(400).json({ message: 'PDF receipt is required' });
    if (!applicationNumber || !semester || !paymentDate) {
        return res.status(400).json({ message: 'applicationNumber, semester, and paymentDate are required' });
    }
    if (verifiedByStudent !== 'true') {
        return res.status(400).json({ message: 'You must verify the details before submitting' });
    }

    try {
        // Block re-upload — student cannot overwrite once submitted
        const existing = await pool.query(
            'SELECT id FROM fee_details WHERE application_number = $1 AND semester = $2',
            [applicationNumber, parseInt(semester)]
        );
        if (existing.rows.length > 0) {
            fs.unlinkSync(req.file.path); // remove the just-uploaded file since we won't use it
            return res.status(409).json({ message: 'Fee receipt for this semester has already been submitted' });
        }

        await pool.query(
            `INSERT INTO fee_details (application_number, semester, payment_date, receipt_pdf_path, verified_by_student)
             VALUES ($1, $2, $3, $4, $5)`,
            [applicationNumber, parseInt(semester), paymentDate, req.file.path, true]
        );
        res.status(201).json({ message: 'Fee receipt uploaded successfully' });
    } catch (err) {
        console.error(err);
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Server error uploading receipt' });
    }
};
