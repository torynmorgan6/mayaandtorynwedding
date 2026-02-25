# ✦ Toryn Morgan & Maya Maitland — Wedding Website

> **August 29, 2026 · Cooper Landing, Alaska**

A full-stack wedding website with a **vintage gothic / dark romantic** aesthetic. Built with Node.js, Express, EJS, and SQLite.

![Home page screenshot](https://github.com/user-attachments/assets/1386bcf1-19ca-4864-bafe-f56ea4f9b5ac)

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home page — couple names, countdown timer, quick links |
| `/rsvp` | **QR code landing page** — RSVP form |
| `/schedule` | Wedding day timeline |
| `/registry` | Gift registry with claim system |
| `/gallery` | Photo gallery with lightbox |
| `/rules` | Wedding guidelines / dress code |
| `/directions` | Map + travel information |
| `/admin` | Password-protected admin dashboard |

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

---

## Local Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/torynmorgan6/mayaandtorynwedding.git
cd mayaandtorynwedding

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Then edit .env with your values (see Environment Variables section below)

# 4. Start the development server
npm start
# or, for auto-restart on file changes:
npm run dev
```

The site will be running at **http://localhost:3000**

- Home page: http://localhost:3000/
- RSVP page: http://localhost:3000/rsvp
- Admin panel: http://localhost:3000/admin

---

## Environment Variables

Edit `.env` (copied from `.env.example`):

```env
# Admin panel password
ADMIN_PASSWORD=your_secure_password_here

# Your email — RSVP notifications are sent here
ADMIN_EMAIL=toryn@youremail.com

# SMTP email settings (for sending RSVP notification emails)
# Gmail: use an App Password — https://myaccount.google.com/apppasswords
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password

# Random secret string for session security
SESSION_SECRET=some_long_random_string_here

# Server port
PORT=3000
```

> **Note:** Email sending is optional. If SMTP is not configured, RSVP submissions still save to the database — you just won't get email notifications.

---

## How to Customize Content

### ✏️ Couple Names, Date & Location
- **`views/layout.ejs`** — Nav brand initials (`T ✦ M`) and footer
- **`views/index.ejs`** — Hero section names, date, location, countdown date (`data-wedding-date`)
- **`views/schedule.ejs`** — Page subtitle date/location

### 📅 Schedule Events
Open **`views/schedule.ejs`** and find the `<!-- CHANGE THIS -->` comments. Each event block looks like:
```html
<!-- CHANGE THIS: Update time, title, description, location -->
<div class="timeline-item">
  <div class="timeline-time">3:00 PM</div>
  <div class="timeline-card gothic-card">
    <h2>The Ceremony</h2>
    <p>Description here...</p>
    <p>📍 Location</p>
  </div>
</div>
```

### 🎁 Registry Items
Open **`routes/registry.js`** and edit the `registryItems` array near the top:
```javascript
const registryItems = [
  {
    id: 'unique-id',        // must be unique, no spaces
    name: 'Item Name',
    description: 'Description of the item.',
    price: '$350',
    link: 'https://...',   // optional purchase link
    image: null,            // or '/images/item.jpg'
    category: 'Kitchen'    // Kitchen, Home, Adventure, Experience, etc.
  },
  // ... more items
];
```

### 📸 Gallery Photos
Open **`views/gallery.ejs`** and find the `<!-- ADD PHOTOS HERE -->` comment. Add photos like:
```html
<div class="gallery-item" data-category="engagement">
  <div class="gallery-frame">
    <img src="/images/gallery/your-photo.jpg" alt="Description" loading="lazy">
  </div>
</div>
```
Place image files in **`public/images/gallery/`**.

### 📜 Wedding Guidelines / Rules
Open **`views/rules.ejs`** and find the `<!-- CHANGE THIS -->` comments on each rule item.

### 🗺️ Directions & Map
Open **`views/directions.ejs`** to update:
- Google Maps embed URL (search Cooper Landing, AK in Google Maps → Share → Embed)
- Airport info, driving directions, accommodation suggestions

### 🎨 Colors & Fonts
Open **`public/css/styles.css`** and find the `:root` CSS variables at the top:
```css
:root {
  --black: #0a0a0a;
  --burgundy: #6b1a2a;
  --gold: #c9a84c;
  --ivory: #f0e6d3;
  /* ... */
}
```
Change font families in the Google Fonts import in **`views/layout.ejs`**.

---

## QR Code Setup

The QR code should point directly to your **RSVP page**:

```
https://yourdomain.com/rsvp
```

**Generate a QR code:**
1. Go to https://www.qr-code-generator.com/ (or similar)
2. Enter your RSVP URL: `https://yourdomain.com/rsvp`
3. Download as PNG/SVG
4. Print on your invitations

When guests scan → they land directly on the RSVP form. If they try to leave without submitting, a polite modal prompts them to stay.

---

## Deployment

### Option A: Render (Recommended — Free Tier Available)

1. Push your code to GitHub (this repo)
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Node
5. Add environment variables (from your `.env`) in Render's dashboard
6. Deploy! Render gives you a URL like `https://your-app.onrender.com`

**Point your GoDaddy domain to Render:**
1. In Render: Settings → Custom Domains → Add your domain
2. In GoDaddy: DNS → Add a CNAME record:
   - Name: `www` (or `@` for root)
   - Value: your Render URL (e.g., `your-app.onrender.com`)
3. Wait 10–30 minutes for DNS propagation

### Option B: Railway

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo
3. Add environment variables in Railway dashboard
4. Railway auto-detects Node.js and deploys

### Option C: GoDaddy VPS / cPanel with Node.js

1. Log into GoDaddy → your VPS/Dedicated server
2. SSH into your server:
   ```bash
   ssh user@your-server-ip
   ```
3. Install Node.js if not present:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
4. Upload your project (via SFTP or git clone):
   ```bash
   git clone https://github.com/torynmorgan6/mayaandtorynwedding.git
   cd mayaandtorynwedding
   npm install
   cp .env.example .env
   nano .env  # fill in your values
   ```
5. Install PM2 to keep the app running:
   ```bash
   npm install -g pm2
   pm2 start server.js --name wedding
   pm2 startup  # auto-start on reboot
   pm2 save
   ```
6. Configure Nginx as a reverse proxy:
   ```nginx
   server {
     listen 80;
     server_name yourdomain.com www.yourdomain.com;
     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

---

## Admin Panel

Access at `/admin` (requires login with your `ADMIN_PASSWORD`).

Features:
- **Stats:** Total RSVPs, attending count, declined count, total guests
- **RSVPs table:** All submissions with full details
- **Delete** individual RSVPs
- **Export CSV** — download all RSVPs as a spreadsheet
- **Registry claims** — see who has claimed which gifts

---

## Database

SQLite database is stored at `database/wedding.db` (auto-created on first run, gitignored).

**Tables:**
- `rsvps` — id, name, email, num_guests, attending, dietary_restrictions, song_request, message, created_at
- `registry_claims` — id, registry_item_id, claimed_by_name, created_at

To back up the database, just copy `database/wedding.db`.

---

## Troubleshooting

**"Cannot find module 'better-sqlite3'"**
```bash
npm install
```

**Email notifications not sending**
- Check your SMTP credentials in `.env`
- For Gmail, use an [App Password](https://myaccount.google.com/apppasswords), not your regular password
- RSVP submissions still save to the database even if email fails

**Admin password not working**
- Check `ADMIN_PASSWORD` in your `.env` file
- Default (if not set) is `changeme`

**Port already in use**
```bash
# Change PORT in .env, or kill the process using port 3000:
lsof -ti:3000 | xargs kill
```

**Database errors**
```bash
# Delete the database to reset (WARNING: deletes all RSVPs!)
rm database/wedding.db
npm start  # recreates it fresh
```

---

## Project Structure

```
├── server.js              # Main Express server
├── package.json
├── .env.example           # Environment variable template
├── .gitignore
├── database/
│   └── init.js            # SQLite database setup
├── public/
│   ├── css/styles.css     # All styles (gothic theme)
│   └── js/main.js         # Client-side JavaScript
├── views/
│   ├── layout.ejs         # Base layout template
│   ├── index.ejs          # Home page
│   ├── rsvp.ejs           # RSVP form (QR code landing page)
│   ├── admin.ejs          # Admin dashboard
│   ├── admin-login.ejs    # Admin login
│   ├── schedule.ejs       # Wedding day schedule
│   ├── registry.ejs       # Gift registry
│   ├── gallery.ejs        # Photo gallery
│   ├── rules.ejs          # Wedding guidelines
│   ├── directions.ejs     # Directions & travel info
│   └── 404.ejs            # 404 error page
└── routes/
    ├── index.js           # Page routes
    ├── rsvp.js            # RSVP form routes
    ├── admin.js           # Admin dashboard routes
    └── registry.js        # Registry + claim routes
```

