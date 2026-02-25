/* ============================================
   ADMIN ROUTES
   Password-protected admin dashboard
   WHAT TO CHANGE: ADMIN_PASSWORD in .env file
   ============================================ */

const express = require('express');
const router = express.Router();
const { db } = require('../database/init');

/* ============================================
   AUTH MIDDLEWARE
   Checks if admin is logged in
   ============================================ */
function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  res.redirect('/admin/login');
}

/* ============================================
   ADMIN LOGIN PAGE
   ============================================ */
router.get('/login', (req, res) => {
  res.render('admin-login', {
    title: 'Admin Login — Toryn & Maya',
    page: 'admin',
    error: null
  });
});

router.post('/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'changeme';

  if (password === adminPassword) {
    req.session.isAdmin = true;
    res.redirect('/admin');
  } else {
    res.render('admin-login', {
      title: 'Admin Login — Toryn & Maya',
      page: 'admin',
      error: 'Incorrect password. Please try again.'
    });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

/* ============================================
   ADMIN DASHBOARD
   Shows RSVP stats and all submissions
   ============================================ */
router.get('/', requireAuth, (req, res) => {
  // Get all RSVPs
  const rsvps = db.prepare('SELECT * FROM rsvps ORDER BY created_at DESC').all();

  // Calculate stats
  const totalRsvps = rsvps.length;
  const attending = rsvps.filter(r => r.attending === 'yes');
  const declined = rsvps.filter(r => r.attending === 'no');
  const totalGuests = attending.reduce((sum, r) => sum + (r.num_guests || 1), 0);

  // Get registry claims
  const claims = db.prepare('SELECT * FROM registry_claims ORDER BY created_at DESC').all();

  res.render('admin', {
    title: 'Admin Dashboard — Toryn & Maya',
    page: 'admin',
    rsvps,
    totalRsvps,
    totalAttending: attending.length,
    totalDeclined: declined.length,
    totalGuests,
    claims
  });
});

/* ============================================
   DELETE RSVP
   ============================================ */
router.post('/delete-rsvp/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM rsvps WHERE id = ?').run(id);
  res.redirect('/admin');
});

/* ============================================
   EXPORT RSVPs AS CSV
   ============================================ */
router.get('/export-csv', requireAuth, (req, res) => {
  const rsvps = db.prepare('SELECT * FROM rsvps ORDER BY created_at DESC').all();

  const headers = ['ID', 'Name', 'Email', 'Guests', 'Attending', 'Dietary', 'Song Request', 'Message', 'Date'];
  const rows = rsvps.map(r => [
    r.id,
    `"${(r.name || '').replace(/"/g, '""')}"`,
    `"${(r.email || '').replace(/"/g, '""')}"`,
    r.num_guests,
    r.attending,
    `"${(r.dietary_restrictions || '').replace(/"/g, '""')}"`,
    `"${(r.song_request || '').replace(/"/g, '""')}"`,
    `"${(r.message || '').replace(/"/g, '""')}"`,
    r.created_at
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="rsvps.csv"');
  res.send(csv);
});

module.exports = router;
