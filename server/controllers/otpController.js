import pool from '../db.js';
import crypto from 'crypto';

// Generate a 6-digit OTP
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export const send = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        // Check if student already registered
        const userCheck = await pool.query('SELECT id FROM student_login_details WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(409).json({ message: "An account with this email already exists" });
        }

        const otp = generateCode();
        const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes from now

        // Store OTP in DB
        await pool.query(
            'INSERT INTO otp_codes (email, code, expires_at) VALUES ($1, $2, $3)',
            [email, otp, expiresAt]
        );

        // MOCK EMAIL SENDING
        console.log(`[MOCK EMAIL] To: ${email} | Code: ${otp}`);

        res.json({ message: "OTP sent successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error generating OTP" });
    }
};

export const verify = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const result = await pool.query(
            'SELECT * FROM otp_codes WHERE email = $1 AND code = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [email, otp]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // OTP is valid
        res.json({ message: "OTP verified successfully" });
        
        // Optionally delete used OTPs or keep for audit
        // await pool.query('DELETE FROM otp_codes WHERE email = $1', [email]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error verifying OTP" });
    }
};
