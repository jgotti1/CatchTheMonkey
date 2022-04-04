"use strict";
const playArea = document.querySelector(".playArea");
const messageArea = document.querySelectorAll(".messageArea span");
let score = 0;
let time;
playArea.addEventListener("mouseenter", function () {
  playArea.style.opacity = "40%";
});
playArea.addEventListener("mouseleave", function () {
  playArea.style.opacity = "20%";
});
playArea.addEventListener("mousemove", function (mouse) {
  // console.log(mouse.x, mouse.y);
  if (mouse.x >= 426 && mouse.y <= 135) {
    score = score + 1;
    messageArea[0].innerText = score;
  }
});
document.addEventListener("DOMContentLoaded", function () {
  let div = document.createElement("div");
  div.classList.add("monkey");
  playArea.appendChild(div);
  div.x = div.offsetLeft;
  div.y = div.offsetTop;
  div.addEventListener("click", function () {
    div.style.backgroundImage = "url(assets/monkey_X.png)";
  });
  div.addEventListener("mouseleave", function () {
    div.style.backgroundImage = "url(assets/monkey.png)";
  });
  div.steps = Math.random() * 20;
  div.direction = Math.floor(Math.random() * 4);
  console.log(div.steps);
  window.requestAnimationFrame(moveMonkey);
});

function moveMonkey() {
  let speed = Math.random() * 10 + 15;
  let monkey = document.querySelector(".monkey");
  let cords = playArea.getBoundingClientRect();
  console.log(cords);
  monkey.steps = monkey.steps - 1;
  if (monkey.steps < 0) {
    monkey.steps = Math.random() * 20;
    monkey.direction = Math.floor(Math.random() * 4);
  }
  console.log(monkey.direction);
  window.requestAnimationFrame(moveMonkey);
}
