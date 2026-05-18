import pool from '../db.js';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js';

export const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM admin_login_details WHERE email = $1',
            [email]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No admin account found with this email' });
        }

        const admin = result.rows[0];
        const validPassword = await bcrypt.compare(password, admin.password_hash);
        if (!validPassword) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        res.json({ message: 'Admin login successful', admin: { id: admin.id, email: admin.email } });
    } catch (err) {
        logger.error(`Error during admin login for ${email}: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: 'Server error' });
    }
};

export const registerAdmin = async (req, res) => {
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
        //Check if email is in the pre-approved list
        const approvedCheck = await pool.query(
            'SELECT id FROM pre_approved_admins WHERE email = $1',
            [email]
        );
        if (approvedCheck.rows.length === 0) {
            return res.status(403).json({ message: "This email is not authorized to register as an admin" });
        }

        //Check if already registered
        const existingCheck = await pool.query(
            'SELECT id FROM admin_login_details WHERE email = $1',
            [email]
        );
        if (existingCheck.rows.length > 0) {
            return res.status(409).json({ message: "An admin account with this email already exists" });
        }

        //Hash and insert
        const hash = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO admin_login_details (email, password_hash) VALUES ($1, $2)',
            [email, hash]
        );

        res.status(201).json({ message: "Admin registered successfully" });

    } catch (err) {
        logger.error(`Error during admin registration for ${email}: ${err.message}`, { stack: err.stack });
        res.status(500).json({ message: "Server error during admin registration" });
    }
};
