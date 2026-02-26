/* ============================================
   RSVP ROUTES
   Handles RSVP form display and submission
   ============================================ */

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { db } = require('../database/init');

/* ============================================
   RSVP FORM PAGE
   This is the QR code landing page
   ============================================ */
router.get('/', (req, res) => {
  res.render('rsvp', {
    title: 'RSVP — Toryn & Maya',
    page: 'rsvp',
    success: false,
    error: null
  });
});

/* ============================================
   RSVP FORM SUBMISSION
   Saves to database and sends email notification
   ============================================ */
router.post('/', async (req, res) => {
  const { name, email, num_guests, attending, dietary_restrictions, song_request, potluck_opt_in, potluck_category, potluck_dish, message } = req.body;

  // Basic validation
  if (!name || !attending) {
    return res.render('rsvp', {
      title: 'RSVP — Toryn & Maya',
      page: 'rsvp',
      success: false,
      error: 'Please fill in your name and let us know if you are attending.'
    });
  }

  try {
    // NEW: Structured potluck values are only saved for attending guests
    const normalizedNumGuests = attending === 'yes' ? (parseInt(num_guests, 10) || 1) : 0;
    const normalizedDietaryRestrictions = attending === 'yes' && dietary_restrictions
      ? dietary_restrictions.trim()
      : '';
    const normalizedSongRequest = attending === 'yes' && song_request
      ? song_request.trim()
      : '';
    const normalizedPotluckOptIn = attending === 'yes' && potluck_opt_in === 'yes' ? 'yes' : 'no';
    const normalizedPotluckCategory = attending === 'yes' && normalizedPotluckOptIn === 'yes' && potluck_category
      ? potluck_category.trim()
      : '';
    const normalizedPotluckDish = attending === 'yes' && normalizedPotluckOptIn === 'yes' && potluck_dish
      ? potluck_dish.trim()
      : '';
    const normalizedMessage = message ? message.trim() : '';

    // Insert RSVP into database
    const stmt = db.prepare(`
      -- NEW: Includes potluck_opt_in and potluck_category for coordination
      INSERT INTO rsvps (name, email, num_guests, attending, dietary_restrictions, song_request, potluck_opt_in, potluck_category, potluck_dish, message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      name.trim(),
      email ? email.trim() : '',
      normalizedNumGuests,
      attending,
      normalizedDietaryRestrictions,
      normalizedSongRequest,
      normalizedPotluckOptIn,
      normalizedPotluckCategory,
      normalizedPotluckDish,
      normalizedMessage
    );

    // Send email notification (non-blocking — don't fail if email fails)
    sendEmailNotification({
      name: name.trim(),
      email: email ? email.trim() : '',
      num_guests: normalizedNumGuests,
      attending,
      dietary_restrictions: normalizedDietaryRestrictions,
      song_request: normalizedSongRequest,
      potluck_opt_in: normalizedPotluckOptIn,
      potluck_category: normalizedPotluckCategory,
      potluck_dish: normalizedPotluckDish,
      message: normalizedMessage
    })
      .catch(err => console.error('Email notification failed:', err));

    res.render('rsvp', {
      title: 'RSVP — Toryn & Maya',
      page: 'rsvp',
      success: true,
      error: null,
      submittedName: name,
      submittedAttending: attending
    });
  } catch (err) {
    console.error('RSVP submission error:', err);
    res.render('rsvp', {
      title: 'RSVP — Toryn & Maya',
      page: 'rsvp',
      success: false,
      error: 'Something went wrong. Please try again.'
    });
  }
});

/* ============================================
   EMAIL NOTIFICATION FUNCTION
   WHAT TO CHANGE: Update email template text if desired
   ============================================ */
async function sendEmailNotification(rsvp) {
  // Skip if SMTP not configured
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log('SMTP not configured — skipping email notification');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT == 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const attendingText = rsvp.attending === 'yes' ? '✓ ATTENDING' : '✗ NOT ATTENDING';

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.ADMIN_EMAIL,
    subject: `New RSVP: ${rsvp.name} — ${attendingText}`,
    html: `
      <h2>New RSVP Received</h2>
      <p><strong>Name:</strong> ${rsvp.name}</p>
      <p><strong>Email:</strong> ${rsvp.email || 'Not provided'}</p>
      <p><strong>Attending:</strong> ${attendingText}</p>
      <p><strong>Number of Guests:</strong> ${rsvp.num_guests || 1}</p>
      <p><strong>Dietary Restrictions:</strong> ${rsvp.dietary_restrictions || 'None'}</p>
      <p><strong>Song Request:</strong> ${rsvp.song_request || 'None'}</p>
      <p><strong>Potluck Contribution:</strong> ${rsvp.potluck_opt_in === 'yes' ? 'Yes' : 'No'}</p>
      <p><strong>Potluck Category:</strong> ${rsvp.potluck_category || 'None'}</p>
      <p><strong>Potluck Dish:</strong> ${rsvp.potluck_dish || 'None'}</p>
      <p><strong>Message:</strong> ${rsvp.message || 'None'}</p>
    `
  });
}

module.exports = router;
