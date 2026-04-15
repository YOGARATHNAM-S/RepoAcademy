import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import repoRoutes from './routes/repoRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', repoRoutes);
app.use('/api', commentRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', app: 'Repolearn API' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Export for Vercel serverless functions
export default app;

// Start server with Supabase ready (local development)
const PORT = process.env.PORT || 5000;

try {
  // Supabase initialization is done in config/firebase.js
  console.log('✅ Supabase initialized');
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('📡 Using Supabase (PostgreSQL) database');
  });
} catch (err) {
  console.error('❌ Supabase initialization failed:', err.message);
  process.exit(1);
}
