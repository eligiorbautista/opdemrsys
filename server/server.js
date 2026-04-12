const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const corsMiddleware = require('./src/middleware/corsMiddleware');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(corsMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    system: process.env.SYSTEM_NAME || 'OPDEMRSYS',
    name: 'OPD EMR System',
    version: '1.0.0',
    status: 'running'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV || 'development' });
});

app.get('/api/test-route/:id', (req, res) => {
  res.json({ message: 'Route working', id: req.params.id, role: req.user?.role });
});

require('./src/routes')(app);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      status: err.status || 500
    }
  });
});

// Only listen on port if not running in serverless environment (Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`${process.env.SYSTEM_NAME} running on port ${PORT}`);
  });
}

module.exports = app;
