import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { Uniwind, useUniwind } from "uniwind";
import AsyncStorage from "@react-native-async-storage/async-storage";
type ThemeName =
  | "light"
  | "dark"
  | "lavender-light"
  | "lavender-dark"
  | "mint-light"
  | "mint-dark"
  | "sky-light"
  | "sky-dark";

interface AppThemeContextType {
  currentTheme: string;
  isLight: boolean;
  isDark: boolean;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
}

const AppThemeContext = createContext<AppThemeContextType | undefined>(
  undefined
);
const THEME_STORAGE_KEY = "@app_theme";

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { theme } = useUniwind();
  // 🔹 Restore saved theme ONCE when app starts
  useEffect(() => {
    (async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme) {
          Uniwind.setTheme(storedTheme as ThemeName);
        }
      } catch (e) {
        console.warn("Failed to load theme", e);
      }
    })();
  }, []);

  const isLight = useMemo(() => {
    return theme === "light" || theme.endsWith("-light");
  }, [theme]);

  const isDark = useMemo(() => {
    return theme === "dark" || theme.endsWith("-dark");
  }, [theme]);

  
  // 🔹 Save theme whenever it changes
  const persistTheme = async (newTheme: ThemeName) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.warn("Failed to save theme", e);
    }
  };

  const setTheme = useCallback((newTheme: ThemeName) => {
    Uniwind.setTheme(newTheme);
    persistTheme(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    switch (theme) {
      case "light":
        Uniwind.setTheme("dark");
        break;
      case "dark":
        Uniwind.setTheme("light");
        break;
      case "lavender-light":
        Uniwind.setTheme("lavender-dark");
        break;
      case "lavender-dark":
        Uniwind.setTheme("lavender-light");
        break;
      case "mint-light":
        Uniwind.setTheme("mint-dark");
        break;
      case "mint-dark":
        Uniwind.setTheme("mint-light");
        break;
      case "sky-light":
        Uniwind.setTheme("sky-dark");
        break;
      case "sky-dark":
        Uniwind.setTheme("sky-light");
        break;
    }
  }, [theme]);

  const value = useMemo(
    () => ({
      currentTheme: theme,
      isLight,
      isDark,
      setTheme,
      toggleTheme,
    }),
    [theme, isLight, isDark, setTheme, toggleTheme]
  );

  return (
    <AppThemeContext.Provider value={value}>
      {children}
    </AppThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within AppThemeProvider");
  }
  return context;
};
