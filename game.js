"use strict";
let playArea = document.querySelector(".playArea");
let messageArea = document.querySelectorAll(".messageArea span");
let score = 0;
//set game running time
let startingMin = 3;
let time = startingMin * 60;
let countdown = document.querySelector(".timer");
let body = document.querySelector("body");
let lowtime = document.querySelector(".timer");
let button = document.querySelector(".ctc");
let speed;
function restart() {
  game();
  button.style.display = "none";
}
//create monkey div//
function game() {
  let div = document.createElement("div");
  div.classList.add("monkey");
  playArea.appendChild(div);
  div.x = div.offsetLeft;
  div.y = div.offsetTop;
  // on click + score and "X"" monkey
  div.addEventListener("click", function () {
    speed = 0;
    div.style.height = 200 + "px";
    div.style.width = 200 + "px";
    div.style.backgroundImage = "url(assets/spinMonkeyx.gif)";
    score = score + 1;
    messageArea[0].innerText = score;
  });
  div.addEventListener("mouseleave", function () {
    div.style.backgroundImage = "url(assets/spinMonkey.gif)";
    div.style.height = 215 + "px";
    div.style.width = 215 + "px";
  });
  //count down clock//
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
    //stop game when time expires//
    function stopGame() {
      playArea.style.backgroundImage = "none";
      playArea.style.cursor = "none";
      body.style.backgroundImage = "url(assets/gameover.jpg)";
      div.style.backgroundImage = "none";
      body.style.backgroundPosition = "left";
      button.innerText = "Game Over Click her to play again ... 🐵🐵🐵";
      button.style.border = "3px dashed red";
      button.style.display = "block";
      button.addEventListener("click", function () {
        location.reload();
      });
    }
  }

  div.steps = Math.random() * 20;
  div.direction = Math.floor(Math.random() * 4);
  window.requestAnimationFrame(moveMonkey);
}

function newFunction() {
  setTimeout("", 5000);
}

function moveMonkey() {
  // control speed //
  let speed = Math.random() * 5 + 2;
  // control speed * x + x  (x = lowest speed plus x random )
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
