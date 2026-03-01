/* ============================================
   PAGE ROUTES
   Handles rendering of all main website pages
   ============================================ */

const express = require('express');
const router = express.Router();

/* ============================================
   HOME PAGE
   WHAT TO CHANGE: Update couple names, date, location if needed
   ============================================ */
router.get('/', (req, res) => {
  res.render('index', {
    title: 'Toryn & Maya — July 29, 2026',
    page: 'home'
  });
});

/* ============================================
   SCHEDULE PAGE
   ============================================ */
router.get('/schedule', (req, res) => {
  res.render('schedule', {
    title: 'The Schedule — Toryn & Maya',
    page: 'schedule'
  });
});

/* ============================================
   LEGACY GALLERY URL
   ============================================ */
router.get('/gallery', (req, res) => {
  res.redirect('/');
});

/* ============================================
   RULES PAGE
   ============================================ */
router.get('/rules', (req, res) => {
  res.render('rules', {
    title: 'Wedding Guidelines — Toryn & Maya',
    page: 'rules'
  });
});

/* ============================================
   DIRECTIONS PAGE
   ============================================ */
router.get('/directions', (req, res) => {
  res.render('directions', {
    title: 'Directions & Travel — Toryn & Maya',
    page: 'directions'
  });
});

/* ============================================
   HONEYMOON / GIFT FUND PAGE
   ============================================ */
router.get('/gift-fund', (req, res) => {
  // CHANGE THIS: if you rename the file/path, update here
  res.render('gift-fund', {
    title: 'Honeymoon Fund — Toryn & Maya',
    page: 'registry'
  });
});

module.exports = router;
