import { supabase } from '../config/firebase.js';

const COMMENTS_TABLE = 'comments';

/**
 * Add a new comment
 */
export const addComment = async (repoId, commentData) => {
  try {
    const { data: newComment, error } = await supabase
      .from(COMMENTS_TABLE)
      .insert([{
        repo_id: repoId,
        username: commentData.username,
        comment: commentData.comment,
        parent_id: commentData.parentId || null,
        likes: 0,
      }])
      .select()
      .single();

    if (error) throw error;

    return formatComment(newComment);
  } catch (err) {
    throw new Error(`Failed to add comment: ${err.message}`);
  }
};

/**
 * Get all comments for a repo, formatted as a threaded tree
 */
export const getComments = async (repoId, sortBy = 'newest') => {
  try {
    let query = supabase
      .from(COMMENTS_TABLE)
      .select('*')
      .eq('repo_id', repoId);

    if (sortBy === 'liked') {
      query = query.order('likes', { ascending: false }).order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data: comments, error } = await query;
    if (error) throw error;

    const formatted = comments.map(formatComment);

    // Build threaded tree: top-level comments with nested replies
    const topLevel = formatted.filter((c) => !c.parentId);
    const replies = formatted.filter((c) => c.parentId);

    const buildThread = (parent) => ({
      ...parent,
      replies: replies
        .filter((r) => r.parentId === parent.id)
        .map(buildThread),
    });

    const threaded = topLevel.map(buildThread);
    return { count: comments.length, comments: threaded };
  } catch (err) {
    throw new Error(`Failed to fetch comments: ${err.message}`);
  }
};

/**
 * Increment like count on a comment
 */
export const likeComment = async (id) => {
  try {
    // Get current likes
    const { data: comment, error: fetchError } = await supabase
      .from(COMMENTS_TABLE)
      .select('likes')
      .eq('id', id)
      .single();

    if (fetchError && fetchError.code === 'PGRST116') {
      return null; // No rows found
    }
    if (fetchError) throw fetchError;

    const currentLikes = comment.likes || 0;

    // Update likes
    const { error: updateError } = await supabase
      .from(COMMENTS_TABLE)
      .update({ likes: currentLikes + 1 })
      .eq('id', id);

    if (updateError) throw updateError;

    return { id, likes: currentLikes + 1 };
  } catch (err) {
    throw new Error(`Failed to like comment: ${err.message}`);
  }
};

/**
 * Delete a comment and its replies
 */
export const deleteComment = async (id) => {
  try {
    // Delete all child replies first
    const { error: deleteChildError } = await supabase
      .from(COMMENTS_TABLE)
      .delete()
      .eq('parent_id', id);

    if (deleteChildError) throw deleteChildError;

    // Delete the parent comment
    const { error: deleteParentError } = await supabase
      .from(COMMENTS_TABLE)
      .delete()
      .eq('id', id);

    if (deleteParentError) throw deleteParentError;

    return { message: 'Comment deleted successfully' };
  } catch (err) {
    throw new Error(`Failed to delete comment: ${err.message}`);
  }
};

/**
 * Format database comment to API format (camelCase)
 */
const formatComment = (dbComment) => {
  return {
    id: dbComment.id,
    repoId: dbComment.repo_id,
    username: dbComment.username,
    comment: dbComment.comment,
    likes: dbComment.likes,
    parentId: dbComment.parent_id,
    createdAt: dbComment.created_at,
    updatedAt: dbComment.updated_at,
  };
};
