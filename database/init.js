/* ============================================
   DATABASE INITIALIZATION
   Sets up SQLite database with tables for RSVPs and registry claims
   Run automatically when server starts
   ============================================ */

const { DatabaseSync: Database } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

// Persistent SQLite path for Render (uses mounted disk in production)
const DB_PATH = process.env.DB_PATH || '/var/data/wedding.sqlite';

// Ensure the database directory exists
const dbDir = path.dirname(DB_PATH);
fs.mkdirSync(dbDir, { recursive: true });

// Database file location — change path if needed
const db = new Database(DB_PATH);

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
      potluck_opt_in TEXT DEFAULT 'no',
      potluck_category TEXT,
      potluck_dish TEXT,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const rsvpColumns = db.prepare('PRAGMA table_info(rsvps)').all();
  // NEW: Migration support for structured potluck RSVP fields
  const hasPotluckOptIn = rsvpColumns.some(col => col.name === 'potluck_opt_in');
  if (!hasPotluckOptIn) {
    db.exec("ALTER TABLE rsvps ADD COLUMN potluck_opt_in TEXT DEFAULT 'no'");
  }

  const hasPotluckCategory = rsvpColumns.some(col => col.name === 'potluck_category');
  if (!hasPotluckCategory) {
    db.exec('ALTER TABLE rsvps ADD COLUMN potluck_category TEXT');
  }

  const hasPotluckDish = rsvpColumns.some(col => col.name === 'potluck_dish');
  if (!hasPotluckDish) {
    db.exec('ALTER TABLE rsvps ADD COLUMN potluck_dish TEXT');
  }

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
