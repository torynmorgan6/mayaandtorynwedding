/* ============================================
   DATABASE INITIALIZATION
   Sets up SQLite database with tables for RSVPs and registry claims
   Run automatically when server starts
   ============================================ */

const { DatabaseSync: Database } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

// Ensure the database directory exists
const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Database file location — change path if needed
const dbPath = path.join(__dirname, 'wedding.db');
const db = new Database(dbPath);

/* ============================================
   INITIALIZE DATABASE TABLES
   Creates tables if they don't already exist
   ============================================ */
function initializeDatabase() {
  // Enable WAL mode for better performance
  db.exec('PRAGMA journal_mode = WAL');

  // ============================================
  // RSVP TABLE
  // Stores all RSVP form submissions
  // ============================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS rsvps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      num_guests INTEGER DEFAULT 1,
      attending TEXT NOT NULL,
      dietary_restrictions TEXT,
      song_request TEXT,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // ============================================
  // REGISTRY CLAIMS TABLE
  // Stores which guests have claimed which registry items
  // ============================================
  db.exec(`
    CREATE TABLE IF NOT EXISTS registry_claims (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      registry_item_id TEXT NOT NULL UNIQUE,
      claimed_by_name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✓ Database initialized successfully');
  return db;
}

module.exports = { initializeDatabase, db: initializeDatabase() };
