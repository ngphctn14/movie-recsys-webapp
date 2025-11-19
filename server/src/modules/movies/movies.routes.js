import express from 'express';
import * as movieController from './movies.controller.js';

const router = express.Router();

router.post('/', movieController.create);
router.get('/', movieController.findAll);
router.get('/:id', movieController.findOne);
router.put('/:id', movieController.update);
router.delete('/:id', movieController.remove);

export default router;