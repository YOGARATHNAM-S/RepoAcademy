import {
  addComment as addCommentToDb,
  getComments as getCommentsFromDb,
  likeComment as likeCommentInDb,
  deleteComment as deleteCommentFromDb,
} from '../services/commentService.js';
import { getRepoById } from '../services/repoService.js';

/**
 * POST /api/repo/:id/comment
 * Add a comment to a repository
 */
export const addComment = async (req, res, next) => {
  try {
    const { username, comment, parentId } = req.body;

    if (!username?.trim()) return res.status(400).json({ error: 'Username is required' });
    if (!comment?.trim()) return res.status(400).json({ error: 'Comment text is required' });

    const repo = await getRepoById(req.params.id);
    if (!repo) return res.status(404).json({ error: 'Repository not found' });

    const newComment = await addCommentToDb(req.params.id, {
      username: username.trim(),
      comment: comment.trim(),
      parentId: parentId || null,
    });

    res.status(201).json(newComment);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/repo/:id/comments
 * Get all comments for a repo (supports ?sort=newest|liked)
 */
export const getComments = async (req, res, next) => {
  try {
    const { sort = 'newest' } = req.query;
    const sortOption = sort === 'liked' ? 'liked' : 'newest';

    const result = await getCommentsFromDb(req.params.id, sortOption);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/comment/:id/like
 * Increment like count on a comment
 */
export const likeComment = async (req, res, next) => {
  try {
    const result = await likeCommentInDb(req.params.id);
    if (!result) return res.status(404).json({ error: 'Comment not found' });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    await deleteCommentFromDb(req.params.id);
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
};
