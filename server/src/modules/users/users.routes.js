import express from 'express';
import * as userController from './users.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/profile', protect, userController.getProfile);

export default router;