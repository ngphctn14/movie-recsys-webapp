import express from 'express';
import * as watchlistController from './watchlists.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', protect, watchlistController.add);
router.delete('/:movieId', protect, watchlistController.remove);
router.get('/', protect, watchlistController.getAll);

export default router;