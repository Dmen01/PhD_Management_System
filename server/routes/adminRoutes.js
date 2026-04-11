import express from 'express';
import {
    getStudents, getTeachers, getSubjects, addSubject, deleteSubject,
    getApprovedTeachers, addApprovedTeacher, updateApprovedTeacher, deleteApprovedTeacher,
    getAssignments, assignStudents, removeAssignment,
    getUnverifiedStudents, verifyStudent, rejectStudent,
    reassignTeacher, deleteTeacher
} from '../controllers/adminDashController.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = express.Router();

const syllabusStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/syllabus';
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `syllabus_${Date.now()}${ext}`);
    }
});

const syllabusFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'), false);
};

const uploadSyllabus = multer({ 
    storage: syllabusStorage, 
    fileFilter: syllabusFilter, 
    limits: { fileSize: 2 * 1024 * 1024 } 
});

router.get('/students', getStudents);
router.get('/unverified-students', getUnverifiedStudents);
router.post('/verify-student/:id', verifyStudent);
router.delete('/reject-student/:id', rejectStudent);
router.get('/teachers', getTeachers);
router.get('/subjects', getSubjects);
router.post('/subjects', uploadSyllabus.single('syllabus'), addSubject);
router.delete('/subjects/:id', deleteSubject);

router.get('/approved-teachers', getApprovedTeachers);
router.post('/approved-teachers', addApprovedTeacher);
router.put('/approved-teachers/:id', updateApprovedTeacher);
router.delete('/approved-teachers/:id', deleteApprovedTeacher);

router.get('/assignments', getAssignments);
router.post('/assignments', assignStudents);
router.delete('/assignments/:id', removeAssignment);

router.post('/reassign-teacher', reassignTeacher);
router.delete('/delete-teacher/:teacher_id', deleteTeacher);

export default router;



