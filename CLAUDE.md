# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Feed the Monkey" — a small browser game (originally an NJIT Boot Camp milestone project, April 2022). Plain HTML/CSS/vanilla JS: no build step, no dependencies, no package.json, no tests, no linter.

## Running

Open `index.html` directly, or serve the folder for device testing (e.g. iPad on the same network):

```
python3 -m http.server 8000
```

## Branches

`main` is the modernized iPad/touch version. The untouched original 2022 version is preserved on the `original-version` branch — don't change it.

## Deployment

Hosted on Vercel (project `catch-the-monkey`, team `john`, scope `john-74e3`), auto-deployed from GitHub `jgotti1/CatchTheMonkey` on every push to `main` — no build step. Live at https://monkeygame.margotticode.com (also catch-the-monkey.vercel.app). The custom domain's DNS lives at Bluehost as a CNAME: host `monkeygame` → `8bff114682e0cfb8.vercel-dns-017.com`; the site's files are not hosted on Bluehost.

The Vercel MCP connector only sees the project when called without a team ID or with slug `jgotti711-4698`; using the team ID or `john-74e3` returns 403/empty results.

## Portfolio card

`README.md` ends with a hidden `<!-- portfolio-card:start ... portfolio-card:end -->` JSON block (invisible on GitHub's rendered page; visible via Raw/Edit) that the author's portfolio site reads to build a project card (title, description, live URL, repo URL, thumbnail, tech). The thumbnail is `docs/preview.jpg`, a screenshot of the live site's start screen.

- When the game's features, tech, or URLs change, update that JSON along with the README text and keep it valid JSON (no `--` inside it).
- The user's personal skills manage this: `/portfolio-card <live-url>` (run here) regenerates the card and `docs/preview.jpg`; `/build-card <github-link>` (run in the portfolio-site repo) reads it. Both live in `~/.claude/skills/`, not in this repo.
- GitHub caches raw files by branch name for a few minutes after a push; fetch by commit SHA to see a fresh card immediately.

## Architecture

Three files plus `favicon.svg` (browser tab icon, linked from `index.html` with a `?v=N` cache-buster) and `assets/` (images, GIFs, and audio referenced by relative path from `game.css`, `index.html`, and `game.js`). `docs/preview.jpg` is only the portfolio thumbnail, not used by the game:

- `index.html` — static markup: HUD (score/timer/best/combo/mute), a `#playArea` containing two overlay screens (`#menu` start screen, `#endScreen` game over), and three `<audio>` elements.
- `game.css` — the page is a flex column filling `100dvh`; `#playArea` takes the remaining space, so the game adapts to any screen size/rotation. Overlays are toggled with the `.hidden` class; the `body.gameover` and `.playArea.playing/.over` classes swap backgrounds and cursor.
- `game.js` — all game logic, module-level state (no classes). Flow: menu choices set `selectedMinutes`/`selectedLevel` → `startGame()` → a 1s `setInterval` (`tick`) drives the countdown while a `requestAnimationFrame` loop (`moveMonkey`) moves every monkey, expires the combo and spawns/expires golden bananas (`updateGolden`) → `endGame()` clears both, saves best score, shows `#endScreen`. "Play again" just returns to the menu (no page reload).

## Things to keep in mind

- Gameplay mechanics in `game.js`: combo multiplier (hits within 2s, max x3), monkey speed scales with score (up to 2x), difficulty sets the monkey count (Easy 1, Medium 2, Expert 3 via `MONKEY_COUNT`, all held in the `monkeys` array), and timed golden bananas spawn in random batches of 1-3 every 1.5-4s (max 3 on screen). Scoring is in the `MONKEY_POINTS` (3, times the combo multiplier), `GOLDEN_POINTS` (1) and `MISS_PENALTY` (1, when a golden banana expires uncaught; score never goes below 0) constants. The monkey's fast spin after a hit is a CSS animation on the inner `.monkey-body` (the outer `.monkey` is moved via `transform`, so the spin must not go on it).
- End of game: `endGame()` calls `playFinale()` before the score screen — a silly flop animation, or (new best score) a dancing monkey plus banana confetti appended to `document.body`. `cleanupFinale()` must run before the next game to remove those elements.
- Touch/iPad support is a design goal: input uses `pointerdown` (not `click`/`mouseleave`), and audio must be started from inside a user tap (`startGame`) or iOS Safari blocks it.
- Monkey movement is time-based (`dt` in seconds, speeds in px/sec via the `SPEEDS` table) so it behaves the same at 60Hz and 120Hz; position is applied via `transform: translate`, and bounds use `playArea.clientWidth/Height`.
- Best score persists in `localStorage` under `ftm-best`; access is wrapped in try/catch because it can throw in private browsing.
- Keep files LF (the original working-tree files were CRLF).
