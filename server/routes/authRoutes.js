import express from 'express';
import { login, registerStudent } from '../controllers/authController.js';
import { send, verify } from '../controllers/otpController.js';

const router = express.Router();

router.post('/login', login);
router.post('/register/student', registerStudent);
router.post('/otp/send', send);
router.post('/otp/verify', verify);

export default router;
