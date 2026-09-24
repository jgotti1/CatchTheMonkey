"use strict";

const playArea = document.getElementById("playArea");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const bestEl = document.getElementById("best");
const menu = document.getElementById("menu");
const endScreen = document.getElementById("endScreen");
const finalScoreEl = document.getElementById("finalScore");
const newBestEl = document.getElementById("newBest");
const comboWrap = document.getElementById("comboWrap");
const comboEl = document.getElementById("combo");
const muteBtn = document.getElementById("muteBtn");

const bkmusic = document.getElementById("bkmusic");
const monkeyYum = document.getElementById("monkeyYum");
const gameOverSound = document.getElementById("gameOver");

// Difficulty 1/2/3 -> monkey speed range in pixels per second
const SPEEDS = { 1: 180, 2: 360, 3: 540 };
// Points
const MONKEY_POINTS = 3; // per monkey hit (before the combo multiplier)
const GOLDEN_POINTS = 1; // per golden banana caught
const MISS_PENALTY = 1; // lost when a golden banana disappears uncaught

// Difficulty 1/2/3 -> how many monkeys are running around
const MONKEY_COUNT = { 1: 1, 2: 2, 3: 3 };

let selectedMinutes = 1;
let selectedLevel = 1;
let score = 0;
let timeLeft = 0;
let bestScore = 0;
let muted = false;
let running = false;
let monkeys = [];
let timerId = null;
let rafId = null;
let lastFrame = 0;
let combo = 0;
let sinceLastHit = 0;
let goldens = []; // golden bananas currently on screen
let goldenTimer = 0; // seconds until the next golden banana appears

// localStorage can throw (private browsing), so never let it break the game
try {
  bestScore = Number(localStorage.getItem("ftm-best")) || 0;
} catch (e) {}
bestEl.textContent = bestScore;

/* ---------- menu ---------- */

function setupChoices(containerId, onPick) {
  const container = document.getElementById(containerId);
  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".choice");
    if (!btn) return;
    container.querySelectorAll(".choice").forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    onPick(Number(btn.dataset.value));
  });
}
setupChoices("timeChoices", (v) => (selectedMinutes = v));
setupChoices("levelChoices", (v) => (selectedLevel = v));

document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("againBtn").addEventListener("click", () => {
  cleanupFinale();
  endScreen.classList.add("hidden");
  menu.classList.remove("hidden");
  document.body.classList.remove("gameover");
  playArea.classList.remove("over");
});

muteBtn.addEventListener("click", () => {
  muted = !muted;
  muteBtn.textContent = muted ? "🔇" : "🔊";
  bkmusic.muted = muted;
  monkeyYum.muted = muted;
  gameOverSound.muted = muted;
});

/* ---------- sound ---------- */

function playSound(audio) {
  audio.currentTime = 0;
  // play() returns a promise that can reject if the browser blocks audio
  const p = audio.play();
  if (p && p.catch) p.catch(() => {});
}

function stopSounds() {
  bkmusic.pause();
  bkmusic.currentTime = 0;
  monkeyYum.pause();
}

/* ---------- game flow ---------- */

function startGame() {
  cleanupFinale();
  score = 0;
  combo = 0;
  sinceLastHit = 0;
  goldenTimer = 1 + Math.random() * 2;
  updateCombo();
  timeLeft = selectedMinutes * 60;
  scoreEl.textContent = score;
  updateTimerDisplay();

  menu.classList.add("hidden");
  endScreen.classList.add("hidden");
  playArea.classList.add("playing");

  createMonkeys();

  // Starting audio inside the tap handler is what lets iPad/Safari play it
  bkmusic.volume = 1;
  playSound(bkmusic);

  running = true;
  timerId = setInterval(tick, 1000);
  lastFrame = performance.now();
  rafId = requestAnimationFrame(moveMonkey);
}

function tick() {
  timeLeft--;
  updateTimerDisplay();
  if (timeLeft <= 0) endGame();
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = String(timeLeft % 60).padStart(2, "0");
  timerEl.textContent = `${minutes}:${seconds}`;
  timerEl.classList.toggle("low", timeLeft <= 10);
}

function endGame() {
  running = false;
  clearInterval(timerId);
  cancelAnimationFrame(rafId);
  stopSounds();
  playSound(gameOverSound);

  removeGoldens();
  comboWrap.classList.add("hidden");

  const isNewBest = score > bestScore;
  if (isNewBest) {
    bestScore = score;
    bestEl.textContent = bestScore;
    try {
      localStorage.setItem("ftm-best", bestScore);
    } catch (e) {}
  }

  finalScoreEl.textContent = score;
  newBestEl.classList.toggle("hidden", !isNewBest);
  playArea.classList.remove("playing");

  // Play a short monkey animation first, then show the score
  playFinale(isNewBest);
}

/* ---------- end-of-game animations ---------- */

let confettiEls = [];
let finaleTimeout = null;

function playFinale(isNewBest) {
  // only one monkey stars in the finale; the others leave
  const monkey = monkeys[0];
  monkeys.slice(1).forEach((m) => m.remove());
  monkeys = [monkey];
  clearTimeout(monkey.fedTimeout);
  monkey.classList.remove("fed");
  monkey.classList.add("finale");
  // glide to the middle (or the bottom, out of the way of the text, for a party)
  monkey.x = (playArea.clientWidth - monkey.size) / 2;
  monkey.y = isNewBest
    ? playArea.clientHeight - monkey.size - 8
    : (playArea.clientHeight - monkey.size) / 2;
  monkey.style.transform = `translate(${monkey.x}px, ${monkey.y}px)`;

  if (isNewBest) {
    monkey.classList.add("party");
    endScreen.classList.add("party");
    launchConfetti();
    finaleTimeout = setTimeout(showEndScreen, 1200);
  } else {
    monkey.classList.add("silly");
    const bubble = document.createElement("div");
    bubble.className = "finale-text";
    bubble.textContent = "⏰ Time's up! 💫";
    playArea.appendChild(bubble);
    monkey.bubble = bubble;
    finaleTimeout = setTimeout(showEndScreen, 2400);
  }
}

function showEndScreen() {
  const monkey = monkeys[0];
  if (monkey && monkey.bubble) monkey.bubble.remove();
  playArea.classList.add("over");
  document.body.classList.add("gameover");
  endScreen.classList.remove("hidden");
  // the silly monkey has done his bit; the party monkey keeps dancing
  if (monkey && !monkey.classList.contains("party")) {
    monkey.style.display = "none";
  }
}

function launchConfetti() {
  const pieces = ["🍌", "🍌", "🍌", "🎉", "⭐"];
  for (let i = 0; i < 90; i++) {
    const el = document.createElement("div");
    el.className = "confetti";
    el.textContent = pieces[Math.floor(Math.random() * pieces.length)];
    el.style.left = Math.random() * 100 + "vw";
    el.style.fontSize = 20 + Math.random() * 30 + "px";
    el.style.animationDuration = 2.5 + Math.random() * 3 + "s";
    el.style.animationDelay = -Math.random() * 5 + "s";
    el.style.setProperty("--drift", Math.random() * 160 - 80 + "px");
    el.style.setProperty("--spin", Math.random() * 720 - 360 + "deg");
    document.body.appendChild(el);
    confettiEls.push(el);
  }
}

// Clear everything the finale added (used by Play again / Start)
function cleanupFinale() {
  clearTimeout(finaleTimeout);
  confettiEls.forEach((el) => el.remove());
  confettiEls = [];
  endScreen.classList.remove("party");
  monkeys.forEach((m) => {
    if (m.bubble) m.bubble.remove();
    m.remove();
  });
  monkeys = [];
}

/* ---------- monkey ---------- */

function createMonkeys() {
  const count = MONKEY_COUNT[selectedLevel];
  // Scale the monkeys to the screen so they aren't huge on a small display
  // (a bit smaller when there are several)
  const base = Math.min(220, Math.max(110, Math.min(playArea.clientWidth, playArea.clientHeight) * 0.28));
  const size = Math.round(count > 1 ? base * 0.85 : base);
  playArea.style.setProperty("--monkey-size", size + "px");

  for (let i = 0; i < count; i++) {
    const monkey = document.createElement("div");
    monkey.className = "monkey";
    monkey.body = document.createElement("div");
    monkey.body.className = "monkey-body";
    monkey.appendChild(monkey.body);
    monkey.size = size;
    // spread them out across the play area so they don't start stacked
    monkey.x = ((playArea.clientWidth - size) * (i + 1)) / (count + 1);
    monkey.y = (playArea.clientHeight - size) / 2;
    monkey.dx = 0;
    monkey.dy = 0;
    monkey.stepsLeft = 0;
    playArea.appendChild(monkey);
    monkeys.push(monkey);

    // pointerdown works for mouse, finger and Apple Pencil, and fires instantly
    // (no 300ms tap delay like "click" can have on older iPads)
    monkey.addEventListener("pointerdown", feedMonkey);
  }
}

function feedMonkey(e) {
  e.preventDefault();
  if (!running) return;
  const monkey = e.currentTarget;
  // Combo: hits within 2 seconds of each other build a multiplier (max x3)
  combo = sinceLastHit < 2 ? combo + 1 : 1;
  sinceLastHit = 0;
  const multiplier = Math.min(3, 1 + Math.floor(combo / 5));
  const points = MONKEY_POINTS * multiplier;
  score += points;
  scoreEl.textContent = score;
  updateCombo();

  // restart the spin animation even if he was already spinning
  monkey.classList.remove("fed");
  void monkey.offsetWidth;
  monkey.classList.add("fed");
  clearTimeout(monkey.fedTimeout);
  monkey.fedTimeout = setTimeout(() => monkey.classList.remove("fed"), 700);

  const rect = playArea.getBoundingClientRect();
  showPop(e.clientX - rect.left, e.clientY - rect.top, `+${points} 🐵`);

  playSound(monkeyYum);
  // duck the music briefly so the yum sound is heard
  bkmusic.volume = 0.3;
  setTimeout(() => (bkmusic.volume = 1), 800);
}

function updateCombo() {
  const multiplier = Math.min(3, 1 + Math.floor(combo / 5));
  comboEl.textContent = multiplier;
  comboWrap.classList.toggle("hidden", multiplier < 2);
}

function showPop(x, y, text, bad) {
  const pop = document.createElement("div");
  pop.className = bad ? "pop minus" : "pop";
  pop.textContent = text;
  pop.style.left = x - 30 + "px";
  pop.style.top = y - 30 + "px";
  playArea.appendChild(pop);
  setTimeout(() => pop.remove(), 700);
}

function pickDirection(monkey) {
  // 0 right, 1 left, 2 down, 3 up (same four directions as the original)
  const dir = Math.floor(Math.random() * 4);
  // the monkey gets faster the more you score (up to 2x)
  const speedUp = 1 + Math.min(score / 60, 1);
  const speed = SPEEDS[selectedLevel] * (1 + Math.random()) * speedUp;
  monkey.dx = dir === 0 ? speed : dir === 1 ? -speed : 0;
  monkey.dy = dir === 2 ? speed : dir === 3 ? -speed : 0;
  monkey.stepsLeft = 0.2 + Math.random() * 0.8; // seconds to keep going
}

function moveMonkey(now) {
  if (!running) return;
  // dt = seconds since last frame, so the speed is the same on a 60Hz
  // screen and a 120Hz iPad Pro
  const dt = Math.min((now - lastFrame) / 1000, 0.05);
  lastFrame = now;

  sinceLastHit += dt;
  if (combo > 0 && sinceLastHit >= 2) {
    combo = 0;
    updateCombo();
  }
  updateGolden(dt);

  for (const monkey of monkeys) {
    monkey.stepsLeft -= dt;
    if (monkey.stepsLeft <= 0) pickDirection(monkey);

    monkey.x += monkey.dx * dt;
    monkey.y += monkey.dy * dt;

    // stay inside the play area; pick a new direction when we hit a wall
    const maxX = playArea.clientWidth - monkey.size;
    const maxY = playArea.clientHeight - monkey.size;
    if (monkey.x < 0 || monkey.x > maxX || monkey.y < 0 || monkey.y > maxY) {
      monkey.x = Math.min(Math.max(monkey.x, 0), maxX);
      monkey.y = Math.min(Math.max(monkey.y, 0), maxY);
      pickDirection(monkey);
    }

    monkey.style.transform = `translate(${monkey.x}px, ${monkey.y}px)`;
  }
  rafId = requestAnimationFrame(moveMonkey);
}

/* ---------- golden bananas ---------- */

const GOLDEN_STAY = 3; // seconds a golden banana stays on screen
const MAX_GOLDENS = 3;

function updateGolden(dt) {
  // each golden banana disappears when its time is up
  for (const g of goldens.slice()) {
    g.life -= dt;
    if (g.life <= 0) {
      // missed it: lose a point (never below zero)
      score = Math.max(0, score - MISS_PENALTY);
      scoreEl.textContent = score;
      showPop(parseFloat(g.el.style.left) + 42, parseFloat(g.el.style.top) + 42, `-${MISS_PENALTY} 💨`, true);
      removeGolden(g);
    }
  }
  // and a new batch shows up every 1.5-4 seconds
  goldenTimer -= dt;
  if (goldenTimer <= 0) {
    // a random 1-3 bananas at once, never more than MAX_GOLDENS on screen
    const room = MAX_GOLDENS - goldens.length;
    const howMany = Math.min(room, 1 + Math.floor(Math.random() * 3));
    for (let i = 0; i < howMany; i++) spawnGolden();
    goldenTimer = 1.5 + Math.random() * 2.5;
  }
}

function spawnGolden() {
  const el = document.createElement("div");
  el.className = "golden";
  el.textContent = "🍌";
  el.style.left = Math.random() * (playArea.clientWidth - 84) + "px";
  el.style.top = Math.random() * (playArea.clientHeight - 84) + "px";
  const g = { el, life: GOLDEN_STAY };
  el.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    if (!running) return;
    score += GOLDEN_POINTS;
    scoreEl.textContent = score;
    const rect = playArea.getBoundingClientRect();
    showPop(e.clientX - rect.left, e.clientY - rect.top, `+${GOLDEN_POINTS} 🍌`);
    playSound(monkeyYum);
    removeGolden(g);
  });
  playArea.appendChild(el);
  goldens.push(g);
}

function removeGolden(g) {
  g.el.remove();
  goldens = goldens.filter((x) => x !== g);
}

function removeGoldens() {
  goldens.slice().forEach(removeGolden);
}

/* Pause the game clock if the tab/app is hidden (e.g. iPad app switch) */
document.addEventListener("visibilitychange", () => {
  if (!running) return;
  if (document.hidden) {
    clearInterval(timerId);
    bkmusic.pause();
  } else {
    timerId = setInterval(tick, 1000);
    lastFrame = performance.now();
    playSound(bkmusic);
  }
});
