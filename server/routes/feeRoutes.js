import express from 'express';
import { getFeeDetail, uploadFeeReceipt, upload } from '../controllers/feeController.js';

const router = express.Router();

router.get('/', getFeeDetail);
router.post('/upload', upload.single('receipt'), uploadFeeReceipt);

export default router;
