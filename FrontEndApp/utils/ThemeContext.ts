import { createContext, useContext } from "react";

export const ThemeContext = createContext<{
  isDarkMode: boolean;
  toggleDarkMode: (value: boolean) => Promise<void>;
}>({ isDarkMode: false, toggleDarkMode: async () => {} });

export const useAppTheme = () => useContext(ThemeContext);

const THEME_CONFIG_PATH = `${FileSystem.documentDirectory}theme_config.json`;