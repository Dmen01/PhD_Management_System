import pool from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const login = async (req, res) => {
  const { role, email, password } = req.body; 

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(400).json({ message: 'User not found' });

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(400).json({ message: 'Invalid Password' });

    if (role && user.role !== role.toLowerCase()) {
        return res.status(403).json({ message: `Access denied. You are not a ${role}.` });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
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
