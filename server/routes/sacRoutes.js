import express from 'express';
import {
    getSacMembers, addSacMember, deleteSacMember,
    getResultsForValidation, verifyResult, rejectResult,
    getSacAssignments, assignSacMembers, getStudentsWithSacStatus,
} from '../controllers/sacController.js';

const router = express.Router();

// SAC member pool
router.get('/members', getSacMembers);
router.post('/members', addSacMember);
router.delete('/members/:id', deleteSacMember);

// Result validation
router.get('/results', getResultsForValidation);
router.post('/results/:roll_no/verify', verifyResult);
router.delete('/results/:roll_no/reject', rejectResult);

// SAC assignment
router.get('/assignments/:roll_no', getSacAssignments);
router.post('/assignments/:roll_no', assignSacMembers);
router.get('/students-with-sac', getStudentsWithSacStatus);

export default router;
