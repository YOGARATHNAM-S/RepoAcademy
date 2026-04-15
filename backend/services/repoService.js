import { supabase } from '../config/firebase.js';

const REPOS_TABLE = 'repos';

export const addRepo = async (repoData) => {
  try {
    const { data: existing, error: fetchError } = await supabase
      .from(REPOS_TABLE)
      .select('*')
      .eq('full_name', repoData.fullName)
      .limit(1);

    if (fetchError) throw fetchError;

    if (existing && existing.length > 0) {
      return { exists: true, repo: formatRepo(existing[0]) };
    }

    // Add new repo
    const { data: newRepo, error: insertError } = await supabase
      .from(REPOS_TABLE)
      .insert([formatRepoForInsert(repoData)])
      .select()
      .single();

    if (insertError) throw insertError;

    return { exists: false, repo: formatRepo(newRepo) };
  } catch (err) {
    throw new Error(`Failed to add repo: ${err.message}`);
  }
};


export const getRepos = async ({ search = '', category, subcategory, sortField = 'created_at', sortOrder = 'desc' } = {}) => {
  try {
    let query = supabase
      .from(REPOS_TABLE)
      .select('id, name, owner, full_name, description, stars, forks, contributors, open_issues, languages, topics, default_branch, homepage, license, pushed_at, github_url, power_score, difficulty, category, subcategory, ai_summary, created_at, updated_at');

    // Apply category filter
    if (category) {
      query = query.eq('category', category);
    }

    // Apply subcategory filter
    if (subcategory) {
      query = query.eq('subcategory', subcategory);
    }

    // Apply sorting
    const validSorts = ['power_score', 'stars', 'forks', 'created_at', 'name'];
    const sortCol = validSorts.includes(sortField) ? sortField : 'created_at';
    query = query.order(sortCol, { ascending: sortOrder === 'asc' });

    const { data: repos, error } = await query;
    if (error) throw error;

    // Apply search filter on client side
    let filtered = repos;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = repos.filter(
        (repo) =>
          repo.name?.toLowerCase().includes(searchLower) ||
          repo.description?.toLowerCase().includes(searchLower) ||
          repo.owner?.toLowerCase().includes(searchLower)
      );
    }

    // Format results
    filtered = filtered.map(repo => {
      const { readme, ...rest } = repo;
      return formatRepo(rest);
    });

    return { count: filtered.length, repos: filtered };
  } catch (err) {
    throw new Error(`Failed to fetch repos: ${err.message}`);
  }
};

/**
 * Get a single repo by ID
 */
export const getRepoById = async (id) => {
  try {
    const { data: repo, error } = await supabase
      .from(REPOS_TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') {
      return null; // No rows found
    }
    if (error) throw error;

    return formatRepo(repo);
  } catch (err) {
    throw new Error(`Failed to fetch repo: ${err.message}`);
  }
};

/**
 * Delete a repo by ID
 */
export const deleteRepo = async (id) => {
  try {
    const { error } = await supabase
      .from(REPOS_TABLE)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { message: 'Repo deleted successfully' };
  } catch (err) {
    throw new Error(`Failed to delete repo: ${err.message}`);
  }
};

/**
 * Update repo data
 */
export const updateRepo = async (id, updates) => {
  try {
    const { data: updated, error } = await supabase
      .from(REPOS_TABLE)
      .update({
        ...formatRepoForInsert(updates),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return formatRepo(updated);
  } catch (err) {
    throw new Error(`Failed to update repo: ${err.message}`);
  }
};

/**
 * Format database data to match API expectations (camelCase)
 */
const formatRepo = (dbRepo) => {
  if (!dbRepo) return null;
  return {
    id: dbRepo.id,
    name: dbRepo.name,
    owner: dbRepo.owner,
    fullName: dbRepo.full_name,
    description: dbRepo.description,
    stars: dbRepo.stars,
    forks: dbRepo.forks,
    contributors: dbRepo.contributors,
    openIssues: dbRepo.open_issues,
    languages: dbRepo.languages,
    readme: dbRepo.readme,
    topics: dbRepo.topics,
    defaultBranch: dbRepo.default_branch,
    homepage: dbRepo.homepage,
    license: dbRepo.license,
    pushedAt: dbRepo.pushed_at,
    githubUrl: dbRepo.github_url,
    powerScore: dbRepo.power_score,
    difficulty: dbRepo.difficulty,
    category: dbRepo.category,
    subcategory: dbRepo.subcategory,
    aiSummary: dbRepo.ai_summary,
    createdAt: dbRepo.created_at,
    updatedAt: dbRepo.updated_at,
  };
};

/**
 * Format API data to database format (snake_case)
 */
const formatRepoForInsert = (apiRepo) => {
  return {
    name: apiRepo.name,
    owner: apiRepo.owner,
    full_name: apiRepo.fullName,
    description: apiRepo.description,
    stars: apiRepo.stars,
    forks: apiRepo.forks,
    contributors: apiRepo.contributors,
    open_issues: apiRepo.openIssues,
    languages: apiRepo.languages,
    readme: apiRepo.readme,
    topics: apiRepo.topics,
    default_branch: apiRepo.defaultBranch,
    homepage: apiRepo.homepage,
    license: apiRepo.license,
    pushed_at: apiRepo.pushedAt,
    github_url: apiRepo.githubUrl,
    power_score: apiRepo.powerScore,
    difficulty: apiRepo.difficulty,
    category: apiRepo.category,
    subcategory: apiRepo.subcategory,
    ai_summary: apiRepo.aiSummary,
  };
};
