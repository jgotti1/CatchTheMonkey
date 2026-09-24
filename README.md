# 🐵 Feed the Monkey 🍌

A fast-paced tap-and-score browser game. Feed the monkey as many times as you can before the clock runs out!

Originally my first project from the NJIT Boot Camp (April 2022). It has since been updated to work on iPads and phones with touch controls. The untouched original version is on the [`original-version`](../../tree/original-version) branch.

**Play it:** https://monkeygame.margotticode.com (also at https://catch-the-monkey.vercel.app)

## How to play

1. Pick how long you want to play (**1, 2 or 3 minutes**) and a **difficulty**.
2. Tap **Start feeding me**.
3. Tap the monkey as he runs around to feed him and score points.
4. Tap the glowing golden bananas before they disappear.
5. When time runs out, see your score. Beat your best score for a banana-confetti celebration!

Works with a mouse, a finger, or an Apple Pencil. Use the 🔊 button in the score bar to mute the sound.

## Scoring

| Action | Points |
| --- | --- |
| Tap a monkey | **+3** |
| Catch a golden banana 🍌 | **+1** |
| Let a golden banana disappear | **-1** (score never drops below 0) |

### Combos 🔥
Feed the monkey again within 2 seconds of the last hit to build a combo. Every hit in the combo is worth more:

| Hits in a row | Multiplier | Points per monkey tap |
| --- | --- | --- |
| 0–4 | x1 | 3 |
| 5–9 | x2 | 6 |
| 10+ | x3 (max) | 9 |

If more than 2 seconds pass without a hit, the combo resets.

## Difficulty

| Level | Monkeys | Speed |
| --- | --- | --- |
| Easy | 1 | Slow |
| Medium | 2 | Faster |
| Expert | 3 | Fastest |

The monkeys also get faster as your score climbs, up to double speed.

## Golden bananas

Golden bananas appear in random groups of 1–3 every few seconds (never more than 3 on screen at once) and stay for 3 seconds. Catch them for a point, but if you let one vanish, you lose a point. Watch the whole screen!

## Best score

Your best score is saved in your browser, so it stays after you close the game. It's stored per device and browser.

## Running it locally

There's nothing to install. Open `index.html` in a browser.

To test on an iPad or phone on the same Wi-Fi network, serve the folder from your computer:

```
python3 -m http.server 8000
```

Then open `http://<your-computer's-IP>:8000` on the device.

## Hosting and domain

- Hosted on [Vercel](https://vercel.com) (project `catch-the-monkey`). Every push to `main` deploys automatically.
- Live at **https://monkeygame.margotticode.com**, a custom subdomain of `margotticode.com`. The domain is registered at Bluehost, which only holds the DNS record; the game files are not on Bluehost.
- DNS record in Bluehost (Domains → Manage → DNS): `CNAME`, host `monkeygame`, pointing to `8bff114682e0cfb8.vercel-dns-017.com`.
- Also available at https://catch-the-monkey.vercel.app.

## Built with

Plain HTML, CSS and JavaScript. No frameworks, libraries or build step. Hosted on Vercel, and every push to `main` deploys automatically.

## Portfolio card

The block below is machine-readable project info for a portfolio site (invisible on GitHub). Keep it in sync when the game, URL or tech changes. To build a card: read this JSON and use `title`, `tagline`/`description`, `thumbnail`, `tech`, and link to `liveUrl` and `repoUrl`.

<!-- portfolio-card:start
{
  "title": "Feed the Monkey",
  "category": "game",
  "tagline": "A fast-paced tap-and-score browser game that works on desktop and iPad.",
  "description": "Feed the monkey as many times as you can before the clock runs out. Tap the monkeys for points, grab the glowing golden bananas, and build combos, but miss a golden banana and you lose a point. Pick 1, 2 or 3 minutes and Easy, Medium or Expert (1, 2 or 3 monkeys). Beat your best score for a banana-confetti celebration.",
  "liveUrl": "https://monkeygame.margotticode.com",
  "repoUrl": "https://github.com/jgotti1/CatchTheMonkey",
  "thumbnail": "https://raw.githubusercontent.com/jgotti1/CatchTheMonkey/main/docs/preview.jpg",
  "tech": [
    "HTML5",
    "CSS3",
    "JavaScript (vanilla)",
    "Pointer Events (touch + mouse)",
    "requestAnimationFrame",
    "CSS animations",
    "Web Audio (HTML audio)",
    "localStorage",
    "Vercel"
  ],
  "features": [
    "Touch-friendly and responsive (iPad, phone, desktop)",
    "3 difficulty levels with 1-3 monkeys",
    "Combo multiplier and golden-banana bonus/penalty scoring",
    "Time-based movement that runs the same at 60Hz and 120Hz",
    "Saved best score, end-of-game animations and confetti"
  ],
  "platforms": [
    "desktop",
    "tablet",
    "mobile"
  ],
  "status": "live",
  "origin": "First project from the NJIT Boot Camp (April 2022), modernized in 2026 for touch devices."
}
portfolio-card:end -->
