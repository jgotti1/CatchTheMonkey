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

let selectedMinutes = 1;
let selectedLevel = 1;
let score = 0;
let timeLeft = 0;
let bestScore = 0;
let muted = false;
let running = false;
let monkey = null;
let timerId = null;
let rafId = null;
let lastFrame = 0;
let fedTimeout = null;
let combo = 0;
let sinceLastHit = 0;
let goldenEl = null;
let goldenTimer = 0; // seconds until the next golden banana appears / disappears

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
  goldenTimer = 6 + Math.random() * 6;
  updateCombo();
  timeLeft = selectedMinutes * 60;
  scoreEl.textContent = score;
  updateTimerDisplay();

  menu.classList.add("hidden");
  endScreen.classList.add("hidden");
  playArea.classList.add("playing");

  createMonkey();

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
  clearTimeout(fedTimeout);
  stopSounds();
  playSound(gameOverSound);

  removeGolden();
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
  if (monkey) {
    if (monkey.bubble) monkey.bubble.remove();
    monkey.remove();
    monkey = null;
  }
}

/* ---------- monkey ---------- */

function createMonkey() {
  // Scale the monkey to the screen so it isn't huge on a small display
  const size = Math.round(
    Math.min(220, Math.max(110, Math.min(playArea.clientWidth, playArea.clientHeight) * 0.28))
  );
  playArea.style.setProperty("--monkey-size", size + "px");

  monkey = document.createElement("div");
  monkey.className = "monkey";
  monkey.body = document.createElement("div");
  monkey.body.className = "monkey-body";
  monkey.appendChild(monkey.body);
  monkey.size = size;
  monkey.x = (playArea.clientWidth - size) / 2;
  monkey.y = (playArea.clientHeight - size) / 2;
  monkey.dx = 0;
  monkey.dy = 0;
  monkey.stepsLeft = 0;
  playArea.appendChild(monkey);

  // pointerdown works for mouse, finger and Apple Pencil, and fires instantly
  // (no 300ms tap delay like "click" can have on older iPads)
  monkey.addEventListener("pointerdown", feedMonkey);
}

function feedMonkey(e) {
  e.preventDefault();
  if (!running) return;
  // Combo: hits within 2 seconds of each other build a multiplier (max x3)
  combo = sinceLastHit < 2 ? combo + 1 : 1;
  sinceLastHit = 0;
  const multiplier = Math.min(3, 1 + Math.floor(combo / 5));
  score += multiplier;
  scoreEl.textContent = score;
  updateCombo();

  // restart the spin animation even if he was already spinning
  monkey.classList.remove("fed");
  void monkey.offsetWidth;
  monkey.classList.add("fed");
  clearTimeout(fedTimeout);
  fedTimeout = setTimeout(() => monkey && monkey.classList.remove("fed"), 700);

  const rect = playArea.getBoundingClientRect();
  showPop(e.clientX - rect.left, e.clientY - rect.top, `+${multiplier} 🍌`);

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

function showPop(x, y, text) {
  const pop = document.createElement("div");
  pop.className = "pop";
  pop.textContent = text;
  pop.style.left = x - 30 + "px";
  pop.style.top = y - 30 + "px";
  playArea.appendChild(pop);
  setTimeout(() => pop.remove(), 700);
}

function pickDirection() {
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

  monkey.stepsLeft -= dt;
  if (monkey.stepsLeft <= 0) pickDirection();

  monkey.x += monkey.dx * dt;
  monkey.y += monkey.dy * dt;

  // stay inside the play area; pick a new direction when we hit a wall
  const maxX = playArea.clientWidth - monkey.size;
  const maxY = playArea.clientHeight - monkey.size;
  if (monkey.x < 0 || monkey.x > maxX || monkey.y < 0 || monkey.y > maxY) {
    monkey.x = Math.min(Math.max(monkey.x, 0), maxX);
    monkey.y = Math.min(Math.max(monkey.y, 0), maxY);
    pickDirection();
  }

  monkey.style.transform = `translate(${monkey.x}px, ${monkey.y}px)`;
  rafId = requestAnimationFrame(moveMonkey);
}

/* ---------- golden banana ---------- */

function updateGolden(dt) {
  goldenTimer -= dt;
  if (goldenTimer > 0) return;
  if (goldenEl) {
    removeGolden(); // ran out of time
    goldenTimer = 8 + Math.random() * 8;
  } else {
    spawnGolden();
    goldenTimer = 2.5; // how long it stays on screen
  }
}

function spawnGolden() {
  goldenEl = document.createElement("div");
  goldenEl.className = "golden";
  goldenEl.textContent = "🍌";
  goldenEl.style.left = Math.random() * (playArea.clientWidth - 84) + "px";
  goldenEl.style.top = Math.random() * (playArea.clientHeight - 84) + "px";
  goldenEl.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    if (!running) return;
    score += 5;
    scoreEl.textContent = score;
    const rect = playArea.getBoundingClientRect();
    showPop(e.clientX - rect.left, e.clientY - rect.top, "+5 ⭐");
    playSound(monkeyYum);
    removeGolden();
    goldenTimer = 8 + Math.random() * 8;
  });
  playArea.appendChild(goldenEl);
}

function removeGolden() {
  if (goldenEl) goldenEl.remove();
  goldenEl = null;
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
