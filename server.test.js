const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

// Create a temporary test database
const tempDbPath = path.join(__dirname, 'test-db.json');

// Mock data for tests
const mockUsers = [
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
];

// Admin credentials for testing
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// Create a separate app instance for testing
let app;
let db;

// Setup and teardown
beforeEach(() => {
  // Create a fresh test database
  if (fs.existsSync(tempDbPath)) {
    fs.unlinkSync(tempDbPath);
  }
  
  const adapter = new FileSync(tempDbPath);
  db = low(adapter);
  
  // Initialize with test data
  db.defaults({ users: mockUsers }).write();
  
  // Create a fresh Express app
  app = express();
  app.use(bodyParser.json());
  
  // Import server routes
  // Note: We're not starting the server, just setting up the routes
  
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
  
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
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
  
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
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
});

afterEach(() => {
  // Clean up test database
  if (fs.existsSync(tempDbPath)) {
    fs.unlinkSync(tempDbPath);
  }
});

// Tests
describe('API Routes', () => {
  describe('GET /api/users', () => {
    it('should return user data when valid name and birth date are provided', async () => {
      const response = await request(app)
        .get('/api/users')
        .query({ name: 'John Doe', birthDate: '1990-05-15' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', '1');
      expect(response.body).toHaveProperty('name', 'John Doe');
      expect(response.body).toHaveProperty('birthDate', '1990-05-15');
    });

    it('should return 404 when user is not found', async () => {
      const response = await request(app)
        .get('/api/users')
        .query({ name: 'Unknown User', birthDate: '2000-01-01' });
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
    });

    it('should return 400 when name or birth date is missing', async () => {
      const response = await request(app)
        .get('/api/users')
        .query({ name: 'John Doe' });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Name and birth date are required');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user data when valid ID is provided', async () => {
      const response = await request(app)
        .get('/api/users/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', '1');
      expect(response.body).toHaveProperty('name', 'John Doe');
    });

    it('should return 404 when user ID is not found', async () => {
      const response = await request(app)
        .get('/api/users/999');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user data when valid data is provided', async () => {
      const updatedUser = {
        id: '1',
        name: 'John Doe Updated',
        birthDate: '1990-05-15',
        baptismDate: '1990-06-20',
        mobilePhone: '555-999-8888',
        homePhone: '555-987-6543',
        address: '123 Main St, Anytown, USA',
        emergencyContact: 'Jane Doe (Sister) - 555-765-4321'
      };

      const response = await request(app)
        .put('/api/users/1')
        .send(updatedUser);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      
      // Verify the update
      const getResponse = await request(app)
        .get('/api/users/1');
      
      expect(getResponse.body).toHaveProperty('name', 'John Doe Updated');
      expect(getResponse.body).toHaveProperty('mobilePhone', '555-999-8888');
    });

    it('should return 404 when user ID is not found', async () => {
      const updatedUser = {
        id: '999',
        name: 'Unknown User',
        birthDate: '2000-01-01'
      };

      const response = await request(app)
        .put('/api/users/999')
        .send(updatedUser);
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
    });

    it('should return 400 when ID in URL does not match ID in body', async () => {
      const updatedUser = {
        id: '2',
        name: 'John Doe Updated',
        birthDate: '1990-05-15'
      };

      const response = await request(app)
        .put('/api/users/1')
        .send(updatedUser);
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'ID mismatch');
    });
  });

  describe('POST /api/users/:id/validate', () => {
    it('should update lastValidatedDate when user is validated', async () => {
      const response = await request(app)
        .post('/api/users/1/validate')
        .send({});
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('lastValidatedDate');
      
      // Verify the update
      const getResponse = await request(app)
        .get('/api/users/1');
      
      expect(getResponse.body).toHaveProperty('lastValidatedDate');
    });

    it('should return 404 when user ID is not found', async () => {
      const response = await request(app)
        .post('/api/users/999/validate')
        .send({});
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User not found');
    });
  });

  describe('GET /api/admin/users', () => {
    it('should return all users when valid credentials are provided', async () => {
      const credentials = Buffer.from(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`).toString('base64');
      
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Basic ${credentials}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('id', '1');
      expect(response.body[1]).toHaveProperty('id', '2');
    });

    it('should return 401 when no authorization header is provided', async () => {
      const response = await request(app)
        .get('/api/admin/users');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Authorization header is required');
    });

    it('should return 401 when invalid credentials are provided', async () => {
      const credentials = Buffer.from('wrong:credentials').toString('base64');
      
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Basic ${credentials}`);
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
  });

  describe('POST /api/admin/login', () => {
    it('should return success when valid credentials are provided', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Authentication successful');
    });

    it('should return 401 when invalid credentials are provided', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({ username: 'wrong', password: 'credentials' });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });
});
