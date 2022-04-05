"use strict";
let playArea = document.querySelector(".playArea");
let messageArea = document.querySelectorAll(".messageArea span");
let score = 0;
let startingMin = 0.1;
let time = startingMin * 60;
let countdown = document.querySelector(".timer");
let winlose = document.querySelector("winlose");
let body = document.querySelector("body");
let lowtime = document.querySelector(".timer");

document.addEventListener("DOMContentLoaded", function () {
  let div = document.createElement("div");
  div.classList.add("monkey");
  playArea.appendChild(div);
  div.x = div.offsetLeft;
  div.y = div.offsetTop;
  div.addEventListener("click", function () {
    div.style.backgroundImage = "url(assets/monkey_X.png)";
    score = score + 1;
    messageArea[0].innerText = score;
  });
  div.addEventListener("mouseleave", function () {
    div.style.backgroundImage = "url(assets/monkey.png)";
    div.style.height = 100 + "px";
    div.style.width = 100 + "px";
  });
  setInterval(updateCountDown, 1000);
  function updateCountDown() {
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    countdown.innerHTML = `${minutes}:${seconds}`;
    time--;

    if (time < 0) {
      time = 0;
      stopGame();
    }
  }

  function stopGame(winlose) {
    if ((winlose = "loser")) {
      playArea.style.backgroundImage = "none";
      playArea.style.cursor = "none";
      body.style.backgroundImage = "url(assets/gameover.jpg)";
      div.style.backgroundImage = "none";
      body.style.backgroundPosition = "left";
    }
  }
  div.steps = Math.random() * 20;
  div.direction = Math.floor(Math.random() * 4);
  window.requestAnimationFrame(moveMonkey);
});

function moveMonkey() {
  let speed = Math.random() * 10 + 3;
  let monkey = document.querySelector(".monkey");
  let cords = playArea.getBoundingClientRect();
  monkey.steps--;
  if (monkey.steps < 0) {
    monkey.direction = Math.floor(Math.random() * 4);
    monkey.steps = Math.random() * 20;
  }
  if (monkey.direction == 0 && monkey.x < cords.right - 150) {
    monkey.x += speed;
  }

  if (monkey.direction == 1 && monkey.x > cords.left) {
    monkey.x -= speed;
  }
  if (monkey.direction == 2 && monkey.y < cords.bottom - 150) {
    monkey.y += speed;
  }

  if (monkey.direction == 3 && monkey.y > cords.top) {
    monkey.y -= speed;
  }

  monkey.style.top = monkey.y + "px";
  monkey.style.left = monkey.x + "px";
  window.requestAnimationFrame(moveMonkey);
}
