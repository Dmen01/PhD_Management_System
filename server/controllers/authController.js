import pool from '../db.js';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM student_login_details WHERE email = $1',
            [email]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No account found with this email' });
        }

        const student = result.rows[0];
        const validPassword = await bcrypt.compare(password, student.password_hash);
        if (!validPassword) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        res.json({ message: 'Login successful', student: { id: student.id, email: student.email } });
    } catch (err) {
        logger.error(`Error during login for ${email}: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error' });
    }
};

export const registerStudent = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const passwordRules = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRules.test(password)) {
        return res.status(400).json({
            message: "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character"
        });
    }

    try {
        const existing = await pool.query(
            'SELECT id FROM student_login_details WHERE email = $1',
            [email]
        );
        if (existing.rows.length > 0) {
            return res.status(409).json({ message: "An account with this email already exists" });
        }

        const hash = await bcrypt.hash(password, 10);

        await pool.query(
            'INSERT INTO student_login_details (email, password_hash) VALUES ($1, $2)',
            [email, hash]
        );

        res.status(201).json({ message: "Student registered successfully" });

    } catch (err) {
        logger.error(`Error during registration for ${email}: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: "Server error during registration" });
    }
};

export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    const passwordRules = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRules.test(newPassword)) {
        return res.status(400).json({
            message: "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character"
        });
    }

    try {
        // Verify OTP is valid and not expired
        const otpCheck = await pool.query(
            'SELECT * FROM otp_codes WHERE email = $1 AND code = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [email, otp]
        );
        if (otpCheck.rows.length === 0) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // Check account exists
        const account = await pool.query(
            'SELECT id FROM student_login_details WHERE email = $1', [email]
        );
        if (account.rows.length === 0) {
            return res.status(404).json({ message: "No account found with this email" });
        }

        const hash = await bcrypt.hash(newPassword, 10);
        await pool.query(
            'UPDATE student_login_details SET password_hash = $1 WHERE email = $2',
            [hash, email]
        );

        res.json({ message: "Password reset successfully" });

    } catch (err) {
        logger.error(`Error during password reset for ${email}: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: "Server error during password reset" });
    }
};
