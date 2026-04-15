import express from 'express';
import { addRepo, getRepos, getRepoById, deleteRepo } from '../controllers/repoController.js';

const router = express.Router();

router.post('/repo', addRepo);
router.get('/repos', getRepos);
router.get('/repo/:id', getRepoById);
router.delete('/repo/:id', deleteRepo);

export default router;
