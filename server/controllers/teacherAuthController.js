import pool from '../db.js';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';

export const loginTeacher = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM teacher_login_details WHERE email = $1',
            [email]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No teacher account found with this email' });
        }

        const teacher = result.rows[0];
        const validPassword = await bcrypt.compare(password, teacher.password_hash);
        if (!validPassword) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        res.json({ message: 'Teacher login successful', teacher: { id: teacher.id, email: teacher.email } });
    } catch (err) {
        logger.error(`Error during teacher login for ${email}: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error' });
    }
};

export const registerTeacher = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const passwordRules = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRules.test(password)) {
        return res.status(400).json({
            message: 'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character'
        });
    }

    try {
        // Must be in pre-approved list
        const approvedCheck = await pool.query(
            'SELECT id FROM pre_approved_teachers WHERE email = $1',
            [email]
        );
        if (approvedCheck.rows.length === 0) {
            return res.status(403).json({ message: 'This email is not authorized to register as a teacher' });
        }

        // Cannot already be registered
        const existingCheck = await pool.query(
            'SELECT id FROM teacher_login_details WHERE email = $1',
            [email]
        );
        if (existingCheck.rows.length > 0) {
            return res.status(409).json({ message: 'A teacher account with this email already exists' });
        }

        const hash = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO teacher_login_details (email, password_hash) VALUES ($1, $2)',
            [email, hash]
        );

        res.status(201).json({ message: 'Teacher registered successfully' });
    } catch (err) {
        logger.error(`Error during teacher registration for ${email}: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error during teacher registration' });
    }
};
