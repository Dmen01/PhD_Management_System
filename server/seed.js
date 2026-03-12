import pool from './db.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedDatabase = async () => {
  try {
    console.log('Applying schema...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');
    await pool.query(schemaSql);

    console.log('Seeding sample student accounts...');
    const hashedPwd = await bcrypt.hash('Password1!', 10);

    const students = [
      { email: 'student1@example.com' },
      { email: 'student2@example.com' },
    ];

    for (const student of students) {
      await pool.query(
        'INSERT INTO student_login_details (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING',
        [student.email, hashedPwd]
      );
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDatabase();

