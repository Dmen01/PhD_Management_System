import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import {
    createNotification,
    getAdminNotifications,
    deleteNotification,
    getStudentNotifications,
    getTeacherNotifications,
    getNotificationFilterOptions,
} from '../controllers/notificationController.js';

const router = express.Router();

const notifStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/notifications';
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `notif_${Date.now()}${ext}`);
    },
});

const notifUpload = multer({
    storage: notifStorage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files are allowed'), false);
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.post('/', notifUpload.single('pdf'), createNotification);
router.get('/admin', getAdminNotifications);
router.delete('/:id', deleteNotification);
router.get('/student', getStudentNotifications);
router.get('/teacher', getTeacherNotifications);
router.get('/filter-options', getNotificationFilterOptions);

export default router;
