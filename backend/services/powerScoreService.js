const recentActivityScore = (pushedAt) => {
  if (!pushedAt) return 0;
  const now = new Date();
  const lastPush = new Date(pushedAt);
  const daysSince = (now - lastPush) / (1000 * 60 * 60 * 24);
  // Score drops linearly: 0 days = 100, 365 days = 0
  return Math.max(0, 100 - (daysSince / 365) * 100);
};

/**
 * Score README quality based on length
 */
const readmeQualityScore = (readme) => {
  if (!readme) return 0;
  const length = readme.length;
  if (length > 5000) return 100;
  if (length > 2000) return 80;
  if (length > 800) return 60;
  if (length > 200) return 40;
  return 20;
};

/**
 * Normalize a raw count to a 0–100 score using log scale
 */
const logNormalize = (value, max) => {
  if (!value || value <= 0) return 0;
  return Math.min(100, (Math.log(value + 1) / Math.log(max + 1)) * 100);
};

/**
 * Calculate the final power score (0–100)
 */
export const calculatePowerScore = ({ stars, forks, contributors, pushedAt, readme, isBeginnerFriendly }) => {
  const starsScore = logNormalize(stars, 50000);       // 50k stars = 100
  const forksScore = logNormalize(forks, 10000);       // 10k forks = 100
  const contribScore = logNormalize(contributors, 500); // 500 contributors = 100

  const activityScore = recentActivityScore(pushedAt);
  const readmeScore = readmeQualityScore(readme);
  const beginnerScore = isBeginnerFriendly ? 100 : 0;

  const raw =
    starsScore * 0.4 +
    forksScore * 0.2 +
    contribScore * 0.15 +
    activityScore * 0.1 +
    readmeScore * 0.1 +
    beginnerScore * 0.05;

  return Math.round(Math.min(100, Math.max(0, raw)));
};

/**
 * Derive difficulty label from power score
 */
export const getDifficulty = (powerScore) => {
  if (powerScore < 35) return 'Beginner';
  if (powerScore < 70) return 'Intermediate';
  return 'Advanced';
};
