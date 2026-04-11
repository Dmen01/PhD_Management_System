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
    deleteLetter
} from '../controllers/phdController.js';

const router = express.Router();

// Fetch eligible students for admin dropdowns
router.get('/eligible-presentation-students', getEligiblePresentationStudents);
router.get('/eligible-letter-students', getEligibleLetterStudents);

// PHD Registration Presentation 
router.post('/presentations', uploadPresentationMiddleware.single('synopsis'), uploadPresentation);
router.get('/presentations', getPresentations);
router.delete('/presentations/:id', deletePresentation);

// PHD Registration Letter
router.post('/letters', uploadLetterMiddleware.single('letter'), uploadLetter);
router.get('/letters', getLetters);
router.delete('/letters/:id', deleteLetter);

export default router;
