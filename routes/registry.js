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
    id: 'glass-tupperware-set',
    name: 'Glass Tupperware Set',
    description: 'Glass tupperware for safe food storage.',
    price: '$33',
    link: 'https://www.amazon.com/Containers-Lids-MCIRCO-Lifetime-Microwave-Dishwasher/dp/B081JTZNRS/ref=sr_1_6?dib=eyJ2IjoiMSJ9.w8gi7tapStVoGlJnHGfBna-RkOpflP5fCV0kYL9POkSJK_Q8fiqycl5EscOGP_20RpQZ_wtldlrG10GGP_MgphOR-Vcn2ReXqcFc7WNbHEIjdBVNeFyBm8z7gz0DMl1PhIMntC9d7TcmFM0TY4zRQDwU8gUbCgcjEjSmY-Etg-NOL0r7JQwFfALBtwjXuMr7smo3UFTg-qsXUIQ14JayLUBEn4-Uwb1okDBY1QLdACub0FOAW7UKemESfOc-3KS37floL4lDHGJMj0qrDZmC6Se_GhUv9pGXytNlfMbPMqc.gs0x2187g-djDhPTWkqCbUq1zRPrSSKTALkXVZ4J6Mw&dib_tag=se&keywords=tupperware&qid=1772348632&sr=8-6',
    category: 'Kitchen'
  },
  {
    id: 'ninja-crispi-pro',
    name: 'Ninja Crispi Pro',
    description: 'Countertop glass air fryer.',
    price: '$300',
    link: 'https://www.bestbuy.com/product/ninja-crispi-pro-6-in-1-countertop-glass-air-fryer-cyberspace/JXJVXLX243/sku/6650389?utm_source=feed&extStoreId=539&ref=212&loc=SaleEvent&gclsrc=aw.ds&gad_source=1&gad_campaignid=23607897536&gclid=Cj0KCQiAwYrNBhDcARIsAGo3u33Ixo3-LZFhk2Nz0Cm7GMWmfqgeRT08IdcmtDBnM7yyl5f3vNKNDcQaAgNWEALw_wcB',
    category: 'Kitchen'
  },
  {
  id: 'ninja-detect-power-blender-pro',
  name: 'Ninja Blender Pro',
  description: 'All in one blender for smoothies, soups, and more.',
  price: '$150',
  link: 'https://www.bestbuy.com/product/ninja-detect-power-blender-pro-personal-single-serve-blendsense-technology-1800pw-72-oz-pitcher-to-go-cups-black/JXJVXG5QF6/sku/6551493?utm_source=feed&extStoreId=539&ref=212&loc=20153185852&gclsrc=aw.ds&gad_source=1&gad_campaignid=20149845761&gclid=Cj0KCQiAwYrNBhDcARIsAGo3u321LNdh4O1K60sawq5MyuWSqhOBF65NxSYSjc-6tyAADPU_7nc0fWQaAs50EALw_wcB',
  category: 'Kitchen'
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
    id: 'kitchen-towels',
    name: 'Kitchen Towels',
    description: 'Kitchen towels for everyday use.',
    price: '$20',
    link: 'http://www.amazon.com/dp/B009N83O1C?ref_=',
    category: 'Kitchen'
  },
  {
    id: 'date-ideas',
    name: 'Date Ideas',
    description: 'Fun date ideas for the couple to enjoy together.',
    price: '$17',
    link: 'https://www.amazon.com/dp/B08YWP5QRF?ref_=',
    category: 'Experience'
  },
  {
    id: 'vacuum-sealer',
    name: 'Vacuum Sealer',
    description: 'Vacuum sealer for safely preserving food.',
    price: '$52',
    link: 'https://www.amazon.com/dp/B01MXLTR09?ref_=hit_wr_dt_ai_md_pt&th=1',
    category: 'Experience'
  },
  {
    id: 'luggage-set',
    name: 'Luggage Set',
    description: 'Black 2 Piece Luggage Set',
    price: '$160',
    link: 'https://shop.americantourister.com/luggage/sets/rejoy-2-piece-set-%28co%2Fl%29/155767XXXX.html?dwvar_155767XXXX_color=1557670651&cgid=luggage-sets',
    category: 'Experience'
  },
  {
    id: 'canon-selphy',
    name: 'Canon Selphy',
    description: 'Canon Selphy Wireless Compact Photo Printer',
    price: '$180',
    link: 'https://www.bestbuy.com/product/canon-selphy-cp1500-wireless-compact-photo-printer-black/J7C86SR2H4/sku/6521753?utm_source=feed&extStoreId=1760&ref=212&loc=18578179888&gclsrc=aw.ds&gad_source=1&gad_campaignid=18574484544&gclid=Cj0KCQiAwYrNBhDcARIsAGo3u31XZwsZ7M-7seFH2ckP_8ouwbH3ABDnTsuFYdQFrjbVu82xeYeBAa8aAkLiEALw_wcB',
    category: 'Home'
  },
  {
    id: 'delta-pivotpro-shower',
    name: 'Replacement Shower Head',
    description: 'Delta Combination Shower Matte Black',
    price: '$92',
    link: 'https://www.lowes.com/pd/Delta-Delta-PivotPro-3-in-1-Combination-Shower-Matte-Black/5016279549?store=&shp-_-c-_-lmn-_-delta-_-kab-_-ggl-_-LMN_PMAX_Delta_KAB_Sales_ShowerHeads_Q4_2025_2081651-_-5016279549-_-online-_-0-_-0&gclsrc=aw.ds&gad_source=1&gad_campaignid=23456608936&gclid=Cj0KCQiAwYrNBhDcARIsAGo3u32Ay4utUeGHDot0ET2mJfuQMa0LMZCBoebAvG9dHMCRsAHe8W108NoaAjzsEALw_wcB',
    category: 'Home'
  },
];

/* ============================================
   REGISTRY PAGE
   ============================================ */
router.get('/', (req, res) => {
  // Get all claimed items
  const claims = db.prepare('SELECT registry_item_id FROM registry_claims').all();
  const claimedIds = new Set(claims.map(c => c.registry_item_id));

  // Attach claim status to items
  const itemsWithClaims = registryItems.map(item => ({
    ...item,
    claimed: item.type === 'fund' ? false : claimedIds.has(item.id)
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

  res.json({ success: true, message: `Thank you! "${item.name}" has been marked as purchased.` });
});

module.exports = router;
