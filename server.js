const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

// Create a database adapter and initialize the database
const adapter = new FileSync('db.json');
const db = low(adapter);

// Set default data
db.defaults({
  users: [
    {
      id: '1',
      name: 'John Doe',
      birthDate: '1990-05-15',
      baptismDate: '1990-06-20',
      mobilePhone: '555-123-4567',
      homePhone: '555-987-6543',
      address: '123 Main St, Anytown, USA',
      emergencyContact: 'Jane Doe (Sister) - 555-765-4321'
    },
    {
      id: '2',
      name: 'Jane Smith',
      birthDate: '1985-10-25',
      baptismDate: '1986-01-15',
      mobilePhone: '555-222-3333',
      homePhone: '555-444-5555',
      address: '456 Oak Ave, Somewhere, USA',
      emergencyContact: 'John Smith (Brother) - 555-666-7777'
    }
  ]
}).write();

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
app.get('/api/users', (req, res) => {
  const { name, birthDate } = req.query;

  if (!name || !birthDate) {
    return res.status(400).json({ error: 'Name and birth date are required' });
  }

  const user = db.get('users')
    .find(u => u.name.toLowerCase() === name.toLowerCase() && u.birthDate === birthDate)
    .value();

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});

// Get user by ID
app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;

  const user = db.get('users')
    .find({ id })
    .value();

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});

// Update user
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const userData = req.body;

  // Ensure the ID in the URL matches the ID in the request body
  if (id !== userData.id) {
    return res.status(400).json({ error: 'ID mismatch' });
  }

  // Check if user exists
  const user = db.get('users')
    .find({ id })
    .value();

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  userData.lastValidatedDate = new Date().toISOString();

  // Update user
  db.get('users')
    .find({ id })
    .assign(userData)
    .write();

  res.json({ success: true, message: 'User updated successfully' });
});

// Validate user data
app.post('/api/users/:id/validate', (req, res) => {
  const { id } = req.params;

  // Check if user exists
  const user = db.get('users')
    .find({ id })
    .value();

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Update lastValidatedDate
  const lastValidatedDate = new Date().toISOString();
  db.get('users')
    .find({ id })
    .assign({ lastValidatedDate })
    .write();

  res.json({ 
    success: true, 
    message: 'User data validated successfully',
    lastValidatedDate
  });
});

// Admin route to get all users (protected by authentication)
app.get('/api/admin/users', authenticateAdmin, (req, res) => {
  const users = db.get('users').value();
  res.json(users);
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

const path = require('path');

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
