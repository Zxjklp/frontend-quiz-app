document.addEventListener("DOMContentLoaded", () => {
  // Theme toggle functionality
  const themeToggle = document.querySelector(".theme-toggle input");
  // Check if user prefers dark mode
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  // Function to set theme
  const setTheme = (isDark) => {
    document.body.classList.toggle("dark-mode", isDark);
    themeToggle.checked = isDark;

    // Update theme toggle icons
    const sunIcon = document.querySelector(".theme-toggle img:first-of-type");
    const moonIcon = document.querySelector(".theme-toggle img:last-of-type");

    if (isDark) {
      sunIcon.src = "./assets/images/icon-sun-light.svg";
      moonIcon.src = "./assets/images/icon-moon-light.svg";
    } else {
      sunIcon.src = "./assets/images/icon-sun-dark.svg";
      moonIcon.src = "./assets/images/icon-moon-dark.svg";
    }
  };

  // Initialize theme based on system preference or saved preference
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark" || (!savedTheme && prefersDarkScheme.matches)) {
    setTheme(true);
  } else {
    setTheme(false);
  }

  // Toggle theme when the switch is clicked
  themeToggle.addEventListener("change", () => {
    const isDarkMode = themeToggle.checked;
    setTheme(isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  });

  // Watch for system theme changes
  prefersDarkScheme.addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      setTheme(e.matches);
    }
  });

  // Quiz functionality
  let quizData;
  let currentQuiz = null;
  let currentQuestionIndex = 0;
  let selectedAnswer = null;
  let score = 0;
  let timerInterval = null;
  const timeLimit = 10; // 10 seconds per question

  // DOM elements
  const quizMenu = document.querySelector(".quiz-menu");
  const quizQuestion = document.querySelector(".quiz-question");
  const quizCompleted = document.querySelector(".quiz-completed");
  const subjectButtons = document.querySelectorAll(".subject-item");
  const questionText = document.querySelector(".question-text");
  const options = document.querySelectorAll(".option");
  const currentQuestionNum = document.querySelector(".current");
  const submitButton = document.querySelector(".submit-btn");
  const finalScore = document.querySelector(".final-score");
  const playAgainButton = document.querySelector(".play-again");
  const timerBar = document.querySelector(".timer-bar");

  // Fetch quiz data
  fetch("./data.json")
    .then((response) => response.json())
    .then((data) => {
      quizData = data.quizzes;

      // Add click event to subject buttons
      subjectButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
          startQuiz(index);
        });
      });
    })
    .catch((error) => console.error("Error fetching quiz data:", error));

  // Function to start the quiz
  function startQuiz(subjectIndex) {
    currentQuiz = quizData[subjectIndex];
    currentQuestionIndex = 0;
    score = 0; // Reset score when starting a new quiz
    selectedAnswer = null;

    // Set quiz title and icon in the header
    const subjectTitle = currentQuiz.title;
    const subjectIcon = currentQuiz.icon;
    const quizHeader = document.querySelector("header .quiz-header");
    const quizTitle = document.querySelector("header .quiz-title");
    const subjectIconContainer = document.querySelector("header .subject-icon");

    // Show the quiz header in the top nav
    quizHeader.classList.remove("hidden");
    document.querySelector(".header-content").classList.add("quiz-active");
    quizTitle.textContent = subjectTitle;

    // Set appropriate class for background color
    subjectIconContainer.className = "subject-icon";
    subjectIconContainer.classList.add(subjectTitle.toLowerCase());

    // Set active color theme based on subject
    document.body.classList.remove(
      "html-active",
      "css-active",
      "javascript-active",
      "accessibility-active"
    );
    document.body.classList.add(subjectTitle.toLowerCase() + "-active");

    // Add icon
    subjectIconContainer.innerHTML = `<img src="${subjectIcon}" alt="${subjectTitle} icon">`;

    // Hide menu and show question section
    quizMenu.classList.remove("active");
    quizMenu.classList.add("hidden");
    quizQuestion.classList.remove("hidden");
    quizQuestion.classList.add("active");

    // Load the first question
    loadQuestion();
  }

  // Function to load a question
  function loadQuestion() {
    const question = currentQuiz.questions[currentQuestionIndex];
    selectedAnswer = null;
    // Remove the disabled attribute since button should be always clickable
    submitButton.disabled = false;

    // Hide error message when loading a new question
    document.querySelector(".error-message").classList.add("hidden");

    // Update question counter
    currentQuestionNum.textContent = currentQuestionIndex + 1;

    // Set question text
    questionText.textContent = question.question;

    // Reset options
    options.forEach((option, index) => {
      const textSpan = option.querySelector(".text");
      textSpan.textContent = question.options[index];
      option.classList.remove("selected", "correct", "wrong");
      option.style.borderColor = "";
      option.disabled = false; // Re-enable options for new question
      option.style.pointerEvents = "auto"; // Reset pointer events
    });

    // Add click event to options
    options.forEach((option, index) => {
      option.onclick = () => {
        selectOption(option, index);
      };
    });

    // Reset button text to "Submit Answer" for all questions
    submitButton.textContent = "Submit Answer";

    // Reset and start the timer
    resetTimer();
    startTimer();
  }

  // Start timer function
  function startTimer() {
    // Clear any existing timer
    if (timerInterval) {
      clearInterval(timerInterval);
    }

    // Reset the timer bar
    timerBar.style.transform = "scaleX(1)";

    let timeLeft = timeLimit;

    timerInterval = setInterval(() => {
      timeLeft -= 0.1; // Update every 100ms

      // Update the timer bar
      const scale = timeLeft / timeLimit;
      timerBar.style.transform = `scaleX(${scale})`;

      // If time is up
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        // Auto-submit if no answer selected
        if (selectedAnswer === null) {
          // Move to next question or show results
          moveToNextOrFinish();
        }
      }
    }, 100);
  }

  // Reset timer function
  function resetTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    timerBar.style.transform = "scaleX(1)";
  }

  // Function to move to next question or finish quiz
  function moveToNextOrFinish() {
    currentQuestionIndex++;

    if (currentQuestionIndex < currentQuiz.questions.length) {
      loadQuestion();
    } else {
      showResults();
    }
  }

  // Submit button event
  submitButton.addEventListener("click", () => {
    // Clear the timer when answer is submitted
    resetTimer();

    // Hide any previous error message
    document.querySelector(".error-message").classList.add("hidden");

    if (selectedAnswer !== null) {
      const currentQuestion = currentQuiz.questions[currentQuestionIndex];
      const correctAnswerIndex = currentQuestion.options.indexOf(
        currentQuestion.answer
      );

      // Add class to the options container to disable further selection
      document.querySelector(".options").classList.add("answered");

      // Disable all option buttons
      options.forEach((option) => {
        option.disabled = true;
        option.style.pointerEvents = "none"; // Additional measure to prevent interaction
      });

      // Mark the correct option
      options[correctAnswerIndex].classList.add("correct");

      // If selected answer is wrong, mark it as wrong
      if (selectedAnswer !== correctAnswerIndex) {
        options[selectedAnswer].classList.add("wrong");
      } else {
        // Only increment score if this is first submission for this question
        // Check button text to make sure we don't add score on "Next Question"/"See Results" click
        if (submitButton.textContent === "Submit Answer") {
          score++;
        }
      }

      // Check if this is the last question
      const isLastQuestion =
        currentQuestionIndex === currentQuiz.questions.length - 1;

      // For the last question, change text to "Finish Quiz" instead of "Next Question"
      if (isLastQuestion) {
        submitButton.textContent = "See Results";

        // Set button behavior for last question
        submitButton.onclick = () => {
          showResults(); // Go directly to results
          submitButton.onclick = null;
        };
      } else {
        // Regular behavior for non-last questions
        submitButton.textContent = "Next Question";

        submitButton.onclick = () => {
          // Reset options for next question
          document.querySelector(".options").classList.remove("answered");
          options.forEach((option) => {
            option.classList.remove("correct", "wrong", "selected");
          });

          moveToNextOrFinish();

          // Restore original button functionality
          submitButton.onclick = null;
        };
      }

      return; // Exit to prevent calling moveToNextOrFinish immediately
    } else {
      // Show error message when no option is selected
      document.querySelector(".error-message").classList.remove("hidden");

      // Restart the timer
      startTimer();

      return; // Don't proceed to next question
    }

    moveToNextOrFinish();
  });

  // Function to select an option
  function selectOption(selectedOption, index) {
    selectedAnswer = index;

    // Update UI to show selected option
    options.forEach((option) => {
      option.classList.remove("selected");
      option.style.borderColor = "";
    });

    selectedOption.classList.add("selected");
    selectedOption.style.borderColor = "var(--active-color)";
    submitButton.disabled = false;
  }

  // Function to show results
  function showResults() {
    quizQuestion.classList.remove("active");
    quizQuestion.classList.add("hidden");
    quizCompleted.classList.remove("hidden");
    quizCompleted.classList.add("active");

    finalScore.textContent = score;
  }

  // Play again button event
  playAgainButton.addEventListener("click", () => {
    // Hide the quiz header when returning to menu
    document.querySelector("header .quiz-header").classList.add("hidden");
    document.querySelector(".header-content").classList.remove("quiz-active");

    // Remove subject-specific active color classes
    document.body.classList.remove(
      "html-active",
      "css-active",
      "javascript-active",
      "accessibility-active"
    );

    quizCompleted.classList.remove("active");
    quizCompleted.classList.add("hidden");
    quizMenu.classList.remove("hidden");
    quizMenu.classList.add("active");
  });
});
