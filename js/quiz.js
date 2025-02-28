/**
 * Quiz management module
 */
export const quizManager = {
  init(elements) {
    this.elements = elements;
    this.state = {
      quizData: null,
      currentQuiz: null,
      currentQuestionIndex: 0,
      selectedAnswer: null,
      score: 0,
      timerInterval: null,
      timeLimit: 10, // seconds
    };

    this.fetchQuizData();
    this.bindEventListeners();
  },

  fetchQuizData() {
    fetch("./data.json")
      .then((response) => response.json())
      .then((data) => {
        this.state.quizData = data.quizzes;
      })
      .catch((error) => console.error("Error fetching quiz data:", error));
  },

  bindEventListeners() {
    // Subject selection
    this.elements.subjectButtons.forEach((button, index) => {
      button.addEventListener("click", () => this.startQuiz(index));
    });

    // Submit button
    this.elements.submitButton.addEventListener(
      "click",
      this.handleSubmit.bind(this)
    );

    // Play again
    this.elements.playAgainButton.addEventListener(
      "click",
      this.resetQuiz.bind(this)
    );

    this.elements.optionsContainer.addEventListener("click", (e) => {
      const option = e.target.closest(".option");
      if (option) {
        const index = Array.from(this.elements.options).indexOf(option);
        this.selectOption(option, index);
      }
    });
  },

  startQuiz(subjectIndex) {
    this.state.currentQuiz = this.state.quizData[subjectIndex];
    this.state.currentQuestionIndex = 0;
    this.state.score = 0;
    this.state.selectedAnswer = null;

    const subject = this.state.currentQuiz.title;

    // Update the header
    this.updateHeader(subject, this.state.currentQuiz.icon);

    // Switch sections
    this.showSection("question");

    // Load first question
    this.loadQuestion();
  },

  updateHeader(subject, icon) {
    // Show header and set subject
    this.elements.header.quizHeader.classList.remove("hidden");
    this.elements.header.headerContent.classList.add("quiz-active");
    this.elements.header.quizTitle.textContent = subject;

    // Set icon
    this.elements.header.subjectIcon.className = `subject-icon ${subject.toLowerCase()}`;
    this.elements.header.subjectIcon.innerHTML = `<img src="${icon}" alt="${subject} icon">`;

    // Set theme color while preserving dark mode if active
    const isDarkMode = document.body.classList.contains("dark-mode");
    document.body.className = subject.toLowerCase() + "-active";

    // Re-add the dark-mode class if it was previously active
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    }
  },

  loadQuestion() {
    const question =
      this.state.currentQuiz.questions[this.state.currentQuestionIndex];
    this.state.selectedAnswer = null;

    // Update UI
    this.elements.errorMessage.classList.add("hidden");
    this.elements.currentQuestionNum.textContent =
      this.state.currentQuestionIndex + 1;
    this.elements.questionText.textContent = question.question;
    this.elements.submitButton.textContent = "Submit Answer";
    this.elements.submitButton.onclick = null;

    // Reset options
    this.elements.options.forEach((option, index) => {
      const textSpan = option.querySelector(".text");
      textSpan.textContent = question.options[index];
      option.className = "option"; // Clear all classes
      option.disabled = false;
      option.style.pointerEvents = "auto";
      option.style.borderColor = "";
    });

    this.elements.optionsContainer.classList.remove("answered");

    // Start timer
    this.startTimer();
  },

  selectOption(selectedOption, index) {
    this.state.selectedAnswer = index;

    // Update UI
    this.elements.options.forEach((option) => {
      option.classList.remove("selected");
      option.style.borderColor = "";
    });

    selectedOption.classList.add("selected");
    selectedOption.style.borderColor = "var(--active-color)";
  },

  handleSubmit() {
    this.resetTimer();
    this.elements.errorMessage.classList.add("hidden");

    // If no answer selected, show error
    if (this.state.selectedAnswer === null) {
      this.elements.errorMessage.classList.remove("hidden");
      this.startTimer();
      return;
    }

    // Get current question and correct answer
    const currentQuestion =
      this.state.currentQuiz.questions[this.state.currentQuestionIndex];
    const correctIndex = currentQuestion.options.indexOf(
      currentQuestion.answer
    );

    // Disable further selections
    this.elements.optionsContainer.classList.add("answered");
    this.elements.options.forEach((option) => {
      option.disabled = true;
      option.style.pointerEvents = "none";
    });

    // Mark correct/incorrect answers
    this.elements.options[correctIndex].classList.add("correct");

    if (this.state.selectedAnswer !== correctIndex) {
      this.elements.options[this.state.selectedAnswer].classList.add("wrong");
    } else if (this.elements.submitButton.textContent === "Submit Answer") {
      this.state.score++;
    }

    // Determine if it's the last question
    const isLastQuestion =
      this.state.currentQuestionIndex ===
      this.state.currentQuiz.questions.length - 1;

    this.elements.submitButton.textContent = isLastQuestion
      ? "Finish Quiz"
      : "Next Question";
    this.elements.submitButton.onclick = () => {
      if (isLastQuestion) {
        this.showResults();
      } else {
        this.state.currentQuestionIndex++;
        this.loadQuestion();
      }
      this.elements.submitButton.onclick = null;
    };
  },

  startTimer() {
    // Clear any existing timer
    this.resetTimer();

    // Reset the timer bar
    this.elements.timerBar.style.transform = "scaleX(1)";

    let timeLeft = this.state.timeLimit;

    this.state.timerInterval = setInterval(() => {
      timeLeft -= 0.1; // Update every 100ms

      // Update the timer bar
      const scale = Math.max(0, timeLeft / this.state.timeLimit);
      this.elements.timerBar.style.transform = `scaleX(${scale})`;

      // If time's up
      if (timeLeft <= 0) {
        this.resetTimer();
        if (this.state.selectedAnswer === null) {
          this.state.currentQuestionIndex++;

          if (
            this.state.currentQuestionIndex <
            this.state.currentQuiz.questions.length
          ) {
            this.loadQuestion();
          } else {
            this.showResults();
          }
        }
      }
    }, 100);
  },

  resetTimer() {
    if (this.state.timerInterval) {
      clearInterval(this.state.timerInterval);
      this.state.timerInterval = null;
    }
  },

  showResults() {
    this.showSection("completed");
    this.elements.finalScore.textContent = this.state.score;
  },

  showSection(section) {
    // Hide all sections
    Object.values(this.elements.quizSections).forEach((el) => {
      el.classList.remove("active");
      el.classList.add("hidden");
    });

    // Show selected section
    this.elements.quizSections[section].classList.remove("hidden");
    this.elements.quizSections[section].classList.add("active");
  },

  resetQuiz() {
    // Hide quiz header
    this.elements.header.quizHeader.classList.add("hidden");
    this.elements.header.headerContent.classList.remove("quiz-active");

    const isDarkMode = document.body.classList.contains("dark-mode");
    document.body.className = isDarkMode ? "dark-mode" : "";

    // Show menu
    this.showSection("menu");
  },
};
