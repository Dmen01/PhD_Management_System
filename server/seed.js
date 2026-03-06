import pool from './db.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedDatabase = async () => {
  try {
    console.log('Reading schema...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');

    console.log('Applying schema...');
    await pool.query(schemaSql);

    // 3. Create Users
    console.log('Creating initial users...');
    const hashedPwd = await bcrypt.hash('password123', 10);

    const users = [
      { name: 'Alice Student', email: 'student@example.com', role: 'student' },
      { name: 'Bob Teacher', email: 'teacher@example.com', role: 'teacher' },
      { name: 'Charlie Admin', email: 'admin@example.com', role: 'admin' },
    ];

    for (const user of users) {
      await pool.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
        [user.name, user.email, hashedPwd, user.role]
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
