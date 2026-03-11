import express from 'express';
import { login, registerStudent, resetPassword } from '../controllers/authController.js';
import { send, verify } from '../controllers/otpController.js';

const router = express.Router();

router.post('/login', login);
router.post('/register/student', registerStudent);
router.post('/otp/send', send);
router.post('/otp/verify', verify);
router.post('/password/reset', resetPassword);

export default router;
