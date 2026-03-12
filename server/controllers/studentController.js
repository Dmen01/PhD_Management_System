import pool from '../db.js';

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
