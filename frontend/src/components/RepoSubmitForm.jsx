import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { submitRepo } from '../services/api';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

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

export default function RepoSubmitForm({ onSuccess }) {
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('Software Development');
  const [subcategory, setSubcategory] = useState(CATEGORIES['Software Development'][0]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isValidGithubUrl = (val) =>
    /^https?:\/\/(www\.)?github\.com\/[^/\s]+\/[^/\s]+/.test(val.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return toast.error('Please enter a GitHub URL');
    if (!isValidGithubUrl(url)) return toast.error('Please enter a valid GitHub repository URL');

    setLoading(true);
    try {
      const { data } = await submitRepo(url.trim(), category, subcategory);
      toast.success(`✅ "${data.repo.name}" added successfully!`);
      setUrl('');
      setCategory('Software Development');
      setSubcategory(CATEGORIES['Software Development'][0]);
      if (onSuccess) onSuccess(data.repo);
      navigate(`/repo/${data.repo.id}`);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to fetch repo. Check the URL and try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 sm:gap-4 w-full max-w-2xl mx-auto p-3 sm:p-4 md:p-6 rounded-2xl relative"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--border-primary)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
      }}
    >
      {/* Decorative background glow */}
      <div
        className="absolute -inset-1 rounded-3xl blur opacity-20 pointer-events-none"
        style={{ background: 'linear-gradient(to right, var(--primary-500), var(--accent-500))' }}
      />

      <div className="relative">
        <label className="block text-xs font-semibold uppercase tracking-widest pl-1 mb-1 sm:mb-1.5" style={{ color: 'var(--text-muted)' }}>
          Repository URL
        </label>
        <div className="relative group">
          <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-lg opacity-40 group-focus-within:opacity-100 transition-opacity" style={{ color: 'var(--primary-400)' }}>🔗</span>
          <input
            type="url"
            className="input-premium pl-10 sm:pl-11 h-11 sm:h-14 text-sm sm:text-base"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            disabled={loading}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 relative">
        <div className="flex-1">
          <label className="block text-xs font-semibold uppercase tracking-widest pl-1 mb-1 sm:mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Category
          </label>
          <select
            className="input-premium h-11 sm:h-12 w-full cursor-pointer text-sm sm:text-base"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setSubcategory(CATEGORIES[e.target.value][0]);
            }}
            disabled={loading}
          >
            {Object.keys(CATEGORIES).map(cat => (
              <option key={cat} value={cat} style={{ background: 'var(--surface-900)', color: 'var(--text-primary)' }}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-xs font-semibold uppercase tracking-widest pl-1 mb-1 sm:mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Type
          </label>
          <select
            className="input-premium h-11 sm:h-12 w-full cursor-pointer text-sm sm:text-base"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            disabled={loading}
          >
            {CATEGORIES[category].map(sub => (
              <option key={sub} value={sub} style={{ background: 'var(--surface-900)', color: 'var(--text-primary)' }}>{sub}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="btn-premium h-11 sm:h-12 w-full sm:w-[140px] text-sm sm:text-base"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner /> <span className="opacity-80">...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="text-xl">⚡</span> Submit
              </span>
            )}
          </button>
        </div>
      </div>
    </motion.form>
  );
}

function Spinner() {
  return (
    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
  );
}
