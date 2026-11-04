const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const studentRoutes = require('./routes/studentRoutes');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Security middleware - must be first
app.use(helmet());

// CORS configuration with environment-based whitelist
const corsOptions = {
  origin: function (origin, callback) {
    const whitelist = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
      : ['http://localhost:5000'];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

// HTTP request logging middleware
app.use(morgan('dev'));

// Body parser middleware
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Student Management API is running' });
});

// API routes
app.use('/api/students', studentRoutes);

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler middleware - must be last
app.use(errorHandler);

module.exports = app;
