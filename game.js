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
let speed;
let bkmusic = document.getElementById("bkmusic");
let monkeyYum = document.getElementById("monkeyYum");

//set amount of minutes to play game//

function restart() {
  startingMin = prompt("How long do you want to play, enter 1 ,2 or 3 minutes");
  if (startingMin == 1 || startingMin == 2 || startingMin == 3) {
    time = 0.3 * 60;
    game();
    button.style.display = "none";
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
  // on click + score and "X"" monkey
  div.addEventListener("click", function () {
    speed = 0;
    div.style.height = 200 + "px";
    div.style.width = 200 + "px";
    div.style.backgroundImage = "url(assets/spinMonkeyx.gif)";
    score = score + 1;
    messageArea[0].innerText = score;
    monkeyYumPlay();
  });
  div.addEventListener("mouseleave", function () {
    div.style.backgroundImage = "url(assets/spinMonkey.gif)";
    div.style.height = 215 + "px";
    div.style.width = 215 + "px";
    setTimeout(() => {
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
  // let monkey = document.querySelector(".monkey");
  // monkey.style.backgroundImage = "none";
  body.style.backgroundPosition = "left";
  button.innerText = "Game Over Click her to play again ... 🐵🐵🐵";
  button.style.border = "3px dashed red";
  button.style.display = "block";
  button.addEventListener("click", function () {
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
