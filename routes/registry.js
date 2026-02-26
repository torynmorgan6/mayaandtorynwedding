/* ============================================
   REGISTRY ROUTES
   Gift registry with claim system
   ============================================ */

const express = require('express');
const router = express.Router();
const { db } = require('../database/init');

/* ============================================
   REGISTRY ITEMS
   WHAT TO CHANGE: Add/remove/edit items in this array
   Each item needs: id (unique string), name, description, price, link (optional), category
   ============================================ */
const registryItems = [
  /* CHANGE THIS: Replace with your actual registry items */
  {
    id: 'dutch-oven',
    name: 'Cast Iron Dutch Oven',
    description: 'A classic 5.5-quart enameled cast iron dutch oven for cozy winter cooking.',
    price: '$350',
    link: 'https://www.lecreuset.com',
    category: 'Kitchen'
  },
  {
    id: 'hiking-pack',
    name: 'Hiking Backpack (His & Hers)',
    description: 'Two matching 40L hiking backpacks for Alaska adventures.',
    price: '$280 each',
    link: null,
    category: 'Adventure'
  },
  {
    id: 'espresso-machine',
    name: 'Espresso Machine',
    description: 'Semi-automatic espresso machine for morning rituals.',
    price: '$450',
    link: null,
    category: 'Kitchen'
  },
  {
    id: 'kayak',
    name: 'Tandem Kayak',
    description: 'A two-person kayak for exploring Alaskan waterways together.',
    price: '$800',
    link: null,
    category: 'Adventure'
  },
  {
    id: 'bedding-set',
    name: 'Luxury Bedding Set',
    description: 'King-size organic cotton bedding set in deep navy.',
    price: '$320',
    link: null,
    category: 'Home'
  },
  {
    id: 'honeymoon-fund',
    type: 'fund',
    name: 'Honeymoon Fund',
    description: 'Contribute to our honeymoon adventure — every bit helps!',
    price: 'Any amount',
    link: '/gift-fund',
    category: 'Experience'
  },
  {
    id: 'wine-cooler',
    name: 'Wine Refrigerator',
    description: 'Dual-zone wine cooler for 46 bottles.',
    price: '$380',
    link: null,
    category: 'Home'
  },
  {
    id: 'stand-mixer',
    name: 'Stand Mixer',
    description: 'Professional 5-quart stand mixer for baking.',
    price: '$430',
    link: null,
    category: 'Kitchen'
  },
  {
    id: 'fire-pit',
    name: 'Outdoor Fire Pit',
    description: 'Elegant cast iron fire pit for Alaskan evenings under the stars.',
    price: '$260',
    link: null,
    category: 'Adventure'
  },
  {
    id: 'photo-album',
    name: 'Custom Wedding Photo Album',
    description: 'A hand-bound leather photo album to preserve our wedding memories.',
    price: '$150',
    link: null,
    category: 'Experience'
  }
];

/* ============================================
   REGISTRY PAGE
   ============================================ */
router.get('/', (req, res) => {
  // Get all claimed items
  const claims = db.prepare('SELECT registry_item_id, claimed_by_name FROM registry_claims').all();
  const claimsMap = {};
  claims.forEach(c => { claimsMap[c.registry_item_id] = c.claimed_by_name; });

  // Attach claim status to items
  const itemsWithClaims = registryItems.map(item => ({
    ...item,
    claimed: item.type === 'fund' ? false : !!claimsMap[item.id],
    claimedBy: item.type === 'fund' ? null : (claimsMap[item.id] || null)
  }));

  res.render('registry', {
    title: 'Registry — Toryn & Maya',
    page: 'registry',
    items: itemsWithClaims
  });
});

/* ============================================
   TRACK ITEM LINK CLICK
   Required for linked gifts before claim
   ============================================ */
router.post('/link-click/:itemId', (req, res) => {
  const { itemId } = req.params;

  const item = registryItems.find(i => i.id === itemId);
  if (!item) {
    return res.json({ success: false, message: 'Item not found.' });
  }

  if (!req.session.registryLinkClicks) {
    req.session.registryLinkClicks = {};
  }

  req.session.registryLinkClicks[itemId] = true;
  return res.json({ success: true });
});

/* ============================================
   CLAIM A REGISTRY ITEM
   ============================================ */
router.post('/claim/:itemId', (req, res) => {
  const { itemId } = req.params;
  const { claimerName } = req.body;

  if (!claimerName || !claimerName.trim()) {
    return res.json({ success: false, message: 'Please enter your name.' });
  }

  // Check item exists
  const item = registryItems.find(i => i.id === itemId);
  if (!item) {
    return res.json({ success: false, message: 'Item not found.' });
  }

  if (item.type === 'fund') {
    return res.json({ success: false, message: 'Please use the Contribute button for the Honeymoon Fund.' });
  }

  // For linked gifts, require that user clicked the item link first
  if (item.link) {
    const clickedMap = req.session.registryLinkClicks || {};
    if (!clickedMap[itemId]) {
      return res.json({
        success: false,
        message: 'Please open the gift link first, then come back and claim it.'
      });
    }
  }

  // Check if already claimed
  const existing = db.prepare('SELECT id FROM registry_claims WHERE registry_item_id = ?').get(itemId);
  if (existing) {
    return res.json({ success: false, message: 'This item has already been claimed.' });
  }

  // Save claim
  db.prepare('INSERT INTO registry_claims (registry_item_id, claimed_by_name) VALUES (?, ?)').run(itemId, claimerName.trim());

  if (req.session.registryLinkClicks && req.session.registryLinkClicks[itemId]) {
    delete req.session.registryLinkClicks[itemId];
  }

  res.json({ success: true, message: `Thank you! "${item.name}" has been claimed by ${claimerName.trim()}.` });
});

module.exports = router;
