const express = require('express');
const cors = require('cors');

// Supabase setup
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase = null;

if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️  WARNING: Missing SUPABASE_URL or SUPABASE_KEY');
  console.error('   SUPABASE_URL:', supabaseUrl ? 'SET' : '❌ NOT SET');
  console.error('   SUPABASE_KEY:', supabaseKey ? 'SET' : '❌ NOT SET');
  console.error('   API will be in read-only mode');
} else {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✓ Supabase initialized successfully');
}

// Routes are ESM in backend, so load them via dynamic import from CJS.
let repoRoutes = null;
let commentRoutes = null;

const app = express();

// Middleware
app.use(cors({
  origin: ['https://repo-academy.vercel.app', 'http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    app: 'RepoAcademy API',
    supabaseConnected: !!(supabaseUrl && supabaseKey),
    timestamp: new Date().toISOString()
  });
});

// Endpoint to show setup status
app.get('/api/status', (req, res) => {
  res.json({ 
    message: 'RepoAcademy API',
    serviceStatus: 'online',
    database: supabase ? 'connected' : 'disconnected',
    environment: {
      supabaseUrl: supabaseUrl ? '✓ Set' : '✗ Missing',
      supabaseKey: supabaseKey ? '✓ Set' : '✗ Missing'
    }
  });
});

const loadRoutes = async () => {
  try {
    const repoModule = await import('../backend/routes/repoRoutes.js');
    const commentModule = await import('../backend/routes/commentRoutes.js');

    repoRoutes = repoModule.default;
    commentRoutes = commentModule.default;

    // Keep same route prefix as backend/server.js.
    app.use('/api', repoRoutes);
    app.use('/api', commentRoutes);
  } catch (err) {
    console.error('Error loading routes:', err.message);
  }
};

loadRoutes();

// 404 handler
app.use((req, res) => {
  console.warn(`404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal Server Error',
    status: err.status || 500,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Export for Vercel serverless
module.exports = app;
