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
    title: 'Toryn & Maya — August 29, 2026',
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
   GALLERY PAGE
   ============================================ */
router.get('/gallery', (req, res) => {
  res.render('gallery', {
    title: 'Our Story — Toryn & Maya',
    page: 'gallery'
  });
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

module.exports = router;
