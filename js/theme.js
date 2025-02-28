/**
 * Theme management module
 */
export const themeManager = {
  init(elements) {
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
    const savedTheme = localStorage.getItem("theme");

    // Set initial theme
    this.elements = elements;
    this.setTheme(
      savedTheme === "dark" || (!savedTheme && prefersDarkScheme.matches)
    );

    // Add event listeners
    this.elements.themeToggle.addEventListener(
      "change",
      this.handleThemeToggle.bind(this)
    );
    prefersDarkScheme.addEventListener("change", (e) => {
      if (!localStorage.getItem("theme")) this.setTheme(e.matches);
    });
  },

  setTheme(isDark) {
    document.body.classList.toggle("dark-mode", isDark);
    this.elements.themeToggle.checked = isDark;

    // Update icons
    this.elements.sunIcon.src = isDark
      ? "./assets/images/icon-sun-light.svg"
      : "./assets/images/icon-sun-dark.svg";
    this.elements.moonIcon.src = isDark
      ? "./assets/images/icon-moon-light.svg"
      : "./assets/images/icon-moon-dark.svg";
  },

  handleThemeToggle() {
    const isDarkMode = this.elements.themeToggle.checked;
    this.setTheme(isDarkMode);
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  },
};
