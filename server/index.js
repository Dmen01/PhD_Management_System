import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import feeRoutes from './routes/feeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import sacRoutes from './routes/sacRoutes.js';
import phdRoutes from './routes/phdRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // serve uploaded PDFs

app.get('/', (req, res) => {
  res.send('PhD ERP API is running');
});

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/fee', feeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/sac', sacRoutes);
app.use('/api/phd', phdRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
