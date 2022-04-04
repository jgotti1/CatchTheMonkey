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
    div.style.backgroundImage = "none";
  });
});
