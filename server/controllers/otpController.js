import pool from '../db.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

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

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Registration OTP',
            text: `Your OTP for registration is: ${otp}. It will expire in 10 minutes.`
        };

        await transporter.sendMail(mailOptions);
        logger.info(`OTP sent successfully to: ${email}`);

        res.json({ message: "OTP sent successfully" });

    } catch (err) {
        logger.error(`Error generating OTP for ${email}: ${err.message}`, { stack: err.stack });
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

        res.json({ message: "OTP verified successfully" });

    } catch (err) {
        logger.error(`Error verifying OTP for ${email}: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: "Server error verifying OTP" });
    }
};

// Separate OTP send for password reset — email MUST already exist
export const sendReset = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        const account = await pool.query(
            'SELECT id FROM student_login_details WHERE email = $1', [email]
        );
        if (account.rows.length === 0) {
            return res.status(404).json({ message: "No account found with this email" });
        }

        const otp = generateCode();
        const expiresAt = new Date(Date.now() + 10 * 60000);

        await pool.query(
            'INSERT INTO otp_codes (email, code, expires_at) VALUES ($1, $2, $3)',
            [email, otp, expiresAt]
        );

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Password Reset OTP',
            text: `Your OTP for resetting your password is: ${otp}. It will expire in 10 minutes.`
        };

        await transporter.sendMail(mailOptions);
        logger.info(`Reset OTP sent successfully to: ${email}`);

        res.json({ message: "Reset OTP sent successfully" });

    } catch (err) {
        logger.error(`Error sending reset OTP to ${email}: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: "Server error sending reset OTP" });
    }
};
