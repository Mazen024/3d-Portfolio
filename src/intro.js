const introSection = document.createElement("section");
introSection.className = "intro";

const title = document.createElement("h1");
title.textContent = "Welcome!";

const description = document.createElement("p");
description.textContent =
  "Hello, I'm Mazen. I'm a front-end developer with a passion for crafting responsive, visually engaging interfaces.";

const button = document.createElement("button");
button.id = "openPortfolioBtn";
button.textContent = "Explore My Work";

introSection.appendChild(title);
introSection.appendChild(description);
introSection.appendChild(button);

document.body.appendChild(introSection);

button.addEventListener("click", () => {
  introSection.style.display = "none"; // Hide intro
  document.getElementById("portfolioContent").style.display = "block"; // Show portfolio
});
