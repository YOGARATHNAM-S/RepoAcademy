import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import RepoSubmitForm from '../components/RepoSubmitForm';
import RepoCard from '../components/RepoCard';
import { fetchRepos } from '../services/api';

const REPO_TYPES = ['Learning Repo', 'Project Repo', 'Open Source Repo', 'Book Repo'];

const CATEGORIES = Object.fromEntries([
  'DevOps',
  'AIML',
  'GenAI',
  'Software Development',
  'Cloud',
  'Books',
  'Data Science',
  'Cyber Security',
  'Interview Prep',
  'Frontend Development',
  'Backend Development',
  'Mobile Development',
  'Blockchain/Web3',
  'IoT',
  'Kubernetes',
  'Game Development',
  'Quantum Computing',
  'Testing/QA',
  'API Development',
  'Serverless',
  'Edge Computing',
  'AR/VR',
  'Robotics',
  'Database/Storage',
  'MLOps',
  'DevSecOps',
  'Awesome websites',
  'Automation',
  'Other'
].map((category) => [category, REPO_TYPES]));

const SORT_OPTIONS = [
  { value: 'createdAt', label: '🕐 Newest' },
  { value: 'powerScore', label: '⚡ Power Score' },
  { value: 'stars', label: '⭐ Stars' },
  { value: 'forks', label: '🍴 Forks' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const heroContentVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export default function HomePage() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterSubcategory, setFilterSubcategory] = useState('All');

  const loadRepos = async () => {
    setLoading(true);
    try {
      const params = { sort, search };
      if (filterCategory !== 'All') params.category = filterCategory;
      if (filterSubcategory !== 'All') params.subcategory = filterSubcategory;
      const { data } = await fetchRepos(params);
      const normalizedRepos = Array.isArray(data?.repos)
        ? data.repos
        : Array.isArray(data)
          ? data
          : [];
      setRepos(normalizedRepos);
    } catch (err) {
      console.error('Failed to load repos:', err);
      setRepos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadRepos, 400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, search, filterCategory, filterSubcategory]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pb-12 sm:pb-16 md:pb-24">
      {/* Hero Section */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="text-center pt-16 sm:pt-24 pb-10 sm:pb-16 md:pt-32 md:pb-24 flex flex-col items-center"
      >


        <motion.h1 variants={heroContentVariants} className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter leading-tight mb-4 sm:mb-6 max-w-4xl px-2">
          <span style={{ color: 'var(--text-primary)' }}>
            Learn from the{' '}
          </span>
          <br className="md:hidden" />
          <span
            className="relative"
            style={{
              background: 'linear-gradient(to right, var(--primary-400), var(--accent-400), #22d3ee)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Best Repositories
            <div className="absolute -inset-2 blur-2xl -z-10 rounded-full opacity-50" style={{ background: 'var(--primary-glow)' }} />
          </span>
        </motion.h1>

        <motion.p
          variants={heroContentVariants}
          className="text-sm xs:text-base sm:text-lg md:text-xl font-medium max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-12 leading-relaxed px-3 sm:px-4"
          style={{ color: 'var(--text-muted)' }}
        >
          Submit any public GitHub repository, get it analyzed instantly, and join the community discussion to accelerate your learning.
        </motion.p>

        {/* Submit form */}
        <motion.div variants={heroContentVariants} className="w-full">
          <RepoSubmitForm onSuccess={loadRepos} />
        </motion.div>


      </motion.div>

      {/* Filter and Content Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        {/* Category Pills */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-3 scrollbar-hide">
          {['All', ...Object.keys(CATEGORIES)].map(cat => (
            <button
              key={cat}
              onClick={() => {
                setFilterCategory(cat);
                setFilterSubcategory('All');
              }}
              className="whitespace-nowrap px-3 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300"
              style={{
                background: filterCategory === cat
                  ? 'var(--primary-600)'
                  : 'var(--surface-900)',
                border: `1px solid ${filterCategory === cat ? 'var(--primary-500)' : 'var(--border-primary)'}`,
                color: filterCategory === cat ? '#fff' : 'var(--text-muted)',
                boxShadow: filterCategory === cat ? '0 0 20px var(--primary-glow)' : 'none',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {filterCategory !== 'All' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide"
            >
              {['All', ...CATEGORIES[filterCategory]].map(sub => (
                <button
                  key={sub}
                  onClick={() => setFilterSubcategory(sub)}
                  className="whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300"
                  style={{
                    background: filterSubcategory === sub
                      ? 'rgba(var(--accent-500), 0.2)'
                      : 'transparent',
                    border: `1px solid ${filterSubcategory === sub ? 'var(--accent-400)' : 'var(--border-primary)'}`,
                    color: filterSubcategory === sub ? 'var(--accent-300)' : 'var(--text-muted)',
                  }}
                >
                  {sub}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter bar */}
        <div
          className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-between gap-3 sm:gap-4 mb-8 p-3 sm:p-4 md:p-6 rounded-2xl"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--border-primary)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="w-full sm:flex-1 sm:min-w-[240px] relative group">
            <span
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              className="input-premium pl-10 sm:pl-11 h-11 sm:h-12 w-full text-sm sm:text-base"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search repos..."
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-1 sm:flex-wrap">
            {SORT_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setSort(value)}
                className="whitespace-nowrap px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300"
                style={{
                  background: sort === value ? 'var(--primary-900)' : 'var(--glass-bg)',
                  border: `1px solid ${sort === value ? 'var(--border-active)' : 'var(--border-primary)'}`,
                  color: sort === value ? 'var(--primary-400)' : 'var(--text-muted)',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Repo grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : repos.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 sm:p-8 md:p-12 text-center max-w-2xl mx-auto mt-8 sm:mt-12"
          >
            <div className="text-4xl sm:text-6xl mb-4 sm:mb-6 relative inline-block">
              📭
              <div className="absolute -inset-4 blur-xl rounded-full -z-10" style={{ background: 'var(--primary-glow)' }} />
            </div>
            <h3 className="text-lg sm:text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {search ? 'No repositories found' : 'No repositories yet'}
            </h3>
            <p style={{ color: 'var(--text-muted)' }}>
              {search
                ? "Try adjusting your search or filters to find what you're looking for."
                : 'Submit your first GitHub repository URL above to get started!'}
            </p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {repos.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-card p-6 flex flex-col gap-4">
      <div className="flex gap-4 mb-4">
        <div className="w-10 h-10 rounded-lg animate-pulse" style={{ background: 'var(--surface-800)' }} />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-3/4 rounded animate-pulse" style={{ background: 'var(--surface-800)' }} />
          <div className="h-4 w-1/2 rounded animate-pulse" style={{ background: 'var(--surface-800)', opacity: 0.5 }} />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded animate-pulse" style={{ background: 'var(--surface-800)', opacity: 0.5 }} />
        <div className="h-3 w-5/6 rounded animate-pulse" style={{ background: 'var(--surface-800)', opacity: 0.3 }} />
      </div>
      <div className="mt-auto pt-4 flex gap-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
        {[...Array(4)].map((_, i) => (
           <div key={i} className="h-4 w-10 rounded animate-pulse" style={{ background: 'var(--surface-800)' }} />
        ))}
      </div>
    </div>
  );
}
