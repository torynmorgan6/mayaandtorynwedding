/* ============================================
   MAIN SERVER — Maya & Toryn's Wedding Website
   Node.js + Express

   WHAT TO CHANGE:
   - Update couple names, date, location in views/layout.ejs
   - Update registry items in routes/registry.js
   - Update schedule events in views/schedule.ejs
   - Update rules in views/rules.ejs
   - Set environment variables in .env
   ============================================ */

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const ejsLayouts = require('express-ejs-layouts');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

/* ============================================
   VIEW ENGINE SETUP
   Using EJS for server-side templating with layouts
   ============================================ */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(ejsLayouts);
app.set('layout', 'layout');

/* ============================================
   MIDDLEWARE
   ============================================ */
// Parse form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware for admin authentication
app.use(session({
  secret: process.env.SESSION_SECRET || 'wedding-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

/* ============================================
   ROUTES
   ============================================ */
// Main page routes
app.use('/', require('./routes/index'));

// RSVP routes — /rsvp is the QR code landing page
app.use('/rsvp', require('./routes/rsvp'));

// Admin dashboard routes
app.use('/admin', require('./routes/admin'));

// Registry routes
app.use('/registry', require('./routes/registry'));

/* ============================================
   404 HANDLER
   ============================================ */
app.use((req, res) => {
  res.status(404).render('404', {
    title: '404 — Page Not Found',
    page: '404'
  });
});

/* ============================================
   START SERVER
   ============================================ */
app.listen(PORT, () => {
  console.log(`\n✦ Wedding website running at http://localhost:${PORT}`);
  console.log(`✦ RSVP page (QR code link): http://localhost:${PORT}/rsvp`);
  console.log(`✦ Admin panel: http://localhost:${PORT}/admin\n`);
});

module.exports = app;
