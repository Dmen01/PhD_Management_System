import express from 'express';
import { login, registerStudent, resetPassword } from '../controllers/authController.js';
import { send, verify, sendReset, sendAdmin, sendTeacherOtp } from '../controllers/otpController.js';
import { loginAdmin, registerAdmin } from '../controllers/adminAuthController.js';
import { loginTeacher, registerTeacher } from '../controllers/teacherAuthController.js';

const router = express.Router();

router.post('/login', login);
router.post('/register/student', registerStudent);
router.post('/otp/send', send);
router.post('/otp/send-reset', sendReset);
router.post('/otp/verify', verify);
router.post('/password/reset', resetPassword);

// Admin Auth Routes
router.post('/admin/login', loginAdmin);
router.post('/admin/register', registerAdmin);
router.post('/admin/otp/send', sendAdmin);

// Teacher Auth Routes
router.post('/teacher/login', loginTeacher);
router.post('/teacher/register', registerTeacher);
router.post('/teacher/otp/send', sendTeacherOtp);

export default router;

