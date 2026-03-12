import express from 'express';
import { getProfile, createProfile } from '../controllers/studentController.js';

const router = express.Router();

router.get('/profile', getProfile);
router.post('/profile', createProfile);

export default router;
