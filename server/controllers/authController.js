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
    const { 
        firstName, middleName, lastName, 
        yearOfAdmission, applicationNumber, 
        email, password, otp 
    } = req.body;

    try {
        // Verify OTP again 
         const otpCheck = await pool.query(
            'SELECT * FROM otp_codes WHERE email = $1 AND code = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
            [email, otp]
        );

        if (otpCheck.rows.length === 0) {
            return res.status(400).json({ message: "Invalid or expired OTP. Please verify again." });
        }

        // Hash Password

        const hash = await bcrypt.hash(password, 10);

        // Create User
        const client = await pool.connect();
        try {
            await client.query('BEGIN'); // Transaction

            // Insert into users
            const newUser = await client.query(
                'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
                [`${firstName} ${lastName}`, email, hash, 'student']
            );
            const userId = newUser.rows[0].id;

            // Insert into student_profiles
            await client.query(
                `INSERT INTO student_profiles 
                (user_id, first_name, middle_name, last_name, year_of_admission, application_number) 
                VALUES ($1, $2, $3, $4, $5, $6)`,
                [userId, firstName, middleName || null, lastName, yearOfAdmission, applicationNumber]
            );

            await client.query('COMMIT');
            
            // Generate auto-login token
            const token = jwt.sign({ id: userId, role: 'student' }, process.env.JWT_SECRET, { expiresIn: '1h' });
            
            res.status(201).json({ 
                message: "Student registered successfully", 
                token, 
                user: { id: userId, name: `${firstName} ${lastName}`, role: 'student' } 
            });

        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

    } catch (err) {
        console.error(err);
        if (err.code === '23505') { // Unique constraint violation
             return res.status(409).json({ message: "Email or Application Number already exists" });
        }
        res.status(500).json({ message: "Server Error during registration" });
    }
};
