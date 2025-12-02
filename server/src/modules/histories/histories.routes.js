import express from 'express';
import * as historyController from './histories.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', protect, historyController.add);
router.get('/', protect, historyController.getAll);
router.delete('/:movieId', protect, historyController.remove);

export default router;