# ✦ Toryn Morgan & Maya Maitland — Wedding Website

> **July 29, 2026 · Cooper Landing, Alaska**

A full-stack wedding website with a dark romantic aesthetic, built with Node.js, Express, EJS, and SQLite.

---

## Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Home page — hero, countdown, quick links |
| `/rsvp` | RSVP form (QR landing page) |
| `/schedule` | Timeline for the wedding day |
| `/registry` | Registry cards, claim flow, honeymoon fund CTA |
| `/gift-fund` | Honeymoon fund payment options page |
| `/gallery` | Gallery with category filters + lightbox |
| `/rules` | Wedding guidelines |
| `/directions` | Travel + venue details |
| `/admin/login` | Admin login |
| `/admin` | Admin dashboard |

---

## Prerequisites

- [Node.js](https://nodejs.org/) **v22+** (project uses `node:sqlite`)
- npm

---

## Local Development Setup

```bash
# 1. Clone
git clone https://github.com/torynmorgan6/mayaandtorynwedding.git
cd mayaandtorynwedding

# 2. Install dependencies
npm install

# 3. Create .env (manually)
# Add values shown in Environment Variables below

# 4. Start
npm start
# or
npm run dev
```

Site runs at `http://localhost:3000` by default.

---

## Environment Variables

Create a `.env` file in the project root:

```env
ADMIN_PASSWORD=your_secure_password_here
ADMIN_EMAIL=you@example.com

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password

SESSION_SECRET=some_long_random_string_here
PORT=3000
```

Notes:
- SMTP is optional. RSVP saves still work without it.
- If `ADMIN_PASSWORD` is missing, default is `changeme`.

---

## Production Launch (Real Website)

This project is documented for **Render only**.

### 10-minute Render launch steps

1. Push latest code to GitHub.
2. In Render, click **New +** → **Web Service**.
3. Connect the GitHub repo and select this project.
4. Use these settings:
  - **Runtime:** Node
  - **Build Command:** `npm install`
  - **Start Command:** `node server.js`
5. Add environment variables in Render (**Environment** tab):
  - `ADMIN_PASSWORD`
  - `ADMIN_EMAIL`
  - `SMTP_HOST`
  - `SMTP_PORT`
  - `SMTP_USER`
  - `SMTP_PASS`
  - `SESSION_SECRET`
  - `PORT` (optional on Render; Render can provide one)
6. Click **Create Web Service**.
7. Wait for build/deploy to complete.
8. Open the Render URL and test:
  - `/`
  - `/rsvp`
  - `/registry`
  - `/gift-fund`
  - `/admin/login`

### Connect your real domain on Render

1. Open your Render service → **Settings** → **Custom Domains**.
2. Add your domain (`yourdomain.com` and optionally `www.yourdomain.com`).
3. Copy Render's DNS instructions.
4. In your DNS provider (GoDaddy/Cloudflare), add the required records exactly.
5. Wait for DNS propagation.
6. Verify HTTPS certificate is issued and active in Render.
7. Re-test your live site routes.

---

## Launch Checklist

- [ ] Set `ADMIN_PASSWORD` and `SESSION_SECRET` to strong values
- [ ] Confirm RSVP submits and appears in `/admin`
- [ ] Confirm registry claim flow works and duplicate claims are blocked
- [ ] Confirm Honeymoon Fund links to `/gift-fund`
- [ ] Replace payment links/usernames in `views/gift-fund.ejs` (`<!-- CHANGE THIS: ... -->`)
- [ ] Confirm SMTP works (or accept save-only mode without email)
- [ ] Verify custom domain + HTTPS

---

## Current Feature Notes

- **RSVP behavior**
  - Not attending hides non-needed fields.
  - Potluck contribution supports opt-in checkbox, category, and planned dish.
  - Potluck fields are only stored for attending guests.

- **Registry behavior**
  - Physical gifts use claim flow with duplicate-claim prevention in DB.
  - Linked gifts require opening the item link before claim confirmation.
  - Honeymoon fund is treated as a dedicated fund item and links to `/gift-fund`.

- **Admin behavior**
  - View RSVP + registry claims.
  - Delete RSVP and delete registry claim.
  - Export RSVP CSV including potluck fields.

---

## Content Customization

### Core wedding details
- `views/layout.ejs` — footer names/date/location + nav branding
- `views/index.ejs` — homepage names/date/location/countdown date
- `views/schedule.ejs` — timeline content

### Registry items
Edit `registryItems` in `routes/registry.js`.

Example regular gift:
```js
{
  id: 'stand-mixer',
  name: 'Stand Mixer',
  description: 'Professional 5-quart stand mixer for baking.',
  price: '$430',
  link: null,
  category: 'Kitchen'
}
```

Example fund item:
```js
{
  id: 'honeymoon-fund',
  type: 'fund',
  name: 'Honeymoon Fund',
  description: 'Contribute to our honeymoon adventure — every bit helps!',
  price: 'Any amount',
  link: '/gift-fund',
  category: 'Experience'
}
```

### Honeymoon fund payment links
Update links in `views/gift-fund.ejs` where marked with:
- `<!-- CHANGE THIS: ... -->`

### Gallery photos
- Add files to `public/images/gallery/`
- Update cards in `views/gallery.ejs` (`data-category` must match filter button values)

### Rules / directions
- `views/rules.ejs`
- `views/directions.ejs`

---

## Admin Panel

Access via `/admin/login`.

Includes:
- RSVP stats and full RSVP table
- Potluck contribution columns (`opt-in`, `category`, `dish`)
- Delete RSVP action
- Registry claims table + delete claim action
- CSV export of RSVPs

---

## Database

SQLite file: `database/wedding.db` (auto-created on first run)

Tables:
- `rsvps`
  - `id, name, email, num_guests, attending, dietary_restrictions, song_request, potluck_opt_in, potluck_category, potluck_dish, message, created_at`
- `registry_claims`
  - `id, registry_item_id, claimed_by_name, created_at`

Backup: copy `database/wedding.db`.

---

## Troubleshooting

### Port already in use
PowerShell:
```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

Then start again:
```bash
npm start
```

### Email notifications not sending
- Verify SMTP values in `.env`
- Use Gmail app password if using Gmail SMTP
- RSVP saves still succeed even if email fails

### Admin login issues
- Check `ADMIN_PASSWORD` in `.env`
- Default fallback is `changeme`

### Reset database (deletes all RSVP/claim data)
PowerShell:
```powershell
Remove-Item .\database\wedding.db
npm start
```

---

## Project Structure

```text
server.js
package.json
README.md
database/
  init.js
public/
  css/styles.css
  js/main.js
views/
  404.ejs
  admin-login.ejs
  admin.ejs
  directions.ejs
  gallery.ejs
  gift-fund.ejs
  index.ejs
  layout.ejs
  registry.ejs
  rsvp.ejs
  rules.ejs
  schedule.ejs
routes/
  admin.js
  index.js
  registry.js
  rsvp.js
```

