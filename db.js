const mysql = require('mysql2/promise');
require('dotenv').config();

// Check if MySQL configuration is available
if (!process.env.MYSQL_HOST || !process.env.MYSQL_USER || !process.env.MYSQL_PASSWORD || !process.env.MYSQL_DATABASE) {
  console.error('MySQL configuration not found. Please set MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, and MYSQL_DATABASE in .env file.');
  console.error('The application requires MySQL database to function properly.');
  process.exit(1);
}

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database schema if needed
const initializeDatabase = async () => {
  try {
    // Check if users table exists
    const [tables] = await pool.query(`
      SELECT TABLE_NAME FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
    `, [process.env.MYSQL_DATABASE]);

    if (tables.length === 0) {
      // Create users table
      await pool.query(`
        CREATE TABLE users (
          id VARCHAR(36) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          birthDate VARCHAR(10) NOT NULL,
          baptismDate VARCHAR(10),
          mobilePhone VARCHAR(20),
          homePhone VARCHAR(20),
          address TEXT,
          emergencyContact TEXT,
          lastValidatedDate VARCHAR(30),
          lastUpdateDate VARCHAR(30)
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
  pool,
  type: 'mysql',
  getUsers: async () => {
    const [rows] = await pool.query('SELECT * FROM users');
    return rows;
  },
  getUserByNameAndBirthDate: async (name, birthDate) => {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE LOWER(name) = LOWER(?) AND birthDate = ? LIMIT 1',
      [name, birthDate]
    );
    return rows[0];
  },
  getUserById: async (id) => {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0];
  },
  updateUser: async (id, userData) => {
    // Ensure lastValidatedDate is set
    userData.lastValidatedDate = new Date().toISOString();

    // Get current user data to compare
    const [currentUserRows] = await pool.query(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    const currentUser = currentUserRows[0];

    // Check if any data has actually changed
    const hasChanged = 
      currentUser.name !== userData.name ||
      currentUser.birthDate !== userData.birthDate ||
      currentUser.baptismDate !== (userData.baptismDate || null) ||
      currentUser.mobilePhone !== (userData.mobilePhone || null) ||
      currentUser.homePhone !== (userData.homePhone || null) ||
      currentUser.address !== (userData.address || null) ||
      currentUser.emergencyContact !== (userData.emergencyContact || null);

    // Only set lastUpdateDate if data has changed
    userData.lastUpdateDate = hasChanged ? new Date().toISOString() : currentUser.lastUpdateDate;

    await pool.query(
      `UPDATE users SET 
        name = ?, 
        birthDate = ?, 
        baptismDate = ?, 
        mobilePhone = ?, 
        homePhone = ?, 
        address = ?, 
        emergencyContact = ?,
        lastValidatedDate = ?,
        lastUpdateDate = ?
      WHERE id = ?`,
      [
        userData.name,
        userData.birthDate,
        userData.baptismDate || null,
        userData.mobilePhone || null,
        userData.homePhone || null,
        userData.address || null,
        userData.emergencyContact || null,
        userData.lastValidatedDate,
        userData.lastUpdateDate,
        id
      ]
    );

    return { 
      success: true, 
      message: 'User updated successfully',
      dataChanged: hasChanged
    };
  },
  validateUser: async (id) => {
    const lastValidatedDate = new Date().toISOString();

    await pool.query(
      'UPDATE users SET lastValidatedDate = ? WHERE id = ?',
      [lastValidatedDate, id]
    );

    return { 
      success: true, 
      message: 'User data validated successfully',
      lastValidatedDate
    };
  }
};
