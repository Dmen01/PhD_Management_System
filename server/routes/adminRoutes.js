import express from 'express';
import {
    getStudents, getTeachers, getSubjects, addSubject,
    getApprovedTeachers, addApprovedTeacher, updateApprovedTeacher, deleteApprovedTeacher,
    getAssignments, assignStudents, removeAssignment
} from '../controllers/adminDashController.js';

const router = express.Router();

router.get('/students', getStudents);
router.get('/teachers', getTeachers);
router.get('/subjects', getSubjects);
router.post('/subjects', addSubject);

router.get('/approved-teachers', getApprovedTeachers);
router.post('/approved-teachers', addApprovedTeacher);
router.put('/approved-teachers/:id', updateApprovedTeacher);
router.delete('/approved-teachers/:id', deleteApprovedTeacher);

router.get('/assignments', getAssignments);
router.post('/assignments', assignStudents);
router.delete('/assignments/:id', removeAssignment);

export default router;



