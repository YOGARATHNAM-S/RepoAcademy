import {
  addRepo as addRepoToDb,
  getRepos as getReposFromDb,
  getRepoById as getRepoByIdFromDb,
  deleteRepo as deleteRepoFromDb,
} from '../services/repoService.js';
import { fetchAllRepoData } from '../services/githubService.js';
import { calculatePowerScore, getDifficulty } from '../services/powerScoreService.js';

/**
 * POST /api/repo
 * Submit a new GitHub repo URL for analysis
 */
export const addRepo = async (req, res, next) => {
  try {
    const { url, category, subcategory } = req.body;
    if (!url) return res.status(400).json({ error: 'GitHub URL is required' });
    if (!category || !subcategory) return res.status(400).json({ error: 'Category and subcategory are required' });

    // Fetch all data from GitHub (public API, no token)
    const githubData = await fetchAllRepoData(url);

    // Calculate power score
    const powerScore = calculatePowerScore(githubData);
    const difficulty = getDifficulty(powerScore);

    const repoData = {
      ...githubData,
      powerScore,
      difficulty,
      category,
      subcategory,
    };

    const result = await addRepoToDb(repoData);
    if (result.exists) {
      return res.status(200).json({ message: 'Repo already exists', repo: result.repo });
    }

    res.status(201).json({ message: 'Repo added successfully', repo: result.repo });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: 'GitHub repository not found. Check the URL.' });
    }
    if (err.response?.status === 403) {
      return res.status(429).json({ error: 'GitHub API rate limit reached. Try again in an hour.' });
    }
    next(err);
  }
};
export const getRepos = async (req, res, next) => {
  try {
    const { sort = 'createdAt', order = 'desc', search = '', category, subcategory } = req.query;

    const result = await getReposFromDb({
      search,
      category,
      subcategory,
      sortField: sort,
      sortOrder: order,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};


export const getRepoById = async (req, res, next) => {
  try {
    const repo = await getRepoByIdFromDb(req.params.id);
    if (!repo) return res.status(404).json({ error: 'Repository not found' });
    res.json(repo);
  } catch (err) {
    next(err);
  }
};
export const deleteRepo = async (req, res, next) => {
  try {
    await deleteRepoFromDb(req.params.id);
    res.json({ message: 'Repository removed' });
  } catch (err) {
    if (err.message.includes('not found')) {
      return res.status(404).json({ error: 'Repository not found' });
    }
    next(err);
  }
};
