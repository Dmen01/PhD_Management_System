import pool from '../db.js';
import bcrypt from 'bcryptjs';

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
        console.error(err);
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
        console.error(err);
        res.status(500).json({ message: "Server error during registration" });
    }
};
