import express from 'express';
import movieRoutes from '../modules/movies/movies.routes.js';

const router = express.Router();

router.use('/movies', movieRoutes);

export default router;