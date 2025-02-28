import { getElements } from "./js/elements.js";
import { themeManager } from "./js/theme.js";
import { quizManager } from "./js/quiz.js";

document.addEventListener("DOMContentLoaded", () => {
  // Get all DOM elements
  const elements = getElements();

  // Initialize theme and quiz functionality
  themeManager.init(elements);
  quizManager.init(elements);
});
