import express from 'express';
import * as ratingController from './ratings.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', protect, ratingController.addRating);
router.get('/me', protect, ratingController.getMyRatings);

export default router;