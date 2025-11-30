import express from 'express';

const app = express();
const PORT = process.env.PORT || 4000;

// Minimal middleware
app.use(express.json());

// Health check for Render
app.get('/api/health/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'SecondWind Backend - Degraded Mode'
  });
});

// Basic API endpoints
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'degraded',
    message: 'Backend running in degraded mode - databases not configured',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Catch-all route
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'Endpoint not implemented in degraded mode'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SecondWind Backend running on port ${PORT}`);
  console.log(`🔧 Mode: Degraded (no databases)`);
  console.log(`💚 Health check: /api/health/live`);
});
