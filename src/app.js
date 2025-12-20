// Load environment variables from a .env file
require('dotenv').config();

// Import Express and connectDB function from database configuration file
const express = require('express');
const { connectDB } = require('./config/db');

// Import CORS Policy
const cors = require('cors');

// Import the main routes file
const routes = require('./routes/index');

// Import middleware for error handling
const { errorMiddleware } = require('./middlewares');

// Connect to the database at application startup
connectDB();

// Create an instance of the Express application
const app = express();

// Trust proxy so req.protocol respects X-Forwarded-Proto in hosting/proxies
app.set('trust proxy', true);

// List of allowed domains
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);

// Security & logging
const helmet = require('helmet');
const pinoHttp = require('pino-http');
const logger = require('./utils/logger');

// Custom CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS bloqueado: Dominio no permitido.'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma'],
  credentials: true,
};

// Apply security headers and request logging (dev)
// Allow cross-origin loading of static assets like images (needed for client at :4200)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
// HTTP request logging
app.use(pinoHttp({ logger }));

// Apply CORS with restrictive settings
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Middleware to parse the body of requests as JSON
app.use(express.json());

// Ensure upload folders exist on startup (useful in hosting environments)
const fs = require('fs');
const path = require('path');
['uploads/logos', 'uploads/claims', 'logs', 'assets/default-branding'].forEach((dir) => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${fullPath}`);
  }
});

// Serve uploads directory (user-uploaded logos, claim attachments, etc.)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Serve default branding assets (read-only)
app.use('/assets', express.static(path.join(__dirname, '..', 'assets'), {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Routes: use the routes defined in the routes/index.js file
app.use('/', routes);

// Health endpoint
app.get('/health', async (req, res) => {
  const health = { server: true };
  // DB check via Sequelize
  try {
    await require('./config/db').sequelize.authenticate();
    health.database = true;
  } catch (e) {
    health.database = false;
  }
  // Redis check
  try {
    const client = require('./config/redis');
    await client.ping();
    health.redis = true;
  } catch (e) {
    health.redis = false;
  }
  res.status(health.database && health.redis ? 200 : 503).json(health);
});

// Handle 404 errors: respond with a JSON message if the requested path is not found
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Middleware for error handling
app.use(errorMiddleware);

// Start the Express server on the port defined in the environment variables or on port 3000 by default
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});
