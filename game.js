"use strict";
let playArea = document.querySelector(".playArea");
let messageArea = document.querySelectorAll(".messageArea span");
let score = 0;
let time;
// playArea.addEventListener("mouseenter", function () {
//   playArea.style.opacity = "40%";
// });
// playArea.addEventListener("mouseleave", function () {
//   playArea.style.opacity = "20%";
// });
// playArea.addEventListener("mousemove", function (mouse) {
//   console.log(mouse.x, mouse.y);
//   // if (mouse.x >= 426 && mouse.y <= 135) {
//   //   score = score + 1;
//   //   messageArea[0].innerText = score;
//   // }
// });
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
  });
  div.steps = Math.random() * 20;
  div.direction = Math.floor(Math.random() * 4);
  window.requestAnimationFrame(moveMonkey);
});

function moveMonkey() {
  let speed = Math.random() * 10 + 3;
  let monkey = document.querySelector(".monkey");
  let cords = playArea.getBoundingClientRect();
  // console.log(playArea);
  // console.log(cords);
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
