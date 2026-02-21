import express from 'express';
import * as bimonthlyController from '../controllers/bimonthlyController.js';

const router = express.Router();

router.get('/', bimonthlyController.getAllBimonthlyScores);
router.post('/', bimonthlyController.createBimonthlyScore);
router.get('/class-average', bimonthlyController.getBimonthlyClassAverage);
router.get('/:id', bimonthlyController.getBimonthlyScoreById);
router.delete('/:id', bimonthlyController.deleteBimonthlyScore);

export default router;
