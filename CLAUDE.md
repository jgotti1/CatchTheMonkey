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

`main` holds the original 2022 version and is intentionally preserved. The iPad/touch modernization lives on `ipad-modernization`; don't merge or change `main` unless asked.

## Architecture

Three files plus `assets/` (images, GIFs, and audio referenced by relative path from `game.css`, `index.html`, and `game.js`):

- `index.html` — static markup: HUD (score/timer/best/mute), a `#playArea` containing two overlay screens (`#menu` start screen, `#endScreen` game over), and three `<audio>` elements.
- `game.css` — the page is a flex column filling `100dvh`; `#playArea` takes the remaining space, so the game adapts to any screen size/rotation. Overlays are toggled with the `.hidden` class; the `body.gameover` and `.playArea.playing/.over` classes swap backgrounds and cursor.
- `game.js` — all game logic, module-level state (no classes). Flow: menu choices set `selectedMinutes`/`selectedLevel` → `startGame()` → a 1s `setInterval` (`tick`) drives the countdown while a `requestAnimationFrame` loop (`moveMonkey`) moves the monkey → `endGame()` clears both, saves best score, shows `#endScreen`. "Play again" just returns to the menu (no page reload).

## Things to keep in mind

- Gameplay mechanics in `game.js`: combo multiplier (hits within 2s, max x3), monkey speed scales with score (up to 2x), and a timed golden banana worth +5. The monkey's fast spin after a hit is a CSS animation on the inner `.monkey-body` (the outer `.monkey` is moved via `transform`, so the spin must not go on it).
- End of game: `endGame()` calls `playFinale()` before the score screen — a silly flop animation, or (new best score) a dancing monkey plus banana confetti appended to `document.body`. `cleanupFinale()` must run before the next game to remove those elements.
- Touch/iPad support is a design goal: input uses `pointerdown` (not `click`/`mouseleave`), and audio must be started from inside a user tap (`startGame`) or iOS Safari blocks it.
- Monkey movement is time-based (`dt` in seconds, speeds in px/sec via the `SPEEDS` table) so it behaves the same at 60Hz and 120Hz; position is applied via `transform: translate`, and bounds use `playArea.clientWidth/Height`.
- Best score persists in `localStorage` under `ftm-best`; access is wrapped in try/catch because it can throw in private browsing.
- Working-tree files on `main` were CRLF while the committed versions are LF; keep new files LF.
