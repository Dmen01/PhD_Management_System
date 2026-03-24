import express from 'express';
import { getTeacherProfile, createTeacherProfile, changeTeacherPassword, getAssignedStudents, getCourseworkSubjects, getStudentCoursework, assignCoursework } from '../controllers/teacherController.js';

const router = express.Router();

router.get('/profile', getTeacherProfile);
router.post('/profile', createTeacherProfile);
router.put('/password', changeTeacherPassword);
router.get('/students', getAssignedStudents);

// Coursework endpoints for teachers
router.get('/coursework-subjects', getCourseworkSubjects);
router.get('/student-coursework', getStudentCoursework);
router.post('/assign-coursework', assignCoursework);

export default router;
