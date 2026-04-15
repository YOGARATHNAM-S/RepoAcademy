import axios from 'axios';

// Determine the API URL based on environment
const getBaseURL = () => {
  // For development
  if (import.meta.env.MODE === 'development') {
    return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  }
  
  // For production (Vercel)
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
  const host = typeof window !== 'undefined' ? window.location.host : '';
  
  if (host) {
    return `${protocol}//${host}/api`;
  }
  
  return '/api';
};

const baseURL = getBaseURL();

const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ─── Repo APIs ───────────────────────────────────────────
export const submitRepo = (url, category, subcategory) => 
  api.post('/repo', { url, category, subcategory });

export const fetchRepos = (params = {}) => 
  api.get('/repos', { params });

export const fetchRepoById = (id) => 
  api.get(`/repo/${id}`);

export const deleteRepo = (id) => 
  api.delete(`/repo/${id}`);

// ─── Comment APIs ─────────────────────────────────────
export const fetchComments = (repoId, sort = 'newest') =>
  api.get(`/repo/${repoId}/comments`, { params: { sort } });

export const addComment = (repoId, data) => 
  api.post(`/repo/${repoId}/comment`, data);

export const likeComment = (commentId) => 
  api.put(`/comment/${commentId}/like`);

export const deleteComment = (commentId) => 
  api.delete(`/comment/${commentId}`);

// ─── Health Check ────────────────────────────────────
export const checkHealth = () => 
  api.get('/health');

export default api;
