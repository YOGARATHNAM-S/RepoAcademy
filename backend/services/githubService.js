import axios from 'axios';

const GITHUB_API = 'https://api.github.com';

// Common headers for all GitHub API requests (no token needed)
const GITHUB_HEADERS = {
  Accept: 'application/vnd.github.v3+json',
  'User-Agent': 'Repolearn-App',
};

/**
 * Parse a GitHub URL and return { owner, repo }
 */
export const parseGithubUrl = (url) => {
  try {
    const cleanUrl = url.replace(/\.git$/, '').replace(/\/$/, '');
    const match = cleanUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) throw new Error('Invalid GitHub URL format');
    return { owner: match[1], repo: match[2] };
  } catch {
    throw new Error('Could not parse GitHub URL. Please use a valid format: https://github.com/owner/repo');
  }
};

const fetchRepoDetails = async (owner, repo) => {
  const { data } = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}`, { headers: GITHUB_HEADERS });
  return data;
};

/**
 * Fetch README content (decoded from base64)
 */
const fetchReadme = async (owner, repo) => {
  try {
    const { data } = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}/readme`, { headers: GITHUB_HEADERS });
    return Buffer.from(data.content, 'base64').toString('utf-8');
  } catch {
    return '';
  }
};

/**
 * Fetch language breakdown { JavaScript: 45000, Python: 12000 }
 */
const fetchLanguages = async (owner, repo) => {
  try {
    const { data } = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}/languages`, { headers: GITHUB_HEADERS });
    return data;
  } catch {
    return {};
  }
};

/**
 * Fetch contributor count (paginated — returns total from last page link header)
 */
const fetchContributorCount = async (owner, repo) => {
  try {
    const response = await axios.get(
      `${GITHUB_API}/repos/${owner}/${repo}/contributors?per_page=1&anon=true`,
      { headers: GITHUB_HEADERS }
    );
    const linkHeader = response.headers['link'] || '';
    // Parse last page number from Link header
    const match = linkHeader.match(/page=(\d+)>; rel="last"/);
    if (match) return parseInt(match[1], 10);
    // If no pagination, count items in response
    return Array.isArray(response.data) ? response.data.length : 0;
  } catch {
    return 0;
  }
};

/**
 * Check if repo has "good first issue" labeled issues (beginner friendly)
 */
const fetchBeginnerFriendly = async (owner, repo) => {
  try {
    const { data } = await axios.get(
      `${GITHUB_API}/repos/${owner}/${repo}/issues?labels=good+first+issue&per_page=1&state=open`,
      { headers: GITHUB_HEADERS }
    );
    return Array.isArray(data) && data.length > 0;
  } catch {
    return false;
  }
};

/**
 * Fetch all GitHub data for a repo in parallel
 */
export const fetchAllRepoData = async (githubUrl) => {
  const { owner, repo } = parseGithubUrl(githubUrl);

  const [details, readme, languages, contributorCount, isBeginnerFriendly] = await Promise.all([
    fetchRepoDetails(owner, repo),
    fetchReadme(owner, repo),
    fetchLanguages(owner, repo),
    fetchContributorCount(owner, repo),
    fetchBeginnerFriendly(owner, repo),
  ]);

  return {
    owner,
    name: details.name,
    fullName: details.full_name,
    description: details.description || '',
    stars: details.stargazers_count || 0,
    forks: details.forks_count || 0,
    openIssues: details.open_issues_count || 0,
    topics: details.topics || [],
    defaultBranch: details.default_branch || 'main',
    homepage: details.homepage || '',
    license: details.license?.name || '',
    pushedAt: details.pushed_at,
    githubUrl: details.html_url,
    contributors: contributorCount,
    languages,
    readme,
    isBeginnerFriendly,
  };
};
