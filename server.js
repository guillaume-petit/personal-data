const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Import database module (supports both Turso and local JSON database)
const database = require('./db');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Admin credentials (in a real app, these would be stored securely)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// Middleware
// Configure CORS based on environment
if (process.env.NODE_ENV === 'production') {
  // In production, only allow requests from the same origin or specific domains
  const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : false,
    optionsSuccessStatus: 200
  };
  app.use(cors(corsOptions));
} else {
  // In development, allow all origins
  app.use(cors());
}

app.use(bodyParser.json());

// Authentication middleware for admin routes
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is required' });
  }

  // Extract credentials from Basic Auth header
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  // Use environment variables for admin credentials if available
  const adminUsername = process.env.ADMIN_USERNAME || ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD || ADMIN_PASSWORD;

  if (username !== adminUsername || password !== adminPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  next();
};

// API Routes

// Get user by name and birth date
app.get('/api/users', async (req, res) => {
  const { name, birthDate } = req.query;

  if (!name || !birthDate) {
    return res.status(400).json({ error: 'Name and birth date are required' });
  }

  try {
    const user = await database.getUserByNameAndBirthDate(name, birthDate);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const user = await database.getUserById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const userData = req.body;

  // Ensure the ID in the URL matches the ID in the request body
  if (id !== userData.id) {
    return res.status(400).json({ error: 'ID mismatch' });
  }

  try {
    // Check if user exists
    const user = await database.getUserById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user
    const result = await database.updateUser(id, userData);
    res.json(result);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Validate user data
app.post('/api/users/:id/validate', async (req, res) => {
  const { id } = req.params;

  try {
    // Check if user exists
    const user = await database.getUserById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update lastValidatedDate
    const result = await database.validateUser(id);
    res.json(result);
  } catch (error) {
    console.error('Error validating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin route to get all users (protected by authentication)
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
  try {
    const users = await database.getUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin route to verify credentials (for frontend login)
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  // Use environment variables for admin credentials if available
  const adminUsername = process.env.ADMIN_USERNAME || ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD || ADMIN_PASSWORD;

  if (username === adminUsername && password === adminPassword) {
    res.json({ 
      success: true, 
      message: 'Authentication successful'
    });
  } else {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials'
    });
  }
});

// Serve static files from the Angular app
app.use(express.static(path.join(__dirname, 'dist/personal-data-app')));

// Add this AFTER all your other routes (API routes)
// This catch-all route handler must be the last route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/personal-data-app/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
