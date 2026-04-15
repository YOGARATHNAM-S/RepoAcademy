import express from 'express';
import { addComment, getComments, likeComment, deleteComment } from '../controllers/commentController.js';

const router = express.Router();

router.post('/repo/:id/comment', addComment);
router.get('/repo/:id/comments', getComments);
router.put('/comment/:id/like', likeComment);
router.delete('/comment/:id', deleteComment);

export default router;
