# ActivateMe Fest: "What should my kid try?" quiz

A 6-question quiz for parents. Acti picks the kid's top activity, plus two runner-ups, from the 12 at ActivateMe Fest
(16–17 Jan 2027, Dubai Silicon Oasis). Parents can share an Instagram-ready result image, sign up for the activity
guide by email, and jump to the "Become Acti" AR filter.

- **Free hosting:** Cloudflare Pages (website) + Pages Functions (small server bits) + D1 (database).
- **Fast:** about 115 KB on first load and no outside services, so it opens in about a second on 4G and works in Instagram's and in-app browsers.
- **Easy to edit:** questions, scoring, wording and clubs are four plain text files in `public/data/`.

---

## What's where

| File | What it is |
|---|---|
| `public/data/quiz.js` | **Questions, answers, scoring**, result lines, the on-screen guide, and which Acti pose shows where |
| `public/data/strings.js` | **All other wording**: buttons, headings, email form, privacy note, event details, AR link |
| `public/data/clubs.js` | **Clubs per activity** (placeholders to fill in) |
| `public/index.html` + `public/js/app.js` | The quiz page |
| `public/js/card.js` | Draws the share images (1080×1920 story, 1080×1350 post) |
| `public/admin.html` + `public/js/admin.js` | Admin page: counts + CSV downloads |
| `functions/api/…` | The server bits that save results and sign-ups and serve the admin data |
| `lib/server.js` | Shared server code. Creates the database tables automatically. |
| `public/assets/` | Acti poses, logo, font (Baloo 2, self-hosted, SIL Open Font License) |
| `scripts/` | Checks and tests (see "Checking your edits") |

---

## How the scoring works

Every answer adds points to some activities. For example, picking 🚀 *Bouncing off the walls* gives Football +2,
Basketball +2, Boxing +2, Gymnastics +1, Cycling +1. After 6 answers, the points are added up:

- **Highest total = top match.** The next two are the runner-ups.
- **Ties:** if two activities have the same total, the one earlier in `tieBreakOrder` (bottom of `quiz.js`) wins.
  The same answers always give the same result.

### The current scoring

| Question | Answer | Points |
|---|---|---|
| How old is your little legend? | 🐣 4–6 | Swimming 1, Gymnastics 1, Creativity 1, Football 1 |
| | 🧒 7–9 | Skating 1, Cycling 1, Tennis 1, Basketball 1 |
| | 🧑 10–14 | VR & Esports 1, Boxing 1, Cricket 1, Chess 1 |
| How much energy are we talking? | 🚀 Bouncing off the walls | Football 2, Basketball 2, Boxing 2, Gymnastics 1, Cycling 1 |
| | ⚡ Busy, but can focus | Tennis 2, Swimming 2, Skating 2, Cricket 1, Cycling 1 |
| | 🧘 Calm and thoughtful | Chess 2, Creativity 2, VR & Esports 2, Cricket 1 |
| Team player or solo star? | 🤝 Loves being in a team | Football 3, Basketball 3, Cricket 3 |
| | 🦸 Happy doing their own thing | Tennis 2, Swimming 2, Gymnastics 2, Skating 2, Cycling 2, Boxing 2 |
| | 👯 Best with a buddy | Chess 2, VR & Esports 2, Creativity 2, Tennis 1 |
| What lights them up? | 🏆 Winning! | Boxing 2, Tennis 2, VR & Esports 2, Football 1, Basketball 1, Chess 1 |
| | 🎨 Making things | Creativity 3, Gymnastics 1, Skating 1 |
| | 🧩 Figuring things out | Chess 3, VR & Esports 2, Cricket 1 |
| | 🤸 Showing off cool tricks | Gymnastics 2, Skating 2, Cycling 1, Basketball 1 |
| Where are they happiest? | ☀️ Outdoors | Football 2, Cricket 2, Cycling 2, Tennis 1, Skating 1 |
| | 🏠 Indoors | Gymnastics 1, Boxing 1, Basketball 1, Chess 1, VR & Esports 1, Creativity 1 |
| | 💦 In the water | Swimming 3 |
| Pick their superpower! | ⚡ Speed | Cycling 3, Football 1, Skating 1, Swimming 1 |
| | 💪 Strength | Boxing 2, Cricket 1, Basketball 1 |
| | 🎯 Perfect aim | Cricket 2, Tennis 2, Basketball 1 |
| | 🌀 Balance | Gymnastics 2, Skating 2 |
| | 💡 Imagination | Creativity 3, VR & Esports 2 |
| | 🧠 Brain power | Chess 2, VR & Esports 1 |

Across every possible combination of answers, each of the 12 activities comes out on top between about 5% and 14%
of the time. Run `npm test` to see the full breakdown.

---

## How to edit things

You can edit these files right on GitHub: open the file, click the ✏️ pencil, make the change and click
**Commit changes**. If you commit to `main`, the live site updates within a minute or two.

> ⚠️ These files are code, so keep every quote `"`, comma `,` and bracket `{ }` in place. If the quiz goes blank
> after an edit, a missing comma or quote is the usual culprit. Run `npm test` (below) or ask a developer.

### Change a question or answer wording
`public/data/quiz.js`: change `title` (the question) or `label` / `emoji` (an answer).
Try to keep the `id`s the same, because they're what's saved in the exports.

### Change the scoring
`public/data/quiz.js`: change the numbers in `points`, e.g.
```js
{ id: "water", emoji: "💦", label: "In the water", points: { swimming: 3 } }
```
To make "In the water" also count a little for Gymnastics: `points: { swimming: 3, gymnastics: 1 }`.
Activity names must be one of: `football, basketball, cricket, tennis, swimming, gymnastics, boxing, skating,
cycling, esports, chess, creativity`.

### Change the result lines
`public/data/quiz.js` → `activities`. Each has:
- `reason`: the big line for a top match ("Born to run and loves a team. Football!")
- `short`: the small line under a runner-up
- `builds` and `tryAtHome`: the "Why it's a great fit" box
- `acti`: which Acti pose shows (`front, wave, run, jump, lol, hmm, threequarter, face`)

### Change any other wording, dates or links
`public/data/strings.js`. This covers buttons, the email form and privacy note, the event line on the share image,
@activatemefest, and the AR filter link.

### Add clubs
`public/data/clubs.js`. Each activity has placeholder entries like:
```js
{ name: "[Club name]", area: "[Area]", ages: "[Ages]", website: "", instagram: "" }
```
Replace them with real details, e.g.
```js
{ name: "Desert Kicks FC", area: "Al Barsha", ages: "4–14", website: "https://example.com", instagram: "desertkicksfc" }
```
- Entries whose name still starts with `[` are hidden from parents. Until an activity has a real club,
  its "Clubs to try" box simply doesn't appear.
- Add more clubs by copying a `{ … }` line. Put a comma between lines.

---

## Sign-ups and results

### What gets saved
- **Every finished quiz** (anonymous): top match, runner-ups, the answers and the link source. This powers the counts.
- **Email sign-ups**: parent email, kid's first name (optional), quiz result + runner-ups, answers,
  *Send me club info* (1/0), *ActivateMe news* (1/0), source, date.
  If the same parent signs up again for the same kid, their row is updated instead of duplicated.

The email is **never required** to see the result.

### Download sign-ups (CSV)
1. Go to **`https://<your-site>/admin`** (e.g. `https://activateme-quiz.pages.dev/admin`).
2. Type the admin password (the `ADMIN_PASSWORD` you set in Cloudflare, see setup below).
3. Click **⬇️ Sign-ups (CSV)**. It opens in Excel, Numbers or Google Sheets.

The admin page also shows how many quizzes were finished, how many people signed up and opted in, and how many
people got each activity as their top match.

### Sending the guide emails
The quiz **collects** sign-ups but doesn't **send** emails (that would need a paid email service). To send the guide:
import the CSV into your email tool (Mailchimp, Brevo, etc.) and email people by their `result`.
- Only send the activity guide to everyone who signed up.
- Only send club info to rows with `opt_in_clubs = 1`, and news to rows with `opt_in_news = 1`.
- Make sure every email has an unsubscribe link (the privacy note promises this).

### Track where people come from
Add `?src=` to the link you post, e.g. `https://<your-site>/?src=ig-story` or `?src=ig-bio`. The `source` column
in both exports then tells you which link people used. `?utm_source=` works too.

---

## Cloudflare setup (one-time, click by click)

You need a free Cloudflare account (the one that hosts becomeacti.pages.dev is fine).
Cloudflare sometimes moves buttons around. If something has a slightly different name, look for the closest match.

### 1. Create the database
1. Log in at **dash.cloudflare.com**.
2. In the left menu, click **Storage & Databases → D1 SQL Database**.
3. Click **Create Database**.
4. Name it **`activateme-quiz`** and click **Create**.
   (You don't need to create any tables. The quiz does that automatically the first time it runs.)

### 2. Create the Pages project from this GitHub repo
1. In the left menu, click **Workers & Pages**.
2. Click **Create application**, then choose **Pages** and **Connect to Git** (it may say *Import an existing Git repository*).
3. Pick the GitHub account **bigfattoes** and the repo **activateme-quiz**, then click **Begin setup**.
   (If the repo isn't listed, click the link to configure the Cloudflare GitHub app and give it access to `activateme-quiz`.)
4. Fill in the build settings:
   - **Project name:** `activateme-quiz` (this becomes `activateme-quiz.pages.dev`)
   - **Production branch:** `main`
   - **Framework preset:** `None`
   - **Build command:** leave **empty**
   - **Build output directory:** `public`
5. Click **Save and Deploy**.

### 3. Connect the database to the site
1. Go to **Workers & Pages** → click **activateme-quiz** → **Settings** tab → **Bindings**.
2. Click **Add** → **D1 database**.
3. **Variable name:** `DB` (exactly that, in capitals). **D1 database:** `activateme-quiz`. Click **Save**.
4. If there's an environment switch (**Production** / **Preview**) at the top, do the same for **Preview** too,
   so test links work before going live.

### 4. Set the admin password
1. Still in **Settings**, open **Variables and Secrets** → click **Add**.
2. **Type:** `Secret`. **Variable name:** `ADMIN_PASSWORD`. **Value:** a long password only your team knows
   (e.g. four random words). Click **Save**.
3. As above, add it to **Preview** too if there's an environment switch.

### 5. Redeploy so the settings take effect
Go to the **Deployments** tab → on the latest deployment click **⋯ → Retry deployment**.
(From now on, every push to `main` deploys automatically.)

### 6. Check it works
- Open `https://activateme-quiz.pages.dev`, take the quiz and sign up with your own email.
- Open `https://activateme-quiz.pages.dev/admin`, log in, and download the CSV. Your sign-up should be in it.
- If the admin page says *"Database not connected"* or *"ADMIN_PASSWORD is not set"*, redo step 3 or 4, then step 5.

**Optional: your own address**, e.g. `quiz.activatemefest.com`: project → **Custom domains** → **Set up a custom domain**.

---

## Instagram, WhatsApp and our app

- **Share button:** on phones that support it (most iPhones and Android browsers), *Share* opens the phone's share
  sheet with the image, so parents can post it straight to their Instagram story. Elsewhere there's a *Save image* button.
- **Instagram's in-app browser** can't download files, so the image is shown full-screen with
  *"Press and hold the image to save it"*.
- **Our iOS/Android app (WebView):** the quiz works fine inside it. For *Save image* to work in the **Android** app,
  the app developer needs to allow downloads and image long-press in the WebView (a `DownloadListener`), or open the quiz
  link in the phone's browser instead. iOS WebViews support press-and-hold to save.
- The phone's back button goes back one question.

---

## For developers

```bash
npm test          # checks the data files and prints the result distribution for all 1,944 answer combinations
npm run dev       # local server with a local D1 database at http://localhost:8788 (admin password: letmein)
NODE_PATH=$(npm root -g) node scripts/e2e.js   # headless phone-sized browser test + screenshots (needs Playwright)
NODE_PATH=$(npm root -g) node scripts/make-og.js  # regenerates public/assets/og.jpg (link preview image)
```

- No build step and no frameworks. Plain HTML/CSS/JS with no external CDNs; everything is in this repo.
- `lib/server.js` creates the tables on first use (`schema.sql` is the same, for reference).
- Admin API calls send the password as `Authorization: Bearer …`, never in the URL. Wrong passwords are slowed down.
- The CSV export guards against spreadsheet formula injection.
- `public/_headers` sets security headers and caching: images and font are cached for a week, while text, data and code always re-check, so edits show up right away.
- Fonts: Baloo 2 (SIL OFL, licence in `public/assets/fonts/OFL.txt`). Acti artwork and logo copied from
  `bigfattoes/acti-stickers` and `bigfattoes/Instaarfilter`.
