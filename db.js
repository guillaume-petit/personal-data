const { createClient } = require('@libsql/client');
require('dotenv').config();

// Check if Turso configuration is available
if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.error('Turso configuration not found. Please set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env file.');
  console.error('The application requires Turso database to function properly.');
  process.exit(1);
}

// Create Turso client
const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Initialize database schema if needed
const initializeDatabase = async () => {
  try {
    // Check if users table exists
    const tableExists = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='users'
    `);

    if (tableExists.rows.length === 0) {
      // Create users table
      await client.execute(`
        CREATE TABLE users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          birthDate TEXT NOT NULL,
          baptismDate TEXT,
          mobilePhone TEXT,
          homePhone TEXT,
          address TEXT,
          emergencyContact TEXT,
          lastValidatedDate TEXT
        )
      `);

      console.log('Database schema created successfully.');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Call initialization function
initializeDatabase().catch(console.error);

// Export database methods
module.exports = {
  client,
  type: 'turso',
  getUsers: async () => {
    const result = await client.execute('SELECT * FROM users');
    return result.rows;
  },
  getUserByNameAndBirthDate: async (name, birthDate) => {
    const result = await client.execute({
      sql: 'SELECT * FROM users WHERE LOWER(name) = LOWER(?) AND birthDate = ? LIMIT 1',
      args: [name, birthDate]
    });
    return result.rows[0];
  },
  getUserById: async (id) => {
    const result = await client.execute({
      sql: 'SELECT * FROM users WHERE id = ? LIMIT 1',
      args: [id]
    });
    return result.rows[0];
  },
  updateUser: async (id, userData) => {
    // Ensure lastValidatedDate is set
    userData.lastValidatedDate = new Date().toISOString();

    await client.execute({
      sql: `
        UPDATE users SET 
          name = ?, 
          birthDate = ?, 
          baptismDate = ?, 
          mobilePhone = ?, 
          homePhone = ?, 
          address = ?, 
          emergencyContact = ?,
          lastValidatedDate = ?
        WHERE id = ?
      `,
      args: [
        userData.name,
        userData.birthDate,
        userData.baptismDate || null,
        userData.mobilePhone || null,
        userData.homePhone || null,
        userData.address || null,
        userData.emergencyContact || null,
        userData.lastValidatedDate,
        id
      ]
    });

    return { success: true, message: 'User updated successfully' };
  },
  validateUser: async (id) => {
    const lastValidatedDate = new Date().toISOString();

    await client.execute({
      sql: 'UPDATE users SET lastValidatedDate = ? WHERE id = ?',
      args: [lastValidatedDate, id]
    });

    return { 
      success: true, 
      message: 'User data validated successfully',
      lastValidatedDate
    };
  }
};
