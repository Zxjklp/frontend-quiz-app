/**
 * DOM elements module
 */
export function getElements() {
  return {
    themeToggle: document.querySelector(".theme-toggle input"),
    sunIcon: document.querySelector(".theme-toggle img:first-of-type"),
    moonIcon: document.querySelector(".theme-toggle img:last-of-type"),
    quizSections: {
      menu: document.querySelector(".quiz-menu"),
      question: document.querySelector(".quiz-question"),
      completed: document.querySelector(".quiz-completed"),
    },
    subjectButtons: document.querySelectorAll(".subject-item"),
    questionText: document.querySelector(".question-text"),
    options: document.querySelectorAll(".option"),
    optionsContainer: document.querySelector(".options"),
    currentQuestionNum: document.querySelector(".current"),
    submitButton: document.querySelector(".submit-btn"),
    errorMessage: document.querySelector(".error-message"),
    finalScore: document.querySelector(".final-score"),
    playAgainButton: document.querySelector(".play-again"),
    timerBar: document.querySelector(".timer-bar"),
    header: {
      quizHeader: document.querySelector("header .quiz-header"),
      quizTitle: document.querySelector("header .quiz-title"),
      subjectIcon: document.querySelector("header .subject-icon"),
      headerContent: document.querySelector(".header-content"),
    },
  };
}
