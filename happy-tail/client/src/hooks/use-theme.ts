import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const THEME_DEFAULT_MIGRATION_KEY = "happy-tail-theme-default-light-v2";

function getInitialTheme(): Theme {
  // Set the default to light once, while preserving future user selections.
  try {
    if (localStorage.getItem(THEME_DEFAULT_MIGRATION_KEY) !== "done") {
      localStorage.setItem(THEME_DEFAULT_MIGRATION_KEY, "done");
      localStorage.setItem("theme", "light");
      return "light";
    }
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "light" || savedTheme === "dark" ? savedTheme : "light";
  } catch {
    return "light";
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // The selected theme still applies for the current session if storage is unavailable.
    }
  }, [theme]);

  return { theme, setTheme };
}
