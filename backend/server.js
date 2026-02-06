import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { eq } from 'drizzle-orm';
import { db } from './db.js';
import { admin as adminTable, products } from './schema.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import bcryptjs from 'bcryptjs';

const app = express();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads folder if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Server error',
  });
});

const PORT = process.env.PORT || 5000;

// DB + Server
async function startServer() {
  try {
    console.log('Connecting to Turso database...');
    
    // Create tables if they don't exist
    await db.run(`
      CREATE TABLE IF NOT EXISTS admin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        category TEXT,
        subcategory TEXT,
        condition TEXT,
        imageUrls TEXT,
        isFeatured INTEGER DEFAULT 0,
        isBestSeller INTEGER DEFAULT 0,
        isHighlighted INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure legacy databases get new columns if table already existed
    try {
      const cols = await db.run(`PRAGMA table_info('products')`);
      const existing = (cols && cols.rows) ? cols.rows.map(r => r.name) : (Array.isArray(cols) ? cols.map(c => c.name) : []);
      if (!existing.includes('isBestSeller')) {
        await db.run(`ALTER TABLE products ADD COLUMN isBestSeller INTEGER DEFAULT 0`);
        console.log('✓ Added column isBestSeller');
      }
      if (!existing.includes('isHighlighted')) {
        await db.run(`ALTER TABLE products ADD COLUMN isHighlighted INTEGER DEFAULT 0`);
        console.log('✓ Added column isHighlighted');
      }
    } catch (mErr) {
      // Non-fatal migration error — log and continue
      console.warn('Migration check failed:', mErr.message || mErr);
    }

    console.log('✓ Database tables ready');

    // Create a default admin if none exists
    try {
      const existingAdmin = await db.select().from(adminTable).limit(1);
      if (existingAdmin.length === 0) {
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash('Bella888!', salt);
        
        await db.insert(adminTable).values({
          name: 'Default Admin',
          email: 'bella888@gmail.com',
          password: hashedPassword,
        });
        console.log('✓ Default admin created');
      }
    } catch (err) {
      console.error('Failed to create default admin:', err);
    }

    // Start server with EADDRINUSE resilience: try next ports up to attempts limit
    const maxRetries = 5;
    const startListening = (port, attemptsLeft) => {
      const srv = app.listen(port, () => {
        console.log(`✓ Server running on port ${port}`);
      });

      srv.on('error', (err) => {
        if (err && err.code === 'EADDRINUSE') {
          console.warn(`Port ${port} in use.`);
          srv.close(() => {});
          if (attemptsLeft > 0) {
            const nextPort = port + 1;
            console.log(`Trying port ${nextPort}... (${attemptsLeft - 1} attempts left)`);
            setTimeout(() => startListening(nextPort, attemptsLeft - 1), 300);
          } else {
            console.error('No available ports found. Exiting.');
            process.exit(1);
          }
        } else {
          console.error('Server error:', err);
          process.exit(1);
        }
      });
    };

    startListening(PORT, maxRetries);
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
}

startServer();
