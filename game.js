"use strict";
let playArea = document.querySelector(".playArea");
let messageArea = document.querySelectorAll(".messageArea span");
let score = 0;
//set game running time
let startingMin = 0;
let countdown = document.querySelector(".timer");
let time = startingMin * 60;
let body = document.querySelector("body");
let lowtime = document.querySelector(".timer");
let button = document.querySelector(".ctc");
let button2 = document.querySelector(".ctc2");
let speed;
let level;
let bkmusic = document.getElementById("bkmusic");
let monkeyYum = document.getElementById("monkeyYum");

//set amount of minutes to play game//
window.addEventListener("DOMContentLoaded", () => {
  button2.style.display = "none";
});
function restart() {
  startingMin = prompt("How long do you want to play, enter 1 ,2 or 3 minutes");
  level = prompt("Difficulty Level: 1-Easy  2- Medium  3-Expert");
  if (startingMin == 1 || startingMin == 2 || startingMin == 3) {
    time = startingMin * 60;
    game();
    button.style.display = "none";
  } else {
    alert("that is not a valid choice");
    stopGame();
  }
  if (level == 1 || level == 2 || level == 3) {
    level = level * 3;
  } else {
    alert("that is not a valid choice");
    stopGame();
  }
}
//background music//
function musicPlay() {
  bkmusic.play();
  bkmusic.volume = 1.0;
}
function musicStop() {
  bkmusic.pause();
  bkmusic.volume = 0.0;
  monkeyYum.pause();
  monkeyYum.volume = 0.0;
}
//monkey Yum click sound/
function monkeyYumPlay() {
  monkeyYum.play();
  monkeyYum.volume = 1.0;
  bkmusic.volume = 0.25;
}
function monkeyYumOff() {
  monkeyYum.play();
  monkeyYum.volume = 0;
  bkmusic.volume = 1.0;
}
//create monkey div//
function game() {
  musicPlay();
  //setup div for moving monkey//
  let div = document.createElement("div");
  div.classList.add("monkey");
  playArea.appendChild(div);
  div.x = div.offsetLeft;
  div.y = div.offsetTop;
  // on click + score and "X" monkey
  div.addEventListener("click", function () {
    div.style.height = 220 + "px";
    div.style.width = 220 + "px";
    div.style.backgroundImage = "url(assets/monkeyBananaSpin.gif)";
    score = score + 1;
    messageArea[0].innerText = score;
    monkeyYumPlay();
  });
  // div.addEventListener("mouseleave", function () {
  //   div.style.backgroundImage = "url(assets/spinMonkey.gif)";
  //   div.style.height = 200 + "px";
  //   div.style.width = 200 + "px";
  //   setTimeout(() => {
  //     monkeyYumOff();
  //   }, 2000);
  // });
  div.addEventListener("mouseleave", function () {
    setTimeout(() => {
      div.style.backgroundImage = "url(assets/spinMonkey.gif)";
      div.style.height = 200 + "px";
      div.style.width = 200 + "px";
      monkeyYumOff();
    }, 2000);
  });
  //count down clock//
  setInterval(updateCountDown, 1000);
  function updateCountDown() {
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    countdown.innerHTML = `${minutes}:${seconds}`;
    time--;

    if (time < 10) {
      lowtime.style.color = "red";
      if (time <= 0) {
        time = 0;
        document.getElementById("gameOver").play();
        stopGame();
      }
    }
  }

  div.steps = Math.random() * 20;
  div.direction = Math.floor(Math.random() * 4);
  window.requestAnimationFrame(moveMonkey);
}
//stop game options/
function stopGame() {
  musicStop();
  playArea.style.backgroundImage = "none";
  playArea.style.cursor = "none";
  body.style.backgroundImage = "url(assets/gameover.jpg)";
  let monkey = document.querySelector(".monkey");
  monkey.style.backgroundImage = "none";
  body.style.backgroundPosition = "left";
  button2.innerText = "Game Over Click her to play again ... 🐵🐵🐵";
  button2.style.border = "3px dashed red";
  button2.style.display = "block";
  button2.addEventListener("click", function () {
    location.reload();
  });
  setTimeout(() => {
    let gameOver = document.getElementById("gameOver");
    gameOver.pause();
    gameOver.volume = 0.0;
  }, 3000);
}

function moveMonkey() {
  // control speed //

  speed = Math.random() * level + level;
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
