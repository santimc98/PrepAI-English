import {
  createContext,
  useContext,
  } from 'react';

export type ColorScheme = 'light' | 'dark';

export type UiTheme = {
  colorScheme: ColorScheme;
  setColorScheme: (v: ColorScheme) => void;
};

export const UiThemeContext = createContext<UiTheme>({
  colorScheme: 'light',
  setColorScheme: () => {},
});

export function useUiTheme() {
  return useContext(UiThemeContext);
}
