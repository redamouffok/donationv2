const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'donations_db',
  user: process.env.DB_USER || 'donations_user',
  password: process.env.DB_PASSWORD || 'donations_password',
});

// Initialize database tables
const initDatabase = async () => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create projects table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create donations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS donations (
        id SERIAL PRIMARY KEY,
        donor_name VARCHAR(100) NOT NULL,
        project_id INTEGER REFERENCES projects(id),
        amount DECIMAL(10,2) NOT NULL,
        donation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default admin user if not exists
    const adminExists = await pool.query('SELECT id FROM users WHERE username = $1', ['admin']);
    if (adminExists.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', ['admin', hashedPassword]);
    }

    // Insert default projects if not exist
    const projectsExist = await pool.query('SELECT COUNT(*) FROM projects');
    if (parseInt(projectsExist.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO projects (name, description) VALUES 
        ('Aide aux familles démunies', 'Soutien financier pour les familles en difficulté'),
        ('Éducation des enfants', 'Financement de la scolarité et du matériel éducatif'),
        ('Soins médicaux', 'Aide pour les soins de santé des plus démunis'),
        ('Urgences', 'Fonds d''urgence pour les situations critiques')
      `);
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Login
app.post('/api/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard data
app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's total donations
    const totalResult = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM donations 
      WHERE DATE(donation_date) = $1
    `, [today]);

    // Get today's donations by project
    const byProjectResult = await pool.query(`
      SELECT p.name as project_name, COALESCE(SUM(d.amount), 0) as total
      FROM projects p
      LEFT JOIN donations d ON p.id = d.project_id AND DATE(d.donation_date) = $1
      GROUP BY p.id, p.name
      ORDER BY total DESC
    `, [today]);

    // Get today's donations list
    const donationsResult = await pool.query(`
      SELECT d.id, d.donor_name, d.amount, d.donation_date, p.name as project_name
      FROM donations d
      LEFT JOIN projects p ON d.project_id = p.id
      WHERE DATE(d.donation_date) = $1
      ORDER BY d.donation_date DESC
    `, [today]);

    res.json({
      date: today,
      totalAmount: parseFloat(totalResult.rows[0].total),
      byProject: byProjectResult.rows,
      donations: donationsResult.rows
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all projects
app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new donation
app.post('/api/donations', authenticateToken, [
  body('donor_name').notEmpty().withMessage('Donor name is required'),
  body('project_id').isInt().withMessage('Project ID must be a valid integer'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { donor_name, project_id, amount } = req.body;
    
    const result = await pool.query(`
      INSERT INTO donations (donor_name, project_id, amount)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [donor_name, project_id, amount]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add donation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get donations history
app.get('/api/donations/history', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        DATE(donation_date) as date,
        SUM(amount) as total_amount,
        COUNT(*) as donation_count
      FROM donations
      GROUP BY DATE(donation_date)
      ORDER BY DATE(donation_date) DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get donations for a specific date
app.get('/api/donations/date/:date', authenticateToken, async (req, res) => {
  try {
    const { date } = req.params;
    
    const result = await pool.query(`
      SELECT d.id, d.donor_name, d.amount, d.donation_date, p.name as project_name
      FROM donations d
      LEFT JOIN projects p ON d.project_id = p.id
      WHERE DATE(d.donation_date) = $1
      ORDER BY d.donation_date DESC
    `, [date]);

    res.json(result.rows);
  } catch (error) {
    console.error('Date donations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize database and start server
initDatabase().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
});
