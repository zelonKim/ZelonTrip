import { createContext, useContext } from "react";

export const ThemeContext = createContext<{
  isDarkMode: boolean;
  toggleDarkMode: (value: boolean) => Promise<void>;
}>({ isDarkMode: false, toggleDarkMode: async () => {} });

export const useAppTheme = () => useContext(ThemeContext);
