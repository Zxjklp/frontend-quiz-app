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
});
