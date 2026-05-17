import express from 'express';
import {
    getEligiblePresentationStudents,
    getEligibleLetterStudents,
    uploadPresentationMiddleware,
    uploadPresentation,
    getPresentations,
    deletePresentation,
    uploadLetterMiddleware,
    uploadLetter,
    getLetters,
    deleteLetter,
    getEligibleProgressStudents,
    uploadProgressReportMiddleware,
    uploadProgressReport,
    getProgressReports,
    deleteProgressReport,
    uploadPreSubmissionMiddleware,
    getPreSubmissions,
    getApprovedProgressCount,
    getEligiblePreSubmissionStudents,
    adminCreatePreSubmission,
    uploadExtendedSynopsis,
    getExtendedSynopsis,
    updatePreSubmissionAdmin,
    uploadFinalSubmissionMiddleware,
    getEligibleFinalSubmissionStudents,
    getApprovedPreSubmissionDate,
    adminCreateFinalSubmission,
    getFinalSubmissions
} from '../controllers/phdController.js';

const router = express.Router();

// Fetch eligible students for admin dropdowns
router.get('/eligible-presentation-students', getEligiblePresentationStudents);
router.get('/eligible-letter-students', getEligibleLetterStudents);
router.get('/eligible-progress-students', getEligibleProgressStudents);
router.get('/eligible-presubmission-students', getEligiblePreSubmissionStudents);

// PHD Registration Presentation 
router.post('/presentations', uploadPresentationMiddleware.single('synopsis'), uploadPresentation);
router.get('/presentations', getPresentations);
router.delete('/presentations/:id', deletePresentation);

// PHD Registration Letter
router.post('/letters', uploadLetterMiddleware.single('letter'), uploadLetter);
router.get('/letters', getLetters);
router.delete('/letters/:id', deleteLetter);

// PHD Progress Reports
router.post('/progress-reports', uploadProgressReportMiddleware.single('report'), uploadProgressReport);
router.get('/progress-reports', getProgressReports);
router.delete('/progress-reports/:id', deleteProgressReport);

// PHD Pre-Submission Presentations (Admin)
router.post('/admin/pre-submissions', uploadPreSubmissionMiddleware.single('synopsis'), adminCreatePreSubmission);
router.put('/pre-submissions/:id', updatePreSubmissionAdmin);
router.get('/pre-submissions', getPreSubmissions);
router.get('/pre-submissions/progress-count/:roll_no', getApprovedProgressCount);

// PHD Extended Synopsis (Student)
router.post('/extended-synopses', uploadPreSubmissionMiddleware.single('synopsis'), uploadExtendedSynopsis);
router.get('/extended-synopses', getExtendedSynopsis);

// PHD Final Submissions (Admin)
router.get('/eligible-finalsubmission-students', getEligibleFinalSubmissionStudents);
router.get('/final-submissions/presubmission-date/:roll_no', getApprovedPreSubmissionDate);
router.post('/admin/final-submissions', uploadFinalSubmissionMiddleware.single('notification'), adminCreateFinalSubmission);
router.get('/final-submissions', getFinalSubmissions);

export default router;
