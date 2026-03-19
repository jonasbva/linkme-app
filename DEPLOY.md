# Deployment Guide — LinkMe App

Follow these steps in order. The whole process takes about 45 minutes the first time.

---

## Step 1 — Install Node.js (if not already installed)

Open Terminal on your Mac and run:
```
curl -fsSL https://fnm.vercel.app/install | bash
fnm install 20
```

---

## Step 2 — Set Up Supabase (your database)

1. Go to https://supabase.com and create a free account
2. Click **New Project** → give it a name (e.g. "linkme") → choose a region close to you → set a database password (save it)
3. Wait ~2 minutes for the project to be ready
4. In the left sidebar go to **SQL Editor**
5. Copy the entire contents of `supabase/schema.sql` and paste it into the SQL editor
6. Click **Run** — this creates all your tables and seeds Lily Brown's page
7. Go to **Settings → API** and copy:
   - **Project URL** (looks like: `https://abcdef.supabase.co`)
   - **anon public** key

---

## Step 3 — Set Up GitHub

1. Go to https://github.com and create a free account
2. Click **+** (top right) → **New repository** → name it "linkme-app" → **Create**
3. Open Terminal, navigate to the `linkme-app` folder and run:
```bash
cd path/to/linkme-app
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/linkme-app.git
git push -u origin main
```

---

## Step 4 — Deploy to Vercel

1. Go to https://vercel.com and sign up (use "Continue with GitHub")
2. Click **Add New → Project**
3. Select your `linkme-app` repository → Click **Import**
4. Before clicking Deploy, scroll down to **Environment Variables** and add:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `ADMIN_PASSWORD` | A password you choose for the admin panel |
| `NEXT_PUBLIC_APP_DOMAIN` | Your main domain (e.g. `yourdomain.com`) |

5. Click **Deploy** — wait ~3 minutes
6. You'll get a URL like `https://linkme-app-abc123.vercel.app` — your app is live!

---

## Step 5 — Connect Your Main Domain to Vercel (optional)

If you have a main domain (e.g. `linkme.agency`):
1. In Vercel: go to your project → **Settings → Domains**
2. Add your domain → Vercel shows you DNS records to add
3. Go to where you bought your domain (GoDaddy, Namecheap, etc.)
4. Find **DNS Settings** and add the records Vercel tells you

---

## Step 6 — Add a Creator's Custom Domain

For each creator's personal domain (e.g. `lilybrown.com`):

**In Vercel:**
1. Project → **Settings → Domains** → Add `lilybrown.com`
2. Vercel shows you an A record and CNAME to add

**At your domain registrar (GoDaddy/Namecheap/etc.):**
1. Go to DNS settings for `lilybrown.com`
2. Add the records Vercel gave you
3. Wait up to 48 hours (usually <30 minutes) for DNS to propagate

**In the Admin Dashboard:**
1. Go to your app's `/admin` → click on Lily Brown → Edit
2. Set **Custom Domain** to `lilybrown.com` → Save

Now `lilybrown.com` will show Lily Brown's page automatically.

---

## Step 7 — Access the Admin Dashboard

1. Go to `https://yourdomain.com/admin` (or your Vercel URL `/admin`)
2. Enter the `ADMIN_PASSWORD` you set in Step 4
3. You're in! You can now:
   - Add/edit creators
   - Add links for each creator
   - View analytics (clicks, countries, devices)

---

## Adding New Creators

1. In admin → click **+ Add Creator**
2. Fill in: name, slug, bio, avatar URL, etc.
3. Click **Create Creator**
4. Go to the **Links** tab → add their platform links
5. Set their **Custom Domain** if they have one
6. Repeat Step 6 above for their domain

---

## Running Locally (for development)

```bash
cd linkme-app
cp .env.example .env.local
# Fill in your Supabase keys in .env.local
npm install
npm run dev
# Open http://localhost:3000/lilybrown
```

---

## Updating the App

After making code changes:
```bash
git add .
git commit -m "Update: your message here"
git push
```
Vercel automatically redeploys within ~2 minutes.
