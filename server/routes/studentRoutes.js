import express from 'express';
import { getProfile, createProfile, getMyCoursework, getMyMentors, uploadResult, getMyResult, uploadResultMiddleware } from '../controllers/studentController.js';

const router = express.Router();

router.get('/profile', getProfile);
router.post('/profile', createProfile);
router.get('/coursework', getMyCoursework);
router.get('/mentors', getMyMentors);
router.get('/result', getMyResult);
router.post('/result', uploadResultMiddleware.single('receipt'), uploadResult);

export default router;
