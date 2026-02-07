import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Define the colors for Light and Dark modes
export const themeColors = {
  light: {
    background: '#e3e3e3',
    card: '#FFFFFF',
    text: '#333333',
    subText: '#666666',
    border: '#E0E0E0',
    tint: '#007AFF',
    inputBg: '#FFFFFF',
    modalBg: '#FFFFFF',
    placeholder: '#888888',
    green: '#41b699',
    saveBtn: '#121212'
  },
  dark: {
    background: '#121212',
    card: '#2c2b2b',
    text: '#FFFFFF',
    subText: '#AAAAAA',
    border: '#333333',
    tint: '#0A84FF',
    inputBg: '#2C2C2C',
    modalBg: '#1E1E1E',
    placeholder: '#AAAAAA',
    green: '#136b55',
    saveBtn: '#FFFFFF'
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme(); // 'light' or 'dark' from phone settings
  const [theme, setTheme] = useState(systemScheme || 'light');

  // Load saved preference on startup
  useEffect(() => {
    const loadTheme = async () => {
    setTheme('light');
    };
    loadTheme();
  }, []);

  // Toggle function
  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const colors = themeColors[theme];

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for easy access
export const useTheme = () => useContext(ThemeContext);